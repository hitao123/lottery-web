package lottery

import (
	"crypto/subtle"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes 将 /api/lottery/* 路由挂载到 r 上，复用同一个 Store。
func RegisterRoutes(r *gin.Engine, s *Store, adminToken string) {
	h := NewHandler(s)
	g := r.Group("/api/lottery")
	{
		g.Use(requireAdminToken(adminToken))
		g.POST("/guests", h.UploadGuests)
		g.GET("/guests", h.ListGuests)
		g.POST("/draw", h.Draw)
		g.GET("/draws/:requestID", h.LookupDraw)
		g.POST("/winners/:id/revoke", h.Revoke)
		g.POST("/reset", h.Reset)
	}
}

func requireAdminToken(expected string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 空 token 仅用于本地开发，生产 Docker Compose 强制要求配置 token。
		if expected == "" {
			c.Next()
			return
		}
		actual := c.GetHeader("X-Lottery-Admin-Token")
		if len(actual) != len(expected) || subtle.ConstantTimeCompare([]byte(actual), []byte(expected)) != 1 {
			writeError(c, http.StatusUnauthorized, "UNAUTHORIZED", "operator password is required")
			return
		}
		c.Next()
	}
}
