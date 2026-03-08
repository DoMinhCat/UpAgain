package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
)

func GetAllContainers() ([]models.Container, error) {
	query := `SELECT id, created_at, city_name, postal_code, status, is_deleted FROM containers WHERE is_deleted = false`
	rows, err := utils.Conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error getting containers from DB: %v", err)
	}
	defer rows.Close()

	var containers []models.Container
	for rows.Next() {
		var c models.Container
		if err := rows.Scan(&c.ID, &c.CreatedAt, &c.CityName, &c.PostalCode, &c.Status, &c.IsDeleted); err != nil {
			return nil, err
		}
		containers = append(containers, c)
	}
	return containers, nil
}
