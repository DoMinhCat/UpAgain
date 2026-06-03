package models

import (
	"time"

	"github.com/guregu/null"
)

// structure to insert into DB table "notifications"
type NotificationInsert struct {
	NotificationType string
	EntityType       string
	EntityId         int
	AccountId        int
}

type NotificationDetail struct {
	Uuid             string    `json:"uuid"`
	CreatedAt        time.Time `json:"created_at"`
	ReadAt           null.Time `json:"read_at" swaggertype:"string"`
	DeletedAt        null.Time `json:"deleted_at" swaggertype:"string"`
	Type             string    `json:"type"`
	EntityType       string    `json:"entity_type"`
	EntityId         int       `json:"entity_id"`
	IdAccount        int       `json:"id_account"`
	EntityTitle      string    `json:"entity_title"`
}

type MarkNotificationsReadRequest struct {
	Ids []string `json:"ids"`
}