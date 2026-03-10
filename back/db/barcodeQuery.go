package db

import (
	"backend/utils"
	"fmt"
)

func GetTotalActiveBarCodeById(id_account int ) (int, error){
	var total int

	query := `
		select count(*) from barcodes bc
		where id_account=$1 and valid_to > now()
	`
	err := utils.Conn.QueryRow(query, id_account).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalActiveBarCodeById() failed: %v", err)
	}
	return total, nil
}