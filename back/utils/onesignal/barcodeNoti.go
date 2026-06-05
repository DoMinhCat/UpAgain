package onesignal

import (
	"backend/db"
	"backend/models"
	"fmt"
	"log/slog"
	"strconv"
)

func HandleBarcodeNoti(accountId int, userType string, itemId int, itemTitle string) error {
	var notiType string
	var headings NotificationHeading
	var contents NotificationContent

	if userType == "user" {
		notiType = "user_code_expiring"
		headings = NotificationHeading{
			En: "Deposit code expired",
			Fr: "Code de dépôt expiré",
			Vi: "Mã gửi hàng hết hạn",
		}
		contents = NotificationContent{
			En: "Your deposit code for the item \"" + itemTitle + "\" has expired.",
			Fr: "Votre code de dépôt pour l'objet \"" + itemTitle + "\" a expiré.",
			Vi: "Mã gửi hàng của bạn cho vật phẩm \"" + itemTitle + "\" đã hết hạn.",
		}
	} else if userType == "pro" {
		notiType = "pro_code_expiring"
		headings = NotificationHeading{
			En: "Retrieval code expired",
			Fr: "Code de retrait expiré",
			Vi: "Mã nhận hàng hết hạn",
		}
		contents = NotificationContent{
			En: "Your retrieval code for the item \"" + itemTitle + "\" has expired.",
			Fr: "Votre code de retrait pour l'objet \"" + itemTitle + "\" a expiré.",
			Vi: "Mã nhận hàng của bạn cho vật phẩm \"" + itemTitle + "\" đã hết hạn.",
		}
	} else {
		return fmt.Errorf("invalid user_type: %s", userType)
	}

	if !IsNotiEnabled(accountId, notiType) {
		return nil
	}

	url := "/marketplace/me/" + strconv.Itoa(itemId)

	apiPayload := NotificationRequest{
		Headings: headings,
		Contents: contents,
		IncludeAliases: NotificationIncludeAliases{
			ExternalIds: []string{strconv.Itoa(accountId)},
		},
		Url: url,
	}

	err := SendNotification(apiPayload)
	if err != nil {
		slog.Warn("Failed to send push notification via OneSignal API", "function", "HandleBarcodeNoti", "error", err.Error())
	}

	dbPayload := models.NotificationInsert{
		NotificationType: notiType,
		EntityType:       "item",
		EntityId:         itemId,
		AccountId:        accountId,
	}
	err = db.InsertNotification(dbPayload)
	if err != nil {
		return fmt.Errorf("failed to insert notification into DB: %w", err)
	}

	return nil
}