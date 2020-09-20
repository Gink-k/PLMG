package app

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"plmg/models"
	u "plmg/utils"
	"regexp"
	"strings"

	"github.com/dgrijalva/jwt-go"
)

var WebJwtAuth = func(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		const TOKEN_NAME = "X-Session-Token"
		reqPath := r.URL.Path
		reqMethod := r.Method
		tokenHeader := r.Header.Get(TOKEN_NAME)

		if tokenHeader == "" {
			cookie1, err := r.Cookie(TOKEN_NAME)
			if err != nil {
				if isSecureReq(reqMethod, reqPath) {
					next.ServeHTTP(w, r)
				} else if strings.HasPrefix(reqPath, "/api") {
					http.Error(w, "Missing auth token", http.StatusInternalServerError)
				} else {
					http.Redirect(w, r, "/registration", http.StatusFound)
				}
				return
			}
			tokenHeader = cookie1.Value
		}
		token, err := getToken(tokenHeader)
		if err != nil {
			if isSecureReq(reqMethod, reqPath) {
				next.ServeHTTP(w, r)
				return
			} else {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		user := models.GetUser(token.UserId)
		if reqMethod == "GET" || user.IsAdmin() || isUserSection(user, r) || reqMethod == "POST" && (reqPath == "/logout" || reqPath == "/api/search") {
			ctx := context.WithValue(r.Context(), "user", token.UserId)
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
			return
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
	})
}

func getToken(tokenHeader string) (*models.Token, error) {
	if tokenHeader != "" { //Токен отсутствует, возвращаем  403 http-код Unauthorized
		splitted := strings.Split(tokenHeader, " ") //Токен обычно поставляется в формате `Bearer {token-body}`, мы проверяем, соответствует ли полученный токен этому требованию
		if len(splitted) == 2 {
			tokenPart := splitted[1] //Получаем вторую часть токена
			tk := &models.Token{}

			token, err := jwt.ParseWithClaims(tokenPart, tk, func(token *jwt.Token) (interface{}, error) {
				return []byte(os.Getenv("token_password")), nil
			})

			if err == nil {
				if token.Valid {
					log.Printf("User %d", tk.UserId)
					return tk, nil
				} else {
					return nil, errors.New("Token is not valid.")
				}
			} else {
				return nil, errors.New("Malformed authentication token")
			}
		} else {
			return nil, errors.New("Invalid/Malformed auth token")
		}
	}
	return nil, errors.New("Missing auth token")
}

func isSecureReq(reqMethod string, reqPath string) bool {
	var isStatic bool = false
	webPrefix := "/characters"

	isWeb := strings.HasPrefix(reqPath, webPrefix) || reqPath == "/"

	noAuth := []string{"/login", "/registration", "/api/login"}
	static := []string{"/static", "/data", "/frontend"}
	noAuthFlag := u.ArrContain(noAuth, reqPath)
	for _, val := range static {
		if strings.HasPrefix(reqPath, val) {
			isStatic = true
			break
		}
	}
	return reqMethod == "GET" && (isWeb || isStatic) || noAuthFlag
}

func isUserSection(user *models.Account, r *http.Request) bool {
	reqUserId, err := u.Stou(r.FormValue("user_id"))
	if err != nil {
		return false
	}
	return user.IsOwnID(reqUserId) //user.IsOwnProfile(reqPath)
}

func getUserIDFromPath(reqPath string) uint {
	path := strings.Replace(reqPath, "/api", "", 1)
	re := regexp.MustCompile(`/characters/([0-9]+).*`)
	submatch := re.FindStringSubmatch(path)
	if len(submatch) == 2 {
		id, err := u.Stou(submatch[1])
		if err == nil {
			return id
		}
	}
	return 0
}
