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

	scheduler.AddFunc("@every 1h", func() {
		UpdateExpiredSubscription()
	})

	scheduler.AddFunc("@every 1h", func() {
		UpdateExpiredReservation()
	})

	scheduler.AddFunc("@every 30m", func() {
		UpdateExpiredCode()
	})

	scheduler.AddFunc("@every 30m", func() {
		UpdateActiveCode()
	})

	scheduler.Start()
}