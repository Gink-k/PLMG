package models

import (
	u "plmg/utils"

	"github.com/jinzhu/gorm"
)

type Comment struct {
	gorm.Model
	UserID uint
	Text   string `json:"text"`
}

func (comment *Comment) Create() map[string]interface{} {
	GetDB().Create(comment)
	if comment.ID <= 0 {
		return u.Message(u.ERROR, "Failed to create comment, connection error.")
	}
	response := u.Message(u.SUCCESS, "Comment has been created")
	response["comment"] = comment
	return response
}

func (comment *Comment) Edit() map[string]interface{} {
	GetDB().Save(comment)
	response := u.Message(u.SUCCESS, "Comment has been edited")
	response["comment"] = comment
	return response
}

func (comment *Comment) Delete() map[string]interface{} {
	GetDB().Delete(comment)
	response := u.Message(u.SUCCESS, "Comment has been deleted")
	response["comment"] = comment
	return response
}

func (comment *Comment) GetID() uint {
	return comment.ID
}

func GetComment(id string) *Comment {
	comm := &Comment{}
	GetDB().Table("comments").Where("id = ?", id).First(comm)
	return comm
}

func GetAllCommByUserID(user_id string) []Comment {
	var all []Comment
	GetDB().Table("comments").Where("user_id = ?", user_id).Find(&all)
	return all
}

func GetAllComments() []Comment {
	var all []Comment
	getAllItems("comments", &all)
	return all
}
