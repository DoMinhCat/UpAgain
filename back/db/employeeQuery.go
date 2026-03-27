package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
	"time"
)

// ALL QUERIES TO TABLE 'employees'

func GetEmployeeRoleById(id int) (bool, error) {
	var isAdmin bool
	row := utils.Conn.QueryRow("SELECT is_admin FROM employees WHERE id_account=$1", id)
	err := row.Scan(&isAdmin)
	if err != nil {
		return false, fmt.Errorf("GetEmployeeRoleById() failed: %v", err.Error())
	}

	return isAdmin, nil
}

func CheckIsAdmin(id int) (bool, error) {
	var isAdmin bool
	err := utils.Conn.QueryRow("SELECT is_admin FROM employees WHERE id_account=$1", id).Scan(&isAdmin)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil // Return nothing found without an error
		}
		return false, fmt.Errorf("CheckIsAdmin() failed: %v", err.Error())
	}
	return isAdmin, nil
}

func CreateEmployee(insertedId int, isAdmin bool) error {
	_, err := utils.Conn.Exec("INSERT INTO employees(id_account, is_admin) VALUES ($1, $2);", insertedId, isAdmin)
	if err != nil {
		err = DeleteAccount(insertedId)
		if err != nil {
			return fmt.Errorf("error rolling back after failed insertion into 'employees': %w", err)
		}
		return fmt.Errorf("CreateEmployee() failed: %v", err)
	}
	return nil
}

func GetEmployeeStatsById(id int) (models.EmployeeStats, error) {
	var stats models.EmployeeStats

	events, err := GetTotalEventsOfEmployeeById(id)
	if err != nil {
		return models.EmployeeStats{}, fmt.Errorf("GetEmployeeStatsById() failed: %v", err.Error())
	}
	stats.TotalEvents = events

	posts, err := GetTotalPostsByIdAccountByCategory(id, nil)
	if err != nil {
		return models.EmployeeStats{}, fmt.Errorf("GetEmployeeStatsById() failed: %v", err.Error())
	}
	stats.TotalPosts = posts
	return stats, nil
}

func GetAvailableEmployeesByTime(from, to time.Time) (models.AvailableEmployeesResponse, error) {
	var employees models.AvailableEmployeesResponse

	query := `
		SELECT a.email, a.username, a.id FROM accounts a 
		JOIN employees e ON a.id = e.id_account
		WHERE a.id NOT IN (
			SELECT ee.id_employee FROM event_employee ee 
			JOIN events ev ON ee.id_event = ev.id 
			WHERE ev.end_at > $1 AND ev.start_at < $2 
			AND ev.status != 'refused' AND ev.status != 'cancelled'
		) AND e.is_admin = false;
	`
	rows, err := utils.Conn.Query(query, from, to)
	if err != nil {
		return models.AvailableEmployeesResponse{}, fmt.Errorf("GetAvailableEmployeesByTime() failed: %v", err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		var employee models.AvailableEmployee
		if err := rows.Scan(&employee.Email, &employee.Username, &employee.Id); err != nil {
			return models.AvailableEmployeesResponse{}, fmt.Errorf("GetAvailableEmployeesByTime() scan failed: %v", err.Error())
		}
		employees.Employees = append(employees.Employees, employee)
	}
	return employees, nil
}

func CheckEmployeeExists(id int) (bool, error) {
	var exists bool
	err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM employees WHERE id_account=$1)", id).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("CheckEmployeeExists() failed: %v", err.Error())
	}
	return exists, nil
}
