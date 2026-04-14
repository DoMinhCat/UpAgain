package validations

import (
	"backend/models"
	"fmt"
	"net/http"
	"strings"
	"time"
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

	if strings.TrimSpace(newEvent.Description) == "" {
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

	if !newEvent.EndAt.Valid || newEvent.EndAt.Time.IsZero() {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("End date is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if newEvent.StartAt.Time.Before(time.Now()) {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Start date cannot be in the past."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if newEvent.EndAt.Time.Before(newEvent.StartAt.Time) {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("End date must be after start date."),
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

func ValidateEventUpdate(updateEvent models.UpdateEventRequest) models.ValidationResponse {
	var response models.ValidationResponse

	if strings.TrimSpace(updateEvent.Title) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Title is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if strings.TrimSpace(updateEvent.Description) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Description is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}
	if !updateEvent.StartAt.Valid || updateEvent.StartAt.Time.IsZero() {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Start date is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if !updateEvent.EndAt.Valid || updateEvent.EndAt.Time.IsZero() {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("End date is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if updateEvent.EndAt.Time.Before(updateEvent.StartAt.Time) {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("End date must be after start date."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	// if event hasn't ended yet, start date can't be in the past
	if updateEvent.StartAt.Time.Before(time.Now()) && updateEvent.EndAt.Time.After(time.Now()) {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Start date must be in the future."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if strings.TrimSpace(updateEvent.Street) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Street is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if strings.TrimSpace(updateEvent.City) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("City is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if updateEvent.Capacity.Valid && updateEvent.Capacity.Int64 < 0 {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Capacity must be greater than or equal to 0."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if !updateEvent.Price.Valid || updateEvent.Price.Float64 < 0 {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Price cannot be negative."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if updateEvent.Category != "workshop" && updateEvent.Category != "meetups" && updateEvent.Category != "conference" && updateEvent.Category != "exposition" && updateEvent.Category != "other" {
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
