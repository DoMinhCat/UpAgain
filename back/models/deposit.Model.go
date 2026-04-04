package models

type DepositDetails struct {
	ContainerId int `json:"container_id"`
}

type UpdateDepositRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Weight      float64  `json:"weight"`
	State       string   `json:"state"`
	Material    string   `json:"material"`
	Price       float64  `json:"price"`
	Photos      []string `json:"photos"`
}

// for history audition
type DepositFullDetails struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Weight      float64  `json:"weight"`
	State       string   `json:"state"`
	IdUser      int      `json:"id_user"`
	Material    string   `json:"material"`
	Price       float64  `json:"price"`
	Status      string   `json:"status"`
	Photos      []string `json:"photos"`
	IdContainer int      `json:"id_container"`
}