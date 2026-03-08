package db

import (
	"backend/utils"
	"fmt"
)

// if param category is nil => get all kind of category
func GetTotalPostsByIdByCategory(id int, category *string) (int, error) {
	var total int
	param := ""
	if category != nil {
		switch *category {
		case "tutorial":
			param = " and category = 'tutorial'"
		case "project":
			param = " and category = 'project'"
		case "tips":
			param = " and category = 'tips'"
		case "news":
			param = " and category = 'news'"
		case "case_study":
			param = " and category = 'case_study'"
		case "other":
			param = " and category = 'other'"
		default:
			return 0, fmt.Errorf("GetTotalPostsByIdByCategory() failed: invalid category '%v'", *category)
		}
	}

	query := `
		select count(*) from posts p
		where p.id_account = $1 and p.is_deleted = false
	`
	row := utils.Conn.QueryRow(query+param+";", id)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalPostsByIdByCategory() failed: '%v'", err)
	}

	return total, nil
}
