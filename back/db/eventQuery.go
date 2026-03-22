package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"time"
)

// get total money user spent on events
func GetTotalEventSpendingsById(id int) (int, error) {
	var total int
	query := `
		select COALESCE(SUM(e.price),0) as total_spent from events e
		join event_registrations er on e.id = er.id_event
		join users u on er.id_account = u.id_account
		where e.price is not null and er.status!='cancelled' and u.id_account=$1;
	`

	row := utils.Conn.QueryRow(query, id)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalEventSpendingsById() failed: %v", err.Error())
	}

	return total, nil
}

// get total count of events not cancelled and not not refused
func GetTotalCountActiveEvents() (int, error) {
	var total int
	err := utils.Conn.QueryRow("SELECT COUNT(*) FROM events WHERE status!='cancelled' AND status!='refused'").Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalCountActiveEvents() failed: %v", err.Error())
	}
	return total, nil
}

func GetEventIncreaseSince(since time.Time) (int, error) {
	var count int
	err := utils.Conn.QueryRow("select count(*) from events where created_at >= $1 and created_at < now()", since).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("GetEventIncreaseSince() failed: %v", err.Error())
	}
	return count, nil
}

func GetUpcomingEventIn(in time.Time) (int, error) {
	var count int
	err := utils.Conn.QueryRow("select count(*) from events where start_at <= $1 AND start_at > now() AND status!='cancelled' AND status!='refused'", in).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("GetUpcomingEventIn() failed: %v", err.Error())
	}
	return count, nil
}

func GetTotalRegistrationsSince(since time.Time) (int, error) {
	var count int
	err := utils.Conn.QueryRow("select count(*) from event_registrations where created_at >= $1 and created_at < now()", since).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("GetTotalRegistrationsSince() failed: %v", err.Error())
	}
	return count, nil
}

// get total count of events by status, status == nil then get all events
func GetTotalEventsByStatus(status *string) (int, error) {
	var count int
	if status == nil {
		err := utils.Conn.QueryRow("select count(*) from events").Scan(&count)
		if err != nil {
			return 0, fmt.Errorf("GetTotalEventsByStatus() failed: %v", err.Error())
		}
		return count, nil
	}

	err := utils.Conn.QueryRow("select count(*) from events where status=$1", *status).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("GetTotalEventsByStatus() failed: %v", err.Error())
	}
	return count, nil
}

// page: get page number for pagination, if page = -1 then get ALL
//
// limit: number of records for each page, if limit = -1 then get ALL
//
// return list of events, total count of events, error
func GetAllEvents(page int, limit int, filters models.EventFilters) ([]models.Event, int, error) {
	var results []models.Event
	var params []interface{}
	var countParams []interface{}
	whereClause := "WHERE e.created_at IS NOT NULL"
	paramIndex := 1

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(" AND (e.title ILIKE $%d OR a.username ILIKE $%d OR CAST(e.id AS TEXT) ILIKE $%d)", paramIndex, paramIndex, paramIndex)
		params = append(params, searchParam)
		countParams = append(countParams, searchParam)
		paramIndex++
	}

	if filters.Status != "" {
		whereClause += fmt.Sprintf(" AND e.status = $%d", paramIndex)
		params = append(params, filters.Status)
		countParams = append(countParams, filters.Status)
		paramIndex++
	}

	var totalRecords int
	countQuery := "SELECT COUNT(*) FROM events e JOIN accounts a ON e.created_by=a.id " + whereClause
	err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&totalRecords)
	if err != nil {
		return nil, 0, fmt.Errorf("GetAllEvents() count failed: %v", err)
	}

	orderBy := "ORDER BY e.id ASC" // Default sorting
	if filters.Sort != "" {
		switch filters.Sort {
		case "earliest_start_date":
			orderBy = "ORDER BY e.start_at ASC"
		case "latest_start_date":
			orderBy = "ORDER BY e.start_at DESC"
		case "most_recent_creation":
			orderBy = "ORDER BY e.created_at DESC"
		case "oldest_creation":
			orderBy = "ORDER BY e.created_at ASC"
		case "highest_price":
			orderBy = "ORDER BY e.price DESC"
		case "lowest_price":
			orderBy = "ORDER BY e.price ASC"
		default:
			orderBy = "ORDER BY e.id ASC"
		}
	}

	query := `
		SELECT e.id, e.created_at, e.title, e.description, e.start_at, e.end_at, e.price, e.category, e.capacity, e.status, e.city, e.street, e.location_detail, a.username 
		FROM events e 
		JOIN accounts a ON e.created_by=a.id 
		` + whereClause + " " + orderBy

	// pagination
	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)

	if err != nil {
		return nil, 0, fmt.Errorf("GetAllEvents() query failed: %v", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var event models.Event
		err := rows.Scan(&event.Id, &event.CreatedAt, &event.Title, &event.Description, &event.StartAt, &event.EndAt, &event.Price, &event.Category, &event.Capacity, &event.Status, &event.City, &event.Street, &event.LocationDetail, &event.EmployeeName)
		if err != nil {
			return nil, 0, fmt.Errorf("GetAllEvents() scan failed: %v", err.Error())
		}
		results = append(results, event)
	}

	return results, totalRecords, nil
}

func CreateEvent(event models.CreateEventRequest, creatorId int) (int, error) {
	var eventId int
	tx, err := utils.Conn.Begin()
	if err != nil {
		return 0, fmt.Errorf("CreateEvent() begin tx failed: %v", err.Error())
	}
	defer tx.Rollback()

	query := `
		INSERT INTO events (title, description, start_at, end_at, price, category, capacity, city, street, location_detail, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id;
	`
	err = tx.QueryRow(query, event.Title, event.Description, event.StartAt, event.EndAt, event.Price, event.Category, event.Capacity, event.City, event.Street, event.LocationDetail, creatorId).Scan(&eventId)
	if err != nil {
		return 0, fmt.Errorf("CreateEvent() failed: %v", err.Error())
	}

	// Insert photos
	for i, imgPath := range event.Images {
		isPrimary := i == 0
		_, err = tx.Exec(`
			INSERT INTO photos (path, is_primary, object_type, event_id)
			VALUES ($1, $2, 'event', $3)
		`, imgPath, isPrimary, eventId)
		if err != nil {
			return 0, fmt.Errorf("failed to insert photo: %v", err.Error())
		}
	}

	if err = tx.Commit(); err != nil {
		return 0, fmt.Errorf("CreateEvent() commit tx failed: %v", err.Error())
	}
	return eventId, nil
}

func GetEventDetailsById(id_event int) (models.Event, error) {
	var event models.Event
	query := `
		SELECT e.id, e.created_at, e.title, e.description, e.start_at, e.end_at, e.price, e.category, e.capacity, e.status, e.city, e.street, e.location_detail
		FROM events e WHERE e.id=$1;
	`
	err := utils.Conn.QueryRow(query, id_event).Scan(&event.Id, &event.CreatedAt, &event.Title, &event.Description, &event.StartAt, &event.EndAt, &event.Price, &event.Category, &event.Capacity, &event.Status, &event.City, &event.Street, &event.LocationDetail)
	if err != nil {
		return models.Event{}, fmt.Errorf("GetEventDetailsById() failed: %v", err.Error())
	}

	// Fetch photos
	rows, err := utils.Conn.Query("SELECT path FROM photos WHERE event_id = $1 AND object_type = 'event' ORDER BY is_primary DESC, created_at ASC", id_event)
	if err != nil {
		return event, fmt.Errorf("failed to fetch photos: %v", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var path string
		if err := rows.Scan(&path); err != nil {
			return event, fmt.Errorf("failed to scan photo path: %v", err.Error())
		}
		event.Images = append(event.Images, path)
	}

	return event, nil
}

func GetTotalEventsAssignedById(id_account int) (int, error){
	var total int
	query := `
		select count(*) from event_employee ee
		join events e on e.id=ee.id_event
		where e.status!='cancelled' and ee.id_employee=$1 and (e.start_at is null or e.start_at > now());
	`
	row := utils.Conn.QueryRow(query, id_account)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalEventsAssignedById() failed: %v", err.Error())
	}
	return total, nil
}


func CheckEventExistsById(id_event int) (bool, error){
	var exists bool
	query := `
		SELECT EXISTS(SELECT 1 FROM events WHERE id=$1);
	`
	err := utils.Conn.QueryRow(query, id_event).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("CheckEventExistsById() failed: %v", err.Error())
	}
	return exists, nil
}

func UpdateEventStatusByEventId(eventID int, newStatus string, employeeID int) error {
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

func UpdateEventByEventId(eventID int, event models.UpdateEventRequest, employeeID int) error {
	tx, err := utils.Conn.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(`UPDATE events SET title = $1, description = $2, start_at = $3, end_at = $4, price = $5, category = $6, capacity = $7, city = $8, street = $9, location_detail = $10 WHERE id = $11`, event.Title, event.Description, event.StartAt, event.EndAt, event.Price, event.Category, event.Capacity, event.City, event.Street, event.LocationDetail, eventID)
	if err != nil {
		return fmt.Errorf("error updating event in tx: %v", err)
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

func GetEventStatusById(id_event int) (string, error) {
	var status string
	query := `
		SELECT status FROM events WHERE id=$1;
	`
	err := utils.Conn.QueryRow(query, id_event).Scan(&status)
	if err != nil {
		return "", fmt.Errorf("GetEventStatusById() failed: %v", err.Error())
	}
	return status, nil
}