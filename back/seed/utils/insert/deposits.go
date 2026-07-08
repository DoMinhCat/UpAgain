package insert

import (
	"database/sql"
	"fmt"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertDeposits(tx *sql.Tx, itemIDs []int, containerIDs []int) error {
	if len(containerIDs) == 0 {
		return fmt.Errorf("cannot seed deposits: containerIDs slice is empty")
	}

	query := `
		INSERT INTO deposits (id_item, id_container)
		VALUES ($1, $2)
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert deposits statement: %w", err)
	}
	defer stmt.Close()

	for _, itemID := range itemIDs {
		idContainer := gofakeit.RandomInt(containerIDs)

		_, err := stmt.Exec(itemID, idContainer)
		if err != nil {
			return fmt.Errorf("failed to insert deposit for item %d: %w", itemID, err)
		}
	}

	fmt.Printf("Successfully seeded %d deposits.\n", len(itemIDs))
	return nil
}