package insert

import (
	"database/sql"
	"fmt"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertPros(tx *sql.Tx, accountIds []int) error {
	query := `
		INSERT INTO pros (id_account, phone, is_premium, completed_onboard)
		VALUES ($1, $2, $3, $4)
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert pros statement: %w", err)
	}
	defer stmt.Close()

	for _, accountID := range accountIds {
		phone := gofakeit.Phone()
		isPremium := gofakeit.Bool()
		completedOnboard := gofakeit.Bool()

		_, err := stmt.Exec(accountID, phone, isPremium, completedOnboard)
		if err != nil {
			return fmt.Errorf("failed to insert pro for account %d: %w", accountID, err)
		}
	}

	fmt.Printf("Successfully seeded %d pros.\n", len(accountIds))
	return nil
}