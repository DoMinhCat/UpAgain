package seed

import (
	"backend/seed/utils"
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

	// Clean databse for fresh restart and reset id auto-increment
	utils.CleanSeedDb(conn)

	// Insert data (modular functions to avoid messy code)
	// TODO: call modular functions to insert into table 1 by 1

	fmt.Println("Seeding completed successfully!")
}

