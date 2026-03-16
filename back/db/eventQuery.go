package db

import (
	"backend/utils"
	"fmt"
)

// get total events assigned to an employee that are not cancelled
func GetTotalEventsOfEmployeeById(id int) (int, error) {
	var total int

	err := utils.Conn.QueryRow("SELECT COUNT(*) FROM event_employee ee JOIN events e on ee.id_event=e.id WHERE ee.id_account=$1 and e.is_cancelled=false", id).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalEventsOfEmployeeById() failed: %v", err.Error())
	}
	return total, nil
}

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

// get total events registered by user/pro that are not cancelled
func GetTotalActiveEventsRegisteredById(id_account int) (int, error){
	var total int
	query := `
		select count(*) from event_registrations er
		join events e on e.id=er.id_event
		where er.status='registered' and er.id_account=$1 and (e.start_at is null or e.start_at > now());
	`
	row := utils.Conn.QueryRow(query, id_account)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalActiveEventsRegisteredById() failed: %v", err.Error())
	}
	return total, nil
}