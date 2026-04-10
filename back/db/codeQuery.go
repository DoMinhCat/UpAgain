package db

import (
	"backend/models"
	"backend/utils"
)

func GetCodesOfLatestTransactionByDepositId(depositId int) ([]models.CodeForAdmin, error) {
	var codes []models.CodeForAdmin
	query := `
	SELECT c.path, c.code, c.valid_from, c.valid_to, c.status, 
       c.user_type, c.id_account, c.id_deposit, c.id_transaction
	FROM barcodes c
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
		err = rows.Scan(&code.Path, &code.Code, &code.ValidFrom, &code.ValidTo, &code.Status, &code.UserType, &code.IdAccount, &code.IdDeposit, &code.IdTransaction)
		if err != nil {
			return nil, err
		}
		codes = append(codes, code)
	}
	return codes, nil
}