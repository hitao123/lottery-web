package lottery

import (
	"errors"
	"math"
	"testing"
)

func TestSecureIndex_InRange(t *testing.T) {
	for _, n := range []int{1, 2, 7, 100, 1024} {
		for i := 0; i < 200; i++ {
			v, err := SecureIndex(n)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if v < 0 || v >= n {
				t.Fatalf("SecureIndex(%d)=%d out of range", n, v)
			}
		}
	}
}

func TestSecureIndex_InvalidRange(t *testing.T) {
	for _, n := range []int{0, -1, -100} {
		if _, err := SecureIndex(n); !errors.Is(err, ErrInvalidRange) {
			t.Fatalf("SecureIndex(%d) expected ErrInvalidRange, got %v", n, err)
		}
	}
}

func TestSecureIndex_DistributionRoughlyUniform(t *testing.T) {
	const (
		n       = 10
		samples = 50000
	)
	counts := make([]int, n)
	for i := 0; i < samples; i++ {
		v, err := SecureIndex(n)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		counts[v]++
	}
	expected := float64(samples) / float64(n)
	// 卡方较松的阈值：5σ 量级，避免偶发抖动。
	maxDev := 4 * math.Sqrt(expected)
	for i, c := range counts {
		if math.Abs(float64(c)-expected) > maxDev {
			t.Fatalf("bucket %d count=%d deviates too much from expected=%.1f (maxDev=%.1f)", i, c, expected, maxDev)
		}
	}
}

func TestSecureShuffle_NoLoss(t *testing.T) {
	original := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	s := make([]int, len(original))
	copy(s, original)

	if err := SecureShuffle(s); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(s) != len(original) {
		t.Fatalf("length changed after shuffle")
	}
	seen := make(map[int]int)
	for _, v := range s {
		seen[v]++
	}
	for _, v := range original {
		if seen[v] != 1 {
			t.Fatalf("element %d count=%d after shuffle", v, seen[v])
		}
	}
}

func TestSecurePickN(t *testing.T) {
	src := []int{1, 2, 3, 4, 5}
	out, err := SecurePickN(src, 3)
	if err != nil {
		t.Fatal(err)
	}
	if len(out) != 3 {
		t.Fatalf("expected 3 elements, got %d", len(out))
	}

	out, err = SecurePickN(src, 100)
	if err != nil {
		t.Fatal(err)
	}
	if len(out) != len(src) {
		t.Fatalf("expected full pool when count > len, got %d", len(out))
	}

	out, err = SecurePickN(src, 0)
	if err != nil || len(out) != 0 {
		t.Fatalf("expected empty result, got %v err=%v", out, err)
	}
}
