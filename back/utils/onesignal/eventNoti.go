package onesignal

import (
	"backend/db"
	"backend/models"
	"log/slog"
	"strconv"
)

// HandleEventAssignedNoti sends notification to employees when they are assigned to an event
func HandleEventAssignedNoti(idEvent int, employeeIds []int) {
	if len(employeeIds) == 0 {
		return
	}

	eventDetails, err := db.GetEventDetailsById(idEvent)
	if err != nil {
		slog.Error("GetEventDetailsById() failed in HandleEventAssignedNoti", "idEvent", idEvent, "error", err)
		return
	}

	var externalIds []string
	var enabledEmployeeIds []int

	for _, empId := range employeeIds {
		if IsNotiEnabled(empId, "emp_event_assigned") {
			externalIds = append(externalIds, strconv.Itoa(empId))
			enabledEmployeeIds = append(enabledEmployeeIds, empId)
		}
	}

	if len(externalIds) == 0 {
		return
	}

	titleEn := "You have been assigned to event \"" + eventDetails.Title + "\""
	titleFr := "Vous avez été assigné à l'événement \"" + eventDetails.Title + "\""
	titleVi := "Bạn đã được phân công vào sự kiện \"" + eventDetails.Title + "\""

	contentEn := "You have been assigned to coordinate this event."
	contentFr := "Vous avez été assigné pour coordonner cet événement."
	contentVi := "Bạn đã được phân công điều phối sự kiện này."

	categoryUrl := eventDetails.Category
	if categoryUrl == "meetups" {
		categoryUrl = "meetups"
	} else if categoryUrl != "" {
		categoryUrl = categoryUrl + "s"
	} else {
		categoryUrl = "others"
	}
	url := "/events/" + categoryUrl + "/" + strconv.Itoa(idEvent)

	apiPayload := NotificationRequest{
		Headings: NotificationHeading{
			En: titleEn,
			Fr: titleFr,
			Vi: titleVi,
		},
		Contents: NotificationContent{
			En: contentEn,
			Fr: contentFr,
			Vi: contentVi,
		},
		IncludeAliases: NotificationIncludeAliases{
			ExternalIds: externalIds,
		},
		Url: url,
	}

	err = SendNotification(apiPayload)
	if err != nil {
		slog.Warn("Failed to send push notification via OneSignal API", "function", "HandleEventAssignedNoti", "error", err.Error())
	}

	for _, empId := range enabledEmployeeIds {
		dbPayload := models.NotificationInsert{
			NotificationType: "emp_event_assigned",
			EntityType:       "event",
			EntityId:         strconv.Itoa(idEvent),
			AccountId:        empId,
		}
		errDb := db.InsertNotification(dbPayload)
		if errDb != nil {
			slog.Warn("failed to insert emp_event_assigned notification in DB", "idEvent", idEvent, "empId", empId, "error", errDb)
		}
	}
}

// HandleEventUpdateNoti sends notification to participants and assigned employees when event is updated or cancelled
func HandleEventUpdateNoti(idEvent int, action string) {
	if action != "updated" && action != "cancelled" {
		slog.Error("Invalid action for event notification", "action", action)
		return
	}

	eventDetails, err := db.GetEventDetailsById(idEvent)
	if err != nil {
		slog.Error("GetEventDetailsById() failed in HandleEventUpdateNoti", "idEvent", idEvent, "error", err)
		return
	}

	// 1. Gather external IDs for enabled recipients
	var externalIds []string
	var enabledAttendees []models.Account
	var enabledOrganizers []models.Account

	for _, attendee := range eventDetails.Attendees {
		if IsNotiEnabled(attendee.Id, "user_event_updated") {
			externalIds = append(externalIds, strconv.Itoa(attendee.Id))
			enabledAttendees = append(enabledAttendees, attendee)
		}
	}
	for _, organizer := range eventDetails.Organizers {
		if IsNotiEnabled(organizer.Id, "emp_event_updated") {
			externalIds = append(externalIds, strconv.Itoa(organizer.Id))
			enabledOrganizers = append(enabledOrganizers, organizer)
		}
	}

	// If nobody is registered or assigned (with settings enabled), we have no notification to send
	if len(externalIds) == 0 {
		return
	}

	// 2. Localized content based on action
	var titleEn, titleFr, titleVi string
	var contentEn, contentFr, contentVi string

	switch action {
	case "updated":
		titleEn = "Event \"" + eventDetails.Title + "\" has been updated"
		titleFr = "L'événement \"" + eventDetails.Title + "\" a été mis à jour"
		titleVi = "Sự kiện \"" + eventDetails.Title + "\" đã được cập nhật"

		contentEn = "An event you are participating in or assigned to has been updated."
		contentFr = "Un événement auquel vous participez ou êtes assigné a été mis à jour."
		contentVi = "Một sự kiện bạn đang tham gia hoặc được phân công đã được cập nhật."

	case "cancelled":
		titleEn = "Event \"" + eventDetails.Title + "\" has been cancelled"
		titleFr = "L'événement \"" + eventDetails.Title + "\" a été annulé"
		titleVi = "Sự kiện \"" + eventDetails.Title + "\" đã bị hủy"

		contentEn = "An event you are participating in or assigned to has been cancelled."
		contentFr = "Un événement auquel vous participez ou êtes assigné a été annulé."
		contentVi = "Một sự kiện bạn đang tham gia hoặc được phân công đã bị hủy."

	case "refused":
		titleEn = "Event \"" + eventDetails.Title + "\" has been refused"
		titleFr = "L'événement \"" + eventDetails.Title + "\" a été refusé"
		titleVi = "Sự kiện \"" + eventDetails.Title + "\" đã bị từ chối"

		contentEn = "An event you are participating in or assigned to has been refused."
		contentFr = "Un événement auquel vous participez ou êtes assigné a été refusé."
		contentVi = "Một sự kiện bạn đang tham gia hoặc được phân công đã bị từ chối."
	}

	categoryUrl := eventDetails.Category
	if categoryUrl == "meetups" {
		categoryUrl = "meetups"
	} else if categoryUrl != "" {
		categoryUrl = categoryUrl + "s"
	} else {
		categoryUrl = "others"
	}
	url := "/events/" + categoryUrl + "/" + strconv.Itoa(idEvent)

	// 3. Construct API request
	apiPayload := NotificationRequest{
		Headings: NotificationHeading{
			En: titleEn,
			Fr: titleFr,
			Vi: titleVi,
		},
		Contents: NotificationContent{
			En: contentEn,
			Fr: contentFr,
			Vi: contentVi,
		},
		IncludeAliases: NotificationIncludeAliases{
			ExternalIds: externalIds,
		},
		Url: url,
	}

	// 4. Send push notification via OneSignal API
	err = SendNotification(apiPayload)
	if err != nil {
		slog.Warn("Failed to send push notification via OneSignal API", "function", "HandleEventUpdateNoti", "error", err.Error())
	}

	// 5. Save notification records in DB (user_event_updated for attendees, emp_event_updated for employees)
	for _, attendee := range enabledAttendees {
		dbPayload := models.NotificationInsert{
			NotificationType: "user_event_updated",
			EntityType:       "event",
			EntityId:         strconv.Itoa(idEvent),
			AccountId:        attendee.Id,
		}
		errDb := db.InsertNotification(dbPayload)
		if errDb != nil {
			slog.Warn("failed to insert user_event_updated notification in DB", "idEvent", idEvent, "userId", attendee.Id, "error", errDb)
		}
	}

	for _, organizer := range enabledOrganizers {
		dbPayload := models.NotificationInsert{
			NotificationType: "emp_event_updated",
			EntityType:       "event",
			EntityId:         strconv.Itoa(idEvent),
			AccountId:        organizer.Id,
		}
		errDb := db.InsertNotification(dbPayload)
		if errDb != nil {
			slog.Warn("failed to insert emp_event_updated notification in DB", "idEvent", idEvent, "empId", organizer.Id, "error", errDb)
		}
	}
}
