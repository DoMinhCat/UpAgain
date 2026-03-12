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
