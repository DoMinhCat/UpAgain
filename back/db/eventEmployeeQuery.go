package db

import (
	"backend/models"
	"backend/utils"
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