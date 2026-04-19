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