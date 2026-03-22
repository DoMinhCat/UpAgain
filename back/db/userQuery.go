package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
)

func CreateUser(newAccount models.CreateAccountRequest, accountID int) error {
	var err error
	if newAccount.Phone != "" {
		_, err = utils.Conn.Exec("INSERT INTO users(id_account, phone) VALUES ($1, $2);", accountID, newAccount.Phone)
	} else {
		_, err = utils.Conn.Exec("INSERT INTO users(id_account) VALUES ($1);", accountID)
	}
	if err != nil {
		err = DeleteAccount(accountID)
		if err != nil {
			return fmt.Errorf("error rolling back after failed insertion into 'users': %w", err)
		}
		return fmt.Errorf("CreateUser() failed: %w", err)
	}
	return nil
}

func GetUserDetailsById(id_account int) (models.UserDetails, error) {
	var userDetails models.UserDetails
	err := utils.Conn.QueryRow("SELECT phone, up_score FROM users WHERE id_account=$1", id_account).Scan(&userDetails.Phone, &userDetails.Score)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.UserDetails{}, nil
		}
		return models.UserDetails{}, fmt.Errorf("GetUserDetailsById() failed: %v", err.Error())
	}
	return userDetails, nil
}

// GetUserStatsById get some basic stats of user to display in admin user detail page or in profile page of user. Stats include:
//
// - Total deposits item of a user, these deposits must be approved, reserved or completed
//
// - Total listings (annonces) of a user that are approved, reserved or completed
//
// - Total spendings on events/workshops (these are the only options that user can spend money on)
func GetUserStatsById(id int) (models.UserStats, error) {
	var userStats models.UserStats

	is_validated := true
	deposits, err := GetUserTotalDepositsById(id, &is_validated)
	if err != nil {
		return models.UserStats{}, fmt.Errorf("GetUserStatsById() failed: %v", err.Error())

	}

	listings, err := GetUserTotalListingsById(id, &is_validated)
	if err != nil {
		return models.UserStats{}, fmt.Errorf("GetUserStatsById() failed: %v", err.Error())

	}

	spendings, err := GetTotalEventSpendingsById(id)
	if err != nil {
		return models.UserStats{}, fmt.Errorf("GetUserStatsById() failed: %v", err.Error())

	}

	userStats.TotalDeposits = deposits
	userStats.TotalListings = listings
	userStats.TotalSpent = spendings
	return userStats, nil
}


func GetTotalScoreStats() (models.TotalScoreStats, error) {
	var totalScoreStats models.TotalScoreStats
	err := utils.Conn.QueryRow("SELECT SUM(up_score) FROM users u JOIN accounts a ON u.id_account = a.id WHERE a.deleted_at IS NULL;").Scan(&totalScoreStats.Total)
	if err != nil {
		return models.TotalScoreStats{}, fmt.Errorf("GetTotalScoreStats() failed: %v", err.Error())
	}
	return totalScoreStats, nil
}
	