package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
)

func GetAllCodesByContainerId(id_container int) ([]models.CodeForAdmin, error) {
	var barcodes []models.CodeForAdmin

	query := `
		SELECT path, code, valid_from, valid_to, status, user_type, id_account, id_deposit, id_transaction, d.id_container 
		FROM barcodes bc
		JOIN deposits d ON bc.id_deposit = d.id_item
		WHERE d.id_container=$1
	`

	rows, err := utils.Conn.Query(query, id_container)
	if err != nil {
		return nil, fmt.Errorf("GetAllCodesByContainerId() failed: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var bc models.CodeForAdmin
		if err := rows.Scan(
			&bc.Path,
			&bc.Code,
			&bc.ValidFrom,
			&bc.ValidTo,
			&bc.Status,
			&bc.UserType,
			&bc.IdAccount,
			&bc.IdDeposit,
			&bc.IdTransaction,
			&bc.IdContainer,
		); err != nil {
			return nil, fmt.Errorf("GetAllCodesByContainerId() failed to scan: %v", err)
		}
		barcodes = append(barcodes, bc)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("GetAllCodesByContainerId() rows error: %v", err)
	}

	return barcodes, nil
}

func GetCodesOfLatestTransactionByDepositId(depositId int) ([]models.CodeForAdmin, error) {
	var codes []models.CodeForAdmin
	query := `
	SELECT c.path, c.code, c.valid_from, c.valid_to, c.status, 
       c.user_type, c.id_account, c.id_deposit, c.id_transaction, d.id_container
	FROM barcodes c
	JOIN deposits d ON c.id_deposit = d.id_item
	JOIN (
		SELECT id_transaction, id_item
		FROM transactions
		WHERE id_item = $1
		ORDER BY created_at DESC
		LIMIT 1
	) t ON c.id_deposit = t.id_item
	LIMIT 2;
	`
	rows, err := utils.Conn.Query(query, depositId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var code models.CodeForAdmin
		err = rows.Scan(&code.Path, &code.Code, &code.ValidFrom, &code.ValidTo, &code.Status, &code.UserType, &code.IdAccount, &code.IdDeposit, &code.IdTransaction, &code.IdContainer)
		if err != nil {
			return nil, err
		}
		codes = append(codes, code)
	}
	return codes, nil
}