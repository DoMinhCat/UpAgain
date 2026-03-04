package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
)

func GetPendingDeposits() ([]models.PendingDepositResponse, error) {

	query := `
		SELECT 
			i.id, i.title, i.description, i.material, i.state, i.weight, i.created_at,
			d.id_container, c.city_name, c.postal_code,
			i.id_user, a.username
		FROM items i
		JOIN deposits d ON i.id = d.id_item
		JOIN containers c ON d.id_container = c.id
		JOIN accounts a ON i.id_user = a.id
		WHERE i.status = 'pending' AND i.is_deleted = false
		ORDER BY i.created_at ASC
	`

	rows, err := utils.Conn.Query(query)
	if err != nil {

		return nil, fmt.Errorf("error getting pending deposits from DB: %v", err)
	}
	defer rows.Close()

	deposits := []models.PendingDepositResponse{}

	for rows.Next() {
		var deposit models.PendingDepositResponse
		var description sql.NullString
		err := rows.Scan(
			&deposit.ItemID, &deposit.Title, &deposit.Description, &deposit.Material, &deposit.State, &deposit.Weight, &deposit.CreatedAt,
			&deposit.ContainerID, &deposit.CityName, &deposit.PostalCode,
			&deposit.UserID, &deposit.Username,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning pending deposit row: %v", err)
		}

		if description.Valid {
			deposit.Description = description.String
		}
		deposits = append(deposits, deposit)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating pending deposits rows: %v", err)
	}
	return deposits, nil
}

func GetPendingListings() ([]models.PendingListingResponse, error) {
	query := `
			SELECT i.id, i.title, i.description, i.material, i.weight, i.price,
				i.created_at, l.city_name, l.postal_code, a.username
			FROM items i 
			JOIN listings l on l.id_item = i.id
			JOIN accounts a ON  a.id = i.id_user
			WHERE i.status = 'pending' and i.is_deleted = false
			ORDER BY i.created_at ASC
			`
	rows, err := utils.Conn.Query(query)

	if err != nil {

		return nil, fmt.Errorf("error getting pending listings from DB: %v", err)
	}
	defer rows.Close()

	listings := []models.PendingListingResponse{}

	for rows.Next() {
		var listing models.PendingListingResponse
		var description sql.NullString
		err := rows.Scan(
			&listing.ItemID, &listing.Title, &description, &d.Material, &d.State, &d.Weight, &d.CreatedAt,
			&d.ContainerID, &d.CityName, &d.PostalCode,
			&d.UserID, &d.Username,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning pending deposit row: %v", err)
		}

		if description.Valid {
			d.Description = description.String
		}
		listings = append(listings, listing)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating pending deposits rows: %v", err)
	}
	return listings, nil
}

func GetPendingEvents()
