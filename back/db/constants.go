package db

var MATERIALS = []string{"wood", "metal", "textile", "glass", "plastic", "mixed", "other"}
var STATES = []string{"new", "very_good", "good", "need_repair"}
var ITEM_STATUS = []string{"pending", "approved", "refused", "completed"}
var EVENT_STATUS = []string{"pending", "approved", "refused", "cancelled"}
var CODE_STATUS = []string{"active", "expired", "used"}
var CONTAINER_STATUS = []string{"ready", "waiting", "occupied", "maintenance"}

var NOTIFICATION_TYPES = []string{
	"user_object_status",     // TODO: purchase or reserved
	"user_validation_status", // TODO: item rejected or approved
	"user_object_retrieved",  // done, not tested
	"user_event_updated",
	"pro_material_available",
	"pro_object_deposited", // done ok
	"pro_subscription_end",
	"emp_event_updated",
	"emp_event_assigned",
}
var NOTIFICATION_ENTITY_TYPES = []string{
	"profile", "event", "item",
}
