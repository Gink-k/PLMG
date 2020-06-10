const IMAGE_STORAGE = "/data/images/"

function Comments(props) {
    const [comments, setComments] = React.useState(null)
    const [isLoaded, setIsLoaded] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(handleSubmit, [])

    function handleSubmit(e) {
        const url = getCurrentApiUrl() + "/comments?location=" + window.location.pathname
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
        return <Wrap className="load">Идет загрузка</Wrap>
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

function formatDate(date) {
    const reqDate = new Date(date)
    const now = new Date()
    console.log(date)
    function getFNum(diviver) {
        return Math.floor(Math.abs((now - reqDate) / diviver))
    }
    const m = 1000 * 60,
          dY = getFNum(m*60*24*365),
          dM = dY? "" : now.getMonth() - reqDate.getMonth(),
          dD = getFNum(m*60*24),
          dH = getFNum(m*60),
          dMin = getFNum(m)
    return getCorrectCase([dY, dM, dD, dH, dMin])
}

function getCorrectCase(date) {
    const cases = [["год", "года", "лет"], ["месяц", "месяца", "месяцев"], ["день", "дня", "дней"], ["час", "часа", "часов"], ["минуту", "минуты", "минут"]]
    let res = "Только что"
    function handleNum(num, cases) {
        const dres = num % 10
        if (dres == 1 && num != 11) res = num + " " + cases[0]
        if (1 < dres && dres < 5 && !(10 < num && num < 20)) res = num + " " + cases[1]
        if (4 < dres || dres == 0 || (10 < num && num < 20)) res = num + " " + cases[2]
    }
    for (let i = 0; i < date.length; i++) {
        if (date[i]) {
            handleNum(date[i], cases[i])
            break
        }
    }
    if (res == "Только что") return res
    return res + " назад"
}

function getCurrentApiUrl() {
    let {origin} = window.location
    return `${origin}/api` 
}

ReactDOM.render(
    <Comments/>,
    document.getElementById("comments")
)