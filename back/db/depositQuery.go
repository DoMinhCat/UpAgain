package db

import (
	"backend/utils"
	"fmt"
	"math/rand"
	"time"
)

func GenerateRandomCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func ProcessDepositValidation(itemID int, newStatus string, employeeID int) error {
	tx, err := utils.Conn.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(`UPDATE items SET status = $1 WHERE id = $2`, newStatus, itemID)
	if err != nil {
		return fmt.Errorf("error updating item status in tx: %v", err)
	}

	_, err = tx.Exec(`
		INSERT INTO admin_history (entity_type, entity_id, action, id_employee)
		VALUES ('deposit', $1, 'update', $2)
	`, itemID, employeeID)
	if err != nil {
		return fmt.Errorf("error inserting history in tx: %v", err)
	}

	if newStatus == "approved" {
		var containerID, userID int
		err = tx.QueryRow(`
			SELECT d.id_container, i.id_user 
			FROM deposits d 
			JOIN items i ON d.id_item = i.id 
			WHERE d.id_item = $1
		`, itemID).Scan(&containerID, &userID)
		if err != nil {
			return fmt.Errorf("error fetching deposit details in tx: %v", err)
		}

		_, err = tx.Exec(`UPDATE containers SET status = 'occupied' WHERE id = $1`, containerID)
		if err != nil {
			return fmt.Errorf("error updating container status in tx: %v", err)
		}

		code := GenerateRandomCode()
		path := fmt.Sprintf("/barcodes/user_%d_item_%d.png", userID, itemID) // Chemin fictif du PNG
		validFrom := time.Now()
		validTo := time.Now().Add(7 * 24 * time.Hour)

		_, err = tx.Exec(`
			INSERT INTO barcodes (path, code, valid_from, valid_to, user_type, id_account, id_deposit)
			VALUES ($1, $2, $3, $4, 'user', $5, $6)
		`, path, code, validFrom, validTo, userID, itemID)
		if err != nil {
			return fmt.Errorf("error inserting barcode in tx: %v", err)
		}
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("error committing deposit transaction: %v", err)
	}

	return nil
}

// GetUserTotalDepositsById get deposits of a user
//
// param is_validated indicates whether to get all/pending or refused/validated or reserved or completed deposits
func GetUserTotalDepositsById(id int, is_validated *bool) (int, error) {
	var total int
	query :=
		`select count(*) from deposits d
    join(
        users u join items i on u.id_account = i.id_user
    ) on d.id_item=i.id where u.id_account=$1 and i.is_deleted=false`

	param := ""
	if is_validated != nil {
		if *is_validated {
			param = " and i.status != 'pending' and i.status != 'refused'"
		} else {
			param = " and i.status = 'pending' and i.status = 'refused'"
		}
	}

	row := utils.Conn.QueryRow(query+param+";", id)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetUserTotalDepositsById() failed: %v", err.Error())
	}
	return total, nil
}
