package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
)

func InsertImage(payload models.PhotoInsertRequest) error {
	var query string
	switch payload.ObjectType {
	case "post":
		query = `
			insert into photos (path, is_primary, object_type, post_id) values ($1, $2, $3, $4);
		`
	case "event":
		query = `
			insert into photos (path, is_primary, object_type, event_id) values ($1, $2, $3, $4);
		`
	case "item":
		query = `
			insert into photos (path, is_primary, object_type, item_id) values ($1, $2, $3, $4);
		`
	default:
		return fmt.Errorf("InsertImage() failed: invalid object type '%v'", payload.ObjectType)
	}

	_, err := utils.Conn.Exec(query, payload.Path, payload.IsPrimary, payload.ObjectType, payload.FkId)
	if err != nil {
		return fmt.Errorf("InsertImage() failed: '%v'", err)
	}
	return nil
}