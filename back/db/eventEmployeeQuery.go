package db

import (
	"backend/utils"
	"fmt"
)

func AssignEmployeeToEvent(eventId int, employeeId int) error {
	query := `
		INSERT INTO event_employees (id_event, id_employee)
		VALUES ($1, $2);
	`
	_, err := utils.Conn.Exec(query, eventId, employeeId)
	if err != nil {
		return fmt.Errorf("AssignEmployeeToEvent() failed: %v", err.Error())
	}
	return nil
}