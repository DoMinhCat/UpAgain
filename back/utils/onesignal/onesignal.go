package onesignal

import (
	"backend/config"
	"backend/db"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
)

const (
	ONE_SIGNAL_API_BASE_URL = "https://api.onesignal.com/notifications?c=push"
)

// Send a POST request to OneSignal API to push notification to client
//
// Should log error only and not block the whole operation/request
func SendNotification(payload NotificationRequest) error {
	// set default settings
	payload.AppId = config.OnesignalAppId
	payload.TargetChannel = "push"

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("SendNotification() JSON marshaling failed: %w", err)
	}

	// HTTP request to OneSignal API
	req, err := http.NewRequest("POST", ONE_SIGNAL_API_BASE_URL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("SendNotification() HTTP request failed: %w", err)
	}

	// Set Headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Key " + config.OnesignalAPIKEY)

	// Execute Request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("SendNotification() HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("SendNotification() HTTP request failed: %d", resp.StatusCode)
	}
	
	body, _ := io.ReadAll(resp.Body)

	var result OneSignalResponse
    if err := json.Unmarshal(body, &result); err != nil {
        return fmt.Errorf("SendNotification() failed to parse OneSignal response: %s", string(body))
    }

    if result.Errors != nil {
        return fmt.Errorf("SendNotification() errors returned from OneSignal: %v", result.Errors)
    }

	return nil
}

// IsNotiEnabled checks if a specific notification type is enabled for an account
func IsNotiEnabled(accountId int, notiType string) bool {
	settings, err := db.GetNotiSettingsByAccountId(accountId)
	if err != nil {
		slog.Error("GetNotiSettingsByAccountId() failed in IsNotiEnabled", "accountId", accountId, "error", err)
		return true // fallback to true to not miss important notifications
	}

	for _, setting := range settings {
		if setting.NotiType == notiType {
			return setting.IsEnabled
		}
	}

	return true // default to true if setting is not found
}