package onesignal

import (
	"backend/db"
	"backend/models"
	"log/slog"
	"strconv"
)

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

	// 1. Gather external IDs
	var externalIds []string
	for _, attendee := range eventDetails.Attendees {
		externalIds = append(externalIds, strconv.Itoa(attendee.Id))
	}
	for _, organizer := range eventDetails.Organizers {
		externalIds = append(externalIds, strconv.Itoa(organizer.Id))
	}

	// If nobody is registered or assigned, we have no notification to send
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

	// Include ChromeWebImage only if the event has an image
	if len(eventDetails.Images) > 0 && eventDetails.Images[0] != "" {
		apiPayload.ChromeWebImage = eventDetails.Images[0]
	}

	// 4. Send push notification via OneSignal API
	err = SendNotification(apiPayload)
	if err != nil {
		slog.Warn("Failed to send push notification via OneSignal API", "function", "HandleEventUpdateNoti", "error", err.Error())
	}

	// 5. Save notification records in DB (user_event_updated for attendees, emp_event_updated for employees)
	for _, attendee := range eventDetails.Attendees {
		dbPayload := models.NotificationInsert{
			NotificationType: "user_event_updated",
			EntityType:       "event",
			EntityId:         idEvent,
			AccountId:        attendee.Id,
		}
		errDb := db.InsertNotification(dbPayload)
		if errDb != nil {
			slog.Warn("failed to insert user_event_updated notification in DB", "idEvent", idEvent, "userId", attendee.Id, "error", errDb)
		}
	}

	for _, organizer := range eventDetails.Organizers {
		dbPayload := models.NotificationInsert{
			NotificationType: "emp_event_updated",
			EntityType:       "event",
			EntityId:         idEvent,
			AccountId:        organizer.Id,
		}
		errDb := db.InsertNotification(dbPayload)
		if errDb != nil {
			slog.Warn("failed to insert emp_event_updated notification in DB", "idEvent", idEvent, "empId", organizer.Id, "error", errDb)
		}
	}
}