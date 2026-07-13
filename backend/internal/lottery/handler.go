package lottery

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	maxRequestBodyBytes = 1 << 20
	maxGuests           = 5000
	maxCodeLength       = 128
	maxDrawCount        = 100
)

// Handler 持有共享 Store，所有方法签名符合 gin.HandlerFunc。
type Handler struct {
	store *Store
}

// NewHandler 创建一个绑定 Store 的 Handler。
func NewHandler(s *Store) *Handler {
	return &Handler{store: s}
}

func writeError(c *gin.Context, status int, code, msg string) {
	c.AbortWithStatusJSON(status, ErrorResponse{Error: msg, Code: code})
}

// UploadGuests 处理 POST /guests，覆盖式重置宾客列表。
func (h *Handler) UploadGuests(c *gin.Context) {
	var req UploadRequest
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxRequestBodyBytes)
	if err := c.ShouldBindJSON(&req); err != nil {
		writeError(c, http.StatusBadRequest, "BAD_REQUEST", "invalid body: "+err.Error())
		return
	}
	codes, err := normalizeCodes(req.Codes)
	if err != nil {
		writeError(c, http.StatusBadRequest, "INVALID_CODES", err.Error())
		return
	}
	total, err := h.store.SetGuests(codes)
	if err != nil {
		log.Printf("lottery: persist uploaded guests failed: %v", err)
		writeError(c, http.StatusInternalServerError, "PERSIST_FAILED", "could not save lottery state")
		return
	}
	guests, round := h.store.ListGuests()
	log.Printf("lottery: guests uploaded total=%d", total)
	c.JSON(http.StatusOK, GuestsResponse{Guests: guests, CurrentRound: round, Total: total})
}

// ListGuests 处理 GET /guests。
func (h *Handler) ListGuests(c *gin.Context) {
	guests, round := h.store.ListGuests()
	c.JSON(http.StatusOK, GuestsResponse{
		Guests:       guests,
		CurrentRound: round,
		Total:        len(guests),
	})
}

// Draw 处理 POST /draw。
func (h *Handler) Draw(c *gin.Context) {
	var req DrawRequest
	// 允许空 body
	if c.Request.ContentLength > 0 {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxRequestBodyBytes)
		if err := c.ShouldBindJSON(&req); err != nil {
			writeError(c, http.StatusBadRequest, "BAD_REQUEST", "invalid body: "+err.Error())
			return
		}
	}
	if req.Count < 0 || req.Count > maxDrawCount {
		writeError(c, http.StatusBadRequest, "INVALID_COUNT", "count must be between 1 and 100")
		return
	}
	if len(strings.TrimSpace(req.RequestID)) == 0 || len(req.RequestID) > 128 {
		writeError(c, http.StatusBadRequest, "INVALID_REQUEST_ID", "requestId is required and must be at most 128 characters")
		return
	}
	winners, err := h.store.Draw(req.Count, req.RequestID)
	if err != nil {
		if errors.Is(err, ErrEmptyPool) {
			writeError(c, http.StatusConflict, "EMPTY_POOL", "no available guests")
			return
		}
		if errors.Is(err, ErrDrawRequestMismatch) {
			writeError(c, http.StatusConflict, "REQUEST_ID_MISMATCH", "requestId cannot be reused with a different count")
			return
		}
		log.Printf("lottery: draw failed: %v", err)
		writeError(c, http.StatusInternalServerError, "DRAW_FAILED", "could not save lottery state")
		return
	}
	for _, w := range winners {
		round := 0
		if w.WonAtRound != nil {
			round = *w.WonAtRound
		}
		log.Printf("lottery: winner id=%d code=%s round=%d", w.ID, w.Code, round)
	}
	guests, round := h.store.ListGuests()
	c.JSON(http.StatusOK, DrawResponse{
		Winners:        winners,
		GuestsResponse: GuestsResponse{Guests: guests, CurrentRound: round, Total: len(guests)},
	})
}

// LookupDraw 处理 GET /draws/:requestID，用于在网络中断后恢复原抽奖结果。
func (h *Handler) LookupDraw(c *gin.Context) {
	requestID := strings.TrimSpace(c.Param("requestID"))
	if requestID == "" || len(requestID) > 128 {
		writeError(c, http.StatusBadRequest, "INVALID_REQUEST_ID", "invalid requestId")
		return
	}
	winners, ok := h.store.LookupDraw(requestID)
	if !ok {
		writeError(c, http.StatusNotFound, "DRAW_NOT_FOUND", "draw result not found")
		return
	}
	guests, round := h.store.ListGuests()
	c.JSON(http.StatusOK, DrawResponse{
		Winners:        winners,
		GuestsResponse: GuestsResponse{Guests: guests, CurrentRound: round, Total: len(guests)},
	})
}

// Revoke 处理 POST /winners/:id/revoke。
func (h *Handler) Revoke(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		writeError(c, http.StatusBadRequest, "BAD_ID", "id must be a positive integer")
		return
	}
	if err := h.store.Revoke(id); err != nil {
		if errors.Is(err, ErrGuestNotFound) {
			writeError(c, http.StatusNotFound, "NOT_FOUND", "guest not found")
			return
		}
		if errors.Is(err, ErrGuestNotWinner) {
			writeError(c, http.StatusConflict, "NOT_A_WINNER", "guest has not won")
			return
		}
		log.Printf("lottery: revoke failed: %v", err)
		writeError(c, http.StatusInternalServerError, "REVOKE_FAILED", "could not save lottery state")
		return
	}
	log.Printf("lottery: winner revoked id=%d", id)
	guests, round := h.store.ListGuests()
	c.JSON(http.StatusOK, GuestsResponse{Guests: guests, CurrentRound: round, Total: len(guests)})
}

// Reset 处理 POST /reset。
func (h *Handler) Reset(c *gin.Context) {
	if err := h.store.Reset(); err != nil {
		log.Printf("lottery: reset failed: %v", err)
		writeError(c, http.StatusInternalServerError, "RESET_FAILED", "could not save lottery state")
		return
	}
	log.Print("lottery: store reset")
	guests, round := h.store.ListGuests()
	c.JSON(http.StatusOK, GuestsResponse{Guests: guests, CurrentRound: round, Total: len(guests)})
}

func normalizeCodes(codes []string) ([]string, error) {
	if len(codes) == 0 {
		return nil, errors.New("codes must not be empty")
	}
	if len(codes) > maxGuests {
		return nil, errors.New("at most 5000 guest codes are allowed")
	}

	seen := make(map[string]struct{}, len(codes))
	out := make([]string, 0, len(codes))
	for _, raw := range codes {
		code := strings.TrimSpace(raw)
		if code == "" || len(code) > maxCodeLength {
			return nil, errors.New("each code must be between 1 and 128 characters")
		}
		if _, exists := seen[code]; exists {
			return nil, errors.New("guest codes must be unique")
		}
		seen[code] = struct{}{}
		out = append(out, code)
	}
	return out, nil
}
