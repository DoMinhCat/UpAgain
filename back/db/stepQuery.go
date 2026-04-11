package db

import (
	"backend/models"
	"backend/utils"
)

func GetProjectStepsByPostId(id_post int) ([]models.ProjectStep, error) {
	query := `
	SELECT s.id, s.created_at, s.title, s.description, s.id_post
	FROM project_steps s
	WHERE s.id_post = $1 AND s.is_deleted = false
	ORDER BY s.created_at DESC;
	`

	rows, err := utils.Conn.Query(query, id_post)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var steps []models.ProjectStep
	for rows.Next() {
		var step models.ProjectStep
		if err := rows.Scan(&step.Id, &step.CreatedAt, &step.Title, &step.Description, &step.IdPost); err != nil {
			return nil, err
		}

		photos, err := GetPhotosPathsByObjectId(step.Id, "step")
		if err != nil {
			return nil, err
		}
		step.Photos = photos

		step.Items = []models.StepItem{}
		items, err := GetItemIdsByStepId(step.Id)
		if err != nil {
			return nil, err
		}

		for _, itemId := range items {
			itemDetail, err := GetItemDetailsByItemId(itemId)
			if err != nil {
				return nil, err
			}
			
			newItem := models.StepItem{
				Id:    itemDetail.Id,
				Title: itemDetail.Title,
			}
			
			step.Items = append(step.Items, newItem)
		}
		steps = append(steps, step)
	}

	return steps, nil
}

func GetItemIdsByStepId(id_step int) ([]int, error) {
	query := `
	SELECT id_item
	FROM step_items
	WHERE id_step = $1;`
	rows, err := utils.Conn.Query(query, id_step)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var itemIds []int
	for rows.Next() {
		var itemId int
		if err := rows.Scan(&itemId); err != nil {
			return nil, err
		}
		itemIds = append(itemIds, itemId)
	}
	return itemIds, nil
}

func CheckProjectStepExistsById(id_step int) (bool, error) {
	query := `
	SELECT EXISTS(SELECT 1 FROM project_steps WHERE id = $1 AND is_deleted = false);
	`
	var exists bool
	err := utils.Conn.QueryRow(query, id_step).Scan(&exists)
	return exists, err
}

func DeleteProjectStepByPostId(id_step int) error {
	query := `
	UPDATE project_steps
	SET is_deleted = true
	WHERE id = $1;
	`
	_, err := utils.Conn.Exec(query, id_step)
	return err
}