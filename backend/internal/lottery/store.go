package lottery

import (
	"errors"
	"sync"
)

var (
	// ErrEmptyPool 表示没有可抽取的未中奖宾客。
	ErrEmptyPool = errors.New("lottery: no available guests to draw")
	// ErrGuestNotFound 表示按 id 查找宾客失败。
	ErrGuestNotFound = errors.New("lottery: guest not found")
	// ErrGuestNotWinner 表示尝试撤销一个尚未中奖的宾客。
	ErrGuestNotWinner = errors.New("lottery: guest has not won")
	// ErrDrawRequestMismatch 表示相同请求 ID 被用于不同批次数量。
	ErrDrawRequestMismatch = errors.New("lottery: draw request ID was reused with a different count")
)

type drawRecord struct {
	Count   int     `json:"count"`
	Winners []Guest `json:"winners"`
}

type persistFunc func([]Guest, int, map[string]drawRecord) error

// Store 是线程安全的宾客与中奖记录管理器。持久化由 persist 可选提供。
type Store struct {
	mu           sync.RWMutex
	guests       []Guest
	currentRound int
	draws        map[string]drawRecord
	persist      persistFunc
}

// NewStore 创建一个新的空 Store。
func NewStore() *Store {
	return &Store{
		guests:       []Guest{},
		currentRound: 1,
		draws:        map[string]drawRecord{},
	}
}

// SetGuests 用一组 codes 覆盖式重置宾客列表，currentRound 归 1。
func (s *Store) SetGuests(codes []string) (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	guests := make([]Guest, 0, len(codes))
	for i, code := range codes {
		guests = append(guests, Guest{
			ID:     i + 1,
			Code:   code,
			HasWon: false,
		})
	}
	if err := s.commitLocked(guests, 1, map[string]drawRecord{}); err != nil {
		return 0, err
	}
	return len(guests), nil
}

// ListGuests 返回全量宾客快照（深拷贝），避免外部修改内部状态。
func (s *Store) ListGuests() ([]Guest, int) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := cloneGuests(s.guests)
	return out, s.currentRound
}

// Draw 从未中奖宾客中安全随机抽取 count 人，标记 HasWon 并写入 WonAtRound。
// 抽奖后自动将 currentRound 自增 1。
//
// 若可用池为空返回 ErrEmptyPool；count <= 0 时按 1 处理；
// count 超出可用池时返回全部剩余。
func (s *Store) Draw(count int, requestIDs ...string) ([]Guest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	requestID := ""
	if len(requestIDs) > 0 {
		requestID = requestIDs[0]
	}

	if count <= 0 {
		count = 1
	}
	if requestID != "" {
		if record, ok := s.draws[requestID]; ok {
			if record.Count != count {
				return nil, ErrDrawRequestMismatch
			}
			return cloneGuests(record.Winners), nil
		}
	}

	availableIdx := make([]int, 0, len(s.guests))
	for i, g := range s.guests {
		if !g.HasWon {
			availableIdx = append(availableIdx, i)
		}
	}
	if len(availableIdx) == 0 {
		return nil, ErrEmptyPool
	}

	if err := SecureShuffle(availableIdx); err != nil {
		return nil, err
	}
	if count > len(availableIdx) {
		count = len(availableIdx)
	}

	nextGuests := cloneGuests(s.guests)
	round := s.currentRound
	winners := make([]Guest, 0, count)
	for _, idx := range availableIdx[:count] {
		r := round
		nextGuests[idx].HasWon = true
		nextGuests[idx].WonAtRound = &r
		winners = append(winners, nextGuests[idx])
	}
	nextDraws := cloneDrawRecords(s.draws)
	if requestID != "" {
		nextDraws[requestID] = drawRecord{Count: count, Winners: cloneGuests(winners)}
	}
	if err := s.commitLocked(nextGuests, round+1, nextDraws); err != nil {
		return nil, err
	}
	return winners, nil
}

// Revoke 撤销某个宾客的中奖记录（hasWon=false, 清除 wonAtRound）。
func (s *Store) Revoke(id int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, g := range s.guests {
		if g.ID == id {
			if !g.HasWon {
				return ErrGuestNotWinner
			}
			nextGuests := cloneGuests(s.guests)
			nextGuests[i].HasWon = false
			nextGuests[i].WonAtRound = nil
			return s.commitLocked(nextGuests, s.currentRound, cloneDrawRecords(s.draws))
		}
	}
	return ErrGuestNotFound
}

// Reset 将所有宾客置为未中奖，currentRound 归 1。
func (s *Store) Reset() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	nextGuests := cloneGuests(s.guests)
	for i := range nextGuests {
		nextGuests[i].HasWon = false
		nextGuests[i].WonAtRound = nil
	}
	return s.commitLocked(nextGuests, 1, map[string]drawRecord{})
}

// LookupDraw 返回已提交抽奖请求的原始结果，用于安全重试与故障恢复。
func (s *Store) LookupDraw(requestID string) ([]Guest, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	record, ok := s.draws[requestID]
	if !ok {
		return nil, false
	}
	return cloneGuests(record.Winners), true
}

func (s *Store) commitLocked(guests []Guest, currentRound int, draws map[string]drawRecord) error {
	if s.persist != nil {
		if err := s.persist(guests, currentRound, draws); err != nil {
			return err
		}
	}
	s.guests = guests
	s.currentRound = currentRound
	s.draws = draws
	return nil
}

func cloneDrawRecords(src map[string]drawRecord) map[string]drawRecord {
	out := make(map[string]drawRecord, len(src))
	for requestID, record := range src {
		out[requestID] = drawRecord{Count: record.Count, Winners: cloneGuests(record.Winners)}
	}
	return out
}

func cloneGuests(src []Guest) []Guest {
	out := make([]Guest, len(src))
	for i, guest := range src {
		out[i] = guest
		if guest.WonAtRound != nil {
			round := *guest.WonAtRound
			out[i].WonAtRound = &round
		}
	}
	return out
}
