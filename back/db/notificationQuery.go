package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"slices"
)

// Insert a notification record into database after sending notification using OneSignal API
func InsertNotification(payload models.NotificationInsert) error {
	if !slices.Contains(NOTIFICATION_TYPES, payload.NotificationType) {
		return fmt.Errorf("invalid notification type: %v", payload.NotificationType)
	}
	if !slices.Contains(NOTIFICATION_ENTITY_TYPES, payload.EntityType) {
		return fmt.Errorf("invalid entity type: %v", payload.EntityType)
	}

	// TODO: Actually implement the notification insertion
	query := `
		INSERT INTO notifications () 
		VALUES ()
	`
	_, err := utils.Conn.Exec(query)
	if err != nil {
		return fmt.Errorf("InsertNotification failed: %w", err)
	}
	return nil
}