package insert

import (
	"database/sql"
	"fmt"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertComments(tx *sql.Tx, postIDs []int, userIDs []int, proIDs []int, count int) ([]int, error) {
	query := `
		INSERT INTO comments (content, is_deleted, like_count, id_post, id_account)
		VALUES ($1, false, 0, $2, $3)
		RETURNING id
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare insert comments statement: %w", err)
	}
	defer stmt.Close()

	// Combine allowed account IDs (users and pros only)
	allowedAccountIDs := append([]int{}, userIDs...)
	allowedAccountIDs = append(allowedAccountIDs, proIDs...)

	var commentIDs []int
	for i := 0; i < count; i++ {
		content := gofakeit.Sentence(6)
		idPost := gofakeit.RandomInt(postIDs)
		idAccount := gofakeit.RandomInt(allowedAccountIDs)

		var insertedID int
		err := stmt.QueryRow(content, idPost, idAccount).Scan(&insertedID)
		if err != nil {
			return nil, fmt.Errorf("failed to insert comment: %w", err)
		}
		commentIDs = append(commentIDs, insertedID)
	}

	fmt.Printf("Successfully seeded %d comments.\n", len(commentIDs))
	return commentIDs, nil
}