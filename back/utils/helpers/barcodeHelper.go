package helpers

import (
	"backend/models"
	"fmt"
	"image/png"
	"math/rand"
	"os"
	"path/filepath"
	"time"

	"github.com/makiuchi-d/gozxing"
	"github.com/makiuchi-d/gozxing/oned"
)

// GenerateRandom6CharCode generates a random 6-character code for many purposes
func GenerateRandom6CharCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

// GenerateAndSaveBarcode generates a barcode from the given data and saves it to images/barcodes/.
//
// Return the path to the generated barcode.
func GenerateAndSaveBarcode(data models.BarCodeData) (string, error) {
	writer := oned.NewCode128Writer()
	if data.UserType != "u" && data.UserType != "p" {
		return "", fmt.Errorf("invalid user type, must be 'u' or 'p'")
	}

	// shorten the payload
	toEncode := fmt.Sprintf("%s|%s|%d", data.IdTransaction, data.UserType, data.IdAccount)
	
	// encode data into barcode
	img, err := writer.Encode(toEncode, gozxing.BarcodeFormat_CODE_128, 250, 50, nil)
	if err != nil {
		return "", fmt.Errorf("failed to encode barcode: %v", err)
	}

	// save barcode in images/barcodes/
	filename := fmt.Sprintf("%s-%s-%d.png",data.IdTransaction, data.UserType, time.Now().UnixNano())
	destPath := filepath.Join("images/barcodes/", filename)
	file, err := os.Create(destPath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer file.Close()

	err = png.Encode(file, img)
	if err != nil {
		return "", fmt.Errorf("failed to encode barcode in png: %v", err)
	}
	return filepath.ToSlash(destPath), nil
}
