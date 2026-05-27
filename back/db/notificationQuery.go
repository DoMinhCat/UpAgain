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