package utils

import (
	"database/sql"
	"fmt"
)

func CleanSeedDb(conn *sql.DB) {
	fmt.Println("Cleaning Seed DB for fresh seeding...")

	tx, err := conn.Begin()
	if err != nil {
		panic(fmt.Sprintf("failed to start transaction: %v", err))
	}
	defer tx.Rollback()

	query := `
		TRUNCATE TABLE 
			pro_alert_materials,
			notifications,
			step_items,
			transactions,
			subscriptions,
			barcodes,
			deposits,
			containers,
			listings,
			photos,
			project_steps,
			items,
			ads,
			liked_comments,
			liked_posts,
			viewed_posts,
			saved_posts,
			comments,
			posts,
			admin_history,
			event_employee,
			event_registrations,
			events,
			pros,
			employees,
			users,
			noti_settings,
			accounts,
			finance_settings
		RESTART IDENTITY CASCADE;
	`

	_, err = tx.Exec(query)
	if err != nil {
		panic(fmt.Sprintf("failed to clean database: %v", err))
	}

	err = tx.Commit()
	if err != nil {
		panic(fmt.Sprintf("failed to commit transaction: %v", err))
	}

	fmt.Println("Database cleaned successfully.")
}