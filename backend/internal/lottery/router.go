package lottery

import "github.com/gin-gonic/gin"

// RegisterRoutes 将 /api/lottery/* 路由挂载到 r 上，复用同一个 Store。
func RegisterRoutes(r *gin.Engine, s *Store) {
	h := NewHandler(s)
	g := r.Group("/api/lottery")
	{
		g.POST("/guests", h.UploadGuests)
		g.GET("/guests", h.ListGuests)
		g.POST("/draw", h.Draw)
		g.POST("/winners/:id/revoke", h.Revoke)
		g.POST("/reset", h.Reset)
	}
}
