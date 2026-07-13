package lottery

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
)

type persistedState struct {
	Guests       []Guest               `json:"guests"`
	CurrentRound int                   `json:"currentRound"`
	Draws        map[string]drawRecord `json:"draws"`
}

// NewPersistentStore 创建文件持久化 Store。每次状态变更都会先原子落盘，
// 只有成功后才更新内存态，避免页面显示了一个无法恢复的中奖结果。
func NewPersistentStore(path string) (*Store, error) {
	state := persistedState{Guests: []Guest{}, CurrentRound: 1, Draws: map[string]drawRecord{}}
	data, err := os.ReadFile(path)
	if err != nil {
		if !errors.Is(err, fs.ErrNotExist) {
			return nil, fmt.Errorf("read lottery state: %w", err)
		}
	} else if err := json.Unmarshal(data, &state); err != nil {
		return nil, fmt.Errorf("parse lottery state: %w", err)
	}

	if state.CurrentRound < 1 {
		return nil, errors.New("lottery state has an invalid currentRound")
	}
	for i, guest := range state.Guests {
		if guest.ID != i+1 || guest.Code == "" {
			return nil, errors.New("lottery state has invalid guest records")
		}
	}

	if state.Draws == nil {
		state.Draws = map[string]drawRecord{}
	}
	s := &Store{guests: cloneGuests(state.Guests), currentRound: state.CurrentRound, draws: cloneDrawRecords(state.Draws)}
	s.persist = func(guests []Guest, currentRound int, draws map[string]drawRecord) error {
		return saveState(path, persistedState{Guests: cloneGuests(guests), CurrentRound: currentRound, Draws: cloneDrawRecords(draws)})
	}
	return s, nil
}

func saveState(path string, state persistedState) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return fmt.Errorf("create lottery state directory: %w", err)
	}

	data, err := json.Marshal(state)
	if err != nil {
		return fmt.Errorf("encode lottery state: %w", err)
	}

	temp, err := os.CreateTemp(filepath.Dir(path), ".lottery-state-*")
	if err != nil {
		return fmt.Errorf("create lottery state temp file: %w", err)
	}
	tempName := temp.Name()
	defer os.Remove(tempName)

	if err := temp.Chmod(0o600); err != nil {
		temp.Close()
		return fmt.Errorf("set lottery state permissions: %w", err)
	}
	if _, err := temp.Write(data); err != nil {
		temp.Close()
		return fmt.Errorf("write lottery state: %w", err)
	}
	if err := temp.Close(); err != nil {
		return fmt.Errorf("close lottery state: %w", err)
	}
	if err := os.Rename(tempName, path); err != nil {
		return fmt.Errorf("replace lottery state: %w", err)
	}
	return nil
}
