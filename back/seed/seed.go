package seed

import (
	"backend/seed/utils"
	"backend/seed/utils/insert"
	"fmt"
)

// This script populate the database with dummy data while respecting business rules

/*
Insert order:
- finance_settings, containers, accounts
- users, employees, pros, noti_settings, notifications
- events, posts, pro_alert_materials
- items, comments, saved_posts, viewed_posts, liked_posts, liked_comments, ads, project_steps
- event_registrations, event_employee, listings, deposits, transactions, step_items, subscriptions, photos
*/

func SeedDB() {
	/* High level plan:
	1. Delete from all tables
	2. Insert into tables in corresponding order of foreign keys
	Any error will terminate the transaction to avoid partial inserts
	*/

	conn := utils.SetUpDbConn()
	fmt.Println("Seed DB connected")
	defer conn.Close()

	tx, err := conn.Begin()
	if err != nil {
		panic(fmt.Sprintf("failed to start transaction: %v", err))
	}
	defer tx.Rollback()

	// Clean databse for fresh restart and reset id auto-increment
	err = utils.CleanSeedDb(tx)
	if err != nil {
		panic(fmt.Sprintf("CleanSeedDb failed: %v", err))
	}

	// Insert data
	// accounts
	userIDs, proIDs, employeeIDs, err := insert.InsertAccounts(tx)
	if err != nil {
		panic(fmt.Sprintf("InsertAccounts failed: %v", err))
	}

	// finance settings
	err = insert.InsertFinanceSettings(tx)
	if err != nil {
		panic(fmt.Sprintf("InsertFinanceSettings failed: %v", err))
	}

	// containers
	containerIDs, err := insert.InsertContainers(tx)
	if err != nil {
		panic(fmt.Sprintf("InsertContainers failed: %v", err))
	}
	
	// TODO: pros, noti_settings, notifications

	// users
	err = insert.InsertUsers(tx, userIDs)
	if err != nil {
		panic(fmt.Sprintf("InsertUsers failed: %v", err))
	}

	// employees
	err = insert.InsertEmployees(tx, userIDs)
	if err != nil {
		panic(fmt.Sprintf("InsertEmployees failed: %v", err))
	}


	_, _, _, _ = userIDs, proIDs, employeeIDs, containerIDs

	err = tx.Commit()
	if err != nil {
		panic(fmt.Sprintf("failed to commit transaction: %v", err))
	}
	fmt.Println("Seeding completed successfully!")
}

