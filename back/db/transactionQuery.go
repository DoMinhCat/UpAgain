package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
	"time"
)

// if param action_type is nil => get all kind of transaction
func GetProTotalListingsByIdByAction(id int, action_type *string) (int, error) {
	var total int
	param := ""
	if action_type != nil {
		if *action_type != "expired" && *action_type != "cancelled" && *action_type != "purchased" && *action_type != "reserved" {
			return 0, fmt.Errorf("GetProTotalListingsByIdByAction() failed: invalid action_type '%v'", *action_type)
		}
		if *action_type == "expired" {
			param = " and t.action = 'expired'"
		}
		if *action_type == "cancelled" {
			param = " and t.action = 'cancelled'"
		}
		if *action_type == "purchased" {
			param = " and t.action = 'purchased'"
		}
		if *action_type == "reserved" {
			param = " and t.action = 'reserved'"
		}
	}

	query := `
		select count(*) from transactions t
		join listings l on l.id_item = t.id_item
		where t.id_pro = $1
	`
	row := utils.Conn.QueryRow(query+param+";", id)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetProTotalListingsByIdByAction() failed: %v", err.Error())
	}

	return total, nil
}

// if param action_type is nil => get all kind of transaction
func GetProTotalDepositsByIdByAction(id int, action_type *string) (int, error) {
	var total int
	param := ""
	if action_type != nil {
		if *action_type != "expired" && *action_type != "cancelled" && *action_type != "purchased" && *action_type != "reserved" {
			return 0, fmt.Errorf("GetProTotalDepositsByIdByAction() failed: invalid action_type '%v'", *action_type)
		}
		if *action_type == "expired" {
			param = " and t.action = 'expired'"
		}
		if *action_type == "cancelled" {
			param = " and t.action = 'cancelled'"
		}
		if *action_type == "purchased" {
			param = " and t.action = 'purchased'"
		}
		if *action_type == "reserved" {
			param = " and t.action = 'reserved'"
		}
	}

	query := `
		select count(*) from transactions t
		join deposits d on d.id_item = t.id_item
		where t.id_pro = $1
	`
	row := utils.Conn.QueryRow(query+param+";", id)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetProTotalDepositsByIdByAction() failed: %v", err.Error())
	}

	return total, nil
}

func GetProTotalItemsSpendingsById(id int) (int, error) {
	var total int
	// Uses snapshot total_price (item_price + commission) stored in transactions
	query := `
		select COALESCE(sum(t.total_price), 0) from transactions t
		where t.id_pro = $1 and t.action = 'purchased' and t.total_price is not null;
	`
	row := utils.Conn.QueryRow(query, id)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetProTotalItemsSpendingsById() failed: %v", err.Error())
	}

	return total, nil
}

func GetTotalActiveTransactionByIdAccount(id_account int) (int, error) {
	var total int
	query := `
		select count(*) from transactions t
		where t.id_pro=$1 and t.action='reserved'
	`
	err := utils.Conn.QueryRow(query, id_account).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalActiveTransactionByIdAccount() failed: %v", err.Error())
	}
	return total, nil
}

func GetTotalTransactionsByStatus(status string, since *time.Time) (int, error) {
	var total int
	param := []interface{}{status}
	time := " AND created_at IS NOT NULL"
	query := `
		select count(*) from transactions t
		where t.action=$1
	`
	if since != nil {
		time = " AND created_at >= $2"
		param = append(param, since)
	}
	err := utils.Conn.QueryRow(query+time+";", param...).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalTransactionsByStatus() failed: %v", err.Error())
	}
	return total, nil
}

func GetTotalTransactionsSince(since time.Time) (int, error) {
	var total int
	query := `
		select count(*) from transactions t
		where t.created_at >= $1
	`
	err := utils.Conn.QueryRow(query, since).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalTransactionsSince() failed: %v", err.Error())
	}
	return total, nil
}

// get all transactions for an item with pagination
//
// set page and limit to -1 to get all without pagination
func GetTransactionsByItemId(itemId int, page int, limit int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	query := `
		select t.id, t.id_transaction, t.created_at, t.action, t.id_item, t.id_pro, a.username,
		       t.reservation_expiry, t.item_price, t.commission_rate, t.total_price
		from transactions t
		join accounts a on a.id = t.id_pro
		where t.id_item = $1
		order by t.created_at desc
	`

	var rows *sql.Rows
	var err error
	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		rows, err = utils.Conn.Query(query+" LIMIT $2 OFFSET $3", itemId, limit, offset)
	} else {
		rows, err = utils.Conn.Query(query, itemId)
	}
	if err != nil {
		return nil, fmt.Errorf("GetTransactionsByItemId() failed: %v", err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		var t models.Transaction
		if err := rows.Scan(&t.Id, &t.IdTransaction, &t.CreatedAt, &t.Action, &t.IdItem, &t.IdPro, &t.UsernamePro,
			&t.ReservationExpiry, &t.ItemPrice, &t.CommissionRate, &t.TotalPrice); err != nil {
			return nil, fmt.Errorf("GetTransactionsByItemId() failed: %v", err.Error())
		}
		transactions = append(transactions, t)
	}
	return transactions, nil
}

func GetTotalTransactionsByItemId(itemId int) (int, error) {
	var total int
	query := `select count(*) from transactions t where t.id_item = $1`
	err := utils.Conn.QueryRow(query, itemId).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalTransactionsByItemId() failed: %v", err.Error())
	}
	return total, nil
}

func CheckTransactionExistByUuid(transactionUuid string) (bool, error) {
	var exist bool
	query := `
		select exists(select 1 from transactions where id_transaction = $1)
	`
	err := utils.Conn.QueryRow(query, transactionUuid).Scan(&exist)
	if err != nil {
		return false, fmt.Errorf("CheckTransactionExistByUuid() failed: %v", err.Error())
	}
	return exist, nil
}

func GetTransactionLatestStatusByUuid(transactionUuid string) (string, error) {
	var status string
	query := `
		select action from transactions where id_transaction = $1 order by created_at desc limit 1;
	`
	err := utils.Conn.QueryRow(query, transactionUuid).Scan(&status)
	if err != nil {
		return "", fmt.Errorf("GetTransactionLatestStatusByUuid() failed: %v", err.Error())
	}
	return status, nil
}

func CancelTransactionByUuid(transactionUuid string, idItem int, idPro int) error {
	query := `
		insert into transactions (id_transaction, action, id_item, id_pro) values ($1, 'cancelled', $2, $3);
	`
	_, err := utils.Conn.Exec(query, transactionUuid, idItem, idPro)
	if err != nil {
		return fmt.Errorf("CancelTransactionByUuid() failed: %v", err.Error())
	}
	return nil
}

func GetProIdByTransUuid(transactionUuid string) (int, error) {
	var idPro int
	query := `
		select id_pro from transactions where id_transaction = $1;
	`
	err := utils.Conn.QueryRow(query, transactionUuid).Scan(&idPro)
	if err != nil {
		return 0, fmt.Errorf("GetProIdByTransUuid() failed: %v", err.Error())
	}
	return idPro, nil
}
