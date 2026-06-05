package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"slices"

	"github.com/google/uuid"
)

// Insert a notification record into database after sending notification using OneSignal API
func InsertNotification(payload models.NotificationInsert) error {
	if !slices.Contains(NOTIFICATION_TYPES, payload.NotificationType) {
		return fmt.Errorf("invalid notification type: %v", payload.NotificationType)
	}
	if !slices.Contains(NOTIFICATION_ENTITY_TYPES, payload.EntityType) {
		return fmt.Errorf("invalid entity type: %v", payload.EntityType)
	}

	uuidStr := uuid.NewString()
	query := `
		INSERT INTO notifications (id, type, entity_type, entity_id, id_account)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := utils.Conn.Exec(query, uuidStr, payload.NotificationType, payload.EntityType, payload.EntityId, payload.AccountId)
	if err != nil {
		return fmt.Errorf("InsertNotification failed: %w", err)
	}
	return nil
}

func MarkNotiAsReadByUuid(notificationUuid string) error {
	query := `
		UPDATE notifications
		SET read_at = NOW()
		WHERE id = $1
	`
	_, err := utils.Conn.Exec(query, uuid.Must(uuid.Parse(notificationUuid)))
	if err != nil {
		return fmt.Errorf("MarkNotiAsReadByUuid failed: %w", err)
	}
	return nil
}

func DeleteNotiByUuid(notificationUuid string) error {
	query := `
		DELETE FROM notifications
		WHERE id = $1
	`
	_, err := utils.Conn.Exec(query, uuid.Must(uuid.Parse(notificationUuid)))
	if err != nil {
		return fmt.Errorf("DeleteNotiByUuid failed: %w", err)
	}
	return nil
}

func GetNotiDetailsByUuid(id_noti uuid.UUID) (models.NotificationDetail, error) {
	query := `
		SELECT n.id, n.created_at, n.read_at, n.deleted_at, n.type, n.entity_type, CAST(n.entity_id AS integer), n.id_account
		FROM notifications n
		WHERE n.id = $1
	`
	var notiDetail models.NotificationDetail
	err := utils.Conn.QueryRow(query, id_noti).Scan(&notiDetail.Uuid, &notiDetail.CreatedAt, &notiDetail.ReadAt, &notiDetail.DeletedAt, &notiDetail.Type, &notiDetail.EntityType, &notiDetail.EntityId, &notiDetail.IdAccount)
	if err != nil {
		return notiDetail, fmt.Errorf("GetNotiDetailsByUuid failed: %w", err)
	}

	var entityTitle string
	switch notiDetail.EntityType {
	case "item":
		err = utils.Conn.QueryRow("SELECT title FROM items WHERE id = $1", notiDetail.EntityId).Scan(&entityTitle)
		if err != nil {
			return notiDetail, fmt.Errorf("GetNotiDetailsByUuid failed: %w", err)
		}
		notiDetail.EntityTitle = entityTitle
	case "event":
		err = utils.Conn.QueryRow("SELECT title FROM events WHERE id = $1", notiDetail.EntityId).Scan(&entityTitle)
		if err != nil {
			return notiDetail, fmt.Errorf("GetNotiDetailsByUuid failed: %w", err)
		}
		notiDetail.EntityTitle = entityTitle
	}
	return notiDetail, nil
}

func GetNotificationsByAccountId(accountId int) ([]models.NotificationDetail, error) {
	query := `
		SELECT n.id, n.created_at, n.read_at, n.deleted_at, n.type, n.entity_type, CAST(n.entity_id AS integer), n.id_account
		FROM notifications n
		WHERE n.id_account = $1 AND n.deleted_at IS NULL
		ORDER BY n.created_at DESC
	`
	rows, err := utils.Conn.Query(query, accountId)
	if err != nil {
		return nil, fmt.Errorf("GetNotificationsByAccountId failed: %w", err)
	}
	defer rows.Close()

	var list []models.NotificationDetail
	for rows.Next() {
		var notiDetail models.NotificationDetail
		err := rows.Scan(&notiDetail.Uuid, &notiDetail.CreatedAt, &notiDetail.ReadAt, &notiDetail.DeletedAt, &notiDetail.Type, &notiDetail.EntityType, &notiDetail.EntityId, &notiDetail.IdAccount)
		if err != nil {
			return nil, fmt.Errorf("GetNotificationsByAccountId Scan failed: %w", err)
		}

		var entityTitle string
		switch notiDetail.EntityType {
		case "item":
			err = utils.Conn.QueryRow("SELECT title FROM items WHERE id = $1", notiDetail.EntityId).Scan(&entityTitle)
			if err == nil {
				notiDetail.EntityTitle = entityTitle
			}
		case "event":
			err = utils.Conn.QueryRow("SELECT title FROM events WHERE id = $1", notiDetail.EntityId).Scan(&entityTitle)
			if err == nil {
				notiDetail.EntityTitle = entityTitle
			}
		}

		list = append(list, notiDetail)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("GetNotificationsByAccountId Rows failed: %w", err)
	}

	return list, nil
}