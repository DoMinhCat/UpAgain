package db

import (
	"backend/utils"
	"fmt"
)

func GetTotalActiveItemById(id_account int ) (int, error){
	var total int

	query := `
		select count(*) from items i
		where i.id_user=$1 and (i.status='pending' or i.status='approved');
	`
	err := utils.Conn.QueryRow(query, id_account).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalActiveItemById() failed: %v", err)
	}
	return total, nil
}
