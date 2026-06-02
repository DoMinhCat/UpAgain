package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
)

func AssignEmployeeToEvent(eventId int, employeeId int) error {
	query := `
		INSERT INTO event_employee (id_event, id_employee)
		VALUES ($1, $2);
	`
	_, err := utils.Conn.Exec(query, eventId, employeeId)
	if err != nil {
		return fmt.Errorf("AssignEmployeeToEvent() failed: %v", err.Error())
	}
	return nil
}

// get total count of events assigned to an employee that are not cancelled
func GetTotalEventsOfEmployeeById(id int) (int, error) {
	var total int

	err := utils.Conn.QueryRow("SELECT COUNT(*) FROM event_employee ee JOIN events e on ee.id_event=e.id WHERE ee.id_employee=$1 and e.status!='cancelled' and e.status!='refused'", id).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalEventsOfEmployeeById() failed: %v", err.Error())
	}
	return total, nil
}

func GetAssignedEmployeesByEventId(eventId int) ([]models.AssignedEmployee, error) {
	var employees []models.AssignedEmployee
	query := `
		SELECT ee.id_employee, a.username, a.email, ee.assigned_at
		FROM event_employee ee
		JOIN accounts a ON ee.id_employee = a.id
		WHERE ee.id_event = $1;
	`
	rows, err := utils.Conn.Query(query, eventId)
	if err != nil {
		return nil, fmt.Errorf("GetAssignedEmployeesByEventId() failed: %v", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var employee models.AssignedEmployee
		if err := rows.Scan(&employee.Id, &employee.Username, &employee.Email, &employee.AssignedAt); err != nil {
			return nil, fmt.Errorf("GetAssignedEmployeesByEventId() failed: %v", err.Error())
		}
		employees = append(employees, employee)
	}
	return employees, nil
}

func AssignEmployeeToEventByEventId(eventId int, employeeIds []int) error {
	query := `
		INSERT INTO event_employee (id_event, id_employee)
		VALUES ($1, $2);
	`
	for _, employeeId := range employeeIds {
		_, err := utils.Conn.Exec(query, eventId, employeeId)
		if err != nil {
			return fmt.Errorf("AssignEmployeeToEventByEventId() failed: %v", err.Error())
		}
	}
	return nil
}

func UnAssignEmployeeByEventId(eventId int, employeeIds int) error {
	_, err := utils.Conn.Exec("DELETE FROM event_employee WHERE id_event = $1 AND id_employee = $2;", eventId, employeeIds)
	if err != nil {
		return fmt.Errorf("UnAssignEmployeeByEventId() failed: %v", err.Error())
	}
	return nil
}

func GetOrganizersByEventId(id_event int) ([]models.Account, error) {
	var organizers []models.Account
	query := `
		SELECT a.id, a.username, a.avatar
		FROM event_employee ee
		JOIN accounts a ON ee.id_employee=a.id
		WHERE ee.id_event=$1;
	`
	rows, err := utils.Conn.Query(query, id_event)
	if err != nil {
		if err == sql.ErrNoRows {
			return []models.Account{}, nil
		}
		return nil, fmt.Errorf("GetOrganizersByEventId() failed: %v", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var organizer models.Account
		err := rows.Scan(&organizer.Id, &organizer.Username, &organizer.Avatar)
		if err != nil {
			return nil, fmt.Errorf("GetOrganizersByEventId() failed: %v", err.Error())
		}
		organizers = append(organizers, organizer)
	}
	return organizers, nil
}

func GetEmployeeEventsByEmployeeId(id_employee int) ([]models.Event, error) {
	var events []models.Event
	query := `
		SELECT 
			e.id, 
			e.created_at, 
			e.title, 
			e.description, 
			e.start_at, 
			e.end_at, 
			e.price, 
			e.category, 
			e.capacity, 
			e.status, 
			e.city, 
			e.street, 
			e.postal_code,
			e.location_detail, 
			a.username, 
			a.avatar, 
			a.id,
			(SELECT count(*) FROM event_registrations er2 WHERE er2.id_event = e.id AND er2.status != 'cancelled') AS total_registered
		FROM event_employee ee
		JOIN events e ON ee.id_event = e.id
		JOIN accounts a ON e.created_by = a.id
		WHERE ee.id_employee = $1
		AND e.status != 'cancelled'
		ORDER BY e.start_at ASC;
	`
	rows, err := utils.Conn.Query(query, id_employee)
	if err != nil {
		if err == sql.ErrNoRows {
			return []models.Event{}, nil
		}
		return nil, fmt.Errorf("GetEmployeeEventsByEmployeeId() failed: %v", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var event models.Event
		err := rows.Scan(
			&event.Id,
			&event.CreatedAt,
			&event.Title,
			&event.Description,
			&event.StartAt,
			&event.EndAt,
			&event.Price,
			&event.Category,
			&event.Capacity,
			&event.Status,
			&event.City,
			&event.Street,
			&event.PostalCode,
			&event.LocationDetail,
			&event.EmployeeName,
			&event.EmployeeAvatar,
			&event.EmployeeId,
			&event.Registered,
		)
		if err != nil {
			return nil, fmt.Errorf("GetEmployeeEventsByEmployeeId() failed: %v", err.Error())
		}

		photos, err := GetPhotosPathsByObjectId(event.Id, "event")
		if err != nil {
			return nil, fmt.Errorf("GetPhotosPathsByObjectId() failed: %v", err.Error())
		}
		event.Images = photos

		events = append(events, event)
	}
	return events, nil
}

func GetAssignedEventsByEmployeeId(id_employee int) ([]models.Event, error) {
	return GetEmployeeEventsByEmployeeId(id_employee)
}
