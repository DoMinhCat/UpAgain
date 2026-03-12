package db

import (
	"backend/utils"
	"fmt"
)

// GetUserTotalDepositsById get deposits of a user
//
// param is_validated indicates whether to get all/pending or refused/validated or reserved or completed deposits
func GetUserTotalDepositsById(id int, is_validated *bool) (int, error) {
	var total int
	query :=
		`select count(*) from deposits d
    join(
        users u join items i on u.id_account = i.id_user
    ) on d.id_item=i.id where u.id_account=$1 and i.is_deleted=false`

	param := ""
	if is_validated != nil {
		if *is_validated {
			param = " and i.status != 'pending' and i.status != 'refused'"
		} else {
			param = " and i.status = 'pending' and i.status = 'refused'"
		}
	}

	row := utils.Conn.QueryRow(query+param+";", id)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetUserTotalDepositsById() failed: %v", err.Error())
	}
	return total, nil
}
