package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
)

func GetAllItemsHistory() ([]models.AllItemResponse, error) {
	query := `
		SELECT 
			i.id, i.title, i.status::text as status, i.created_at, a.username,
			CASE 
				WHEN d.id_item IS NOT NULL THEN 'Deposit'
				WHEN l.id_item IS NOT NULL THEN 'Listing'
				ELSE 'Unknown'
			END as item_type
		FROM items i
		JOIN accounts a ON i.id_user = a.id
		LEFT JOIN deposits d ON i.id = d.id_item
		LEFT JOIN listings l ON i.id = l.id_item
		WHERE i.is_deleted = false

		UNION ALL

		SELECT 
			ev.id, ev.title, ev.status::text as status, ev.created_at, acc.username,
			'Event' as item_type
		FROM events ev
		JOIN event_employee ee ON ev.id = ee.id_event
		JOIN accounts acc ON ee.id_employee = acc.id
		WHERE ev.status!='cancelled'

		ORDER BY created_at DESC
	`

	rows, err := utils.Conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error getting all items and events history: %v", err)
	}
	defer rows.Close()

	var items []models.AllItemResponse
	for rows.Next() {
		var item models.AllItemResponse
		err := rows.Scan(&item.ID, &item.Title, &item.Status, &item.CreatedAt, &item.Username, &item.ItemType)
		if err != nil {
			return nil, fmt.Errorf("error scanning history row: %v", err)
		}
		items = append(items, item)
	}
	return items, nil
}

// GetPendingDeposits returns paginated pending deposits with optional search/sort.
// page=-1 and limit=-1 returns all records.
func GetPendingDeposits(page, limit int, filters models.ValidationFilters) ([]models.PendingDepositResponse, int, error) {
	var params []interface{}
	var countParams []interface{}
	paramIndex := 1

	whereClause := "WHERE i.status = 'pending' AND i.is_deleted = false"

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(
			" AND (i.title ILIKE $%d OR a.username ILIKE $%d OR CAST(i.id AS TEXT) ILIKE $%d OR c.city_name ILIKE $%d)",
			paramIndex, paramIndex, paramIndex, paramIndex,
		)
		params = append(params, searchParam)
		countParams = append(countParams, searchParam)
		paramIndex++
	}

	orderBy := "ORDER BY i.created_at ASC"
	if filters.Sort == "most_recent" {
		orderBy = "ORDER BY i.created_at DESC"
	}

	countQuery := `
		SELECT COUNT(*)
		FROM items i
		JOIN deposits d ON i.id = d.id_item
		JOIN containers c ON d.id_container = c.id
		JOIN accounts a ON i.id_user = a.id
		` + whereClause

	var totalRecords int
	if err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&totalRecords); err != nil {
		return nil, 0, fmt.Errorf("GetPendingDeposits() count failed: %v", err)
	}

	query := `
		SELECT
			i.id, i.title, i.description, i.material, i.state, i.weight, i.created_at,
			d.id_container, c.city_name, c.postal_code,
			i.id_user, a.username
		FROM items i
		JOIN deposits d ON i.id = d.id_item
		JOIN containers c ON d.id_container = c.id
		JOIN accounts a ON i.id_user = a.id
		` + whereClause + " " + orderBy

	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)
	if err != nil {
		return nil, 0, fmt.Errorf("GetPendingDeposits() query failed: %v", err)
	}
	defer rows.Close()

	deposits := []models.PendingDepositResponse{}
	for rows.Next() {
		var deposit models.PendingDepositResponse
		var description sql.NullString
		if err := rows.Scan(
			&deposit.ItemID, &deposit.Title, &description, &deposit.Material, &deposit.State, &deposit.Weight, &deposit.CreatedAt,
			&deposit.ContainerID, &deposit.CityName, &deposit.PostalCode,
			&deposit.UserID, &deposit.Username,
		); err != nil {
			return nil, 0, fmt.Errorf("GetPendingDeposits() scan failed: %v", err)
		}
		if description.Valid {
			deposit.Description = description.String
		}
		deposits = append(deposits, deposit)
	}
	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("GetPendingDeposits() rows error: %v", err)
	}
	return deposits, totalRecords, nil
}

// GetPendingListings returns paginated pending listings with optional search/sort.
// page=-1 and limit=-1 returns all records.
func GetPendingListings(page, limit int, filters models.ValidationFilters) ([]models.PendingListingResponse, int, error) {
	var params []interface{}
	var countParams []interface{}
	paramIndex := 1

	whereClause := "WHERE i.status = 'pending' AND i.is_deleted = false"

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(
			" AND (i.title ILIKE $%d OR a.username ILIKE $%d OR CAST(i.id AS TEXT) ILIKE $%d OR l.city_name ILIKE $%d)",
			paramIndex, paramIndex, paramIndex, paramIndex,
		)
		params = append(params, searchParam)
		countParams = append(countParams, searchParam)
		paramIndex++
	}

	orderBy := "ORDER BY i.created_at ASC"
	if filters.Sort == "most_recent" {
		orderBy = "ORDER BY i.created_at DESC"
	}

	countQuery := `
		SELECT COUNT(*)
		FROM items i
		JOIN listings l ON l.id_item = i.id
		JOIN accounts a ON a.id = i.id_user
		` + whereClause

	var totalRecords int
	if err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&totalRecords); err != nil {
		return nil, 0, fmt.Errorf("GetPendingListings() count failed: %v", err)
	}

	query := `
		SELECT
			i.id, i.title, i.description, i.material, i.state, i.weight, i.price, i.created_at,
			l.city_name, l.postal_code,
			i.id_user, a.username
		FROM items i
		JOIN listings l ON l.id_item = i.id
		JOIN accounts a ON a.id = i.id_user
		` + whereClause + " " + orderBy

	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)
	if err != nil {
		return nil, 0, fmt.Errorf("GetPendingListings() query failed: %v", err)
	}
	defer rows.Close()

	listings := []models.PendingListingResponse{}
	for rows.Next() {
		var listing models.PendingListingResponse
		if err := rows.Scan(
			&listing.ItemID, &listing.Title, &listing.Description, &listing.Material, &listing.State, &listing.Weight, &listing.Price, &listing.CreatedAt,
			&listing.CityName, &listing.PostalCode,
			&listing.UserID, &listing.Username,
		); err != nil {
			return nil, 0, fmt.Errorf("GetPendingListings() scan failed: %v", err)
		}
		listings = append(listings, listing)
	}
	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("GetPendingListings() rows error: %v", err)
	}
	return listings, totalRecords, nil
}

// GetPendingEvents returns paginated pending events with optional search/sort.
// page=-1 and limit=-1 returns all records.
func GetPendingEvents(page, limit int, filters models.ValidationFilters) ([]models.PendingEventResponse, int, error) {
	var params []interface{}
	var countParams []interface{}
	paramIndex := 1

	whereClause := "WHERE ev.status = 'pending'"

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(
			" AND (ev.title ILIKE $%d OR acc.username ILIKE $%d OR CAST(ev.id AS TEXT) ILIKE $%d)",
			paramIndex, paramIndex, paramIndex,
		)
		params = append(params, searchParam)
		countParams = append(countParams, searchParam)
		paramIndex++
	}

	orderBy := "ORDER BY ev.created_at ASC"
	if filters.Sort == "most_recent" {
		orderBy = "ORDER BY ev.created_at DESC"
	}

	countQuery := `
		SELECT COUNT(*)
		FROM events ev
		JOIN event_employee ee ON ev.id = ee.id_event
		JOIN accounts acc ON ee.id_employee = acc.id
		` + whereClause

	var totalRecords int
	if err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&totalRecords); err != nil {
		return nil, 0, fmt.Errorf("GetPendingEvents() count failed: %v", err)
	}

	query := `
		SELECT
			ev.id, ev.title, ev.description, ev.category, ev.start_at,
			ev.capacity, ev.price, ev.created_at, ee.id_employee, acc.username
		FROM events ev
		LEFT JOIN event_employee ee ON ev.id = ee.id_event
		LEFT JOIN accounts acc ON ee.id_employee = acc.id
		` + whereClause + " " + orderBy

	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)
	if err != nil {
		return nil, 0, fmt.Errorf("GetPendingEvents() query failed: %v", err)
	}
	defer rows.Close()

	events := []models.PendingEventResponse{}
	for rows.Next() {
		var ev models.PendingEventResponse
		if err := rows.Scan(
			&ev.EventID, &ev.Title, &ev.Description, &ev.Category, &ev.DateStart,
			&ev.Capacity, &ev.Price, &ev.CreatedAt, &ev.EmployeeID, &ev.EmployeeUsername,
		); err != nil {
			return nil, 0, fmt.Errorf("GetPendingEvents() scan failed: %v", err)
		}
		events = append(events, ev)
	}
	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("GetPendingEvents() rows error: %v", err)
	}
	return events, totalRecords, nil
}

func UpdateListingStatus(itemID int, newStatus string, employeeID int) error {
	tx, err := utils.Conn.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(`UPDATE items SET status = $1 WHERE id = $2`, newStatus, itemID)
	if err != nil {
		return fmt.Errorf("error updating item status in tx: %v", err)
	}

	_, err = tx.Exec(`
		INSERT INTO admin_history (entity_type, entity_id, action, id_employee)
		VALUES ('listing', $1, 'update', $2)
	`, itemID, employeeID)
	if err != nil {
		return fmt.Errorf("error inserting into admin_history in tx: %v", err)
	}

	if err = tx.Commit(); err != nil {
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

	_, err = tx.Exec(`UPDATE events SET status = $1 WHERE id = $2`, newStatus, eventID)
	if err != nil {
		return fmt.Errorf("error updating event status in tx: %v", err)
	}

	_, err = tx.Exec(`
		INSERT INTO admin_history (entity_type, entity_id, action, id_employee)
		VALUES ('event', $1, 'update', $2)
	`, eventID, employeeID)
	if err != nil {
		return fmt.Errorf("error inserting into admin_history in tx: %v", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing event transaction: %v", err)
	}
	return nil
}

// GetValidationStats returns counts of pending/approved/refused for deposits, listings, and events.
func GetValidationStats() (models.ValidationStats, error) {
	var stats models.ValidationStats

	itemQuery := `
		SELECT
			COUNT(*) FILTER (WHERE i.status = 'pending'  AND d.id_item IS NOT NULL) AS pending_deposits,
			COUNT(*) FILTER (WHERE i.status = 'approved' AND d.id_item IS NOT NULL) AS approved_deposits,
			COUNT(*) FILTER (WHERE i.status = 'refused'  AND d.id_item IS NOT NULL) AS refused_deposits,
			COUNT(*) FILTER (WHERE i.status = 'pending'  AND l.id_item IS NOT NULL) AS pending_listings,
			COUNT(*) FILTER (WHERE i.status = 'approved' AND l.id_item IS NOT NULL) AS approved_listings,
			COUNT(*) FILTER (WHERE i.status = 'refused'  AND l.id_item IS NOT NULL) AS refused_listings
		FROM items i
		LEFT JOIN deposits d ON i.id = d.id_item
		LEFT JOIN listings l ON i.id = l.id_item
		WHERE i.is_deleted = false
	`
	if err := utils.Conn.QueryRow(itemQuery).Scan(
		&stats.PendingDeposits, &stats.ApprovedDeposits, &stats.RefusedDeposits,
		&stats.PendingListings, &stats.ApprovedListings, &stats.RefusedListings,
	); err != nil {
		return stats, fmt.Errorf("GetValidationStats() items query failed: %v", err)
	}

	eventQuery := `
		SELECT
			COUNT(*) FILTER (WHERE status = 'pending')  AS pending_events,
			COUNT(*) FILTER (WHERE status = 'approved') AS approved_events,
			COUNT(*) FILTER (WHERE status = 'refused')  AS refused_events
		FROM events
	`
	if err := utils.Conn.QueryRow(eventQuery).Scan(
		&stats.PendingEvents, &stats.ApprovedEvents, &stats.RefusedEvents,
	); err != nil {
		return stats, fmt.Errorf("GetValidationStats() events query failed: %v", err)
	}

	return stats, nil
}
