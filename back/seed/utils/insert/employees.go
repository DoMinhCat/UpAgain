package insert

import (
	"database/sql"
	"fmt"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertEmployees(tx *sql.Tx, accountIds []int) error {
	query := `
		INSERT INTO employees (id_account, is_admin)
		VALUES ($1, $2)
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert employees statement: %w", err)
	}
	defer stmt.Close()

	for _, accountID := range accountIds {
		// Generate realistic mock value for employee role
		isAdmin := gofakeit.Bool()

		_, err := stmt.Exec(accountID, isAdmin)
		if err != nil {
			return fmt.Errorf("failed to insert employee for account %d: %w", accountID, err)
		}
	}

	fmt.Printf("Successfully seeded %d employees.\n", len(accountIds))
	return nil
}
