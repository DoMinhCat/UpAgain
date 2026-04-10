package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"log/slog"
)

func GetAllContainers(page int, limit int, filters models.ContainerFilters) ([]models.Container, int, error) {
	var count int
	var params []interface{}
	var countParams []interface{}
	paramIndex := 1

	whereClause := "WHERE is_deleted = false"

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(" AND (city_name ILIKE $%d OR postal_code ILIKE $%d OR CAST(id AS TEXT) ILIKE $%d)", paramIndex, paramIndex, paramIndex)
		params = append(params, searchParam)
		countParams = append(countParams, searchParam)
		paramIndex++
	}

	if filters.Status != "" {
		whereClause += fmt.Sprintf(" AND status = $%d", paramIndex)
		params = append(params, filters.Status)
		countParams = append(countParams, filters.Status)
		paramIndex++
	}

	countQuery := "SELECT COUNT(*) FROM containers " + whereClause
	err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&count)
	if err != nil {
		return nil, 0, fmt.Errorf("GetAllContainers() count failed: %v", err)
	}

	query := "SELECT id, created_at, city_name, postal_code, status, is_deleted FROM containers " + whereClause + " ORDER BY id ASC"

	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)
	if err != nil {
		return nil, 0, fmt.Errorf("GetAllContainers() query failed: %v", err)
	}
	defer rows.Close()

	var containers []models.Container
	for rows.Next() {
		var c models.Container
		if err := rows.Scan(&c.ID, &c.CreatedAt, &c.CityName, &c.PostalCode, &c.Status, &c.IsDeleted); err != nil {
			return nil, 0, err
		}
		containers = append(containers, c)
	}
	
	if containers == nil {
		containers = make([]models.Container, 0)
	}

	return containers, count, nil
}

func FindContainerByID(id int) (models.Container, error) {
	var c models.Container
	query := `SELECT id, created_at, city_name, postal_code, status, is_deleted
			  FROM containers WHERE id = $1 AND is_deleted = false`

	err := utils.Conn.QueryRow(query, id).Scan(
		&c.ID, &c.CreatedAt, &c.CityName, &c.PostalCode, &c.Status, &c.IsDeleted,
	)
	return c, err
}

func UpdateStatusContainer(id int, status string) error {
	query := `UPDATE containers SET status = $1 WHERE id = $2`
	_, err := utils.Conn.Exec(query, status, id)
	return err
}

func SoftDeleteContainer(id int) error {
	query := `UPDATE containers SET is_deleted = true WHERE id = $1`
	_, err := utils.Conn.Exec(query, id)
	return err
}

// return total count of containers by status
//
// Available status: "active" => ("occupied" or "ready") and not deleted, "occupied", "maintenance", "ready", "deleted"
//
// return total of all records if status is nil
func GetContainerCountByStatus(status *string) (int, error) {
	var count int
	param := ""

	if status != nil {
		switch *status {
		case "active":
			param = "WHERE (status='occupied' or status='ready') and is_deleted=false"
		case "occupied":
			param = "WHERE status='occupied' and is_deleted=false"
		case "maintenance":
			param = "WHERE status='maintenance' and is_deleted=false"
		case "ready":
			param = "WHERE status='ready' and is_deleted=false"
		case "deleted":
			param = "WHERE is_deleted=true"
		case "not_deleted":
			param = "WHERE is_deleted=false"
		default:
			param = ""
		}
	}

	query := "SELECT COUNT(*) FROM containers "
	err := utils.Conn.QueryRow(query + param + ";").Scan(&count)
	return count, err
}

func InsertContainer(c models.Container) (int, error) {
	var newId int
	query := `INSERT INTO containers (city_name, postal_code, status, is_deleted, created_at)
              VALUES ($1, $2, $3, false, NOW()) RETURNING id`

	err := utils.Conn.QueryRow(query, c.CityName, c.PostalCode, "ready").Scan(&newId)

	if err != nil {
		slog.Error("CRITICAL SQL ERROR", "msg", err.Error())
	}

	return newId, err
}

func GetContainerStatusById(id int) (string, error) {
	var status string
	query := `SELECT status FROM containers WHERE id = $1 AND is_deleted = false`
	err := utils.Conn.QueryRow(query, id).Scan(&status)
	return status, err
}

func GetAvailableContainers() ([]models.Container, error) {
	var containers []models.Container
	query := `SELECT id FROM containers WHERE status != 'maintenance' AND is_deleted = false`
	rows, err := utils.Conn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var c models.Container
		if err := rows.Scan(&c.ID); err != nil {
			return nil, err
		}
		containers = append(containers, c)
	}
	return containers, err
}

func CheckContainerExistById(id int) (bool, error) {
	var exist bool
	query := `SELECT EXISTS(SELECT 1 FROM containers WHERE id = $1 AND is_deleted = false)`
	err := utils.Conn.QueryRow(query, id).Scan(&exist)
	return exist, err
}