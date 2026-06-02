package onesignal

import (
	"backend/db"
	"backend/models"
	"fmt"
	"log/slog"
	"strconv"
)

func HandleSmartAlertsNoti(itemId int) error {
	itemDetails, err := db.GetItemDetailsByItemId(itemId)
	if err != nil {
		return fmt.Errorf("HandleSmartAlertsNoti failed to get item details: %w", err)
	}

	proIds, err := db.GetMatchingAlertProIds(itemId)
	if err != nil {
		return fmt.Errorf("HandleSmartAlertsNoti failed to get matching pros: %w", err)
	}

	for _, proId := range proIds {
		titleEn := "New item available: " + itemDetails.Title
		titleFr := "Nouvel objet disponible: " + itemDetails.Title
		titleVi := "Vật phẩm mới có sẵn: " + itemDetails.Title

		contentEn := "An item matching your alert has been posted"
		contentFr := "Un objet correspondant à votre alerte a été posté"
		contentVi := "Một vật phẩm phù hợp với cảnh báo của bạn đã được đăng"

		url := "/marketplace/" + strconv.Itoa(itemId)

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
				ExternalIds: []string{strconv.Itoa(proId)},
			},
			Url: url,
		}

		err = SendNotification(apiPayload)
		if err != nil {
			slog.Warn("Failed to send push notification via OneSignal API", "function", "HandleSmartAlertsNoti", "error", err.Error())
		}

		dbPayload := models.NotificationInsert{
			NotificationType: "pro_material_available",
			EntityType:       "item",
			EntityId:         itemId,
			AccountId:        proId,
		}
		err = db.InsertNotification(dbPayload)
		if err != nil {
			slog.Warn("failed to insert pro_material_available notification in DB", "idItem", itemId, "accountId", proId, "error", err)
		}
	}
	return nil
}