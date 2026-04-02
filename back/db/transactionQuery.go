package db

import (
	"backend/utils"
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
	query := `
		select COALESCE(sum(i.price), 0) from transactions t
		join pros p on p.id_account = t.id_pro
		join items i on i.id = t.id_item
		where p.id_account = $1 and i.price is not null and t.action = 'purchased';
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
	time:= " AND created_at IS NOT NULL"
	query := `
		select count(*) from transactions t
		where t.action=$1
	`
	if since != nil{
		time = " AND created_at >= $2"
	}
	err := utils.Conn.QueryRow(query+time+";", status, since).Scan(&total)
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
