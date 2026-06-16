package seed

import (
	"backend/seed/utils"
	"backend/seed/utils/insert"
	"fmt"
)

// This script populate the database with dummy data while respecting business rules

func SeedDB() {
	/* High level plan:
	1. Delete from all tables
	2. Insert into tables in corresponding order of foreign keys
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

	// Insert data (modular functions to avoid messy code)
	// TODO: call modular functions to insert into table 1 by 1
	err = insert.InsertAccounts(tx)
	if err != nil {
		panic(fmt.Sprintf("InsertAccounts failed: %v", err))
	}

	err = tx.Commit()
	if err != nil {
		panic(fmt.Sprintf("failed to commit transaction: %v", err))
	}
	fmt.Println("Seeding completed successfully!")
}

