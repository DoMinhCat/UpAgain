package helper

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
)

// SaveUploadedFile saves a multipart file to the specified directory with a unique name.
func SaveUploadedFile(file *multipart.FileHeader, destDir string) (string, error) {
	// Create the destination directory if it doesn't exist
	if _, err := os.Stat(destDir); os.IsNotExist(err) {
		err := os.MkdirAll(destDir, 0755)
		if err != nil {
			return "", fmt.Errorf("could not create directory: %v", err)
		}
	}

	// Generate a unique filename
	filename := fmt.Sprintf("%d-%s", time.Now().UnixNano(), file.Filename)
	destPath := filepath.Join(destDir, filename)

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	dst, err := os.Create(destPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return "", err
	}

	return filepath.ToSlash(destPath), nil
}
