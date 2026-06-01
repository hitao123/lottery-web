package lottery

import (
	"errors"
	"sync"
	"testing"
)

func newStoreWith(n int) *Store {
	s := NewStore()
	codes := make([]string, n)
	for i := 0; i < n; i++ {
		codes[i] = "C" + string(rune('0'+i%10))
	}
	s.SetGuests(codes)
	return s
}

func TestStore_DrawMarksHasWonAndAdvancesRound(t *testing.T) {
	s := newStoreWith(5)
	winners, err := s.Draw(1)
	if err != nil {
		t.Fatal(err)
	}
	if len(winners) != 1 {
		t.Fatalf("want 1 winner, got %d", len(winners))
	}
	if !winners[0].HasWon || winners[0].WonAtRound == nil || *winners[0].WonAtRound != 1 {
		t.Fatalf("winner not properly marked: %+v", winners[0])
	}

	guests, round := s.ListGuests()
	if round != 2 {
		t.Fatalf("round expected to advance to 2, got %d", round)
	}
	marked := 0
	for _, g := range guests {
		if g.HasWon {
			marked++
		}
	}
	if marked != 1 {
		t.Fatalf("expected 1 marked guest, got %d", marked)
	}
}

func TestStore_DrawExhaustsPool(t *testing.T) {
	s := newStoreWith(3)
	for i := 0; i < 3; i++ {
		if _, err := s.Draw(1); err != nil {
			t.Fatalf("draw %d failed: %v", i, err)
		}
	}
	if _, err := s.Draw(1); !errors.Is(err, ErrEmptyPool) {
		t.Fatalf("expected ErrEmptyPool, got %v", err)
	}
}

func TestStore_DrawMultiNoDuplicate(t *testing.T) {
	s := newStoreWith(20)
	winners, err := s.Draw(20)
	if err != nil {
		t.Fatal(err)
	}
	if len(winners) != 20 {
		t.Fatalf("want 20 winners, got %d", len(winners))
	}
	seen := make(map[int]struct{})
	for _, w := range winners {
		if _, dup := seen[w.ID]; dup {
			t.Fatalf("duplicate winner id=%d", w.ID)
		}
		seen[w.ID] = struct{}{}
	}
}

func TestStore_RevokeRestores(t *testing.T) {
	s := newStoreWith(3)
	winners, _ := s.Draw(1)
	id := winners[0].ID
	if err := s.Revoke(id); err != nil {
		t.Fatal(err)
	}
	guests, _ := s.ListGuests()
	for _, g := range guests {
		if g.ID == id && (g.HasWon || g.WonAtRound != nil) {
			t.Fatalf("guest not revoked: %+v", g)
		}
	}
}

func TestStore_ConcurrentDrawNoDuplicate(t *testing.T) {
	const total = 200
	s := newStoreWith(total)

	var (
		wg      sync.WaitGroup
		mu      sync.Mutex
		winners = make([]int, 0, total)
	)
	for i := 0; i < total; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			ws, err := s.Draw(1)
			if err != nil {
				return
			}
			mu.Lock()
			winners = append(winners, ws[0].ID)
			mu.Unlock()
		}()
	}
	wg.Wait()

	seen := make(map[int]struct{}, len(winners))
	for _, id := range winners {
		if _, dup := seen[id]; dup {
			t.Fatalf("duplicate winner id under concurrency: %d", id)
		}
		seen[id] = struct{}{}
	}
	if len(seen) != total {
		t.Fatalf("expected %d unique winners, got %d", total, len(seen))
	}
}

func TestStore_Reset(t *testing.T) {
	s := newStoreWith(4)
	_, _ = s.Draw(2)
	s.Reset()
	guests, round := s.ListGuests()
	if round != 1 {
		t.Fatalf("round expected 1 after reset, got %d", round)
	}
	for _, g := range guests {
		if g.HasWon || g.WonAtRound != nil {
			t.Fatalf("guest not reset: %+v", g)
		}
	}
}
