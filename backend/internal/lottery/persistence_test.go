package lottery

import (
	"path/filepath"
	"testing"
)

func TestPersistentStoreRestoresWinnersAndRound(t *testing.T) {
	path := filepath.Join(t.TempDir(), "state", "lottery.json")
	store, err := NewPersistentStore(path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := store.SetGuests([]string{"001", "002", "003"}); err != nil {
		t.Fatal(err)
	}
	if _, err := store.Draw(1); err != nil {
		t.Fatal(err)
	}

	reloaded, err := NewPersistentStore(path)
	if err != nil {
		t.Fatal(err)
	}
	guests, round := reloaded.ListGuests()
	if round != 2 {
		t.Fatalf("want restored round 2, got %d", round)
	}
	if len(guests) != 3 {
		t.Fatalf("want 3 restored guests, got %d", len(guests))
	}
	winners := 0
	for _, guest := range guests {
		if guest.HasWon {
			winners++
			if guest.WonAtRound == nil || *guest.WonAtRound != 1 {
				t.Fatalf("winner round was not restored: %+v", guest)
			}
		}
	}
	if winners != 1 {
		t.Fatalf("want 1 restored winner, got %d", winners)
	}
}
