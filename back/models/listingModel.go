package models

type Listing struct {
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
	City        string   `json:"city"`
	PostalCode  string   `json:"postal_code"`
	Photos      []string `json:"photos"`
}
