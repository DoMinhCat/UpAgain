package insert

import (
	"database/sql"
	"fmt"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertUsers(tx *sql.Tx, accountIds []int) error {
	query := `
		INSERT INTO users (id_account, country_code, phone, up_score, completed_onboard)
		VALUES ($1, $2, $3, $4, $5)
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert users statement: %w", err)
	}
	defer stmt.Close()

	for _, accountID := range accountIds {
		// Generate realistic mock values
		countryCode := "+33"
		phone := gofakeit.Phone()
		upScore := gofakeit.Number(0, 99)
		completedOnboard := gofakeit.Bool()

		_, err := stmt.Exec(accountID, countryCode, phone, upScore, completedOnboard)
		if err != nil {
			return fmt.Errorf("failed to insert user for account %d: %w", accountID, err)
		}
	}

	fmt.Printf("Successfully seeded %d users.\n", len(accountIds))
	return nil
}
