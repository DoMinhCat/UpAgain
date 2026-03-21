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

// TODO
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
		whereClause += fmt.Sprintf(" AND (e.title ILIKE $%d OR (SELECT a.username FROM accounts a JOIN event_employee ee ON a.id=ee.id_employee) ILIKE $%d OR CAST(e.id AS TEXT) ILIKE $%d)", paramIndex, paramIndex, paramIndex)
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
	countQuery := "SELECT COUNT(*) FROM events e " + whereClause
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
		SELECT e.id, e.created_at, e.title, e.description, e.start_at, e.price, e.category, e.capacity, e.status, e.city, e.street, e.location_detail, a.username as employee_name 
		FROM events e 
		LEFT JOIN event_employee ee ON e.id=ee.id_event 
		LEFT JOIN accounts a ON ee.id_employee=a.id 
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
		err := rows.Scan(&event.Id, &event.CreatedAt, &event.Title, &event.Description, &event.StartAt, &event.Price, &event.Category, &event.Capacity, &event.Status, &event.City, &event.Street, &event.LocationDetail, &event.EmployeeName)
		if err != nil {
			return nil, 0, fmt.Errorf("GetAllEvents() scan failed: %v", err.Error())
		}
		results = append(results, event)
	}

	return results, totalRecords, nil
}

func CreateEvent(event models.CreateEventRequest) (int, error) {
	var eventId int
	query := `
		INSERT INTO events (title, description, start_at, price, category, capacity, city, street, location_detail)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id;
	`
	err := utils.Conn.QueryRow(query, event.Title, event.Description, event.StartAt, event.Price, event.Category, event.Capacity, event.City, event.Street, event.LocationDetail).Scan(&eventId)
	if err != nil {
		return 0, fmt.Errorf("CreateEvent() failed: %v", err.Error())
	}
	return eventId, nil
}

func GetEventDetailsById(id_event int) (models.Event, error) {
	var event models.Event
	query := `
		SELECT e.id, e.created_at, e.title, e.description, e.start_at, e.price, e.category, e.capacity, e.status, e.city, e.street, e.location_detail
		FROM events e WHERE e.id=$1;
	`
	err := utils.Conn.QueryRow(query, id_event).Scan(&event.Id, &event.CreatedAt, &event.Title, &event.Description, &event.StartAt, &event.Price, &event.Category, &event.Capacity, &event.Status, &event.City, &event.Street, &event.LocationDetail)
	if err != nil {
		return models.Event{}, fmt.Errorf("GetEventDetailsById() failed: %v", err.Error())
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