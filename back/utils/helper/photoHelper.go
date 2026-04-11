package helper

import (
	"mime/multipart"
)

// ProcessPhotoUpdate handles the full photo update lifecycle for an entity:
//  1. Deletes physical files that are no longer referenced (present in currentPaths but not in keepPaths).
//  2. Saves newly-uploaded files to destDir and appends their paths to keepPaths.
//
// Parameters:
//   - destDir:      upload directory, e.g. "images/events"
//   - currentPaths: paths currently stored in the DB for this entity
//   - keepPaths:    paths sent by the client that should be retained
//   - newFiles:     new multipart files uploaded by the client
//
// Returns the final ordered slice of image paths (kept + new) and any error that prevents
// new files from being saved. Errors during physical deletion are non-fatal and are returned
// via the deletionErrors slice so the caller can log them without aborting.
func ProcessPhotoUpdate(
	destDir string,
	currentPaths []string,
	keepPaths []string,
	newFiles []*multipart.FileHeader,
) (finalPaths []string, deletionErrors []error, err error) {
	// 1. Delete physical files that were removed by the client
	keepSet := make(map[string]struct{}, len(keepPaths))
	for _, p := range keepPaths {
		keepSet[p] = struct{}{}
	}

	for _, dbImg := range currentPaths {
		if _, kept := keepSet[dbImg]; !kept {
			if delErr := DeleteFileByPath(destDir, dbImg); delErr != nil {
				deletionErrors = append(deletionErrors, delErr)
			}
		}
	}

	// 2. Start with kept images, then append newly-saved ones
	finalPaths = append(finalPaths, keepPaths...)
	for _, file := range newFiles {
		path, saveErr := SaveUploadedFile(file, destDir)
		if saveErr != nil {
			return nil, deletionErrors, saveErr
		}
		finalPaths = append(finalPaths, path)
	}

	return finalPaths, deletionErrors, nil
}
