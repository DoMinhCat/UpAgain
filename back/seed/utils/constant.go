package utils

var TABLES = []string{
	"finance_settings",
	"accounts",
	"noti_settings",
	"users",
	"employees",
	"pros",
	"events",
	"event_registrations",
	"event_employee",
	"admin_history",
	"posts",
	"comments",
	"saved_posts",
	"viewed_posts",
	"liked_posts",
	"liked_comments",
	"ads",
	"items",
	"project_steps",
	"photos",
	"listings",
	"containers",
	"deposits",
	"barcodes",
	"subscriptions",
	"transactions",
	"step_items",
	"notifications",
	"pro_alert_materials",
}

// Event Categorization and Constraints
const (
	ParisMinLat = 48.8156
	ParisMaxLat = 48.9021
	ParisMinLng = 2.2241
	ParisMaxLng = 2.4699
)

var EVENT_CATEGORIES = []string{"workshop", "conference", "meetups", "exposition", "other"}

// Post Categorization and Content
const (
	CategoryProject = "project"
	CategoryTips    = "tips"
	MockHTMLContent = `<article><h2>%s</h2><p>%s</p><section><p>%s</p></section></article>`
)

var NON_PROJECT_POST_CATEGORIES = []string{"tutorial", "tips", "news", "case_study", "other"}

// Material Enum Values
var MATERIALS = []string{"wood", "metal", "textile", "glass", "plastic", "mixed", "other"}