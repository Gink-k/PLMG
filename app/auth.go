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

	jwt "github.com/dgrijalva/jwt-go"
)

var JwtAuthentication = func(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		notAuth := []string{"/", "/characters", "/login", "/data/images/", "/static/stylesheets/style.css"} //Список эндпоинтов, для которых не требуется авторизация
		requestPath := r.URL.Path                                                                           //текущий путь запроса

		//проверяем, не требует ли запрос аутентификации, обслуживаем запрос, если он не нужен
		for _, value := range notAuth {

			if value == requestPath {
				next.ServeHTTP(w, r)
				return
			}
		}

		tokenHeader := r.Header.Get("X-Session-Token")
		tk, err := getToken(tokenHeader)
		if err != nil {
			response := u.Message(u.ERROR, err.Error())
			u.Respond(w, response)
			return
		}
		//Всё прошло хорошо, продолжаем выполнение запроса
		log.Printf("User %d", tk.UserId) //Полезно для мониторинга
		ctx := context.WithValue(r.Context(), "user", tk.UserId)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r) //передать управление следующему обработчику!
	})
}

var WebJwtAuth = func(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// apiPrefix := "/api"
		const TOKEN_NAME = "X-Session-Token"
		reqPath := r.URL.Path
		reqMethod := r.Method
		tokenHeader := r.Header.Get(TOKEN_NAME)

		if tokenHeader == "" {
			cookie1, err := r.Cookie(TOKEN_NAME)
			if err != nil {
				if isSecureReq(reqMethod, reqPath) {
					next.ServeHTTP(w, r)
					return
				} else {
					http.Error(w, "Missing auth token", http.StatusInternalServerError)
					return
				}
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
		if reqMethod == "GET" || reqMethod == "POST" && (user.IsAdmin() || isUserProfile(reqPath, user.ID)) || reqPath == "/logout" {
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
	user_char, _ := regexp.MatchString("/[0-9]+"+webPrefix, reqPath)

	isWeb := strings.HasPrefix(reqPath, webPrefix) || reqPath == "/" || user_char

	noAuth := []string{"/login", "/registration"}
	static := []string{"/static", "/data"}
	noAuthFlag := u.ArrContain(noAuth, reqPath)
	for _, val := range static {
		if strings.HasPrefix(reqPath, val) {
			isStatic = true
			break
		}
	}
	return reqMethod == "GET" && (isWeb || isStatic) || noAuthFlag
}

func isUserProfile(reqPath string, user_id uint) bool {
	profile := "/profile/"
	reqPath = strings.Replace(reqPath, "/api", "", 1)
	if strings.HasPrefix(reqPath, profile) {
		s_id := strings.Split(reqPath, "/")[2]
		id, err := u.Stou(s_id)
		if err == nil && id == user_id {
			return true
		}
	}

	return false
}
