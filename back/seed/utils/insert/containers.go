package insert

import (
	"database/sql"
	"fmt"

	"github.com/brianvoe/gofakeit/v7"
)

// InsertContainers generates and inserts a set of dummy containers into the 'containers' table.
// It returns a slice of the generated container IDs.
func InsertContainers(tx *sql.Tx) (containerIDs []int, err error) {
	query := `
		INSERT INTO containers (city_name, postal_code, street, status, is_deleted, lat, lng)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare insert containers statement: %w", err)
	}
	defer stmt.Close()

	// Seed 30 containers
	for i := 0; i < 30; i++ {
		city := gofakeit.City()
		zip := gofakeit.Zip()
		street := gofakeit.StreetName() + " " + gofakeit.StreetSuffix()
		status := "ready"
		isDeleted := false
		
		// Focus coordinates around Paris
		lat, err := gofakeit.LatitudeInRange(48.815, 48.900)
		if err != nil {
			return nil, fmt.Errorf("failed to generate lat: %w", err)
		}
		lng, err := gofakeit.LongitudeInRange(2.224, 2.470)
		if err != nil {
			return nil, fmt.Errorf("failed to generate lng: %w", err)
		}

		var insertedID int
		err = stmt.QueryRow(city, zip, street, status, isDeleted, lat, lng).Scan(&insertedID)
		if err != nil {
			return nil, fmt.Errorf("failed to insert container: %w", err)
		}

		containerIDs = append(containerIDs, insertedID)
	}

	fmt.Printf("Successfully seeded %d containers.\n", len(containerIDs))
	return containerIDs, nil
}
