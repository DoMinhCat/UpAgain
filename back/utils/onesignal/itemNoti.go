package onesignal

import (
	"backend/db"
	"backend/models"
	"fmt"
	"log/slog"
	"strconv"
)

// HandleItemStatusChangeNoti sends push noti to user/pro about new status change of item and saves a record in DB
func HandleItemStatusChangeNoti(payload HandleItemNotiPayload) error {
	switch payload.Status {
	case "approved", "refused", "reserved", "purchased", "deposited", "retrieved":
	default:
		return fmt.Errorf("invalid status: %s", payload.Status)
	}

	// construct payload
	titlePrefixEn := "An item"
	titlePrefixFr := "Un objet"
	titlePrefixVi := "Một vật phẩm"

	itemDetails, err := db.GetItemDetailsByItemId(payload.ItemId)
	if err != nil {
		slog.Warn("GetItemDetailsByItemId() failed", "called from", "HandleItemStatusChangeNoti", "error", err)
	} else {
		titlePrefixEn = "Item \"" + itemDetails.Title + "\""
		titlePrefixFr = "L'objet \"" + itemDetails.Title + "\""
		titlePrefixVi = "Vật phẩm \"" + itemDetails.Title + "\""
	}

	titleSuffixEn := ""
	titleSuffixFr := ""
	titleSuffixVi := ""
	contentEn := ""
	contentFr := ""
	contentVi := ""

	notiType := "user_validation_status"

	switch payload.Status {
	case "approved":
		titleSuffixEn = " has been approved"
		titleSuffixFr = " a été approuvé"
		titleSuffixVi = " đã được phê duyệt"

		contentEn = "An item you posted has been approved by admin and is now visible to everyone."
		contentFr = "Un objet que vous avez posté a été approuvé par l'administrateur et est maintenant visible par tous."
		contentVi = "Một vật phẩm bạn đăng đã được quản trị viên phê duyệt và hiện đã hiển thị với mọi người."

	case "refused":
		titleSuffixEn = " has been refused"
		titleSuffixFr = " a été refusé"
		titleSuffixVi = " đã bị từ chối"
		contentEn = "Your item has been refused because: " + itemDetails.RefuseReason.String
		contentFr = "Votre objet a été refusé parce que: " + itemDetails.RefuseReason.String
		contentVi = "Vật phẩm của bạn đã bị từ chối vì lý do: " + itemDetails.RefuseReason.String
		notiType = "user_validation_status"

	case "reserved":
		titleSuffixEn = " has been reserved"
		titleSuffixFr = " a été réservé"
		titleSuffixVi = " đã được đặt trước"
		contentEn = "A professional has reserved your item"
		contentFr = "Un professionnel a réservé votre objet"
		contentVi = "Một chuyên gia đã đặt trước vật phẩm của bạn"
		notiType = "user_object_status"

	case "purchased":
		titleSuffixEn = " has been purchased"
		titleSuffixFr = " a été acheté"
		titleSuffixVi = " đã được mua"
		contentEn = "Your item has been purchased by a professional"
		contentFr = "Votre objet a été acheté par un professionnel"
		contentVi = "Vật phẩm của bạn đã được mua bởi một chuyên gia"
		notiType = "user_object_status"

	case "deposited":
		titleSuffixEn = " is ready for retrieval"
		titleSuffixFr = " est prêt à être récupéré."
		titleSuffixVi = " đã sẵn sàng để được lấy."
		contentEn = "You will have 7 days to retrieve the item at the designated container"
		contentFr = "Vous avez 7 jours pour récupérer votre objet au containeur désigné."
		contentVi = "Bạn có 7 ngày để lấy vật phẩm tại thùng chứa được chỉ định."
		notiType = "pro_object_deposited"

	case "retrieved":
		titleSuffixEn = " retrieved"
		titleSuffixFr = " a été récupéré"
		titleSuffixVi = " đã được lấy"
		contentEn = "The item has been retrieved by a professional"
		contentFr = "L'objet a été récupéré par un professionnel"
		contentVi = "Vật phẩm đã được một chuyên gia lấy"
		notiType = "user_object_retrieved"
	}

	// check if notification type is enabled for this account
	if !IsNotiEnabled(payload.AccountId, notiType) {
		return nil
	}

	url := "/marketplace/me/" + strconv.Itoa(payload.ItemId)

	apiPayload := NotificationRequest{
		Headings: NotificationHeading{
			En: titlePrefixEn + titleSuffixEn,
			Fr: titlePrefixFr + titleSuffixFr,
			Vi: titlePrefixVi + titleSuffixVi,
		},
		Contents: NotificationContent{
			En: contentEn,
			Fr: contentFr,
			Vi: contentVi,
		},
		IncludeAliases: NotificationIncludeAliases{
			ExternalIds: []string{strconv.Itoa(payload.AccountId)},
		},
		Url:            url,
	}

	// send via SendNotification
	err = SendNotification(apiPayload)
	if err != nil {
		slog.Warn("Failed to send push notification via OneSignal API", "function", "HandleItemStatusChangeNoti", "error", err.Error())
	}

	// save into DB
	dbPayload := models.NotificationInsert{
		NotificationType: notiType,
		EntityType:       "item",
		EntityId:         payload.ItemId,
		AccountId:        payload.AccountId,
	}
	err = db.InsertNotification(dbPayload)
	if err != nil {
		return fmt.Errorf("failed to insert notification into DB: %w", err)
	}
	return nil
}

// HandleItemNotiPayload is the payload struct for notification updates
type HandleItemNotiPayload struct {
	ItemId    int
	AccountId int
	Status    string
}