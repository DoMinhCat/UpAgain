package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
)

func GetPendingDeposits() ([]models.PendingDepositResponse, error) {

	query := `
		SELECT 
			i.id, i.title, i.description, i.material, i.state, i.weight, i.created_at,
			d.id_container, c.city_name, c.postal_code,
			i.id_user, a.username
		FROM items i
		JOIN deposits d ON i.id = d.id_item
		JOIN containers c ON d.id_container = c.id
		JOIN accounts a ON i.id_user = a.id
		WHERE i.status = 'pending' AND i.is_deleted = false
		ORDER BY i.created_at ASC
	`

	rows, err := utils.Conn.Query(query)
	if err != nil {

		return nil, fmt.Errorf("error getting pending deposits from DB: %v", err)
	}
	defer rows.Close()

	deposits := []models.PendingDepositResponse{}

	for rows.Next() {
		var deposit models.PendingDepositResponse
		var description sql.NullString
		err := rows.Scan(
			&deposit.ItemID, &deposit.Title, &description, &deposit.Material, &deposit.State, &deposit.Weight, &deposit.CreatedAt,
			&deposit.ContainerID, &deposit.CityName, &deposit.PostalCode,
			&deposit.UserID, &deposit.Username,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning pending deposit row: %v", err)
		}

		if description.Valid {
			deposit.Description = description.String
		}
		deposits = append(deposits, deposit)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating pending deposits rows: %v", err)
	}
	return deposits, nil
}

func GetPendingListings() ([]models.PendingListingResponse, error) {
	query := `
        SELECT 
            i.id, i.title, i.description, i.material, i.state, i.weight, i.price, i.created_at, 
            l.city_name, l.postal_code, 
            i.id_user, a.username
        FROM items i 
        JOIN listings l ON l.id_item = i.id
        JOIN accounts a ON a.id = i.id_user
        WHERE i.status = 'pending' AND i.is_deleted = false
        ORDER BY i.created_at ASC
    `
	rows, err := utils.Conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error getting pending listings from DB: %v", err)
	}
	defer rows.Close()

	listings := []models.PendingListingResponse{}

	for rows.Next() {
		var listing models.PendingListingResponse

		err := rows.Scan(
			&listing.ItemID, &listing.Title, &listing.Description, &listing.Material, &listing.State, &listing.Weight, &listing.Price, &listing.CreatedAt,
			&listing.CityName, &listing.PostalCode,
			&listing.UserID, &listing.Username,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning pending listing row: %v", err)
		}

		listings = append(listings, listing)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating pending listings rows: %v", err)
	}

	return listings, nil
}

func GetPendingEvents() ([]models.PendingEventResponse, error) {
	query := `
		SELECT 
			ev.id, ev.title, ev.description, ev.category, ev.date_start, ev.time_start, 
			ev.capacity, ev.price, ev.created_at, ee.id_employee, acc.username
		FROM events ev
		JOIN event_employee ee ON ev.id = ee.id_event
		JOIN accounts acc ON ee.id_employee = acc.id
		WHERE ev.status = 'pending' AND ev.is_cancelled = false
		ORDER BY ev.created_at ASC
	`

	rows, err := utils.Conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error getting pending events from DB: %v", err)
	}
	defer rows.Close()

	events := []models.PendingEventResponse{}

	for rows.Next() {
		var ev models.PendingEventResponse

		err := rows.Scan(
			&ev.EventID,
			&ev.Title,
			&ev.Description,
			&ev.Category,
			&ev.DateStart,
			&ev.TimeStart,
			&ev.Capacity,
			&ev.Price,
			&ev.CreatedAt,
			&ev.EmployeeID,
			&ev.EmployeeUsername,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning pending event row: %v", err)
		}

		events = append(events, ev)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating pending events rows: %v", err)
	}

	return events, nil
}

func UpdateListingStatus(itemID int, newStatus string, employeeID int) error {
	tx, err := utils.Conn.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}

	defer tx.Rollback()

	updateQuery := `UPDATE items SET status = $1 WHERE id = $2`
	_, err = tx.Exec(updateQuery, newStatus, itemID)
	if err != nil {
		return fmt.Errorf("error updating item status in tx: %v", err)
	}

	historyQuery := `
		INSERT INTO admin_history (entity_type, entity_id, action, id_employee)
		VALUES ('listing', $1, 'update', $2)
	`
	_, err = tx.Exec(historyQuery, itemID, employeeID)
	if err != nil {
		return fmt.Errorf("error inserting into admin_history in tx: %v", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	return nil
}

func UpdateEventStatus(eventID int, newStatus string, employeeID int) error {
	tx, err := utils.Conn.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}

	defer tx.Rollback()

	updateQuery := `UPDATE events SET status = $1 WHERE id = $2`
	_, err = tx.Exec(updateQuery, newStatus, eventID)
	if err != nil {
		return fmt.Errorf("error updating event status in tx: %v", err)
	}

	historyQuery := `
		INSERT INTO admin_history (entity_type, entity_id, action, id_employee)
		VALUES ('event', $1, 'update', $2)
	`
	_, err = tx.Exec(historyQuery, eventID, employeeID)
	if err != nil {
		return fmt.Errorf("error inserting into admin_history in tx: %v", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("error committing event transaction: %v", err)
	}

	return nil
}
