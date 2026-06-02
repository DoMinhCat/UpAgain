package cron

import (
	c "github.com/robfig/cron/v3"
)

func StartCronJobs() {
	c := c.New()
	// c.AddFunc

	c.Start()	
}