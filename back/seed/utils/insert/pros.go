package insert

import (
	"database/sql"
	"fmt"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertPros(tx *sql.Tx, accountIds []int) (premiumIds []int, err error) {
	query := `
		INSERT INTO pros (id_account, phone, is_premium, completed_onboard)
		VALUES ($1, $2, $3, $4)
        RETURNING id
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare insert pros statement: %w", err)
	}
	defer stmt.Close()

	for _, accountID := range accountIds {
		phone := gofakeit.Phone()
		isPremium := gofakeit.Bool()
		completedOnboard := gofakeit.Bool()

		var insertedID int
		err := stmt.QueryRow(accountID, phone, isPremium, completedOnboard).Scan(&insertedID)
		if err != nil {
			return nil, fmt.Errorf("failed to insert pro for account %d: %w", accountID, err)
		}

		// return list of premium ids
		if isPremium {
			premiumIds = append(premiumIds, insertedID)
		}
	}

	fmt.Printf("Successfully seeded %d pros.\n", len(accountIds))
	return premiumIds, nil
}