package validations

import (
	"backend/models"
	"fmt"
	"net/http"
	"strings"
)

func ValidateEventCreation(newEvent models.CreateEventRequest) models.ValidationResponse {
	var response models.ValidationResponse

	if strings.TrimSpace(newEvent.Title) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Title is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if !newEvent.Description.Valid || strings.TrimSpace(newEvent.Description.String) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Description is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if !newEvent.StartAt.Valid || newEvent.StartAt.Time.IsZero() {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Start date is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if strings.TrimSpace(newEvent.Street) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Street is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if strings.TrimSpace(newEvent.City) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("City is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if newEvent.Capacity.Valid && newEvent.Capacity.Int64 <= 0 {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Capacity must be greater than 0."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if !newEvent.Price.Valid || newEvent.Price.Float64 < 0 {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Price cannot be negative."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if newEvent.Status != "pending" && newEvent.Status != "approved" && newEvent.Status != "refused" && newEvent.Status != "cancelled" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Invalid status."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if newEvent.Category != "workshop" && newEvent.Category != "meetups" && newEvent.Category != "conference" && newEvent.Category != "exposition" && newEvent.Category != "other" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Invalid category."),
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