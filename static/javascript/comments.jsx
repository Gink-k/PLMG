const IMAGE_STORAGE = "/data/images/"

function Comments(props) {
    const [comments, setComments] = React.useState(null)
    const [isLoaded, setIsLoaded] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(handleSubmit, [])

    function handleSubmit(e) {
        const url = getCurrentApiUrl() + "/comments"
        e && e.preventDefault()
        fetch(url)
            .then(handleErrors)
            .then(res => res.json())
            .then(
                (result) => {
                    const itemName = result.item
                    setComments(result[itemName])
                    setIsLoaded(true)
                }, 
                (reason) => {setError(reason)})
            .catch(reason => setError(reason))
    }
 
    if (error) {
        return <Wrap className="error">Произошла ошибка, невозможно получить данные с сервера!</Wrap>
    } else if (!isLoaded) {
        return <Wrap className="load">Идет загрузка</Wrap>
    } else {
        return <CommentsPanel comments={comments} handleSubmit={handleSubmit}/>
    }
}

function CommentsPanel(props) {
    const comments = props.comments.map((value, index) => {
        return <Comment value={value} id={"comment_"+index}/>
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
            {comments}
            <form className={props.className || ""} onSubmit={handleSubmit}>
                <input type="hidden" name="user_id" value={getCurUserID()}/>
                <textarea name="text"></textarea>
                <input type="submit" value="Сохранить"/>
            </form>
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
        return <Wrap className="load">Идет загрузка</Wrap>
    } else {
        return (
            <Wrap className="comment">
                <UserInfo user={owner}/>
                <Wrap className="comment-text">{props.value.text}</Wrap>
                <Wrap className="comment-date">{props.value.CreatedAt}</Wrap>
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

function Wrap(props) {
    let {className, children, _ref, ...restProps} = props
    if (className) {
        const lLetter = className.length - 1
        if (className[lLetter] == " ") className = className.slice(0, lLetter)
        else className = className + "-wrap"
    } else className = ""
    return (
        <div className={className} ref={_ref} {...restProps}>{children}</div>
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

function getCurrentApiUrl() {
    let {origin} = window.location
    return `${origin}/api` 
}

ReactDOM.render(
    <Comments/>,
    document.getElementById("comments")
)