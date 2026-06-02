package onesignal

// JSON structures to send to OneSignal API

type NotificationRequest struct {
	AppId          string                     `json:"app_id"`          // env variable
	TargetChannel  string                     `json:"target_channel"`  // push
	Headings       NotificationHeading        `json:"headings"`        // title of noti
	Contents       NotificationContent        `json:"contents"`        // message of the noti
	IncludeAliases NotificationIncludeAliases `json:"include_aliases"` // use external id (account id) to send notification to specific account(s)
	Url            string                     `json:"url"`             // redirect user to this URL if click on noti
}

type NotificationContent struct {
	En string `json:"en"`
	Fr string `json:"fr"`
	Vi string `json:"vi"`
}

type NotificationHeading struct {
	En string `json:"en"`
	Fr string `json:"fr"`
	Vi string `json:"vi"`
}

type NotificationIncludeAliases struct {
	ExternalIds []string `json:"external_id"`
}

// response of OneSignal API
type OneSignalResponse struct {
	ID         string      `json:"id"`
	ExternalID string      `json:"external_id"`
	Errors     interface{} `json:"errors"`
}
