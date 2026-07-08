package insert

import (
	"database/sql"
	"fmt"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertEventRegistrations(tx *sql.Tx, eventIDs []int, userIDs []int, proIDs []int) error {
	query := `
		INSERT INTO event_registrations (id_account, id_event, status, paid_price)
		VALUES ($1, $2, 'registered', $3)
		ON CONFLICT (id_event, id_account) DO NOTHING
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert event registrations statement: %w", err)
	}
	defer stmt.Close()

	// Combine allowed account IDs (users and pros only)
	allowedAccountIDs := append([]int{}, userIDs...)
	allowedAccountIDs = append(allowedAccountIDs, proIDs...)

	var totalInserted int
	for _, eventID := range eventIDs {
		// Randomly register between 5 to 20 accounts per event
		registrationCount := gofakeit.Number(5, 20)
		
		// Use unique maps to prevent duplicate composite key evaluation loops
		chosenAccounts := make(map[int]bool)
		for len(chosenAccounts) < registrationCount {
			chosenAccounts[gofakeit.RandomInt(allowedAccountIDs)] = true
		}

		for accountID := range chosenAccounts {
			paidPrice := gofakeit.Float64Range(0.0, 100.0)

			_, err := stmt.Exec(accountID, eventID, paidPrice)
			if err != nil {
				return fmt.Errorf("failed to insert event registration for event %d: %w", eventID, err)
			}
			totalInserted++
		}
	}

	fmt.Printf("Successfully seeded %d event registrations.\n", totalInserted)
	return nil
}