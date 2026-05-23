package onesignal

import (
	"backend/db"
	"backend/models"
	"fmt"
	"log/slog"
	"strconv"

	"github.com/google/uuid"
)

// helper functions that sends notification to user/pro regarding new status of items (approve, refuse, reserve, purchase, dropped ...)
// these functions will call OneSignal API to send push noti and save a record to our DB to allow showing notification list on frontend

func HandleItemReservedNoti() {

}

func HandleItemPurchasedNoti() {
	
}

// HandleDepositDroppedNoti sends push noti to pro to signifies that item is available in container for retrieval and save a record in DB
func HandleDepositDroppedNoti(payload HandleDepositDroppedNotiPayload) error {
	// construct payload
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
			ExternalIds: []string{strconv.Itoa(payload.ProId)},
		},
		ChromeWebImage: payload.ItemThumbnailImg,
		Url: payload.Url,
	}

	// send via SendNotification
	err := SendNotification(apiPayload)
	if err != nil {
		// failed to send push notification but still attempt to save to DB so that user is notified in their noti list
		slog.Warn("Failed to send push notification via OneSignal API", "function", "HandleDepositDroppedNoti", "error", err.Error())
	}

	// save into DB
	dbPayload := models.NotificationInsert{
		NotificationId: uuid.NewString(),
		NotificationType: "pro_object_deposited",
		EntityType: "item",
		EntityId: payload.ItemId, // TODO: insert real item id
		AccountId: payload.ProId, // there is only 1 buyer
	}
	err = db.InsertNotification(dbPayload)
	if err != nil {
		return fmt.Errorf("failed to insert notification into DB: %w", err)
	}
	return nil
}


// payload structs for functions above
type HandleDepositDroppedNotiPayload struct {
	ItemId int
	ProId int
	ItemThumbnailImg string
	Url string
}