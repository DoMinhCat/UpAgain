package cron

import (
	"backend/db"
	"backend/utils"
	"backend/utils/onesignal"
	"log/slog"
	"time"
)

func UpdateExpiredCode() {
	slog.Info("UpdateExpiredCode started", "time", time.Now().Format(time.RFC3339))

	// Retrieve info for notification and container status updating
	query := `
		SELECT bc.id_account, bc.user_type, bc.id_deposit, i.title, d.id_container, bc.id_transaction
		FROM barcodes bc
		JOIN deposits d ON bc.id_deposit = d.id_item
		JOIN items i ON d.id_item = i.id
		WHERE bc.status = 'active' AND bc.valid_to < NOW()
	`
	rows, err := utils.Conn.Query(query)
	if err != nil {
		slog.Error("UpdateExpiredCode failed to query expired barcodes", "error", err)
		return
	}
	defer rows.Close()

	type ExpiredBarcode struct {
		IdAccount     int
		UserType      string
		IdDeposit     int
		ItemTitle     string
		IdContainer   int
		IdTransaction string
	}
	var expiredBarcodes []ExpiredBarcode

	for rows.Next() {
		var eb ExpiredBarcode
		if err := rows.Scan(&eb.IdAccount, &eb.UserType, &eb.IdDeposit, &eb.ItemTitle, &eb.IdContainer, &eb.IdTransaction); err != nil {
			slog.Error("UpdateExpiredCode failed to scan row", "error", err)
			continue
		}
		expiredBarcodes = append(expiredBarcodes, eb)
	}

	// Update barcodes status to expired
	updateQuery := `
		UPDATE barcodes
		SET status = 'expired'
		WHERE valid_to < NOW() AND status = 'active'
	`
	_, err = utils.Conn.Exec(updateQuery)
	if err != nil {
		slog.Error("UpdateExpiredCode error updating status", "error", err)
		return
	}

	// Update container status from waiting or occupied to ready whose barcodes just expired,
	// checking if no other active barcodes exist for that container.
	uniqueContainers := make(map[int]bool)
	for _, eb := range expiredBarcodes {
		uniqueContainers[eb.IdContainer] = true
	}

	for containerId := range uniqueContainers {
		var hasActive bool
		checkQuery := `
			SELECT EXISTS (
				SELECT 1
				FROM barcodes bc
				JOIN deposits d ON bc.id_deposit = d.id_item
				WHERE d.id_container = $1 AND bc.status = 'active'
			)
		`
		err := utils.Conn.QueryRow(checkQuery, containerId).Scan(&hasActive)
		if err != nil {
			slog.Error("Failed to check active barcodes for container", "containerId", containerId, "error", err)
			continue
		}

		if !hasActive {
			status, err := db.GetContainerStatusById(containerId)
			if err != nil {
				slog.Error("Failed to get container status", "containerId", containerId, "error", err)
				continue
			}
			if status == "waiting" || status == "occupied" {
				err = db.UpdateStatusContainer(containerId, "ready")
				if err != nil {
					slog.Error("Failed to update container status to ready", "containerId", containerId, "error", err)
				} else {
					slog.Info("Updated container status to ready after barcode expiry", "containerId", containerId)
				}
			}
		}
	}

	for _, eb := range expiredBarcodes {
		// update transaction status to cancelled for barcodes that just expired
		_, errTx := utils.Conn.Exec("UPDATE transactions SET action = 'cancelled' WHERE id_transaction = $1", eb.IdTransaction)
		if errTx != nil {
			slog.Error("UpdateExpiredCode failed to update transaction status", "id_transaction", eb.IdTransaction, "error", errTx)
		}

		// update item status to approved for barcodes that just expired (item back to market)
		errItem := db.UpdateItemStatusById(eb.IdDeposit, "approved", "")
		if errItem != nil {
			slog.Error("UpdateExpiredCode failed to update item status", "id_item", eb.IdDeposit, "error", errItem)
		}
	}

	// Send notification to pro and user whose code expired
	for _, eb := range expiredBarcodes {
		go func(accountId int, userType string, itemId int, title string) {
			errNoti := onesignal.HandleBarcodeNoti(accountId, userType, itemId, title)
			if errNoti != nil {
				slog.Warn("HandleBarcodeNoti failed", "accountId", accountId, "userType", userType, "itemId", itemId, "error", errNoti)
			}
		}(eb.IdAccount, eb.UserType, eb.IdDeposit, eb.ItemTitle)
	}

	slog.Info("UpdateExpiredCode completed")
}

func UpdateActiveCode() {
	slog.Info("UpdateActiveCode started", "time", time.Now().Format(time.RFC3339))

	query := `
		UPDATE containers c
		SET status = 'waiting'
		WHERE c.status = 'ready'
		  AND EXISTS (
		      SELECT 1 
		      FROM barcodes bc
		      JOIN deposits d ON bc.id_deposit = d.id_item
		      WHERE d.id_container = c.id
		        AND bc.status = 'active'
		        AND bc.valid_from <= NOW()
		        AND bc.valid_to >= NOW()
		  );
	`
	_, err := utils.Conn.Exec(query)
	if err != nil {
		slog.Error("UpdateActiveCode error", "error", err)
		return
	}

	slog.Info("UpdateActiveCode completed")
}
