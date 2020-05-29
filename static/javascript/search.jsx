function App(props) {
    const [searchResult, setSearchResult] = React.useState(null)
    const [error, setError] = React.useState(null)
    const [isLoaded, setIsLoaded] = React.useState(false)
    return (
        <Wrap className="search">
            <SearchPanel setError={setError} setIsLoaded={setIsLoaded} setSearchResult={setSearchResult}/>
            <SearchResultPanel error={error} isLoaded={isLoaded} searchResult={searchResult}/>
        </Wrap>
    )
}

function SearchPanel(props) {
    const [request, setRequest] = React.useState(null)
    const formRef = React.useRef()
    const url = getCurrentApiUrl()
    React.useEffect(() => {
        const formData = new FormData(formRef.current)
        fetch(url, {
            method: "POST",
            body: formData,
        })
        .then(res => res.json())
        .then(
            result => {
                props.setSearchResult(result)
                props.setIsLoaded(true)
            })
        .catch(reason => props.setError(reason))
    }, [request])
    function onChange(event) {
        event.preventDefault()
        setRequest(event.target.value)
    }
    return (
        <form ref={formRef}>
            <input type="text" name="search" value={request} onChange={onChange}/>
            <input type="submit"/>
        </form>
    )
}

function SearchResultPanel(props) {
    if (props.error) {
        return <Wrap className="error">Произошла ошибка, невозможно получить данные с сервера!{props.error.message}</Wrap>
    } else if (!props.isLoaded) {
        return <Wrap className="load">Идет загрузка</Wrap>
    } else {
        return (
            <Wrap>
                {props.searchResult.search.map(value => {
                    return <ViewChar char={value}/>
                })}
            </Wrap>
        )
    }
}

// duplicates from account.jsx (need to improve namespace)

function ViewChar(props) {
    const {CreatedAt, UpdatedAt, DeletedAt, ID, UserID, photo, ...textContent} = props.char
    const date = {CreatedAt, UpdatedAt} // titles={{"CreatedAt": "Дата создания", "UpdatedAt": "Дата обновления"}}
    return (
        <Wrap class="acc-char-view">
            <ViewItem item={date} className="char-date"/>
            <ImageWrap name={photo} className="acc-char-photo"/>
            <ViewItem item={textContent} titles={{"about": "Обо мне", "excerpt": "Отрывок", "name": "Имя"}} className="char-content"/>
        </Wrap>
    )
}

function ViewItem(props) {
    const item = props.item || {}
    let className = `acc-${props.className}`
    return (
        <Wrap className={className}>
            {Object.entries(item).map(([key, value]) => {
                let itemClass = `acc-item-prop acc-${props.className}-${key}`
                const elem = key == "photo"? <img src={IMAGE_STORAGE + value}/> : <p>{value}</p>
                const title = props.titles && key in props.titles && <h2>{props.titles[key]}</h2> || ""
                
                if (key in {"CreatedAt":1, "UpdatedAt":1}) itemClass = "date-line-wrap " + itemClass
                if (key == "ID") return
                return (
                    <Wrap className={itemClass}>
                        {title}
                        {elem}
                    </Wrap>
                )
            })}
        </Wrap>
    )
}

function ImageWrap(props) {
    return (
        <Wrap className={props.className}>
            <img src={`/data/images/${props.name}`}/>    
        </Wrap>
    )
}

function Wrap(props) {
    let {className, children, _ref, ...restProps} = props
    className = className ? className + "-wrap" : "wrap"
    return (
        <div className={className} ref={_ref} {...restProps}>{children}</div>
    ) 
}

function getCurrentApiUrl() {
    let {origin, pathname} = window.location
    return `${origin}/api${pathname}`  
}

ReactDOM.render(
    <App/>,
    document.getElementById("app")
)