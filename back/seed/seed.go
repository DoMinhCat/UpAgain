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
	allAccountIDs := append(userIDs, proIDs...)
    allAccountIDs = append(allAccountIDs, employeeIDs...)

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

	// pros
	premiumIds, err := insert.InsertPros(tx, userIDs)
	if err != nil {
		panic(fmt.Sprintf("InsertPros failed: %v", err))
	}

	// noti_settings
	err = insert.InsertNotiSettingsForRoles(tx, userIDs, proIDs, employeeIDs)
    if err != nil {
        panic(fmt.Sprintf("InsertNotiSettingsForRoles failed: %v", err))
    }

	// ! notifications will be leave empty

	// events
	eventIDs, err := insert.InsertEvents(tx, employeeIDs, 30)
    if err != nil {
        panic(fmt.Sprintf("InsertEvents failed: %v", err))
    }

	// posts
	postIDs, projectIDs, err := insert.InsertPosts(tx, proIDs, employeeIDs, 100)
    if err != nil {
        panic(fmt.Sprintf("InsertPosts failed: %v", err))
    }

	// pro_alert_materials
	err = insert.InsertProAlertMaterials(tx, premiumIds)
    if err != nil {
        panic(fmt.Sprintf("InsertProAlertMaterials failed: %v", err))
    }

	// ! saved_posts, viewed_posts, liked_posts, liked_comments will be empty

	// items
	itemIDs, err := insert.InsertItems(tx, userIDs, 250)
	if err != nil {
		panic(fmt.Sprintf("InsertItems failed: %v", err))
	}

	// comments
	_, err = insert.InsertComments(tx, postIDs, userIDs, proIDs, 300)
	if err != nil {
		panic(fmt.Sprintf("InsertComments failed: %v", err))
	}

	// project steps
	_, err = insert.InsertProjectSteps(tx, projectIDs)
	if err != nil {
		panic(fmt.Sprintf("InsertProjectSteps failed: %v", err))
	}

	//ads
	err = insert.InsertAds(tx, projectIDs)
	if err != nil {
		panic(fmt.Sprintf("InsertAds failed: %v", err))
	}

	// event registrations
	err = insert.InsertEventRegistrations(tx, eventIDs, userIDs, proIDs)
	if err != nil {
		panic(fmt.Sprintf("InsertEventRegistrations failed: %v", err))
	}
	
	// event employee
	err = insert.InsertEventEmployees(tx, eventIDs, employeeIDs)
	if err != nil {
		panic(fmt.Sprintf("InsertEventEmployees failed: %v", err))
	}
	
	// Split items 50/50
	halfIndex := len(itemIDs) / 2
	listingItemIDs := itemIDs[:halfIndex]
	depositItemIDs := itemIDs[halfIndex:]

	// listings
	err = insert.InsertListings(tx, listingItemIDs)
	if err != nil {
		panic(fmt.Sprintf("InsertListings failed: %v", err))
	}

	// deposits
	err = insert.InsertDeposits(tx, depositItemIDs, containerIDs)
	if err != nil {
		panic(fmt.Sprintf("InsertDeposits failed: %v", err))
	}

	// ! transactions, step_items is empty

	// subscriptions
	err = insert.InsertSubscriptions(tx, premiumIds)
	if err != nil {
		panic(fmt.Sprintf("InsertSubscriptions failed: %v", err))
	}
	
	// photos
	


	_, _, _, _, _, _, _ = userIDs, proIDs, employeeIDs, containerIDs, eventIDs, postIDs, itemIDs

	err = tx.Commit()
	if err != nil {
		panic(fmt.Sprintf("failed to commit transaction: %v", err))
	}
	fmt.Println("Seeding completed successfully!")
}

