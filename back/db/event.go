package db

import (
	"backend/utils"
	"fmt"
)

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
