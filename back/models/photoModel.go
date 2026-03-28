package models

type PhotoInsertRequest struct {
	Path       string
	IsPrimary  bool
	ObjectType string
	FkId       int
}
