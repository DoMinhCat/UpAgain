package onesignal

import (
	"backend/db"
	"backend/models"
	"fmt"
	"log/slog"
	"strconv"
)

// Handling sending notification related to premium subscription

func HandleExpiredSubscriptionNoti(accountId int) error {
	notiType := "pro_subscription_end"

	if !IsNotiEnabled(accountId, notiType) {
		return nil
	}

	headings := NotificationHeading{
		En: "Premium subscription expired",
		Fr: "Abonnement Premium expiré",
		Vi: "Gói Premium đã hết hạn",
	}

	contents := NotificationContent{
		En: "Your premium subscription has expired. Renew now to keep enjoying premium benefits!",
		Fr: "Votre abonnement premium a expiré. Renouvelez-le maintenant pour continuer à profiter des avantages premium !",
		Vi: "Gói thành viên Premium của bạn đã hết hạn. Hãy gia hạn ngay để tiếp tục tận hưởng các quyền lợi premium!",
	}

	url := "/profile"

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
		slog.Warn("Failed to send push notification via OneSignal API", "function", "HandleExpiredSubscriptionNoti", "error", err.Error())
	}

	dbPayload := models.NotificationInsert{
		NotificationType: notiType,
		EntityType:       "profile",
		EntityId:         accountId,
		AccountId:        accountId,
	}
	err = db.InsertNotification(dbPayload)
	if err != nil {
		return fmt.Errorf("failed to insert notification into DB: %w", err)
	}

	return nil
}