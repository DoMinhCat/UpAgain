package db

import (
	"backend/notifications"
	"fmt"
	"slices"
)

// Interact with table "notifications"

var allowedNotificationTypes = []string{
    "user_object_status",
    "user_validation_status",
    "user_object_retrieved",
    "user_event_updated",
    "pro_material_available",
    "pro_object_deposited",
    "pro_subscription_end",
    "emp_event_updated",
    "emp_event_assigned",
}
var allowedNotificationEntityTypes = []string{
	"profile", "event", "item",
}

// Insert a notification record into database after sending notification using OneSignal API
func InsertNotification(payload notifications.NotificationInsert) error {
	if !slices.Contains(allowedNotificationTypes, payload.NotificationType) {
		return fmt.Errorf("invalid notification type: %v", payload.NotificationType)
	}
	if !slices.Contains(allowedNotificationEntityTypes, payload.EntityType) {
		return fmt.Errorf("invalid entity type: %v", payload.EntityType)
	}

	// TODO: Actually implement the notification insertion
	return nil
}