package helpers

import (
	"backend/models"
	"time"
)

func FindNextAvailableDate(schedule models.ContainerSchedule) time.Time {
	earliest := time.Now()
	for _, item := range schedule.UserRange {
		if item.ValidTo.After(earliest) {
			earliest = item.ValidTo
		}
	}

	for _, item := range schedule.ProRange {
		if item.ValidTo.After(earliest) {
			earliest = item.ValidTo
		}
	}
	return earliest
}