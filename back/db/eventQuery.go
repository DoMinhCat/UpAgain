package db

import (
	"backend/utils"
	"fmt"
	"time"
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

// get total count of events not cancelled and not not refused 
func GetTotalCountActiveEvents() (int, error){
	var total int
	err := utils.Conn.QueryRow("SELECT COUNT(*) FROM events WHERE status!='cancelled' AND status!='refused'").Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalCountActiveEvents() failed: %v", err.Error())
	}
	return total, nil
}

func GetEventIncreaseSince(since time.Time) (int, error){
	var count int
	err := utils.Conn.QueryRow("select count(*) from events where created_at >= $1 and created_at < now()", since).Scan(&count)
	if err != nil{
		return 0, fmt.Errorf("GetEventIncreaseSince() failed: %v", err.Error())
	}
	return count, nil
}

func GetUpcomingEventIn(in time.Time) (int, error){
	var count int
	err := utils.Conn.QueryRow("select count(*) from events where start_at <= $1 AND start_at > now() AND status!='cancelled' AND status!='refused'", in).Scan(&count)
	if err != nil{
		return 0, fmt.Errorf("GetUpcomingEventIn() failed: %v", err.Error())
	}
	return count, nil
}


// TODO
func GetTotalRegistrationsSince(since time.Time) (int, error){
	var count int
	err := utils.Conn.QueryRow("select count(*) from event_registrations where created_at >= $1 and created_at < now()", since).Scan(&count)
	if err != nil{
		return 0, fmt.Errorf("GetTotalRegistrationsSince() failed: %v", err.Error())
	}
	return count, nil
}

func GetTotalEventsByStatus(status string) (int, error){
	var count int
	err := utils.Conn.QueryRow("select count(*) from events where status=$1", status).Scan(&count)
	if err != nil{
		return 0, fmt.Errorf("GetTotalEventsByStatus() failed: %v", err.Error())
	}
	return count, nil
}