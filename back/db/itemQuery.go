package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"time"
)

func GetAllItemsHistory(page, limit int, filters models.ValidationFilters) ([]models.AllItemResponse, int, error) {
	var params []interface{}
	paramIndex := 1

	itemsWhere := "WHERE i.is_deleted = false"
	eventsWhere := "WHERE ev.status != 'cancelled'"

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		itemsWhere += fmt.Sprintf(" AND (i.title ILIKE $%d OR a.username ILIKE $%d OR CAST(i.id AS TEXT) ILIKE $%d)", paramIndex, paramIndex, paramIndex)
		eventsWhere += fmt.Sprintf(" AND (ev.title ILIKE $%d OR acc.username ILIKE $%d OR CAST(ev.id AS TEXT) ILIKE $%d)", paramIndex, paramIndex, paramIndex)
		params = append(params, searchParam)
		paramIndex++
	}

	if filters.Status != "" {
		itemsWhere += fmt.Sprintf(" AND i.status::text = $%d", paramIndex)
		eventsWhere += fmt.Sprintf(" AND ev.status::text = $%d", paramIndex)
		params = append(params, filters.Status)
		paramIndex++
	}

	includeItems := filters.Type == "" || filters.Type == "Deposit" || filters.Type == "Listing"
	includeEvents := filters.Type == "" || filters.Type == "Event"

	if filters.Type == "Deposit" {
		itemsWhere += " AND d.id_item IS NOT NULL"
	} else if filters.Type == "Listing" {
		itemsWhere += " AND l.id_item IS NOT NULL"
	}

	countQuery := "SELECT COALESCE(SUM(count), 0) FROM ("
	if includeItems {
		countQuery += fmt.Sprintf("SELECT COUNT(*) FROM items i JOIN accounts a ON i.id_user = a.id LEFT JOIN deposits d ON i.id = d.id_item LEFT JOIN listings l ON i.id = l.id_item %s", itemsWhere)
	}
	if includeItems && includeEvents {
		countQuery += " UNION ALL "
	}
	if includeEvents {
		countQuery += fmt.Sprintf("SELECT COUNT(*) FROM events ev LEFT JOIN (SELECT DISTINCT ON (id_event) id_event, id_employee FROM event_employee ORDER BY id_event, assigned_at ASC) ee ON ev.id = ee.id_event LEFT JOIN accounts acc ON ee.id_employee = acc.id %s", eventsWhere)
	}
	countQuery += ") as history_counts"

	var totalRecords int
	if err := utils.Conn.QueryRow(countQuery, params...).Scan(&totalRecords); err != nil {
		return nil, 0, fmt.Errorf("error counting history: %v", err)
	}

	orderBy := "ORDER BY created_at DESC"
	if filters.Sort == "oldest" {
		orderBy = "ORDER BY created_at ASC"
	}

	query := "SELECT * FROM ("
	if includeItems {
		query += fmt.Sprintf(`
			SELECT 
				i.id, i.title, i.status::text as status, i.created_at, COALESCE(a.username, 'System'),
				CASE 
					WHEN d.id_item IS NOT NULL THEN 'Deposit'
					WHEN l.id_item IS NOT NULL THEN 'Listing'
					ELSE 'Unknown'
				END as item_type
			FROM items i
			JOIN accounts a ON i.id_user = a.id
			LEFT JOIN deposits d ON i.id = d.id_item
			LEFT JOIN listings l ON i.id = l.id_item
			%s`, itemsWhere)
	}
	if includeItems && includeEvents {
		query += " UNION ALL "
	}
	if includeEvents {
		query += fmt.Sprintf(`
			SELECT 
				ev.id, ev.title, ev.status::text as status, ev.created_at, 
				COALESCE(acc.username, 'Not assigned') as username,
				'Event' as item_type
			FROM events ev
			LEFT JOIN (
				SELECT DISTINCT ON (id_event) id_event, id_employee FROM event_employee ORDER BY id_event, assigned_at ASC
			) ee ON ev.id = ee.id_event
			LEFT JOIN accounts acc ON ee.id_employee = acc.id
			%s`, eventsWhere)
	}
	query += ") as total_history " + orderBy

	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)
	if err != nil {
		return nil, 0, fmt.Errorf("error getting all items and events history: %v", err)
	}
	defer rows.Close()

	var items []models.AllItemResponse
	for rows.Next() {
		var item models.AllItemResponse
		err := rows.Scan(&item.ID, &item.Title, &item.Status, &item.CreatedAt, &item.Username, &item.ItemType)
		if err != nil {
			return nil, 0, fmt.Errorf("error scanning history row: %v", err)
		}
		items = append(items, item)
	}
	if items == nil {
		items = []models.AllItemResponse{}
	}
	return items, totalRecords, nil
}

// GetValidationStats returns counts of pending/approved/refused for deposits, listings, and events.
func GetValidationStats() (models.ValidationStats, error) {
	var stats models.ValidationStats

	itemQuery := `
		SELECT
			COUNT(*) FILTER (WHERE i.status = 'pending'  AND d.id_item IS NOT NULL) AS pending_deposits,
			COUNT(*) FILTER (WHERE i.status = 'approved' AND d.id_item IS NOT NULL) AS approved_deposits,
			COUNT(*) FILTER (WHERE i.status = 'refused'  AND d.id_item IS NOT NULL) AS refused_deposits,
			COUNT(*) FILTER (WHERE i.status = 'pending'  AND l.id_item IS NOT NULL) AS pending_listings,
			COUNT(*) FILTER (WHERE i.status = 'approved' AND l.id_item IS NOT NULL) AS approved_listings,
			COUNT(*) FILTER (WHERE i.status = 'refused'  AND l.id_item IS NOT NULL) AS refused_listings
		FROM items i
		LEFT JOIN deposits d ON i.id = d.id_item
		LEFT JOIN listings l ON i.id = l.id_item
		WHERE i.is_deleted = false
	`
	if err := utils.Conn.QueryRow(itemQuery).Scan(
		&stats.PendingDeposits, &stats.ApprovedDeposits, &stats.RefusedDeposits,
		&stats.PendingListings, &stats.ApprovedListings, &stats.RefusedListings,
	); err != nil {
		return stats, fmt.Errorf("GetValidationStats() items query failed: %v", err)
	}

	eventQuery := `
		SELECT
			COUNT(*) FILTER (WHERE status = 'pending')  AS pending_events,
			COUNT(*) FILTER (WHERE status = 'approved') AS approved_events,
			COUNT(*) FILTER (WHERE status = 'refused')  AS refused_events
		FROM events
	`
	if err := utils.Conn.QueryRow(eventQuery).Scan(
		&stats.PendingEvents, &stats.ApprovedEvents, &stats.RefusedEvents,
	); err != nil {
		return stats, fmt.Errorf("GetValidationStats() events query failed: %v", err)
	}
	return stats, nil
}

func GetTotalWeightByMaterialByStatus(material string, status string) (float64, error) {
	if material != "wood" && material != "metal" && material != "textile" && material != "glass" && material != "plastic" && material != "mixed" && material != "all" {
		return 0, fmt.Errorf("invalid material")
	}
	if status != "pending" && status != "approved" && status != "refused" && status != "all" {
		return 0, fmt.Errorf("invalid status")
	}
	var totalWeight float64
	var err error
	if material == "all" {
		err = utils.Conn.QueryRow("SELECT SUM(weight) FROM items WHERE status = $1", status).Scan(&totalWeight)
	}
	if status == "all" {
		err = utils.Conn.QueryRow("SELECT SUM(weight) FROM items WHERE material = $1", material).Scan(&totalWeight)
	}
	if material == "all" && status == "all" {
		err = utils.Conn.QueryRow("SELECT SUM(weight) FROM items").Scan(&totalWeight)
	}

	if err != nil {
		return 0, fmt.Errorf("GetTotalWeightByMaterialByStatus() failed: %v", err)
	}

	return totalWeight, nil
}

func GetAllItems(page, limit int, filters models.ItemFilters) ([]models.Item, int, error) {
	var results []models.Item
	var params []interface{}
	var countParams []interface{}
	whereClause := "WHERE i.is_deleted = false"
	paramIndex := 1

	// Multi select filters
	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(" AND (i.title ILIKE $%d OR a.username ILIKE $%d OR CAST(i.id AS TEXT) ILIKE $%d)", paramIndex, paramIndex, paramIndex)
		params = append(params, searchParam)
		countParams = append(countParams, searchParam)
		paramIndex++
	}
	if filters.Status != "" {
		whereClause += fmt.Sprintf(" AND i.status = $%d", paramIndex)
		params = append(params, filters.Status)
		countParams = append(countParams, filters.Status)
		paramIndex++
	}
	if filters.Category != "" {
		whereClause += " AND EXISTS (SELECT 1 FROM listings l WHERE l.id_item = i.id)"
	}
	if filters.Material != "" {
		whereClause += fmt.Sprintf(" AND i.material = $%d", paramIndex)
		params = append(params, filters.Material)
		countParams = append(countParams, filters.Material)
		paramIndex++
	}

	var totalRecords int
	countQuery := "SELECT COUNT(*) FROM items i JOIN accounts a ON i.id_user=a.id " + whereClause
	err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&totalRecords)
	if err != nil {
		return nil, 0, fmt.Errorf("GetAllItems() count failed: %v", err)
	}

	orderBy := "ORDER BY i.id ASC" // Default sorting
	if filters.Sort != "" {
		switch filters.Sort {
		case "most_recent_creation":
			orderBy = "ORDER BY i.created_at DESC"
		case "oldest_creation":
			orderBy = "ORDER BY i.created_at ASC"
		case "highest_price":
			orderBy = "ORDER BY i.price DESC"
		case "lowest_price":
			orderBy = "ORDER BY i.price ASC"
		default:
			orderBy = "ORDER BY i.id ASC"
		}
	}

	query := `
		SELECT i.created_at, i.id, i.title, i.description, i.weight, i.state, i.id_user, a.username, i.material, i.price, i.status
		FROM items i
		JOIN accounts a ON i.id_user=a.id 
		` + whereClause + " " + orderBy

	// pagination
	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)

	if err != nil {
		return nil, 0, fmt.Errorf("GetAllItems() query failed: %v", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var item models.Item
		err := rows.Scan(&item.CreatedAt, &item.Id, &item.Title, &item.Description, &item.Weight, &item.State, &item.IdUser, &item.Username, &item.Material, &item.Price, &item.Status)
		if err != nil {
			return nil, 0, fmt.Errorf("GetAllItems() scan failed: %v", err.Error())
		}
		// get category
		isListing, err := CheckListingOrDepositByItemId(item.Id)
		if err != nil {
			return nil, 0, fmt.Errorf("GetAllItems() check listing or deposit failed: %v", err.Error())
		}
		if isListing {
			item.Category = "listing"
		} else {
			item.Category = "deposit"
		}
		results = append(results, item)
	}

	return results, totalRecords, nil
}

func GetItemsCountByStatus(status *string) (int, error) {
	if status != nil && *status != "pending" && *status != "approved" && *status != "refused" && *status != "completed" {
		return 0, fmt.Errorf("invalid status")
	}

	var count int
	var err error
	if status == nil {
		err = utils.Conn.QueryRow("SELECT COUNT(*) FROM items WHERE is_deleted = false").Scan(&count)
	} else {
		err = utils.Conn.QueryRow("SELECT COUNT(*) FROM items WHERE status = $1 AND is_deleted = false", *status).Scan(&count)
	}
	if err != nil {
		return 0, fmt.Errorf("GetItemsCountByStatus() failed: %v", err)
	}
	return count, nil
}

func GetTotalItemsSince(date time.Time) (int, error) {
	var count int
	err := utils.Conn.QueryRow("SELECT COUNT(*) FROM items WHERE created_at >= $1 AND is_deleted = false", date).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("GetTotalItemsSince() failed: %v", err)
	}
	return count, nil
}

func GetTotalItemsByMaterialSince(material string, since *time.Time) (int, error) {
	if material != "wood" && material != "metal" && material != "textile" && material != "glass" && material != "plastic" && material != "mixed" && material != "other" {
		return 0, fmt.Errorf("invalid material")
	}
	var count int
	var err error
	if since == nil {
		err = utils.Conn.QueryRow("SELECT COUNT(*) FROM items WHERE material = $1 AND is_deleted = false", material).Scan(&count)
	} else {
		err = utils.Conn.QueryRow("SELECT COUNT(*) FROM items WHERE material = $1 AND is_deleted = false AND created_at >= $2", material, since).Scan(&count)
		if err != nil {
			return 0, fmt.Errorf("GetTotalItemsByMaterial() failed: %v", err)
		}
	}
	return count, nil
}

func CheckItemExistByItemId(id int) (bool, error) {
	var exists bool
	err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM items WHERE id = $1 AND is_deleted = false)", id).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("CheckItemExistByItemId() failed: %v", err)
	}
	return exists, nil
}

func DeleteItemById(id int) error {
	_, err := utils.Conn.Exec("UPDATE items SET is_deleted = true WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("DeleteItemById() failed: %v", err)
	}
	return nil
}

func GetItemDetailsByItemId(id int) (models.Item, error) {
	var item models.Item
	row := utils.Conn.QueryRow("SELECT id, created_at, title, description, weight, state, id_user, material, price, status FROM items WHERE id = $1 AND is_deleted = false", id)
	err := row.Scan(&item.Id, &item.CreatedAt, &item.Title, &item.Description, &item.Weight, &item.State, &item.IdUser, &item.Material, &item.Price, &item.Status); 
	if err != nil {
		return models.Item{}, fmt.Errorf("GetItemDetailsByItemId() failed: %v", err)
	}

	isListing, err := CheckListingOrDepositByItemId(id)
	if err != nil {
		return models.Item{}, fmt.Errorf("GetItemDetailsByItemId() check listing or deposit failed: %v", err)
	}
	if isListing {
		item.Category = "listing"
	} else {
		item.Category = "deposit"
		}
	return item, nil
}

// helper function
//
// return true if is listing, false if is deposit
func CheckListingOrDepositByItemId(id int) (bool, error) {
	var isListing bool
	err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM listings WHERE id_item = $1);", id).Scan(&isListing)
	if err != nil {
		return false, fmt.Errorf("CheckListingOrDepositByItemId() failed: %v", err)
	}
	return isListing, nil
}

func UpdateItemStatusById(id int, new_status string) error {
	var err error
	if new_status == "deleted" {
		err = DeleteItemById(id)
		if err != nil {
			return fmt.Errorf("UpdateItemStatusById() failed: %v", err)
		}
		return nil
	}
	_, err = utils.Conn.Exec("UPDATE items SET status = $1 WHERE id = $2", new_status, id)
	if err != nil {
		return fmt.Errorf("UpdateItemStatusById() failed: %v", err)
	}
	return nil
}

func GetItemStatusByItemId(id int) (string, error) {
	var status string
	err := utils.Conn.QueryRow("SELECT status FROM items WHERE id = $1 AND is_deleted = false", id).Scan(&status)
	if err != nil {
		return "", fmt.Errorf("GetItemStatusByItemId() failed: %v", err)
	}
	return status, nil
}

func CheckItemBelongsToUser(idItem int, userId int) (bool, error) {
	var belongsToUser bool
	err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM items WHERE id = $1 AND id_user = $2)", idItem, userId).Scan(&belongsToUser)
	if err != nil {
		return false, fmt.Errorf("CheckItemBelongsToUser() failed: %v", err)
	}
	return belongsToUser, nil
}