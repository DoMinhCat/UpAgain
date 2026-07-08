package insert

import (
	"database/sql"
	"fmt"
	"math/rand"

	"backend/seed/utils" // Imported from your package path

	"github.com/brianvoe/gofakeit/v7"
)

func InsertProAlertMaterials(tx *sql.Tx, premiumProIDs []int) error {
	query := `
		INSERT INTO pro_alert_materials (id_pro, material)
		VALUES ($1, $2)
		ON CONFLICT (id_pro, material) DO NOTHING
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert pro alert materials statement: %w", err)
	}
	defer stmt.Close()

	var totalInserted int
	for _, proID := range premiumProIDs {
		// Assign between 1 to 3 random alert materials per premium user
		numMaterials := gofakeit.Number(1, 3)
		
		// Copy array from utils package to avoid race conditions/mutations
		shuffled := make([]string, len(utils.MATERIALS))
		copy(shuffled, utils.MATERIALS)
		
		// Slice Shuffle Algorithm Fix
		for i := len(shuffled) - 1; i > 0; i-- {
			j := rand.Intn(i + 1)
			shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
		}

		for i := 0; i < numMaterials; i++ {
			material := shuffled[i]
			_, err := stmt.Exec(proID, material)
			if err != nil {
				return fmt.Errorf("failed to insert pro alert material for pro %d: %w", proID, err)
			}
			totalInserted++
		}
	}

	fmt.Printf("Successfully seeded %d premium pro material alerts.\n", totalInserted)
	return nil
}