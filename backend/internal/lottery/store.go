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
)

// Store 是线程安全的内存态宾客与中奖记录管理器。
type Store struct {
	mu           sync.RWMutex
	guests       []Guest
	currentRound int
}

// NewStore 创建一个新的空 Store。
func NewStore() *Store {
	return &Store{
		guests:       []Guest{},
		currentRound: 1,
	}
}

// SetGuests 用一组 codes 覆盖式重置宾客列表，currentRound 归 1。
func (s *Store) SetGuests(codes []string) int {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.guests = make([]Guest, 0, len(codes))
	for i, code := range codes {
		s.guests = append(s.guests, Guest{
			ID:     i + 1,
			Code:   code,
			HasWon: false,
		})
	}
	s.currentRound = 1
	return len(s.guests)
}

// ListGuests 返回全量宾客快照（深拷贝），避免外部修改内部状态。
func (s *Store) ListGuests() ([]Guest, int) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]Guest, len(s.guests))
	copy(out, s.guests)
	return out, s.currentRound
}

// Draw 从未中奖宾客中安全随机抽取 count 人，标记 HasWon 并写入 WonAtRound。
// 抽奖后自动将 currentRound 自增 1。
//
// 若可用池为空返回 ErrEmptyPool；count <= 0 时按 1 处理；
// count 超出可用池时返回全部剩余。
func (s *Store) Draw(count int) ([]Guest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if count <= 0 {
		count = 1
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

	round := s.currentRound
	winners := make([]Guest, 0, count)
	for _, idx := range availableIdx[:count] {
		r := round
		s.guests[idx].HasWon = true
		s.guests[idx].WonAtRound = &r
		winners = append(winners, s.guests[idx])
	}
	s.currentRound++
	return winners, nil
}

// Revoke 撤销某个宾客的中奖记录（hasWon=false, 清除 wonAtRound）。
func (s *Store) Revoke(id int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, g := range s.guests {
		if g.ID == id {
			s.guests[i].HasWon = false
			s.guests[i].WonAtRound = nil
			return nil
		}
	}
	return ErrGuestNotFound
}

// Reset 将所有宾客置为未中奖，currentRound 归 1。
func (s *Store) Reset() {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.guests {
		s.guests[i].HasWon = false
		s.guests[i].WonAtRound = nil
	}
	s.currentRound = 1
}
