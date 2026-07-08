package insert

import (
	"backend/seed/utils"
	"database/sql"
	"fmt"
	"time"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertPosts(tx *sql.Tx, proIDs []int, employeeIDs []int, count int) ([]int, []int, error) {
	query := `
		INSERT INTO posts (title, content, category, view_count, like_count, is_deleted, id_account, end_date)
		VALUES ($1, $2, $3, 0, 0, false, $4, $5)
		RETURNING id
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to prepare insert posts statement: %w", err)
	}
	defer stmt.Close()

	var postIDs []int
	var projectIDs []int
	for i := 0; i < count; i++ {
		title := gofakeit.BookTitle()
		htmlContent := fmt.Sprintf(utils.MOCK_HTML_CONTENT, title, gofakeit.Paragraph(1, 2, 8, " "), gofakeit.Paragraph(1, 2, 5, " "))
		
		var accountID int
		var category string
		var endDate *time.Time

		// 50/50 distribution between Pro or Employee accounts
		if gofakeit.Bool() && len(proIDs) > 0 {
			accountID = gofakeit.RandomInt(proIDs)
			category = utils.CATEGORY_PROJECT
		} else {
			accountID = gofakeit.RandomInt(employeeIDs)
			category = gofakeit.RandomString(utils.NON_PROJECT_POST_CATEGORIES)
			
			if category == utils.CATEGORY_TIPS {
				futureDate := gofakeit.DateRange(time.Now().AddDate(0, 0, 7), time.Now().AddDate(0, 1, 0))
				endDate = &futureDate
			}
		}

		var insertedID int
		err := stmt.QueryRow(title, htmlContent, category, accountID, endDate).Scan(&insertedID)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to insert post: %w", err)
		}
		postIDs = append(postIDs, insertedID)
		if category == utils.CATEGORY_PROJECT {
			projectIDs = append(projectIDs, insertedID)
		}
	}

	fmt.Printf("Successfully seeded %d posts.\n", len(postIDs))
	return postIDs, projectIDs, nil
}