package models

import "time"

type CreateAdsRequest struct {
	From     time.Time `json:"from"`
	Duration int       `json:"duration"`
	IdPost   int       `json:"id_post"`
}