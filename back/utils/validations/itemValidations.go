package validations

import (
	"backend/db"
	"backend/models"
	"fmt"
	"net/http"
	"slices"
	"strings"
)

func ValidateItemCreation(newItem models.ItemCreateRequest) models.ValidationResponse {
	var response models.ValidationResponse

	if strings.TrimSpace(newItem.Title) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Title is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}
	if len(newItem.Title) < 3 || len(newItem.Title) > 50 {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Title must be between 3 and 50 characters."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if strings.TrimSpace(newItem.Description) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Description is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if newItem.Price < 0 {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Price must be greater than or equal to 0."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if newItem.Weight <= 0 {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Weight must be greater than 0."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if newItem.Category != "listing" && newItem.Category != "deposit" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Invalid category."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if !slices.Contains(db.STATES, newItem.State) {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Invalid state."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if !slices.Contains(db.MATERIALS, newItem.Material) {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Invalid material."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	return models.ValidationResponse{
		Success: true,
		Message: nil,
		Error:   http.StatusOK,
	}
}