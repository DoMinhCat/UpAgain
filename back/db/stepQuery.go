package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"log/slog"
	"strings"
)

func GetProjectStepsByPostId(id_post int) ([]models.ProjectStep, error) {
	query := `
	SELECT s.id, s.created_at, s.title, s.description, s.id_post, s.order
	FROM project_steps s
	WHERE s.id_post = $1 AND s.is_deleted = false
	ORDER BY s."order" ASC;
	`

	rows, err := utils.Conn.Query(query, id_post)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var steps []models.ProjectStep
	for rows.Next() {
		var step models.ProjectStep
		if err := rows.Scan(&step.Id, &step.CreatedAt, &step.Title, &step.Description, &step.IdPost, &step.Order); err != nil {
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
		INSERT INTO project_steps (title, description, id_post, "order")
		VALUES ($1, $2, $3, COALESCE((SELECT MAX("order") FROM project_steps WHERE id_post = $3), 0) + 1)
		RETURNING id
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

func UpdateStep(payload models.StepInsertPayload, idStep int) error {
	var err error
	var newOrder *float64

	if payload.PrevStepId != nil || payload.NextStepId != nil {
		var prevOrder, nextOrder float64
		hasPrev := false
		hasNext := false

		if payload.PrevStepId != nil {
			err = utils.Conn.QueryRow(`SELECT "order" FROM project_steps WHERE id = $1 AND is_deleted = false`, *payload.PrevStepId).Scan(&prevOrder)
			if err == nil {
				hasPrev = true
			} else {
				slog.Warn("Failed to get step order", "function", "UpdateStep", "error", err)
			}
		}

		if payload.NextStepId != nil {
			err = utils.Conn.QueryRow(`SELECT "order" FROM project_steps WHERE id = $1 AND is_deleted = false`, *payload.NextStepId).Scan(&nextOrder)
			if err == nil {
				hasNext = true
			} else {
				slog.Warn("Failed to get step order", "function", "UpdateStep", "error", err)
			}
		}

		if hasPrev && hasNext {
			// step placed in between
			calculated := (prevOrder + nextOrder) / 2.0
			newOrder = &calculated
		} else if hasPrev {
			// step placed in last
			calculated := prevOrder + 1.0
			newOrder = &calculated
		} else if hasNext {
			// step placed in first
			calculated := nextOrder / 2.0
			newOrder = &calculated
		}
	}

	var query string
	var args []interface{}
	if newOrder != nil {
		query = `
			UPDATE project_steps SET title=$1, description=$2, "order"=$3
			WHERE id=$4
		`
		args = []interface{}{payload.Title, payload.Description, *newOrder, idStep}
	} else {
		query = `
			UPDATE project_steps SET title=$1, description=$2
			WHERE id=$3
		`
		args = []interface{}{payload.Title, payload.Description, idStep}
	}

	_, err = utils.Conn.Exec(query, args...)
	if err != nil {
		return err
	}

	// update items of step
	err = UpdateItemsOfSteps(idStep, payload.ItemIds)
	if err != nil {
		return err
	}
	return nil
}

func UpdateItemsOfSteps(idStep int, itemIds []int) error {
	existingItemIds, err := GetItemIdsByStepId(idStep)
	if err != nil {
		return fmt.Errorf("UpdateItemsOfSteps failed to fetch existing items: %v", err)
	}

	// 2. Convert slices into maps for O(1) instant lookup sets
	existingMap := make(map[int]bool)
	for _, id := range existingItemIds {
		existingMap[id] = true
	}

	newMap := make(map[int]bool)
	for _, id := range itemIds {
		newMap[id] = true
	}

	// 3. Find items to INSERT 
	// (If it's in the new list but NOT in the database map -> Insert it)
	var itemsToInsert []int
	for _, id := range itemIds {
		if !existingMap[id] {
			itemsToInsert = append(itemsToInsert, id)
		}
	}

	// 4. Find items to DELETE 
	// (If it's in the database but NOT in the new incoming list -> Delete it)
	var itemsToDelete []int
	for _, id := range existingItemIds {
		if !newMap[id] {
			itemsToDelete = append(itemsToDelete, id)
		}
	}

	// 5. Execute INSERTS
	if len(itemsToInsert) > 0 {
		err := InsertItemsOfSteps(idStep, itemsToInsert)
		if err != nil {
			return fmt.Errorf("UpdateItemsOfSteps failed to insert new step items: %v", err)
		}
	}

	// 6. Execute DELETES
	for _, idToDelete := range itemsToDelete {
		err := DeleteItemOfStep(idStep, idToDelete)
		if err != nil {
			return fmt.Errorf("UpdateItemsOfSteps failed to delete step item %d: %v", idToDelete, err)
		}
	}
	return nil
}

func DeleteItemOfStep(idStep int, itemId int) error {
	_, err := utils.Conn.Exec("DELETE FROM step_items WHERE id_step=$1 AND id_item=$2", idStep, itemId)
	if err != nil {
		return err
	}
	return nil
}

func UpdateStepsOrder(stepIds []int) error {
	for index, id := range stepIds {
		_, err := utils.Conn.Exec(`UPDATE project_steps SET "order"=$1 WHERE id=$2`, float64(index+1), id)
		if err != nil {
			return err
		}
	}
	return nil
}