package insert

import (
	"database/sql"
	"fmt"
	"math/rand"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertNotiSettingsForRoles(tx *sql.Tx, userIDs []int, proIDs []int, employeeIDs []int) error {
	query := `
		INSERT INTO noti_settings (id_account, noti_type, is_enabled)
		VALUES ($1, $2, $3)
		ON CONFLICT (id_account, noti_type) DO NOTHING
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert noti settings statement: %w", err)
	}
	defer stmt.Close()

	roleSettings := []struct {
		ids       []int
		notiTypes []string
	}{
		{
			ids: userIDs,
			notiTypes: []string{
				"user_object_status",
				"user_validation_status",
				"user_object_retrieved",
				"user_event_updated",
				"user_code_expiring",
			},
		},
		{
			ids: proIDs,
			notiTypes: []string{
				"pro_material_available",
				"pro_object_deposited",
				"pro_object_expired",
				"pro_subscription_end",
				"pro_code_expiring",
			},
		},
		{
			ids: employeeIDs,
			notiTypes: []string{
				"emp_event_updated",
				"emp_event_assigned",
			},
		},
	}

	var totalInserted int
	for _, group := range roleSettings {
		for _, accountID := range group.ids {
			numToSeed := gofakeit.Number(1, len(group.notiTypes))

			// Create a copy of the slice to avoid modifying original group layout
			shuffledTypes := make([]string, len(group.notiTypes))
			copy(shuffledTypes, group.notiTypes)

			// Shuffle slice algorithm
			for i := len(shuffledTypes) - 1; i > 0; i-- {
				j := rand.Intn(i + 1)
				shuffledTypes[i], shuffledTypes[j] = shuffledTypes[j], shuffledTypes[i]
			}

			for i := 0; i < numToSeed; i++ {
				notiType := shuffledTypes[i]
				isEnabled := gofakeit.Bool()

				_, err := stmt.Exec(accountID, notiType, isEnabled)
				if err != nil {
					return fmt.Errorf("failed to insert noti setting %s for account %d: %w", notiType, accountID, err)
				}
				totalInserted++
			}
		}
	}

	fmt.Printf("Successfully seeded %d role-specific notification settings.\n", totalInserted)
	return nil
}