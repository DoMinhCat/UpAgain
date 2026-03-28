package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
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

func GetPhotosPathsByObjectId(id int, objectType string) ([]string, error) {
	var photos []string
	var fk string
	query := `SELECT path FROM photos p WHERE p.%s = $1 ORDER BY p.is_primary DESC, p.created_at ASC;`

	switch objectType {
	case "post":
		fk = "post_id"
	case "event":
		fk = "event_id"
	case "item":
		fk = "item_id"
	case "avatar":
		fk = "account_id"
	default:
		return nil, fmt.Errorf("GetPhotosPathsByObjectId() failed: invalid object type '%v'", objectType)
	}
	rows, err := utils.Conn.Query(fmt.Sprintf(query, fk), id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("GetPhotosPathsByObjectId() failed: '%v'", err)
	}
	defer rows.Close()

	for rows.Next() {
		var path string
		if err := rows.Scan(&path); err != nil {
			return nil, fmt.Errorf("GetPhotosByObjectId() scan failed: '%v'", err)
		}
		photos = append(photos, path)
	}
	return photos, nil
}