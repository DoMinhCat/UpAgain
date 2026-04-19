package validations

import (
	"backend/models"
	"fmt"
	"net/http"
	"time"
)

func ValidateCreateAdsRequest(payload models.CreateAdsRequest) models.ValidationResponse {
	if payload.From.IsZero() {
		return models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Start date is required"),
			Error:   http.StatusBadRequest,
		}
	}

	if payload.Duration <= 0 {
		return models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Duration must be at least 1 month"),
			Error:   http.StatusBadRequest,
		}
	}

	if payload.From.Before(time.Now()) {
		return models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Start date must be in the future"),
			Error:   http.StatusBadRequest,
		}
	}
	
	return models.ValidationResponse{
		Success: true,
		Message: nil,
		Error:   http.StatusOK,
	}
}

func ValidateUpdateAdsRequest(payload models.UpdateAdsRequest) models.ValidationResponse {
	if payload.From.IsZero() {
		return models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Start date is required"),
			Error:   http.StatusBadRequest,
		}
	}

	if payload.To.IsZero() {
		return models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("End date is required"),
			Error:   http.StatusBadRequest,
		}
	}

	if payload.From.Before(time.Now()) {
		return models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Start date must be in the future"),
			Error:   http.StatusBadRequest,
		}
	}

	if payload.To.Before(payload.From) {
		return models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("End date must be after start date"),
			Error:   http.StatusBadRequest,
		}
	}

	if payload.From.After(payload.To) {
		return models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Start date must be before end date"),
			Error:   http.StatusBadRequest,
		}
	}
	
	return models.ValidationResponse{
		Success: true,
		Message: nil,
		Error:   http.StatusOK,
	}
}