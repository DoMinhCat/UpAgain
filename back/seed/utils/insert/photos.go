package insert

import (
	"database/sql"
	"fmt"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertPhotos(tx *sql.Tx, itemIDs []int, postIDs []int, stepIDs []int, eventIDs []int, accountIDs []int) error {
	query := `
		INSERT INTO photos (is_primary, path, object_type, item_id, post_id, step_id, event_id, account_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert photos statement: %w", err)
	}
	defer stmt.Close()

	// Helper to generate a unique public mock image link
	getPhotoURL := func() string {
		return fmt.Sprintf("https://picsum.photos/seed/%s/800/600", gofakeit.UUID())
	}

	// 1. Seed Avatars (Strictly 1 photo per account, is_primary is irrelevant or true here)
	for _, accountID := range accountIDs {
		_, err := stmt.Exec(false, getPhotoURL(), "avatar", nil, nil, nil, nil, accountID)
		if err != nil {
			return fmt.Errorf("failed to insert avatar photo for account %d: %w", accountID, err)
		}
	}

	// 2. Helper for multi-photo relational entities
	seedMultiPhotos := func(ids []int, objectType string) error {
		for _, entityID := range ids {
			// Generate between 2 to 5 photos per entity
			photoCount := gofakeit.Number(2, 5)
			primaryIndex := gofakeit.Number(0, photoCount-1)

			for i := 0; i < photoCount; i++ {
				isPrimary := i == primaryIndex
				path := getPhotoURL()

				var itemID, postID, stepID, eventID sql.NullInt64
				switch objectType {
				case "item":
					itemID = sql.NullInt64{Int64: int64(entityID), Valid: true}
				case "post":
					postID = sql.NullInt64{Int64: int64(entityID), Valid: true}
				case "step":
					stepID = sql.NullInt64{Int64: int64(entityID), Valid: true}
				case "event":
					eventID = sql.NullInt64{Int64: int64(entityID), Valid: true}
				}

				_, err := stmt.Exec(isPrimary, path, objectType, itemID, postID, stepID, eventID, nil)
				if err != nil {
					return fmt.Errorf("failed to insert %s photo for entity %d: %w", objectType, entityID, err)
				}
			}
		}
		return nil
	}

	// Execute multi-photo seeding based on constraint mappings
	if err := seedMultiPhotos(itemIDs, "item"); err != nil {
		return err
	}
	if err := seedMultiPhotos(postIDs, "post"); err != nil {
		return err
	}
	if err := seedMultiPhotos(stepIDs, "step"); err != nil {
		return err
	}
	if err := seedMultiPhotos(eventIDs, "event"); err != nil {
		return err
	}

	fmt.Println("Successfully seeded single-source constrained entity photos.")
	return nil
}