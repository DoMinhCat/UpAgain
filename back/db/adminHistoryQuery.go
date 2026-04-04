package db

import (
	"backend/utils"
	"encoding/json"
)

// InsertHistory insert a new history record in admin_history table
//
// entityType: 'employee', 'user', 'pro', 'event', 'container', 'post', 'comment', 'listing', 'deposit', 'transaction', 'subscription', 'finance_setting'
//
// entityId: id of the entity
//
// action: action performed ('create', 'update', 'delete')
//
// adminId: id of the admin who performed the action
//
// oldState: old state of the entity (interface)
//
// newState: new state of the entity (interface)
func InsertHistory(entityType string, entityId interface{}, action string, adminId int, oldState interface{}, newState interface{}) error {
	oldJSON, _ := json.Marshal(oldState)
	newJSON, _ := json.Marshal(newState)

	query := `INSERT INTO admin_history (entity_type, entity_id, action, id_employee, old_state, new_state) VALUES ($1, $2, $3, $4, $5, $6)`

	_, err := utils.Conn.Exec(query, entityType, entityId, action, adminId, oldJSON, newJSON)
	return err
}
