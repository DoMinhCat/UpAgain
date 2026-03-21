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

func GetProDetailsById(id_account int) (models.ProDetails, error) {
	var proDetails models.ProDetails
	err := utils.Conn.QueryRow("SELECT phone, is_premium FROM pros WHERE id_account=$1", id_account).Scan(&proDetails.Phone, &proDetails.IsPremium)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.ProDetails{}, nil
		}
		return models.ProDetails{}, fmt.Errorf("GetProDetailsById() failed: %v", err.Error())
	}
	return proDetails, nil
}

// GetProStatsById get some basic stats of pro to display in admin user detail page or in profile page of pro. Stats include:
//
// - Total deposits item pro bought/reserved
//
// - Total listings (annonces) pro bought/reserved
//
// - Total projects posted
//
// - Total spendings on events/workshops and buying items and subscription and ads
func GetProStatsById(id int) (models.ProStats, error) {
	var stats models.ProStats

	action_type := "purchased"
	deposits, err := GetProTotalDepositsByIdByAction(id, &action_type)
	if err != nil {
		return models.ProStats{}, fmt.Errorf("GetProStatsById() failed: %v", err.Error())
	}

	listings, err := GetProTotalListingsByIdByAction(id, &action_type)
	if err != nil {
		return models.ProStats{}, fmt.Errorf("GetProStatsById() failed: %v", err.Error())
	}

	category := "project"
	projects, err := GetTotalPostsByIdByCategory(id, &category)
	if err != nil {
		return models.ProStats{}, fmt.Errorf("GetProStatsById() failed: %v", err.Error())
	}

	spendings, err := GetProTotalSpendingsById(id)
	if err != nil {
		return models.ProStats{}, fmt.Errorf("GetProStatsById() failed: %v", err.Error())
	}

	stats.TotalDeposits = deposits
	stats.TotalListings = listings
	stats.TotalProjects = projects
	stats.TotalSpent = spendings
	return stats, nil
}

func GetProTotalSpendingsById(id int) (int, error) {
	total := 0

	subscription_total, err := GetTotalSubscriptionSpendingsById(id)
	if err != nil {
		return 0, fmt.Errorf("GetProTotalSpendingsById() failed: %v", err.Error())
	}
	total += subscription_total

	ads_total, err := GetTotalAdsSpendingsById(id)
	if err != nil {
		return 0, fmt.Errorf("GetProTotalSpendingsById() failed: %v", err.Error())
	}
	total += ads_total

	items_total, err := GetProTotalItemsSpendingsById(id)
	if err != nil {
		return 0, fmt.Errorf("GetProTotalSpendingsById() failed: %v", err.Error())
	}
	total += items_total

	events_total, err := GetTotalEventSpendingsById(id)
	if err != nil {
		return 0, fmt.Errorf("GetProTotalSpendingsById() failed: %v", err.Error())
	}
	total += events_total
	return total, nil
}
