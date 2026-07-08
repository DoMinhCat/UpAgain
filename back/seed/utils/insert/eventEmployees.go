package insert

import (
	"database/sql"
	"fmt"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertEventEmployees(tx *sql.Tx, eventIDs []int, employeeIDs []int) error {
	query := `
		INSERT INTO event_employee (id_event, id_employee)
		VALUES ($1, $2)
		ON CONFLICT (id_event, id_employee) DO NOTHING
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert event employee statement: %w", err)
	}
	defer stmt.Close()

	var totalInserted int
	for _, eventID := range eventIDs {
		// Assign 1 to 3 distinct employees to manage/supervise each event
		assignmentCount := gofakeit.Number(1, 3)
		if assignmentCount > len(employeeIDs) {
			assignmentCount = len(employeeIDs)
		}

		chosenEmployees := make(map[int]bool)
		for len(chosenEmployees) < assignmentCount {
			chosenEmployees[gofakeit.RandomInt(employeeIDs)] = true
		}

		for employeeID := range chosenEmployees {
			_, err := stmt.Exec(eventID, employeeID)
			if err != nil {
				return fmt.Errorf("failed to assign employee %d to event %d: %w", employeeID, eventID, err)
			}
			totalInserted++
		}
	}

	fmt.Printf("Successfully seeded %d event employee assignments.\n", totalInserted)
	return nil
}