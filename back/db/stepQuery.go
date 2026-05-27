package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"strings"
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

func DeleteProjectStepByStepId(id_step int) error {
	query := `
	UPDATE project_steps
	SET is_deleted = true
	WHERE id = $1;
	`
	_, err := utils.Conn.Exec(query, id_step)
	return err
}

func InsertStep(payload models.StepInsertPayload) (int, error) {
	var idStep int
	query := `
		INSERT INTO project_steps (title, description, id_post)
		VALUES ($1, $2, $3) RETURNING id
	`
	err := utils.Conn.QueryRow(query, payload.Title, payload.Description, payload.IdPost).Scan(&idStep)
	if err != nil {
		return 0, err
	}
	return idStep, nil
}

func InsertItemsOfSteps(idStep int, itemIds []int) error {
	if len(itemIds) == 0 {
        return nil
    }

    // 1. Build the value placeholders dynamically
    valueStrings := make([]string, 0, len(itemIds))
    valueArgs := make([]interface{}, 0, len(itemIds)*2)
    
    placeholderCounter := 1

    for _, itemID := range itemIds {
        // Generates strings like "($1, $2)"
        valueStrings = append(valueStrings, fmt.Sprintf("($%d, $%d)", placeholderCounter, placeholderCounter+1))
        
        // Append the actual arguments in matching positional pairs
        valueArgs = append(valueArgs, idStep, itemID)
        
        placeholderCounter += 2
    }

    // 2. Join the parts into a single query layout string
    query := fmt.Sprintf("INSERT INTO step_items (id_step, id_item) VALUES %s", strings.Join(valueStrings, ", "))

    // 3. Execute the dynamically compiled SQL string block
    _, err := utils.Conn.Exec(query, valueArgs...)
    if err != nil {
        return fmt.Errorf("InsertItemsOfSteps() failed dynamically: %v", err)
    }

    return nil
}