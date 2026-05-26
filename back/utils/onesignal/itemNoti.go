package onesignal

import (
	"backend/db"
	"backend/models"
	"fmt"
	"log/slog"
	"strconv"
)

// helper functions that sends notification to user/pro regarding new status of items (approve, refuse, reserve, purchase, dropped ...)
// these functions will call OneSignal API to send push noti and save a record to our DB to allow showing notification list on frontend

func HandleItemReservedNoti() {

}

func HandleItemPurchasedNoti() {
	
}

// HandleDepositDroppedNoti sends push noti to pro to signifies that item is available in container for retrieval and save a record in DB
func HandleDepositDroppedNoti(payload HandleDepositStatusNotiPayload) error {
	itemImgs, err := db.GetPhotosPathsByObjectId(payload.ItemId, "item")
	if err != nil {
		// no early return, if no image then no problem
		slog.Warn("GetPhotosPathsByObjectId() failed", "called from", "HandleDepositDroppedNoti", "error", err)
		// fallback to avoid null pointer
		itemImgs = []string{""}
	} else if len(itemImgs) == 0 {
		itemImgs = []string{""}
	}
	payload.ItemThumbnailImg = itemImgs[0]

	// construct payload
	titlePrefixEn := "An item"
	titlePrefixFr := "Un objet"
	titlePrefixVi := "Một vật phẩm"
	itemDetails, err := db.GetItemDetailsByItemId(payload.ItemId)
	if err != nil {
		slog.Warn("GetItemDetailsByItemId() failed", "called from", "HandleDepositDroppedNoti", "error", err)
	} else {
		titlePrefixEn = "Item \"" + itemDetails.Title + "\""
		titlePrefixFr = "L'objet \"" + itemDetails.Title + "\""
		titlePrefixVi = "Vật phẩm \"" + itemDetails.Title + "\""
	}
	apiPayload := NotificationRequest{
		Headings: NotificationHeading{
			En: titlePrefixEn + " is ready for retrieval",
			Fr: titlePrefixFr + " est prêt à être récupéré.",
			Vi: titlePrefixVi + " đã sẵn sàng để được lấy.",
		},
		Contents: NotificationContent{
			En: "You will have 7 days to retrieve the item at the designated container",
			Fr: "Vous avez 7 jours pour récupérer votre objet au containeur désigné.",
			Vi: "Bạn có 7 ngày để lấy vật phẩm tại thùng chứa được chỉ định.",
		},
		IncludeAliases: NotificationIncludeAliases{
			ExternalIds: []string{strconv.Itoa(payload.AccountId)},
		},
		ChromeWebImage: payload.ItemThumbnailImg,
		Url: payload.Url,
	}

	// send via SendNotification
	err = SendNotification(apiPayload)
	if err != nil {
		// failed to send push notification but still attempt to save to DB so that user is notified in their noti list
		slog.Warn("Failed to send push notification via OneSignal API", "function", "HandleDepositDroppedNoti", "error", err.Error())
	}

	// save into DB
	dbPayload := models.NotificationInsert{
		NotificationType: "pro_object_deposited",
		EntityType: "item",
		EntityId: payload.ItemId,
		AccountId: payload.AccountId,
	}
	err = db.InsertNotification(dbPayload)
	if err != nil {
		return fmt.Errorf("failed to insert notification into DB: %w", err)
	}
	return nil
}

// HandleDepositRetrievedNoti sends push noti to user to signifies that item has been retrieved by pro and save a record in DB
func HandleDepositRetrievedNoti(payload HandleDepositStatusNotiPayload) error {
	itemImgs, err := db.GetPhotosPathsByObjectId(payload.ItemId, "item")
	if err != nil {
		// no early return, if no image then no problem
		slog.Warn("GetPhotosPathsByObjectId() failed", "called from", "HandleDepositRetrievedNoti", "error", err)
		// fallback to avoid null pointer
		itemImgs = []string{ ""}
	} else if len(itemImgs) == 0 {
		itemImgs = []string{ ""}
	}
	payload.ItemThumbnailImg = itemImgs[0]

	// construct payload
	titlePrefixEn := "An item"
	titlePrefixFr := "Un objet"
	titlePrefixVi := "Một vật phẩm"
	itemDetails, err := db.GetItemDetailsByItemId(payload.ItemId)
	if err != nil {
		slog.Warn("GetItemDetailsByItemId() failed", "called from", "HandleDepositRetrievedNoti", "error", err)
	} else {
		titlePrefixEn = "Item \"" + itemDetails.Title + "\""
		titlePrefixFr = "L'objet \"" + itemDetails.Title + "\""
		titlePrefixVi = "Vật phẩm \"" + itemDetails.Title + "\""
	}
	apiPayload := NotificationRequest{
		Headings: NotificationHeading{
			En: titlePrefixEn + " retrieved",
			Fr: titlePrefixFr + " a été récupéré",
			Vi: titlePrefixVi + " đã được lấy",
		},
		Contents: NotificationContent{
			En: "The item has been retrieved by a professional",
			Fr: "L'objet a été récupéré par un professionnel",
			Vi: "Vật phẩm đã được một chuyên gia lấy",
		},
		IncludeAliases: NotificationIncludeAliases{
			ExternalIds: []string{strconv.Itoa(payload.AccountId)},
		},
		ChromeWebImage: payload.ItemThumbnailImg,
		Url: payload.Url,
	}

	// send via SendNotification
	err = SendNotification(apiPayload)
	if err != nil {
		// failed to send push notification but still attempt to save to DB so that user is notified in their noti list
		slog.Warn("Failed to send push notification via OneSignal API", "function", "HandleDepositRetrievedNoti", "error", err.Error())
	}

	// save into DB
	dbPayload := models.NotificationInsert{
		NotificationType: "user_object_retrieved",
		EntityType: "item",
		EntityId: payload.ItemId,
		AccountId: payload.AccountId,
	}
	err = db.InsertNotification(dbPayload)
	if err != nil {
		return fmt.Errorf("failed to insert notification into DB: %w", err)
	}
	return nil
}

// payload structs for functions above
type HandleDepositStatusNotiPayload struct {
	ItemId int
	AccountId int
	ItemThumbnailImg string
	Url string
}