// Package lottery 提供基于 crypto/rand.Int 的加密安全随机抽奖工具。
//
// 等价于 Node.js 的 crypto.randomInt(n)：
//   - 使用 rand.Int(rand.Reader, big.NewInt(n))
//   - Go 标准库内部采用 rejection sampling，规避取模偏差
//   - 切勿使用 binary.Read + (% n) 的写法（存在分布偏差）
package lottery

import (
	"crypto/rand"
	"errors"
	"math/big"
)

// ErrInvalidRange 表示传入了非法的范围参数（n <= 0）。
var ErrInvalidRange = errors.New("lottery: range must be a positive integer")

// SecureIndex 返回 [0, n) 区间内一个加密安全的均匀随机整数。
// 当 n <= 0 时返回 ErrInvalidRange。
func SecureIndex(n int) (int, error) {
	if n <= 0 {
		return 0, ErrInvalidRange
	}
	bi, err := rand.Int(rand.Reader, big.NewInt(int64(n)))
	if err != nil {
		return 0, err
	}
	return int(bi.Int64()), nil
}

// SecureShuffle 使用 Fisher–Yates 算法对切片进行原地洗牌，
// 每一步的随机下标来自 SecureIndex（crypto/rand）。
func SecureShuffle[T any](s []T) error {
	for i := len(s) - 1; i > 0; i-- {
		j, err := SecureIndex(i + 1)
		if err != nil {
			return err
		}
		s[i], s[j] = s[j], s[i]
	}
	return nil
}

// SecurePickN 从 src 中安全无放回地选取 count 个元素，返回新切片。
// 当 count > len(src) 时返回全部元素的随机排列。
func SecurePickN[T any](src []T, count int) ([]T, error) {
	if count <= 0 || len(src) == 0 {
		return []T{}, nil
	}
	pool := make([]T, len(src))
	copy(pool, src)
	if err := SecureShuffle(pool); err != nil {
		return nil, err
	}
	if count > len(pool) {
		count = len(pool)
	}
	return pool[:count], nil
}
