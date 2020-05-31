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
            <ul>
                {props.searchResult.search.map(value => {
                    return <li key={value.ID}><ViewChar char={value}/></li>
                })}
            </ul>
        )
    }
}

// copied from characters.html

function ViewChar(props) {
    const char = props.char
    return (
        <div class="preview-content-wrap"  style={{"background":`white url('/data/images/${char.photo}') no-repeat center`, "backgroundSize": "cover"}}>
            <a style={{"display":"block"}} href={`characters/${char.ID}`}>
                <div class="preview-char-text-info preview-text-info-wrap">
                    <div class="preview-char-name preview-title-wrap">
                        <p>{ char.name }:</p>
                    </div>
                    <div class="preview-char-about">
                        <p>{ char.about }</p>
                    </div>
                </div>
            </a>
        </div>
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