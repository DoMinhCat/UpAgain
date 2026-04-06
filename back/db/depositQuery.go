package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
	"time"
)

// GetUserTotalDepositsById get deposits of a user
//
// param is_validated indicates whether to get all/pending or refused/validated or reserved or completed deposits
func GetUserTotalDepositsById(id int, is_validated *bool) (int, error) {
	var total int
	query :=
		`select count(*) from deposits d
    join(
        users u join items i on u.id_account = i.id_user
    ) on d.id_item=i.id where u.id_account=$1 and i.is_deleted=false`

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
		return 0, fmt.Errorf("GetUserTotalDepositsById() failed: %v", err.Error())
	}
	return total, nil
}

// GetPendingDeposits returns paginated pending deposits with optional search/sort.
// page=-1 and limit=-1 returns all records.
func GetPendingDeposits(page, limit int, filters models.ValidationFilters) ([]models.PendingDepositResponse, int, error) {
	var params []interface{}
	var countParams []interface{}
	paramIndex := 1

	whereClause := "WHERE i.status = 'pending' AND i.is_deleted = false"

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(
			" AND (i.title ILIKE $%d OR a.username ILIKE $%d OR CAST(i.id AS TEXT) ILIKE $%d OR c.city_name ILIKE $%d)",
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
		LEFT JOIN deposits d ON i.id = d.id_item
		LEFT JOIN containers c ON d.id_container = c.id
		LEFT JOIN accounts a ON i.id_user = a.id
		` + whereClause

	var totalRecords int
	if err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&totalRecords); err != nil {
		return nil, 0, fmt.Errorf("GetPendingDeposits() count failed: %v", err)
	}

	query := `
		SELECT
			i.id, i.title, i.description, i.material, i.state, i.weight, i.created_at,
			d.id_container, c.city_name, c.postal_code,
			i.id_user, a.username
		FROM items i
		JOIN deposits d ON i.id = d.id_item
		JOIN containers c ON d.id_container = c.id
		JOIN accounts a ON i.id_user = a.id
		` + whereClause + " " + orderBy

	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)
	if err != nil {
		return nil, 0, fmt.Errorf("GetPendingDeposits() query failed: %v", err)
	}
	defer rows.Close()

	deposits := []models.PendingDepositResponse{}
	for rows.Next() {
		var deposit models.PendingDepositResponse
		var description sql.NullString
		if err := rows.Scan(
			&deposit.ItemID, &deposit.Title, &description, &deposit.Material, &deposit.State, &deposit.Weight, &deposit.CreatedAt,
			&deposit.ContainerID, &deposit.CityName, &deposit.PostalCode,
			&deposit.UserID, &deposit.Username,
		); err != nil {
			return nil, 0, fmt.Errorf("GetPendingDeposits() scan failed: %v", err)
		}
		if description.Valid {
			deposit.Description = description.String
		}
		deposits = append(deposits, deposit)
	}
	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("GetPendingDeposits() rows error: %v", err)
	}
	return deposits, totalRecords, nil
}

func GetTotalDeposits(since *time.Time) (int, error) {
	var total int
	var row *sql.Row
	if since != nil {
		row = utils.Conn.QueryRow("SELECT count(*) FROM deposits d join items i on d.id_item=i.id where i.is_deleted=false and i.created_at >= $1;", *since)
	} else {
		row = utils.Conn.QueryRow("SELECT count(*) FROM deposits d join items i on d.id_item=i.id where i.is_deleted=false;")
	}
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalDeposits() failed: %v", err.Error())
	}
	return total, nil
}

func GetDepositDetailsById(id int) (models.DepositDetails, error) {
	var deposit models.DepositDetails
	err := utils.Conn.QueryRow("SELECT id_container FROM deposits WHERE id_item = $1", id).Scan(&deposit.ContainerId)
	return deposit, err
}

func UpdateDepositById(depositID int, deposit models.UpdateDepositRequest) error {
	tx, err := utils.Conn.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(`UPDATE items SET title = $1, description = $2, price = $3, weight = $4, state = $5,  material = $6 WHERE id = $7`, deposit.Title, deposit.Description, deposit.Price, deposit.Weight, deposit.State, deposit.Material, depositID)
	if err != nil {
		return fmt.Errorf("error updating item in tx: %v", err)
	}

	// Remove all existing images and replace with the new list
	_, err = tx.Exec("DELETE FROM photos WHERE item_id = $1 AND object_type = 'item'", depositID)
	if err != nil {
		return fmt.Errorf("error deleting old images in tx: %v", err)
	}

	for i, imgPath := range deposit.Photos {
		isPrimary := i == 0
		_, err = tx.Exec(`
			INSERT INTO photos (path, is_primary, object_type, item_id)
			VALUES ($1, $2, 'item', $3)
		`, imgPath, isPrimary, depositID)
		if err != nil {
			return fmt.Errorf("failed to insert photo: %v", err.Error())
		}
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing item transaction: %v", err)
	}
	return nil
}