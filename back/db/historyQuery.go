package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
)

func GetAllAdminHistory(page int, limit int, filters models.HistoryFilters) ([]models.History, int, error) {
	histories := make([]models.History, 0)
	var params []interface{}
	var countParams []interface{}
	paramIndex := 1

	whereClause := "WHERE h.id IS NOT NULL"

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(" AND (a.username ILIKE $%d OR CAST(h.entity_id AS TEXT) ILIKE $%d)", paramIndex, paramIndex)
		params = append(params, searchParam)
		countParams = append(countParams, searchParam)
		paramIndex++
	}

	if filters.Module != "" {
		whereClause += fmt.Sprintf(" AND h.entity_type = $%d", paramIndex)
		params = append(params, filters.Module)
		countParams = append(countParams, filters.Module)
		paramIndex++

	}

	if filters.Action == "create" {
		whereClause += " AND h.action = 'create'"
	} else if filters.Action == "update" {
		whereClause += " AND h.action = 'update'"
	} else if filters.Action == "delete" {
		whereClause += " AND h.action = 'delete'"
	}

	var totalRecords int
	countQuery := "SELECT COUNT(*) FROM admin_history h JOIN accounts a ON h.id_employee = a.id " + whereClause
	err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&totalRecords)
	if err != nil {
		return nil, 0, fmt.Errorf("GetAllAdminHistory() count failed: %v", err)
	}

	orderBy := "ORDER BY id ASC" // Default sorting
	switch filters.Sort {
	case "most_recent_activity":
		orderBy = "ORDER BY created_at DESC"
	case "oldest_activity":
		orderBy = "ORDER BY created_at ASC"
	}

	query := `
	SELECT h.id, h.created_at, h.entity_type, h.entity_id, h.action, h.old_state, h.new_state, h.id_employee, a.username
	FROM admin_history h JOIN accounts a ON h.id_employee = a.id
	` + whereClause + " " + orderBy

	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)

	if err != nil {
		return nil, 0, fmt.Errorf("GetAllAdminHistory() query failed: %v", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var history models.History
		if err := rows.Scan(&history.Id, &history.CreatedAt, &history.Module, &history.ItemId, &history.Action, &history.OldState, &history.NewState, &history.AdminId, &history.AdminName); err != nil {
			return nil, 0, fmt.Errorf("GetAllAdminHistory() scan failed: %v", err.Error())
		}
		histories = append(histories, history)

	}

	return histories, totalRecords, nil
}

func GetHistoryDetailsById(id_history int) (models.History, error) {
	var history models.History
	query := `
	SELECT h.id, h.created_at, h.entity_type, h.entity_id, h.action, h.old_state, h.new_state, h.id_employee, a.username
	FROM admin_history h JOIN accounts a ON h.id_employee = a.id
	WHERE h.id = $1
	`
	err := utils.Conn.QueryRow(query, id_history).Scan(&history.Id, &history.CreatedAt, &history.Module, &history.ItemId, &history.Action, &history.OldState, &history.NewState, &history.AdminId, &history.AdminName)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.History{}, nil
		}
		return models.History{}, fmt.Errorf("GetHistoryDetailsById() query failed: %v", err.Error())
	}
	return history, nil
}
