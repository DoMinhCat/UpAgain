package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
)

func GetAllItemsHistory() ([]models.AllItemResponse, error) {
	query := `
		SELECT 
			i.id, i.title, i.status::text as status, i.created_at, a.username,
			CASE 
				WHEN d.id_item IS NOT NULL THEN 'Deposit'
				WHEN l.id_item IS NOT NULL THEN 'Listing'
				ELSE 'Unknown'
			END as item_type
		FROM items i
		JOIN accounts a ON i.id_user = a.id
		LEFT JOIN deposits d ON i.id = d.id_item
		LEFT JOIN listings l ON i.id = l.id_item
		WHERE i.is_deleted = false

		UNION ALL

		SELECT 
			ev.id, ev.title, ev.status::text as status, ev.created_at, acc.username,
			'Event' as item_type
		FROM events ev
		JOIN event_employee ee ON ev.id = ee.id_event
		JOIN accounts acc ON ee.id_employee = acc.id
		WHERE ev.is_cancelled = false

		ORDER BY created_at DESC
	`

	rows, err := utils.Conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error getting all items and events history: %v", err)
	}
	defer rows.Close()

	var items []models.AllItemResponse
	for rows.Next() {
		var item models.AllItemResponse
		err := rows.Scan(&item.ID, &item.Title, &item.Status, &item.CreatedAt, &item.Username, &item.ItemType)
		if err != nil {
			return nil, fmt.Errorf("error scanning history row: %v", err)
		}
		items = append(items, item)
	}
	return items, nil
}
