package insert

import (
	"database/sql"
	"fmt"
	"time"

	auth "backend/utils/auth"

	"github.com/brianvoe/gofakeit/v7"
)

type AccountSeed struct {
	Email    string
	Username string
	Password string
	Role     string
	IsBanned bool
	Avatar   string
}

func InsertAccounts(tx *sql.Tx) (userIDs []int, proIDs []int, employeeIDs []int, err error) {
	// Simple mock helper to generate public avatar URL links
	getAvatarURL := func() string {
		return fmt.Sprintf("https://api.dicebear.com/7.x/adventurer/svg?seed=%s", gofakeit.UUID())
	}

	hashedPassword := auth.HashPassword("Dummy!123456")

	accounts := []AccountSeed{
		{Email: "admin@upagain.com", Username: "admin", Password: hashedPassword, Role: "employee", Avatar: getAvatarURL()},
		{Email: "employee@upagain.com", Username: "employee", Password: hashedPassword, Role: "employee", Avatar: getAvatarURL()},
		{Email: "user@upagain.com", Username: "user", Password: hashedPassword, Role: "user", Avatar: getAvatarURL()},
		{Email: "pro@upagain.com", Username: "pro", Password: hashedPassword, Role: "pro", Avatar: getAvatarURL()},
	}

	// 150 users
	for i := 0; i < 150; i++ {
		accounts = append(accounts, AccountSeed{
			Email:    gofakeit.Email(),
			Username: gofakeit.Username(),
			Password: hashedPassword,
			Role:     "user",
			Avatar:   getAvatarURL(),
		})
	}
	// 70 pros
	for i := 0; i < 70; i++ {
		accounts = append(accounts, AccountSeed{
			Email:    gofakeit.Email(),
			Username: gofakeit.Username(),
			Password: hashedPassword,
			Role:     "pro",
			Avatar:   getAvatarURL(),
		})
	}
	// 20 employees
	for i := 0; i < 20; i++ {
		accounts = append(accounts, AccountSeed{
			Email:    gofakeit.Email(),
			Username: gofakeit.Username(),
			Password: hashedPassword,
			Role:     "employee",
			Avatar:   getAvatarURL(),
		})
	}

	query := `
        INSERT INTO accounts (email, username, password, role, is_banned, avatar, email_verified_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `

	stmt, err := tx.Prepare(query)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to prepare insert accounts statement: %w", err)
	}
	defer stmt.Close()

	now := time.Now()

	for _, acc := range accounts {
		var avatar *string
		if acc.Avatar != "" {
			avatar = &acc.Avatar
		}
		var insertedID int
		err = stmt.QueryRow(acc.Email, acc.Username, acc.Password, acc.Role, acc.IsBanned, avatar, now).Scan(&insertedID)
		if err != nil {
			return nil, nil, nil, fmt.Errorf("failed to insert account %s: %w", acc.Email, err)
		}

		switch acc.Role {
		case "user":
			userIDs = append(userIDs, insertedID)
		case "pro":
			proIDs = append(proIDs, insertedID)
		case "employee":
			employeeIDs = append(employeeIDs, insertedID)
		}
	}

	fmt.Printf("Successfully seeded %d accounts (Users: %d, Pros: %d, Employees: %d).\n",
		len(accounts), len(userIDs), len(proIDs), len(employeeIDs))
	return userIDs, proIDs, employeeIDs, nil
}

