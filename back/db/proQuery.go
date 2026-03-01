package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
)

func CreatePro(newAccount models.CreateAccountRequest, insertedId int) error {
	var err error
	if newAccount.Phone != "" {
		_, err = utils.Conn.Exec("INSERT INTO pros(id_account, phone) VALUES ($1, $2);", insertedId, newAccount.Phone)
	} else {
		_, err = utils.Conn.Exec("INSERT INTO pros(id_account) VALUES ($1);", insertedId)
	}
	if err != nil {
		err = DeleteAccount(insertedId)
		if err != nil {
			return fmt.Errorf("error rolling back after failed insertion into 'pros': %w", err)
		}
		return fmt.Errorf("CreatePro() failed: %w", err)
	}
	return nil
}

func GetProDetailsById(id_account int) (models.ProDetails, error){
	var proDetails models.ProDetails
	err := utils.Conn.QueryRow("SELECT phone, is_premium FROM pros WHERE id_account=$1", id_account).Scan(&proDetails.Phone, &proDetails.IsPremium)
	if err!=nil{
		if err == sql.ErrNoRows{
			return models.ProDetails{}, nil
		}
		return models.ProDetails{}, fmt.Errorf("GetProDetailsById() failed: %v", err.Error())
	}
	return proDetails, nil
}