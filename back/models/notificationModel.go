package models

// structure to insert into DB table "notifications"
type NotificationInsert struct {
	NotificationType string
	EntityType       string
	EntityId         int
	AccountId        int
}