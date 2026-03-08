package utils

import (
	"log/slog"
	"os"
	"sync"
)

var once sync.Once

// sets up the global slog instance
func InitLogger() {
	// avoid accidentally re-init the logger
	once.Do(func() {
		opts := &slog.HandlerOptions{
			Level: slog.LevelDebug,
		}

		// Use JSON
		handler := slog.NewJSONHandler(os.Stdout, opts)
		logger := slog.New(handler)

		// Set as the global logger
		slog.SetDefault(logger)
	})
}
