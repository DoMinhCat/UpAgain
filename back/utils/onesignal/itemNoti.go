package onesignal

import (
	"backend/db"
	"backend/models"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
)

// helper functions that sends notification to user/pro regarding new status of items (approve, refuse, reserve, purchase, dropped ...)
// these functions will call OneSignal API to send push noti and save a record to our DB to allow showing notification list on frontend

func HandleItemReservedNoti() {

}

func HandleItemPurchasedNoti() {
	
}

// HandleDepositDroppedNoti sends push noti to pro to signifies that item is available in container for retrieval and save a record in DB
func HandleDepositDroppedNoti() error {
	apiPayload := NotificationRequest{
		Headings: NotificationHeading{
			En: "Item \"title of item\" ready for retrieval",
			Fr: "L'objet prêt à récupérer",
			Vi: "Tieng Viet",
		},
		Contents: NotificationContent{
			En: "Item \"title of item\" ready for retrieval",
			Fr: "L'objet prêt à récupérer",
			Vi: "Tieng Viet",
		},
		IncludeAliases: NotificationIncludeAliases{
			ExternalIds: []string{"id1", "id2"},
		},
		ChromeWebImage: "path to item's thumbnail image (1st img)",
	}
	// TODO: call SendNotification
	err := SendNotification(apiPayload)
	if err != nil {
		slog.Warn("Failed to send push notification via OneSignal API", "function", "HandleDepositDroppedNoti", "error", err.Error())
		// failed to send push notification but still proceed 
		// save to DB so that user is notified in their noti list
	}

	// TODO: save into DB
	dbPayload := models.NotificationInsert{
		NotificationId: uuid.NewString(),
		NotificationType: "pro_object_deposited",
		EntityType: "item",
		EntityId: 9999, // TODO: insert real item id
		AccountId: 9999, // TODO: insert real pro id
	}
	err = db.InsertNotification(dbPayload)
	if err != nil {
		return fmt.Errorf("failed to insert notification into DB: %w", err)
	}
	return nil
}