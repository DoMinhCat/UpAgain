package db

import (
	"backend/utils"
	"os"
	"testing"
)

func TestGetNotifications(t *testing.T) {
	// Load development env
	os.Chdir("..")
	utils.LoadEnv("dev")
	conn, err := utils.GetDb()
	if err != nil {
		t.Fatalf("Failed to connect to DB: %v", err)
	}
	utils.Conn = conn
	defer conn.Close()

	// 1. Get the total count of rows in the notifications table
	var count int
	err = conn.QueryRow("SELECT count(*) FROM notifications").Scan(&count)
	if err != nil {
		t.Fatalf("Failed to count notifications: %v", err)
	}
	t.Logf("Total notifications in notifications table: %d", count)

	// 2. Select and print all notifications in the table
	if count > 0 {
		rows, err := conn.Query("SELECT id, created_at, read_at, deleted_at, type, entity_type, entity_id, id_account FROM notifications")
		if err != nil {
			t.Fatalf("Failed to select notifications: %v", err)
		}
		defer rows.Close()

		for rows.Next() {
			var id, typeStr, entityType, entityId string
			var createdAt string
			var readAt, deletedAt interface{}
			var idAccount int
			if err := rows.Scan(&id, &createdAt, &readAt, &deletedAt, &typeStr, &entityType, &entityId, &idAccount); err != nil {
				t.Errorf("Scan error: %v", err)
				continue
			}
			t.Logf("Noti ID: %s | Account: %d | Type: %s | EntityType: %s | EntityID: %s | Created: %s | Read: %v | Deleted: %v",
				id, idAccount, typeStr, entityType, entityId, createdAt, readAt, deletedAt)
		}
	}
}
