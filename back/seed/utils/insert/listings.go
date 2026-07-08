package insert

import (
	"database/sql"
	"fmt"

	"backend/seed/utils"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertListings(tx *sql.Tx, itemIDs []int) error {
	query := `
		INSERT INTO listings (id_item, street, city_name, postal_code, lat, lng)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert listings statement: %w", err)
	}
	defer stmt.Close()

	for _, itemID := range itemIDs {
		street := gofakeit.StreetName()
		cityName := "Paris"
		postalCode := gofakeit.Zip()
		lat := gofakeit.Float64Range(utils.PARIS_MIN_LAT, utils.PARIS_MAX_LAT)
		lng := gofakeit.Float64Range(utils.PARIS_MIN_LNG, utils.PARIS_MAX_LNG)

		_, err := stmt.Exec(itemID, street, cityName, postalCode, lat, lng)
		if err != nil {
			return fmt.Errorf("failed to insert listing for item %d: %w", itemID, err)
		}
	}

	fmt.Printf("Successfully seeded %d listings.\n", len(itemIDs))
	return nil
}