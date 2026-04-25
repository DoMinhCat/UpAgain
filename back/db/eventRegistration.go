package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
)

// get total events registered by user/pro that are not cancelled
func GetTotalActiveEventsRegisteredById(id_account int) (int, error) {
	var total int
	query := `
		select count(*) from event_registrations er
		join events e on e.id=er.id_event
		where er.status='registered' and er.id_account=$1 and (e.start_at is null or e.start_at > now());
	`
	row := utils.Conn.QueryRow(query, id_account)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalActiveEventsRegisteredById() failed: %v", err.Error())
	}
	return total, nil
}

func CheckEventHasParticipant(id_event int) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS(SELECT 1 FROM event_registrations WHERE id_event=$1 AND status='registered');
	`
	err := utils.Conn.QueryRow(query, id_event).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("CheckEventHasParticipant() failed: %v", err.Error())
	}
	return exists, nil
}

func GetAttendeesByEventId(id_event int) ([]models.Account, error) {
	var attendees []models.Account
	query := `
		SELECT a.id, a.username, a.avatar
		FROM event_registrations er
		JOIN accounts a ON er.id_account=a.id
		WHERE er.id_event=$1 and (er.status='registered' OR er.status='attended');
	`
	rows, err := utils.Conn.Query(query, id_event)
	if err != nil {
		if err == sql.ErrNoRows {
			return []models.Account{}, nil
		}
		return nil, fmt.Errorf("GetAttendeesByEventId() failed: %v", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var attendee models.Account
		err := rows.Scan(&attendee.Id, &attendee.Username, &attendee.Avatar)
		if err != nil {
			return nil, fmt.Errorf("GetAttendeesByEventId() failed: %v", err.Error())
		}
		attendees = append(attendees, attendee)
	}
	return attendees, nil
}