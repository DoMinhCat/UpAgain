package cron

import (
	c "github.com/robfig/cron/v3"
)

func StartCronJobs() {
	scheduler := c.New()

	scheduler.AddFunc("@every 30m", func() {
		UpdateEventRegistrationStatus()
	})

	scheduler.AddFunc("@every 30m", func() {
		UpdateExpiredAds()
	})

	scheduler.Start()
}