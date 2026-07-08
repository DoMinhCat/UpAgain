package insert

import (
	"database/sql"
	"fmt"

	"backend/seed/utils" // Imported from your package path

	"github.com/brianvoe/gofakeit/v7"
)

func InsertItems(tx *sql.Tx, userIDs []int, count int) ([]int, error) {
	query := `
		INSERT INTO items (title, description, price, weight, material, status, state, is_deleted, id_user)
		VALUES ($1, $2, $3, $4, $5, $6, $7, false, $9)
		RETURNING id
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare insert items statement: %w", err)
	}
	defer stmt.Close()

	// Local enum tracking schemas mapped against database constraints
	itemStates := []string{"new", "very_good", "good", "need_repair"}

	var itemIDs []int
	for i := 0; i < count; i++ {
		title := gofakeit.AppName() // Generates short catchy mock names
		description := gofakeit.Sentence(8)
		price := gofakeit.Float64Range(0.0, 500.0)
		weight := gofakeit.Float64Range(0.1, 50.0)
		material := gofakeit.RandomString(utils.MATERIALS)
		status := "approved"
		state := gofakeit.RandomString(itemStates)

		idUser := gofakeit.RandomInt(userIDs)

		var insertedID int
		err := stmt.QueryRow(title, description, price, weight, material, status, state, idUser).Scan(&insertedID)
		if err != nil {
			return nil, fmt.Errorf("failed to insert item: %w", err)
		}
		itemIDs = append(itemIDs, insertedID)
	}

	fmt.Printf("Successfully seeded %d items.\n", len(itemIDs))
	return itemIDs, nil
}