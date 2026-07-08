package insert

import (
	"backend/seed/utils"
	"database/sql"
	"fmt"
	"time"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertEvents(tx *sql.Tx, employeeIDs []int, count int) ([]int, error) {
	query := `
		INSERT INTO events (title, description, start_at, end_at, price, category, capacity, status, city, street, postal_code, location_detail, created_by, lat, lng)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8, $9, $10, $11, $12, $13, $14)
		RETURNING id
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare insert events statement: %w", err)
	}
	defer stmt.Close()

	var eventIDs []int
	for i := 0; i < count; i++ {
		title := gofakeit.BookTitle()
		description := gofakeit.Paragraph(1, 3, 10, " ")
		startAt := gofakeit.DateRange(time.Now().AddDate(0, 0, 1), time.Now().AddDate(0, 0, 30))
		endAt := startAt.Add(time.Duration(gofakeit.Number(2, 6)) * time.Hour)
		
		var price *float64
		if gofakeit.Bool() {
			p := gofakeit.Float64Range(5.0, 50.0)
			price = &p
		}

		category := gofakeit.RandomString(utils.EVENT_CATEGORIES)
		capacity := gofakeit.Number(10, 200)
		city := "Paris"
		street := gofakeit.StreetName()
		postalCode := gofakeit.Zip()
		locationDetail := gofakeit.Phrase()
		createdBy := gofakeit.RandomInt(employeeIDs)
		
		lat := gofakeit.Float64Range(utils.ParisMinLat, utils.ParisMaxLat)
		lng := gofakeit.Float64Range(utils.ParisMinLng, utils.ParisMaxLng)

		var insertedID int
		err := stmt.QueryRow(title, description, startAt, endAt, price, category, capacity, city, street, postalCode, locationDetail, createdBy, lat, lng).Scan(&insertedID)
		if err != nil {
			return nil, fmt.Errorf("failed to insert event: %w", err)
		}
		eventIDs = append(eventIDs, insertedID)
	}

	fmt.Printf("Successfully seeded %d events.\n", len(eventIDs))
	return eventIDs, nil
}