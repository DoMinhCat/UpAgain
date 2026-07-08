package db

import (
	"backend/models"
	"backend/utils"
	helpers "backend/utils/helpers"
	"database/sql"
	"fmt"
)

func CreatePro(newAccount models.CreateAccountRequest, insertedId int) error {
	var err error
	if newAccount.Phone != "" {
		_, err = utils.Conn.Exec("INSERT INTO pros(id_account, phone, is_premium) VALUES ($1, $2, $3);", insertedId, newAccount.Phone, newAccount.IsPremium)
	} else {
		_, err = utils.Conn.Exec("INSERT INTO pros(id_account, is_premium) VALUES ($1, $2);", insertedId, newAccount.IsPremium)
	}
	if err != nil {
		err = DeleteAccount(insertedId)
		if err != nil {
			return fmt.Errorf("error rolling back after failed insertion into 'pros': %w", err)
		}
		return fmt.Errorf("CreatePro() failed: %w", err)
	}

	//if premium, create a subscription
	if *newAccount.IsPremium {
		err = CreateSubscription(insertedId, *newAccount.IsTrial)
		if err != nil {
			err = DeleteAccount(insertedId)
			if err != nil {
				return fmt.Errorf("error rolling back after failed insertion into 'subscriptions': %w", err)
			}
			return fmt.Errorf("CreatePro() failed: %w", err)
		}
	}
	return nil
}

func GetProDetailsById(id_account int) (models.ProDetails, error) {
	var proDetails models.ProDetails
	err := utils.Conn.QueryRow("SELECT phone, is_premium, completed_onboard FROM pros WHERE id_account=$1", id_account).Scan(&proDetails.Phone, &proDetails.IsPremium, &proDetails.CompletedOnboard)
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
	projects, err := GetTotalPostsByIdAccountByCategory(id, &category)
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

func GetProTotalSpendingsById(id int) (float64, error) {
	total := 0.0

	subscription_total, err := GetTotalSubscriptionSpendingsById(id)
	if err != nil {
		return 0.0, fmt.Errorf("GetProTotalSpendingsById() failed: %v", err.Error())
	}
	total += subscription_total

	ads_total, err := GetTotalAdsSpendingsById(id)
	if err != nil {
		return 0.0, fmt.Errorf("GetProTotalSpendingsById() failed: %v", err.Error())
	}
	total += ads_total

	items_total, err := GetProTotalItemsSpendingsById(id)
	if err != nil {
		return 0.0, fmt.Errorf("GetProTotalSpendingsById() failed: %v", err.Error())
	}
	total += items_total

	events_total, err := GetTotalEventSpendingsById(id)
	if err != nil {
		return 0.0, fmt.Errorf("GetProTotalSpendingsById() failed: %v", err.Error())
	}
	total += events_total
	return total, nil
}

func UpdateProPremium(id_account int, is_premium bool) error {
	_, err := utils.Conn.Exec("UPDATE pros SET is_premium=$1 WHERE id_account=$2;", is_premium, id_account)
	if err != nil {
		return fmt.Errorf("UpdateProPremium() failed: %w", err)
	}
	return nil
}

func getTimeframeCondition(timeframe string) string {
	switch timeframe {
	case "24h":
		return "now() - interval '24 hours'"
	case "7d":
		return "now() - interval '7 days'"
	case "30d":
		return "now() - interval '30 days'"
	case "year":
		return "now() - interval '1 year'"
	default:
		return "date_trunc('month', now())"
	}
}

func GetProInventoryAnalytics(timeframe string) ([]models.MaterialInventoryStats, error) {
	cond := getTimeframeCondition(timeframe)
	query := fmt.Sprintf(`
		SELECT 
			m.mat::text AS material,
			COALESCE(avail.cnt, 0) AS available,
			COALESCE(add_cnt.cnt, 0) AS added,
			COALESCE(recy.cnt, 0) AS recycled
		FROM (
			SELECT unnest(enum_range(NULL::material)) AS mat
		) m
		LEFT JOIN (
			SELECT material, COUNT(*) AS cnt
			FROM items i
			WHERE i.is_deleted = false
			  AND i.status = 'approved'
			  AND NOT EXISTS (
				  SELECT 1 FROM transactions t
				  WHERE t.id_item = i.id AND t.action = 'purchased'
			  )
			GROUP BY material
		) avail ON m.mat = avail.material
		LEFT JOIN (
			SELECT material, COUNT(*) AS cnt
			FROM items i
			WHERE i.is_deleted = false
			  AND i.created_at >= %s
			GROUP BY material
		) add_cnt ON m.mat = add_cnt.material
		LEFT JOIN (
			SELECT i.material, COUNT(*) AS cnt
			FROM items i
			JOIN transactions t ON i.id = t.id_item
			WHERE i.is_deleted = false
			  AND t.action = 'purchased'
			  AND t.created_at >= %s
			GROUP BY i.material
		) recy ON m.mat = recy.material
		ORDER BY m.mat;
	`, cond, cond)
	rows, err := utils.Conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("GetProInventoryAnalytics() query failed: %w", err)
	}
	defer rows.Close()

	var stats []models.MaterialInventoryStats
	for rows.Next() {
		var s models.MaterialInventoryStats
		if err := rows.Scan(&s.Material, &s.Available, &s.Added, &s.Recycled); err != nil {
			return nil, fmt.Errorf("GetProInventoryAnalytics() scan failed: %w", err)
		}
		stats = append(stats, s)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("GetProInventoryAnalytics() rows check failed: %w", err)
	}
	return stats, nil
}

func GetProImpactTracking(idPro int, timeframe string) (float64, []models.MaterialUsageStats, error) {
	materialsList := []string{"wood", "metal", "textile", "glass", "plastic", "mixed", "other"}
	usageMap := make(map[string]float64)
	for _, m := range materialsList {
		usageMap[m] = 0.0
	}

	cond := getTimeframeCondition(timeframe)
	query := fmt.Sprintf(`
		SELECT 
			i.material::text, 
			COALESCE(SUM(i.weight), 0.0)
		FROM items i
		JOIN transactions t ON i.id = t.id_item
		WHERE t.id_pro = $1
		  AND t.action = 'purchased'
		  AND i.is_deleted = false
		  AND t.created_at >= %s
		GROUP BY i.material
	`, cond)
	rows, err := utils.Conn.Query(query, idPro)
	if err != nil {
		return 0, nil, fmt.Errorf("GetProImpactTracking() query failed: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var material string
		var weight float64
		if err := rows.Scan(&material, &weight); err != nil {
			return 0, nil, fmt.Errorf("GetProImpactTracking() scan failed: %w", err)
		}
		usageMap[material] = weight
	}
	if err := rows.Err(); err != nil {
		return 0, nil, fmt.Errorf("GetProImpactTracking() rows check failed: %w", err)
	}

	var totalCO2 float64
	var stats []models.MaterialUsageStats
	for _, m := range materialsList {
		weight := usageMap[m]
		stats = append(stats, models.MaterialUsageStats{
			Material: m,
			Weight:   weight,
		})

		if weight > 0 {
			co2, err := helpers.CalculateCO2(m, weight)
			if err != nil {
				return 0, nil, fmt.Errorf("GetProImpactTracking() CalculateCO2 failed: %w", err)
			}
			totalCO2 += co2
		}
	}

	return totalCO2, stats, nil
}

func GetProFinancialStats(idPro int, timeframe string) (int, int, float64, error) {
	var totalPurchases int
	var paidPurchases int
	var totalSpent float64

	cond := getTimeframeCondition(timeframe)
	query := fmt.Sprintf(`
		SELECT 
			COUNT(*), 
			COUNT(*) FILTER (WHERE total_price > 0),
			COALESCE(SUM(total_price), 0.0)::float8
		FROM transactions
		WHERE id_pro = $1 AND action = 'purchased'
		  AND created_at >= %s
	`, cond)
	err := utils.Conn.QueryRow(query, idPro).Scan(&totalPurchases, &paidPurchases, &totalSpent)
	if err != nil {
		return 0, 0, 0, fmt.Errorf("GetProFinancialStats() failed: %w", err)
	}

	return totalPurchases, paidPurchases, totalSpent, nil
}

func GetProAlertMaterials(idPro int) ([]string, error) {
	rows, err := utils.Conn.Query("SELECT material::text FROM pro_alert_materials WHERE id_pro = $1", idPro)
	if err != nil {
		return nil, fmt.Errorf("GetProAlertMaterials() query failed: %w", err)
	}
	defer rows.Close()

	materials := []string{}
	for rows.Next() {
		var mat string
		if err := rows.Scan(&mat); err != nil {
			return nil, fmt.Errorf("GetProAlertMaterials() scan failed: %w", err)
		}
		materials = append(materials, mat)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("GetProAlertMaterials() rows check failed: %w", err)
	}
	return materials, nil
}

func UpdateProAlertMaterials(idPro int, materials []string) error {
	tx, err := utils.Conn.Begin()
	if err != nil {
		return fmt.Errorf("UpdateProAlertMaterials() transaction start failed: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM pro_alert_materials WHERE id_pro = $1", idPro)
	if err != nil {
		return fmt.Errorf("UpdateProAlertMaterials() delete failed: %w", err)
	}

	for _, mat := range materials {
		_, err = tx.Exec("INSERT INTO pro_alert_materials (id_pro, material) VALUES ($1, $2)", idPro, mat)
		if err != nil {
			return fmt.Errorf("UpdateProAlertMaterials() insert failed for material '%s': %w", mat, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("UpdateProAlertMaterials() commit failed: %w", err)
	}
	return nil
}

func IsProSubscriptionActive(idPro int) (bool, error) {
	var active bool
	query := `
		SELECT EXISTS (
			SELECT 1 FROM subscriptions
			WHERE id_pro = $1 AND is_active = true AND sub_to > now()
		)
	`
	err := utils.Conn.QueryRow(query, idPro).Scan(&active)
	if err != nil {
		return false, fmt.Errorf("IsProSubscriptionActive() failed: %w", err)
	}
	return active, nil
}

func GetMatchingAlertProIds(itemId int) ([]int, error) {
	query := `
		SELECT pam.id_pro 
		FROM pro_alert_materials pam
		JOIN items i ON i.id = $1
		WHERE pam.material = i.material
		  AND EXISTS (
			  SELECT 1 FROM noti_settings ns
			  WHERE ns.id_account = pam.id_pro 
			    AND ns.noti_type = 'pro_material_available' 
			    AND ns.is_enabled = true
		  )
		  AND EXISTS (
			  SELECT 1 FROM subscriptions s
			  WHERE s.id_pro = pam.id_pro 
			    AND s.is_active = true 
			    AND s.sub_to > now()
		  )
	`
	rows, err := utils.Conn.Query(query, itemId)
	if err != nil {
		return nil, fmt.Errorf("GetMatchingAlertProIds() query failed: %w", err)
	}
	defer rows.Close()

	var proIds []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("GetMatchingAlertProIds() scan failed: %w", err)
		}
		proIds = append(proIds, id)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("GetMatchingAlertProIds() rows check failed: %w", err)
	}
	return proIds, nil
}
