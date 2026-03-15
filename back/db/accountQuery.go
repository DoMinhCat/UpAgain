package db

import (
	"backend/models"
	"backend/utils"
	authUtils "backend/utils/auth"
	"database/sql"
	"fmt"
	"time"
)

// ALL QUERY TO TABLE 'ACCOUNTS'
func GetAccountCredsByEmail(email string) (*models.AccountCreds, error) {
	var user models.AccountCreds

	row := utils.Conn.QueryRow("SELECT id, email, password, role FROM accounts WHERE email=$1", email)
	err := row.Scan(&user.Id, &user.Email, &user.Password, &user.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Return nothing found without an error
		}
		return nil, fmt.Errorf("error getting user by email from DB: %v", err.Error())
	}

	return &user, nil
}

func CheckUsernameExists(username string) (bool, error) {
	var exists bool

	err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM accounts WHERE username=$1)", username).Scan(&exists)
	return exists, err
}

func CheckEmailExists(email string) (bool, error) {
	var exists bool

	err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM accounts WHERE email=$1)", email).Scan(&exists)
	return exists, err
}

func CreateAccount(newAccount models.CreateAccountRequest) error {
	//hash password
	isAdmin := false
	hashedPassword := authUtils.HashPassword(newAccount.Password)

	if newAccount.Role == "admin" || newAccount.Role == "employee" {
		newAccount.Phone = ""
	}
	if newAccount.Role == "admin" {
		isAdmin = true
		newAccount.Role = "employee"
	}

	// insert into 'accounts'
	var insertedId int
	err := utils.Conn.QueryRow(
		"INSERT INTO accounts(email, username, password, role) VALUES ($1,$2,$3,$4) RETURNING id;",
		newAccount.Email, newAccount.Username, hashedPassword, newAccount.Role).Scan(&insertedId)
	if err != nil {
		return fmt.Errorf("error inserting new account into database: %v", err.Error())
	}

	// insert into 'users/pros/employees'
	switch newAccount.Role {
	case "user":
		err = CreateUser(newAccount, insertedId)
		if err != nil {
			return err
		}

	case "pro":
		err = CreatePro(newAccount, insertedId)
		if err != nil {
			return err
		}

	case "employee":
		err = CreateEmployee(insertedId, isAdmin)
		if err != nil {
			return err
		}

	default:
		return fmt.Errorf("invalid role '%s'.", newAccount.Role)
	}

	return nil
}

// DO NOT use for endpoints, only for api internal use, all records should be soft deleted
func DeleteAccount(id int) error {

	_, err := utils.Conn.Exec("DELETE FROM accounts WHERE id=$1;", id)
	if err != nil {
		return fmt.Errorf("DeleteAccount() failed: %v", err.Error())
	}
	return nil
}

type AccountFilters struct {
	Search string
	Sort   string
	Role   string
	Status string
}

// isDeleted: get soft deleted or existing account
//
// page: get page number for pagination, if page = -1 then get ALL
//
// limit: number of records for each page, if limit = -1 then get ALL
func GetAllAccounts(isDeleted bool, page int, limit int, filters AccountFilters) ([]models.Account, int, error) {
	accounts := make([]models.Account, 0)
	var params []interface{}
	var countParams []interface{}
	paramIndex := 1

	whereClause := "WHERE deleted_at IS NULL"
	if isDeleted {
		whereClause = "WHERE deleted_at IS NOT NULL"
	}

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(" AND (username ILIKE $%d OR email ILIKE $%d OR CAST(id AS TEXT) ILIKE $%d)", paramIndex, paramIndex, paramIndex)
		params = append(params, searchParam)
		countParams = append(countParams, searchParam)
		paramIndex++
	}

	if filters.Role != "" {
		if filters.Role == "admin" {
			whereClause += " AND role = 'employee' AND EXISTS (SELECT 1 FROM employees WHERE employees.id_account = accounts.id AND employees.is_admin = true)"
		} else if filters.Role == "employee" {
			whereClause += " AND role = 'employee' AND NOT EXISTS (SELECT 1 FROM employees WHERE employees.id_account = accounts.id AND employees.is_admin = true)"
		} else {
			whereClause += fmt.Sprintf(" AND role = $%d", paramIndex)
			params = append(params, filters.Role)
			countParams = append(countParams, filters.Role)
			paramIndex++
		}
	}

	if filters.Status == "active" {
		whereClause += " AND is_banned = false"
	} else if filters.Status == "banned" {
		whereClause += " AND is_banned = true"
	}

	var totalRecords int
	countQuery := "SELECT COUNT(*) FROM accounts " + whereClause
	err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&totalRecords)
	if err != nil {
		return nil, 0, fmt.Errorf("GetAllAccounts() count failed: %v", err)
	}

	orderBy := "ORDER BY id ASC" // Default sorting
	switch filters.Sort {
	case "most_recent_registration":
		orderBy = "ORDER BY created_at DESC"
	case "oldest_registration":
		orderBy = "ORDER BY created_at ASC"
	case "most_recent_last_active":
		orderBy = "ORDER BY coalesce(last_active, to_timestamp(0)) DESC"
	case "oldest_last_active":
		orderBy = "ORDER BY coalesce(last_active, to_timestamp(0)) ASC"
	case "most_recent_deletion":
		orderBy = "ORDER BY deleted_at DESC"
	case "oldest_deletion":
		orderBy = "ORDER BY deleted_at ASC"
	}

	query := "SELECT id, email, username, role, is_banned, created_at, last_active, deleted_at FROM accounts " + whereClause + " " + orderBy

	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)

	if err != nil {
		return nil, 0, fmt.Errorf("GetAllAccounts() query failed: %v", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var account models.Account
		if err := rows.Scan(&account.Id, &account.Email, &account.Username, &account.Role, &account.IsBanned, &account.CreatedAt, &account.LastActive, &account.DeletedAt); err != nil {
			return nil, 0, fmt.Errorf("GetAllAccounts() scan failed: %v", err.Error())
		}
		if account.Role == "employee" {
			isAdmin, err := CheckIsAdmin(account.Id)
			if err != nil {
				return nil, 0, fmt.Errorf("GetAllAccounts() admin check failed: %v", err.Error())
			}
			if isAdmin {
				account.Role = "admin"
			}
		}
		accounts = append(accounts, account)
	}

	return accounts, totalRecords, nil
}

func GetAccountDetailsById(id_account int) (models.AccountDetails, error) {
	var account models.AccountDetails

	row := utils.Conn.QueryRow("SELECT id, email, username, role, is_banned, created_at, avatar, last_active, deleted_at FROM accounts WHERE id=$1", id_account)
	err := row.Scan(&account.Id, &account.Email, &account.Username, &account.Role, &account.IsBanned, &account.CreatedAt, &account.Avatar, &account.LastActive, &account.DeletedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.AccountDetails{}, nil
		}
		return models.AccountDetails{}, fmt.Errorf("GetAccountById() failed: %v", err.Error())
	}
	if account.Role == "employee" {
		isAdmin, err := CheckIsAdmin(account.Id)
		if err != nil {
			return models.AccountDetails{}, fmt.Errorf("GetAccountById() failed: %v", err.Error())
		}
		if isAdmin {
			account.Role = "admin"
		}
	}
	if account.Role == "pro" {
		proDetails, err := GetProDetailsById(id_account)
		if err != nil {
			return models.AccountDetails{}, fmt.Errorf("GetAccountById() failed: %v", err.Error())
		}
		account.Phone = proDetails.Phone
		account.IsPremium = proDetails.IsPremium
	}

	if account.Role == "user" {
		userDetail, err := GetUserDetailsById(id_account)
		if err != nil {
			return models.AccountDetails{}, fmt.Errorf("GetAccountById() failed: %v", err.Error())
		}
		account.Phone = userDetail.Phone
		account.Score = userDetail.Score
	}
	return account, nil
}

// if is_deleted is nil, check if account exists in db (deleted or not)
//
// if is_deleted is true, check if account exists in db and is deleted
//
// if is_deleted is false, check if account exists in db and is not deleted
//
// Usage:
//
//	is_deleted = true
//	CheckAccountExistsById(id_account, &is_deleted)
func CheckAccountExistsById(id_account int, is_deleted *bool) (bool, error) {
	var exists bool
	var param string
	if is_deleted != nil {
		if *is_deleted {
			param = "AND deleted_at IS NOT NULL"
		} else {
			param = "AND deleted_at IS NULL"
		}
	} else {
		param = ""
	}

	err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM accounts WHERE id=$1 "+param+")", id_account).Scan(&exists)
	return exists, err
}

func SoftDeleteAccount(id_account int) error {
	_, err := utils.Conn.Exec("UPDATE accounts SET deleted_at=NOW() WHERE id=$1;", id_account)
	if err != nil {
		return fmt.Errorf("SoftDeleteAccount() failed: %v", err.Error())
	}
	return nil
}

func UpdatePassword(id_account int, newPassword string) error {
	hashedPassword := authUtils.HashPassword(newPassword)
	_, err := utils.Conn.Exec("UPDATE accounts SET password=$1 WHERE id=$2 AND deleted_at IS NULL", hashedPassword, id_account)
	if err != nil {
		return fmt.Errorf("UpdatePassword() failed: %v", err.Error())
	}
	return nil
}

// return "admin", "employee", "user", "pro"
func GetRoleById(id_account int) (string, error) {
	var role string
	row := utils.Conn.QueryRow("SELECT role FROM accounts WHERE id=$1", id_account)
	err := row.Scan(&role)
	if err != nil {
		return "", fmt.Errorf("GetRoleById() failed: %v", err.Error())
	}

	if role == "employee" {
		isAdmin, err := CheckIsAdmin(id_account)
		if err != nil {
			return "", fmt.Errorf("GetRoleById() failed: CheckIsAdmin() failed: %v", err.Error())
		}
		if isAdmin {
			role = "admin"
		}
	}
	return role, nil
}

func ToggleBanAccount(id_account int, currently_banned bool) error {
	param := !currently_banned
	_, err := utils.Conn.Exec("UPDATE accounts SET is_banned=$1 WHERE id=$2 AND deleted_at IS NULL", param, id_account)
	if err != nil {
		return fmt.Errorf("ToggleBanAccount() failed: %v", err.Error())
	}
	return nil
}

func UpdateLastActive(accountID int) error {
	_, err := utils.Conn.Exec("UPDATE accounts SET last_active = $1 WHERE id = $2 AND (last_active < $3 OR last_active IS NULL)", time.Now(), accountID, time.Now().Add(-2*time.Minute))
	if err != nil {
		return fmt.Errorf("UpdateLastActive() failed: %v", err.Error())
	}
	return nil
}

func RecoverAccount(id_account int) error {
	_, err := utils.Conn.Exec("UPDATE accounts SET deleted_at=NULL WHERE id=$1;", id_account)
	if err != nil {
		return fmt.Errorf("RecoverAccount() failed: %v", err.Error())
	}
	return nil
}

func UpdateAccount(account models.UpdateAccountRequest, currentRole string) error {
	// update accounts entity
	_, err := utils.Conn.Exec("UPDATE accounts SET username=$1, email=$2 WHERE id=$3 AND deleted_at IS NULL", account.Username, account.Email, account.Id)
	if err != nil{
		return fmt.Errorf("UpdateAccount() failed: %v", err.Error())
	}

	// update phone
	if currentRole =="pro"{
		_, err = utils.Conn.Exec("UPDATE pros SET phone=$1 WHERE id_account=$2;", account.Phone, account.Id)
	}
	if currentRole =="user"{
		_, err = utils.Conn.Exec("UPDATE users SET phone=$1 WHERE id_account=$2;", account.Phone, account.Id)
	}
	if err != nil {
		return fmt.Errorf("UpdateAccount() failed: %v", err.Error())
	}
	return nil
}

func GetIdByUsernameByEmail(username *string, email * string) (int, error){
	var id int
	var err error

	if username != nil && email != nil{
		err = utils.Conn.QueryRow("select id from accounts where username=$1 and email=$2;", *username, *email).Scan(&id)
	}
	if username != nil{
		err = utils.Conn.QueryRow("select id from accounts where username=$1;", *username).Scan(&id)
	}
	if email != nil{
		err = utils.Conn.QueryRow("select id from accounts where email=$1;", *email).Scan(&id)
	}
	if err != nil{
		return 0, fmt.Errorf("GetIdByUsernameByEmail() failed: %v", err.Error())
	}

	return id, nil
}

func GetAccountIdByEmail(email string) (int, error){
	id := 0
	err := utils.Conn.QueryRow("select id from accounts where email=$1;", email).Scan(&id)
	if err != nil{
		if err == sql.ErrNoRows {
			return id, nil
		}
		return id, fmt.Errorf("GetAccountIdByEmail() failed: %v", err.Error())
	}
	return id, nil
}

func GetAccountIdByUsername(username string) (int, error){
	id := 0
	err := utils.Conn.QueryRow("select id from accounts where username=$1;", username).Scan(&id)
	if err != nil{
		if err == sql.ErrNoRows {
			return id, nil
		}
		return id, fmt.Errorf("GetAccountIdByUsername() failed: %v", err.Error())
	}
	return id, nil
}


func GetAccountCount() (int, error){
	var count int
	err := utils.Conn.QueryRow("select count(*) from accounts").Scan(&count)
	if err != nil{
		return 0, fmt.Errorf("GetAccountCount() failed: %v", err.Error())
	}
	return count, nil
}

func GetAccountIncreaseSince(since time.Time) (int, error){
	var count int
	err := utils.Conn.QueryRow("select count(*) from accounts where created_at > $1", since).Scan(&count)
	if err != nil{
		return 0, fmt.Errorf("GetAccountIncreaseSince() failed: %v", err.Error())
	}
	return count, nil
}
