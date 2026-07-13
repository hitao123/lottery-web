package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"lottery-server/internal/lottery"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery(), corsMiddleware())

	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	dataFile := os.Getenv("LOTTERY_DATA_FILE")
	if dataFile == "" {
		dataFile = "./data/lottery-state.json"
	}
	store, err := lottery.NewPersistentStore(dataFile)
	if err != nil {
		log.Fatalf("load lottery state: %v", err)
	}
	adminToken := os.Getenv("LOTTERY_ADMIN_TOKEN")
	if adminToken == "" {
		log.Print("WARNING: LOTTERY_ADMIN_TOKEN is not set; API protection is disabled")
	}
	lottery.RegisterRoutes(r, store, adminToken)

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    16 << 10,
	}

	go func() {
		log.Printf("lottery-server listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server error: %v", err)
		}
	}()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()

	log.Println("shutdown signal received, draining...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("graceful shutdown failed: %v", err)
	}
	log.Println("bye")
}

// corsMiddleware 仅用于显式配置的本地跨源开发；线上同源代理不发送 CORS 头。
func corsMiddleware() gin.HandlerFunc {
	allowOrigin := os.Getenv("CORS_ALLOW_ORIGIN")
	return func(c *gin.Context) {
		if allowOrigin == "" {
			c.Next()
			return
		}
		c.Header("Access-Control-Allow-Origin", allowOrigin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, X-Request-Id")
		c.Header("Access-Control-Max-Age", "600")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
