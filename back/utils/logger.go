package utils

import (
	"io"
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

		// Open or create the log file (append mode)
		// 0666 grants read/write permissions to the file
		logFile, err := os.OpenFile("backend.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			// Fallback strictly to stdout if the VM file system fails
			handler := slog.NewJSONHandler(os.Stdout, opts)
			slog.SetDefault(slog.New(handler))
			slog.Error("Failed to open log file, falling back to stdout", "error", err)
			return
		}

		multiWriter := io.MultiWriter(os.Stdout, logFile)

		// Use JSON
		handler := slog.NewJSONHandler(multiWriter, opts)
		logger := slog.New(handler)

		// Set as the global logger
		slog.SetDefault(logger)
	})
}
