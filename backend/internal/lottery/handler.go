package lottery

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
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
	if err := c.ShouldBindJSON(&req); err != nil {
		writeError(c, http.StatusBadRequest, "BAD_REQUEST", "invalid body: "+err.Error())
		return
	}
	if len(req.Codes) == 0 {
		writeError(c, http.StatusBadRequest, "EMPTY_CODES", "codes must not be empty")
		return
	}
	total := h.store.SetGuests(req.Codes)
	log.Printf("lottery: guests uploaded total=%d", total)
	c.JSON(http.StatusOK, gin.H{"total": total})
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
		if err := c.ShouldBindJSON(&req); err != nil {
			writeError(c, http.StatusBadRequest, "BAD_REQUEST", "invalid body: "+err.Error())
			return
		}
	}
	winners, err := h.store.Draw(req.Count)
	if err != nil {
		if errors.Is(err, ErrEmptyPool) {
			writeError(c, http.StatusConflict, "EMPTY_POOL", "no available guests")
			return
		}
		writeError(c, http.StatusInternalServerError, "DRAW_FAILED", err.Error())
		return
	}
	for _, w := range winners {
		round := 0
		if w.WonAtRound != nil {
			round = *w.WonAtRound
		}
		log.Printf("lottery: winner id=%d code=%s round=%d", w.ID, w.Code, round)
	}
	c.JSON(http.StatusOK, DrawResponse{Winners: winners})
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
		writeError(c, http.StatusInternalServerError, "REVOKE_FAILED", err.Error())
		return
	}
	log.Printf("lottery: winner revoked id=%d", id)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// Reset 处理 POST /reset。
func (h *Handler) Reset(c *gin.Context) {
	h.store.Reset()
	log.Print("lottery: store reset")
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
