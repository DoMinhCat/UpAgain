package validations

import (
	"backend/models"
	"fmt"
	"net/http"
	"strings"
)

func ValidatePostCreationOrUpdate(newPost models.CreatePostRequest) models.ValidationResponse {
	var response models.ValidationResponse

	if strings.TrimSpace(newPost.Title) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Title is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if strings.TrimSpace(newPost.Content) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Content is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if strings.TrimSpace(newPost.Category) == "" {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Errorf("Category is required."),
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if newPost.Category != "tutorial" && newPost.Category != "project" && newPost.Category != "tips" && newPost.Category != "news" && newPost.Category != "case_study" && newPost.Category != "other" {
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
