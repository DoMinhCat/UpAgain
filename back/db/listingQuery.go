package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
	"time"
)

// GetUserTotalListingsById get listings of a user
//
// param is_validated indicates whether to get all/pending or refused/validated or reserved or completed listings
func GetUserTotalListingsById(id int, is_validated *bool) (int, error) {
	var total int
	query :=
		`select count(*) from listings l
    join(
        users u join items i on u.id_account = i.id_user
    ) on l.id_item=i.id where u.id_account = $1 and i.is_deleted=false`

	param := ""
	if is_validated != nil {
		if *is_validated {
			param = " and i.status != 'pending' and i.status != 'refused'"
		} else {
			param = " and i.status = 'pending' and i.status = 'refused'"
		}
	}

	row := utils.Conn.QueryRow(query+param+";", id)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetUserTotalListingsById() failed: %v", err.Error())
	}

	return total, nil
}

func GetListingStatusById(id int) (string, error) {
	var status string
	err := utils.Conn.QueryRow("SELECT status FROM items WHERE id = $1", id).Scan(&status)
	return status, err
}

func GetTotalListings(since *time.Time) (int, error) {
	var total int
	var row *sql.Row
	if since != nil {
		row = utils.Conn.QueryRow("SELECT count(*) FROM listings l join items i on l.id_item=i.id where i.is_deleted=false and i.created_at >= $1;", *since)
	} else {
		row = utils.Conn.QueryRow("SELECT count(*) FROM listings l join items i on l.id_item=i.id where i.is_deleted=false;")
	}
	
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalListings() failed: %v", err.Error())
	}
	return total, nil
}

func UpdateListingStatus(itemID int, newStatus string, employeeID int) error {
	tx, err := utils.Conn.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(`UPDATE items SET status = $1 WHERE id = $2`, newStatus, itemID)
	if err != nil {
		return fmt.Errorf("error updating item status in tx: %v", err)
	}

	_, err = tx.Exec(`
		INSERT INTO admin_history (entity_type, entity_id, action, id_employee)
		VALUES ('listing', $1, 'update', $2)
	`, itemID, employeeID)
	if err != nil {
		return fmt.Errorf("error inserting into admin_history in tx: %v", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}
	return nil
}

// GetPendingListings returns paginated pending listings with optional search/sort.
// page=-1 and limit=-1 returns all records.
func GetPendingListings(page, limit int, filters models.ValidationFilters) ([]models.PendingListingResponse, int, error) {
	var params []interface{}
	var countParams []interface{}
	paramIndex := 1

	whereClause := "WHERE i.status = 'pending' AND i.is_deleted = false"

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(
			" AND (i.title ILIKE $%d OR a.username ILIKE $%d OR CAST(i.id AS TEXT) ILIKE $%d OR l.city_name ILIKE $%d)",
			paramIndex, paramIndex, paramIndex, paramIndex,
		)
		params = append(params, searchParam)
		countParams = append(countParams, searchParam)
		paramIndex++
	}

	orderBy := "ORDER BY i.created_at ASC"
	if filters.Sort == "most_recent" {
		orderBy = "ORDER BY i.created_at DESC"
	}

	countQuery := `
		SELECT COUNT(DISTINCT i.id)
		FROM items i
		LEFT JOIN listings l ON l.id_item = i.id
		LEFT JOIN accounts a ON a.id = i.id_user
		` + whereClause

	var totalRecords int
	if err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&totalRecords); err != nil {
		return nil, 0, fmt.Errorf("GetPendingListings() count failed: %v", err)
	}

	query := `
		SELECT
			i.id, i.title, i.description, i.material, i.state, i.weight, i.price, i.created_at,
			l.city_name, l.postal_code,
			i.id_user, a.username
		FROM items i
		JOIN listings l ON l.id_item = i.id
		JOIN accounts a ON a.id = i.id_user
		` + whereClause + " " + orderBy

	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)
	if err != nil {
		return nil, 0, fmt.Errorf("GetPendingListings() query failed: %v", err)
	}
	defer rows.Close()

	listings := []models.PendingListingResponse{}
	for rows.Next() {
		var listing models.PendingListingResponse
		if err := rows.Scan(
			&listing.ItemID, &listing.Title, &listing.Description, &listing.Material, &listing.State, &listing.Weight, &listing.Price, &listing.CreatedAt,
			&listing.CityName, &listing.PostalCode,
			&listing.UserID, &listing.Username,
		); err != nil {
			return nil, 0, fmt.Errorf("GetPendingListings() scan failed: %v", err)
		}
		listings = append(listings, listing)
	}
	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("GetPendingListings() rows error: %v", err)
	}
	return listings, totalRecords, nil
}

func GetListingDetailsById(id int) (models.Listing, error) {
	var listing models.Listing
	err := utils.Conn.QueryRow("SELECT city_name, postal_code FROM listings WHERE id_item = $1", id).Scan(&listing.City, &listing.PostalCode)
	if err != nil {
		return models.Listing{}, fmt.Errorf("GetListingDetailsById() failed: %v", err)
	}
	return listing, nil
}
