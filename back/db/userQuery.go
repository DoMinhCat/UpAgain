package db

import (
	"backend/models"
	"backend/utils"
	"backend/utils/helpers"
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
	err := utils.Conn.QueryRow("SELECT phone, up_score, completed_onboard FROM users WHERE id_account=$1", id_account).Scan(&userDetails.Phone, &userDetails.Score, &userDetails.CompletedOnboard)
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

func GetTotalScore() (models.TotalScoreStats, error) {
	var totalScoreStats models.TotalScoreStats
	err := utils.Conn.QueryRow("SELECT SUM(up_score) FROM users u JOIN accounts a ON u.id_account = a.id WHERE a.deleted_at IS NULL;").Scan(&totalScoreStats.Total)
	if err != nil {
		return models.TotalScoreStats{}, fmt.Errorf("GetTotalScoreStats() failed: %v", err.Error())
	}

	return totalScoreStats, nil
}

func GetGlobalImpactStats() (models.UserImpactStats, error) {
	rows, err := utils.Conn.Query(`
		SELECT material::text, SUM(weight)
		FROM items
		WHERE status = 'completed' AND is_deleted = false
		GROUP BY material
	`)
	if err != nil {
		return models.UserImpactStats{}, fmt.Errorf("GetGlobalImpactStats() query failed: %w", err)
	}
	defer rows.Close()

	var stats models.UserImpactStats
	for rows.Next() {
		var material string
		var totalWeight float64
		if err := rows.Scan(&material, &totalWeight); err != nil {
			return models.UserImpactStats{}, fmt.Errorf("GetGlobalImpactStats() scan failed: %w", err)
		}
		co2, err := helpers.CalculateCO2(material, totalWeight)
		if err != nil {
			return models.UserImpactStats{}, fmt.Errorf("GetGlobalImpactStats() CalculateCO2 failed: %w", err)
		}
		electricity, err := helpers.CalculateElectricitySaved(material, totalWeight)
		if err != nil {
			return models.UserImpactStats{}, fmt.Errorf("GetGlobalImpactStats() CalculateElectricitySaved failed: %w", err)
		}
		water, err := helpers.CalculateWaterSaved(material, totalWeight)
		if err != nil {
			return models.UserImpactStats{}, fmt.Errorf("GetGlobalImpactStats() CalculateWaterSaved failed: %w", err)
		}
		stats.CO2 += co2
		stats.Electricity += electricity
		stats.Water += water
	}
	if err := rows.Err(); err != nil {
		return models.UserImpactStats{}, fmt.Errorf("GetGlobalImpactStats() rows error: %w", err)
	}
	return stats, nil
}

func GetUserImpactStats(idAccount int) (models.UserImpactStats, error) {
	rows, err := utils.Conn.Query(`
		SELECT material::text, SUM(weight)
		FROM items
		WHERE id_user = $1 AND status = 'completed' AND is_deleted = false
		GROUP BY material
	`, idAccount)
	if err != nil {
		return models.UserImpactStats{}, fmt.Errorf("GetUserImpactStats() query failed: %w", err)
	}
	defer rows.Close()

	var stats models.UserImpactStats
	for rows.Next() {
		var material string
		var totalWeight float64
		if err := rows.Scan(&material, &totalWeight); err != nil {
			return models.UserImpactStats{}, fmt.Errorf("GetUserImpactStats() scan failed: %w", err)
		}
		co2, err := helpers.CalculateCO2(material, totalWeight)
		if err != nil {
			return models.UserImpactStats{}, fmt.Errorf("GetUserImpactStats() CalculateCO2 failed: %w", err)
		}
		water, err := helpers.CalculateWaterSaved(material, totalWeight)
		if err != nil {
			return models.UserImpactStats{}, fmt.Errorf("GetUserImpactStats() CalculateWaterSaved failed: %w", err)
		}
		electricity, err := helpers.CalculateElectricitySaved(material, totalWeight)
		if err != nil {
			return models.UserImpactStats{}, fmt.Errorf("GetUserImpactStats() CalculateElectricitySaved failed: %w", err)
		}
		stats.CO2 += co2
		stats.Water += water
		stats.Electricity += electricity
	}
	if err := rows.Err(); err != nil {
		return models.UserImpactStats{}, fmt.Errorf("GetUserImpactStats() rows error: %w", err)
	}
	return stats, nil
}

func GetUserImpactItems(idAccount, page, limit int) ([]models.UserImpactItem, int, error) {
	countRow := utils.Conn.QueryRow(`
		SELECT COUNT(*)
		FROM items i
		JOIN transactions t ON t.id_item = i.id AND t.action = 'purchased'
		WHERE i.id_user = $1 AND i.status = 'completed' AND i.is_deleted = false
	`, idAccount)

	var totalRecords int
	if err := countRow.Scan(&totalRecords); err != nil {
		return nil, 0, fmt.Errorf("GetUserImpactItems() count failed: %w", err)
	}

	offset := (page - 1) * limit
	rows, err := utils.Conn.Query(`
		SELECT i.id, i.title, i.material::text, i.weight, i.price,
		       t.created_at, a.username
		FROM items i
		JOIN transactions t ON t.id_item = i.id AND t.action = 'purchased'
		JOIN accounts a ON a.id = t.id_pro
		WHERE i.id_user = $1 AND i.status = 'completed' AND i.is_deleted = false
		ORDER BY t.created_at DESC
		LIMIT $2 OFFSET $3
	`, idAccount, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("GetUserImpactItems() query failed: %w", err)
	}
	defer rows.Close()

	items := make([]models.UserImpactItem, 0)
	for rows.Next() {
		var item models.UserImpactItem
		var soldDate string
		if err := rows.Scan(
			&item.Id, &item.Title, &item.Material, &item.Weight, &item.Price,
			&soldDate, &item.BuyerName,
		); err != nil {
			return nil, 0, fmt.Errorf("GetUserImpactItems() scan failed: %w", err)
		}
		item.SoldDate = soldDate

		co2, err := helpers.CalculateCO2(item.Material, item.Weight)
		if err != nil {
			return nil, 0, fmt.Errorf("GetUserImpactItems() CalculateCO2 failed: %w", err)
		}
		water, err := helpers.CalculateWaterSaved(item.Material, item.Weight)
		if err != nil {
			return nil, 0, fmt.Errorf("GetUserImpactItems() CalculateWaterSaved failed: %w", err)
		}
		electricity, err := helpers.CalculateElectricitySaved(item.Material, item.Weight)
		if err != nil {
			return nil, 0, fmt.Errorf("GetUserImpactItems() CalculateElectricitySaved failed: %w", err)
		}
		item.CO2 = co2
		item.Water = water
		item.Electricity = electricity

		photos, err := GetPhotosPathsByObjectId(item.Id, "item")
		if err != nil {
			return nil, 0, fmt.Errorf("GetUserImpactItems() GetPhotosPathsByObjectId failed: %w", err)
		}
		item.Photos = photos

		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("GetUserImpactItems() rows error: %w", err)
	}
	return items, totalRecords, nil
}

func UpdateOnboardByIdAccount(id_account int) error {
	_, err := utils.Conn.Exec("UPDATE users SET completed_onboard=true WHERE id_account=$1", id_account)
	if err != nil {
		return fmt.Errorf("UpdateOnboardByIdAccount() failed: %v", err.Error())
	}
	return nil
}
