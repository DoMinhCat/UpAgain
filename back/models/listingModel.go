package models

type Listing struct {
	Street     string `json:"street"`
	City       string `json:"city"`
	PostalCode string `json:"postal_code"`
}

type ListingFullDetails struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Weight      float64  `json:"weight"`
	State       string   `json:"state"`
	IdUser      int      `json:"id_user"`
	Material    string   `json:"material"`
	Price       float64  `json:"price"`
	Status      string   `json:"status"`
	Photos      []string `json:"photos"`
	Street      string   `json:"street"`
	City        string   `json:"city"`
	PostalCode  string   `json:"postal_code"`
}

type UpdateListingRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Weight      float64  `json:"weight"`
	State       string   `json:"state"`
	Material    string   `json:"material"`
	Price       float64  `json:"price"`
	Street      string   `json:"street"`
	City        string   `json:"city"`
	PostalCode  string   `json:"postal_code"`
	Photos      []string `json:"photos"`
	Lat         *float64 `json:"lat"`
	Lng         *float64 `json:"lng"`
}

type CreateListingRequest struct {
	IdItem     int     `json:"id_item"`
	Street     string  `json:"street"`
	CityName   string  `json:"city_name"`
	PostalCode string  `json:"postal_code"`
	Lat        float64 `json:"lat"`
	Lng        float64 `json:"lng"`
}
