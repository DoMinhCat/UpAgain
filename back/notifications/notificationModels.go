package notifications

type NotificationContent struct {
	En string `json:"en"`
	Fr string `json:"fr"`
	Vi string `json:"vi"`
}

type NotificationIncludeAliases struct {
	ExternalIds []string `json:"external_id"`
}

type NotificationRequest struct {
	AppId          string                     `json:"app_id"`
	Contents       NotificationContent        `json:"contents"`
	IncludeAliases NotificationIncludeAliases `json:"include_aliases"`
	ChromeWebImage string                     `json:"chrome_web_image"`
	ChromeWebIcon  string                     `json:"chrome_web_icon"`
	ChromeWebBadge string                     `json:"chrome_web_badge"`
	Url            string                     `json:"url"`
}