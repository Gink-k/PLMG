import React from "react"
import ReactDOM from "react-dom"
import {IMAGE_STORAGE, Wrap, getCurrentApiUrl, formatDate} from "./utils"

function Comments(props) {
    const [comments, setComments] = React.useState(null)
    const [isLoaded, setIsLoaded] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(handleSubmit, [])

    function handleSubmit(e) {
        const url = getCurrentApiUrl() + "/comments?location=" + window.location.pathname
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    const itemName = result.item
                    setComments(result[itemName])
                    setIsLoaded(true)
                }, 
                (reason) => {setError(reason)})
    }
 
    if (error) {
        return <Wrap className="error">Произошла ошибка, невозможно получить данные с сервера!</Wrap>
    } else if (!isLoaded) {
        return <Wrap className="load"/>
    } else {
        return <CommentsPanel comments={comments} handleSubmit={handleSubmit}/>
    }
}

function CommentsPanel(props) {
    const comments = props.comments.map((value, index) => {
        return <Comment value={value} id={"comment_"+index} key={"comment_"+value.ID}/>
    })
    function handleSubmit(e) {
        const url = getCurrentApiUrl() + "/comments"
        const formData = new FormData(e.target)
        e.target.text.value = ""
        e.preventDefault()
        fetch(url, {
            body: formData,
            method: "POST"
        }).then(result => {
            props.handleSubmit(e)
        })
    }
    return (
        <Wrap className="comments-panel ">
            <h2 className="comments-title">Комментарии:</h2>
            <form className={props.className || ""} onSubmit={handleSubmit}>
                <input type="hidden" name="user_id" value={getCurUserID()}/>
                <input type="hidden" name="location" value={window.location.pathname}/>
                <textarea name="text"></textarea>
                <input type="submit" value="Сохранить"/>
            </form>
            {comments}
        </Wrap>
    )
}

function Comment(props) {
    const [owner, setOwner] = React.useState(null)
    const [isLoaded, setIsLoaded] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        const url = getCurrentApiUrl() + "/profile/" + props.value.UserID
        fetch(url)
        .then(res => res.json())
        .then(result => {
            const itemName = result.item
            setOwner(result[itemName])
            setIsLoaded(true)
        })
        .catch(reason => setError(reason))
    }, [])
     
    if (error) {
        return <Wrap className="error">Произошла ошибка, невозможно получить данные с сервера!{error}</Wrap>
    } else if (!isLoaded) {
        return <Wrap className="load"/>
    } else {
        return (
            <Wrap className="comment">
                <UserInfo user={owner}/>
                <Wrap className="comment-text">{props.value.text}</Wrap>
                <Wrap className="date-line-wrap comment-date">{formatDate(props.value.CreatedAt)}</Wrap>
            </Wrap>
        )
    }
}

function UserInfo(props) {
    const imgSrc = props.user.photo ? IMAGE_STORAGE + info.photo : IMAGE_STORAGE + "acc-icon.png"
    return (
        <Wrap className="user-info">
            <img src={imgSrc} style={{"width":"50px", "height":"50px"}}/>
            <Wrap className="user-info-name">{props.user.name}</Wrap>
        </Wrap>
    )
}

function getCurUserID() {
    const profileBtn = document.querySelector("#profile-btn-wrap h1 a")
    return profileBtn.href.slice(profileBtn.href.lastIndexOf("/") + 1)
}

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

ReactDOM.render(
    <Comments/>,
    document.getElementById("comments-section")
)