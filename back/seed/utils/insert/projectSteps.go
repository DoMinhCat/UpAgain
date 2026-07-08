package insert

import (
	"database/sql"
	"fmt"

	"backend/seed/utils"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertProjectSteps(tx *sql.Tx, postIDs []int) ([]int, error) {
	query := `
		INSERT INTO project_steps (is_deleted, title, description, id_post, "order")
		VALUES (false, $1, $2, $3, $4)
		RETURNING id
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare insert project steps statement: %w", err)
	}
	defer stmt.Close()

	var stepIDs []int
	for _, postID := range postIDs {
		// Generate between 2 to 5 structured sequential steps per post
		stepsCount := gofakeit.Number(2, 5)

		for currentOrder := 1; currentOrder <= stepsCount; currentOrder++ {
			title := gofakeit.Sentence(3)
			htmlDescription := fmt.Sprintf(utils.MOCK_HTML_CONTENT, title, gofakeit.Paragraph(1, 1, 5, " "), gofakeit.Paragraph(1, 1, 3, " "))

			var insertedID int
			// Cast currentOrder to float64 to match schema definition (order FLOAT)
			err := stmt.QueryRow(title, htmlDescription, postID, float64(currentOrder)).Scan(&insertedID)
			if err != nil {
				return nil, fmt.Errorf("failed to insert project step order %d for post %d: %w", currentOrder, postID, err)
			}
			stepIDs = append(stepIDs, insertedID)
		}
	}

	fmt.Printf("Successfully seeded %d sequential project steps across %d posts.\n", len(stepIDs), len(postIDs))
	return stepIDs, nil
}