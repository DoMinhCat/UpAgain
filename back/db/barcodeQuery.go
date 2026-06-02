package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
	"slices"
)

func GetAllCodesByContainerId(id_container int) ([]models.Barcode, error) {
	var barcodes []models.Barcode

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
		var bc models.Barcode
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

func GetCodesOfLatestTransactionByDepositId(depositId int) ([]models.Barcode, error) {
	var codes []models.Barcode
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
		if err == sql.ErrNoRows {
			return []models.Barcode{}, nil
		}
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var code models.Barcode
		err = rows.Scan(&code.Path, &code.Code, &code.ValidFrom, &code.ValidTo, &code.Status, &code.UserType, &code.IdAccount, &code.IdDeposit, &code.IdTransaction, &code.IdContainer)
		if err != nil {
			return nil, err
		}
		codes = append(codes, code)
	}
	return codes, nil
}

func InsertBarcode(payload models.BarCodeInsert) error {
	query := `
		INSERT INTO barcodes (path, code, valid_from, valid_to, user_type, id_account, id_deposit, id_transaction)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := utils.Conn.Exec(query, payload.BarcodePath, payload.Code6Digit, payload.ValidFrom, payload.ValidFrom.AddDate(0, 0, 7), payload.UserType, payload.IdAccount, payload.IdDeposit, payload.IdTransaction)
	if err != nil {
		return fmt.Errorf("InsertBarcode() failed: %v", err)
	}
	return nil
}

// get 1 barcode info for user or pro for a deposit
func GetCodeByDepositIdAndAccountId(depositId int, accountId int) (models.Barcode, error) {
	var code models.Barcode
	query := `
	SELECT c.path, c.code, c.valid_from, c.valid_to, c.status, 
       c.user_type, c.id_account, c.id_deposit, c.id_transaction, d.id_container
	FROM barcodes c
	JOIN deposits d ON c.id_deposit = d.id_item
	WHERE d.id_item = $1 AND c.id_account = $2
	`
	err := utils.Conn.QueryRow(query, depositId, accountId).Scan(&code.Path, &code.Code, &code.ValidFrom, &code.ValidTo, &code.Status, &code.UserType, &code.IdAccount, &code.IdDeposit, &code.IdTransaction, &code.IdContainer)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Barcode{}, nil
		}
		return models.Barcode{}, err
	}
	return code, nil
}

func GetCodeBy6DigitCode(code6digit string) (models.Barcode, error) {
	var code models.Barcode
	query := `
	SELECT c.path, c.code, c.valid_from, c.valid_to, c.status, 
       c.user_type, c.id_account, c.id_deposit, c.id_transaction, d.id_container
	FROM barcodes c
	JOIN deposits d ON c.id_deposit = d.id_item
	WHERE c.code = $1
	`
	err := utils.Conn.QueryRow(query, code6digit).Scan(&code.Path, &code.Code, &code.ValidFrom, &code.ValidTo, &code.Status, &code.UserType, &code.IdAccount, &code.IdDeposit, &code.IdTransaction, &code.IdContainer)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Barcode{}, nil
		}
		return models.Barcode{}, err
	}
	return code, nil
}

func UpdateCodeStatusBy6DigitCode(code6digit string, status string) error {
	if !slices.Contains(CODE_STATUS, status) {
		return fmt.Errorf("Invalid status: %s", status)
	}
	query := `
	UPDATE barcodes SET status = $1 WHERE code = $2
	`
	_, err := utils.Conn.Exec(query, status, code6digit)
	if err != nil {
		return fmt.Errorf("UpdateCodeStatus() failed: %v", err)
	}
	return nil
}
