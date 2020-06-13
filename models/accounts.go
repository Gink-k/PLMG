package models

import (
	"fmt"
	"os"
	u "plmg/utils"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
)

/*
Структура прав доступа JWT
*/
type Token struct {
	UserId uint
	jwt.StandardClaims
}

//структура для учётной записи пользователя
type Account struct {
	gorm.Model
	Email    string `json:"email"`
	Password string `json:"password"`
	Token    string `json:"token" sql:"-"`
	Name     string `json:"name"`
	Surname  string `json:"surname"`
	Photo    string `json:"photo"`
	Status   uint   `json:"status"` //0 - anonymous, 1 - authorized user
	Group    uint   `json:"group"`  //0 - admin, 1 - user
}

const (
	ANONYMOUS uint = 0
	LOGGED    uint = 1
	ADMIN     uint = 0
	USER      uint = 1
)

//Проверить входящие данные пользователя ...
func (account *Account) Validate() (map[string]interface{}, bool) {

	if !strings.Contains(account.Email, "@") {
		return u.Message(u.WARNING, "Email address is required"), false
	}

	if len(account.Password) < 6 {
		return u.Message(u.WARNING, "Password is required"), false
	}

	//Email должен быть уникальным
	temp := &Account{}

	//проверка на наличие ошибок и дубликатов электронных писем
	err := GetDB().Table("accounts").Where("email = ?", account.Email).First(temp).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return u.Message(u.ERROR, "Connection error. Please retry"), false
	}
	if temp.Email != "" {
		return u.Message(u.WARNING, "Email address already in use by another user."), false
	}

	return u.Message(u.SUCCESS, "Requirement passed"), true
}

func (account *Account) Create() map[string]interface{} {
	if resp, ok := account.Validate(); !ok {
		return resp
	}
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(account.Password), bcrypt.DefaultCost)
	account.Password = string(hashedPassword)
	account.Status = LOGGED
	account.Group = USER

	GetDB().Create(account)

	if account.ID <= 0 {
		return u.Message(u.ERROR, "Failed to create account, connection error.")
	}
	//Создать новый токен JWT для новой зарегистрированной учётной записи
	tk := &Token{UserId: account.ID}
	token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"), tk)
	tokenString, _ := token.SignedString([]byte(os.Getenv("token_password")))
	account.Token = tokenString
	account.Password = "" //удалить пароль

	response := u.Message(u.SUCCESS, "Account has been created")
	response["account"] = account
	return response
}

func (account *Account) Edit() map[string]interface{} {
	GetDB().Save(account)
	response := u.Message(u.SUCCESS, "Chapter has been edited")
	response["account"] = account
	return response
}

func (account *Account) Delete() map[string]interface{} {
	GetDB().Delete(account)
	removePhoto(account.Photo)
	response := u.Message(u.SUCCESS, "Chapter has been deleted")
	response["account"] = account
	return response
}

func (account *Account) GetID() uint {
	return account.ID
}

func (account *Account) BuildPhotoName(extension string) string {
	return fmt.Sprintf(
		"account_photo%d.%s", account.ID, extension,
	)
}

func (account *Account) SetPhotoName(photoName string) {
	account.Photo = photoName
}

func (account *Account) SavePhotoName() {
	GetDB().Model(account).Update("photo", account.Photo)
}

func (account *Account) IsAdmin() bool {
	return account.Status == LOGGED && account.Group == ADMIN
}

func (account *Account) IsLogged() bool {
	return account.Status == LOGGED
}

func (account *Account) IsOwnProfile(reqPath string) bool {
	profile := "/profile/"
	reqPath = strings.Replace(reqPath, "/api", "", 1)
	if strings.HasPrefix(reqPath, profile) {
		s_id := strings.Split(reqPath, "/")[2]
		id, err := u.Stou(s_id)
		if err == nil && account.IsOwnID(id) {
			return true
		}
	}

	return false
}

func (account *Account) IsOwnID(ID uint) bool {
	return account.ID == ID
}

func Login(email, password string) map[string]interface{} {
	account := &Account{}
	err := GetDB().Table("accounts").Where("email = ?", email).First(account).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return u.Message(u.WARNING, "Email address not found")
		}
		return u.Message(u.ERROR, "Connection error. Please retry")
	}
	err = bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(password))
	if err != nil && err == bcrypt.ErrMismatchedHashAndPassword { //Пароль не совпадает!!
		return u.Message(u.WARNING, "Invalid login credentials. Please try again")
	}
	//Работает! Войти в систему
	account.Password = ""

	//Создать токен JWT
	tk := &Token{UserId: account.ID}
	token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"), tk)
	tokenString, _ := token.SignedString([]byte(os.Getenv("token_password")))
	account.Token = tokenString // Сохраните токен в ответе
	resp := u.Message(u.SUCCESS, "Logged In")
	resp["account"] = account
	return resp
}

func GetUser(u uint) *Account {
	acc := &Account{}
	GetDB().Table("accounts").Where("id = ?", u).First(acc)
	acc.Password = ""
	return acc
}

func GetAllUsers() []Account {
	var all []Account
	getAllItems("accounts", &all)
	for i := 0; i < len(all); i++ {
		all[i].Password = ""
	}
	return all
}
