package barcode

import (
	"encoding/json"
	"fmt"
	"image/png"
	"os"

	"backend/models"

	"github.com/makiuchi-d/gozxing"
	"github.com/makiuchi-d/gozxing/oned"
)

// GenerateAndSaveBarcode generates a barcode from the given data and saves it to images/barcodes/.
func GenerateAndSaveBarcode(data models.BarCodeData, filepath string) error {
	writer := oned.NewCode128Writer()
	jsonStr, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal barcode data: %v", err)
	}
	img, err := writer.Encode(string(jsonStr), gozxing.BarcodeFormat_CODE_128, 250, 50, nil)
	if err != nil {
		return fmt.Errorf("failed to encode barcode: %v", err)
	}


	
	filename := fmt.Sprintf("%s-%s.png",data.IdTransaction, data.UserType)
	destPath := filepath.Join("images/barcodes/", filename)
	file, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("failed to create file: %v", err)
	}
	defer file.Close()

	err = png.Encode(file, img)
	if err != nil {
		return fmt.Errorf("failed to encode barcode in png: %v", err)
	}
	return nil
}
