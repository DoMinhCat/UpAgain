package helpers

import (
	"backend/models"
	"encoding/base64"
	"fmt"
	"image"
	_ "image/jpeg"
	"image/png"
	"io"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
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
	toEncode := fmt.Sprintf("%d|%s|%d", data.Id, data.UserType, data.IdAccount)

	// encode data into barcode
	img, err := writer.Encode(toEncode, gozxing.BarcodeFormat_CODE_128, 250, 50, nil)
	if err != nil {
		return "", fmt.Errorf("failed to encode barcode: %v", err)
	}

	// save barcode in images/barcodes/
	filename := fmt.Sprintf("%s-%s-%d.png", data.IdTransaction, data.UserType, time.Now().UnixNano())
	destDir := "images/barcodes"
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %v", err)
	}
	destPath := filepath.Join(destDir, filename)
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

func EncodeBarcodeToBase64(filepath string) (string, error) {
	file, err := os.Open(filepath)
	if err != nil {
		if strings.Contains(err.Error(), "The system cannot find the file specified") || strings.Contains(err.Error(), "no such file or directory") {
			return "", nil
		}
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %v", err)
	}
	return base64.StdEncoding.EncodeToString(data), nil
}

func IsCodeValid(idUser int, idContainer int, code models.Barcode) bool {
	if code.IdAccount != idUser {
		return false
	}
	if code.IdContainer != idContainer {
		return false
	}
	if code.Status != "active" {
		return false
	}
	if code.ValidTo.Before(time.Now()) || code.ValidFrom.After(time.Now()) {
		return false
	}
	return true
}

// DecodeBarcode decodes a barcode from the given image reader.
func DecodeBarcode(imgReader io.Reader) (string, error) {
	img, _, err := image.Decode(imgReader)
	if err != nil {
		return "", fmt.Errorf("failed to decode image: %v", err)
	}

	bmp, err := gozxing.NewBinaryBitmapFromImage(img)
	if err != nil {
		return "", fmt.Errorf("failed to create binary bitmap: %v", err)
	}

	// Try reading as Code 128 (our generated barcode format)
	reader := oned.NewCode128Reader()
	result, err := reader.Decode(bmp, nil)
	if err != nil {
		return "", fmt.Errorf("failed to decode barcode: %v", err)
	}

	return result.GetText(), nil
}
