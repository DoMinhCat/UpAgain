package db

import (
	"backend/utils"
	"fmt"
)

// get total events registered by user/pro that are not cancelled
func GetTotalActiveEventsRegisteredById(id_account int) (int, error) {
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