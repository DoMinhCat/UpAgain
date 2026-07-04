package cron

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"backend/utils/onesignal"
	"log/slog"
	"time"
)

func UpdateExpiredReservation() {
	slog.Info("UpdateExpiredReservation started", "time", time.Now().Format(time.RFC3339))

	// Retrieve necessary fields for notification via onesignal of expired reservations
	query := `
	SELECT t.id_transaction, t.id_item, t.id_pro, i.title
	FROM (
		SELECT DISTINCT ON (id_transaction) id_transaction, id_item, id_pro, action, reservation_expiry
		FROM transactions
		ORDER BY id_transaction, created_at DESC
	) t
	JOIN items i ON t.id_item = i.id
	WHERE t.action = 'reserved'
		AND t.reservation_expiry < NOW();
	`
	rows, err := utils.Conn.Query(query)
	if err != nil {
		slog.Error("UpdateExpiredReservation query failed", "error", err)
		return
	}
	defer rows.Close()

	type ExpiredReservation struct {
		IdTransaction string
		IdItem        int
		IdPro         int
		ItemTitle     string
	}
	var expiredReservations []ExpiredReservation

	for rows.Next() {
		var er ExpiredReservation
		if err := rows.Scan(&er.IdTransaction, &er.IdItem, &er.IdPro, &er.ItemTitle); err != nil {
			slog.Error("UpdateExpiredReservation row scan failed", "error", err)
			continue
		}
		expiredReservations = append(expiredReservations, er)
	}

	for _, er := range expiredReservations {
		_, err = db.InsertTransaction(models.TransactionInsert{
			IdTransaction: er.IdTransaction,
			Action:        "expired",
			IdItem:        er.IdItem,
			IdPro:         er.IdPro,
		})
		if err != nil {
			slog.Error("Failed to insert expired transaction", "id_transaction", er.IdTransaction, "error", err)
			continue
		}

		// Notify pro that reservation expired
		go func(itemId int, proId int, title string) {
			errNoti := onesignal.HandleExpiredReservationNoti(itemId, proId, title)
			if errNoti != nil {
				slog.Warn("HandleExpiredReservationNoti failed", "itemId", itemId, "proId", proId, "error", errNoti)
			}
		}(er.IdItem, er.IdPro, er.ItemTitle)
	}

	slog.Info("UpdateExpiredReservation completed")
}
