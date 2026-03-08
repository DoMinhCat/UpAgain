package db

import (
	"backend/utils"
	"fmt"
)

func GetTotalEventsOfEmployeeById(id int) (int, error) {
	var total int

	err := utils.Conn.QueryRow("SELECT COUNT(*) FROM event_employee WHERE id_employee=$1", id).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalEventsOfEmployeeById() failed: %v", err.Error())
	}
	return total, nil
}