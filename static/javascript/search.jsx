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
        const formData = new FormData()
        for (let child of formRef.current) {
            if (child.name == "category") {
                if (child.checked) formData.append(child.value, "true") 
                continue
            }
            if (child.type != "submit") formData.append(child.name, child.value)
        }
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
            <p><input type="checkbox" name="category" value="ch_box_chars" defaultChecked={true}/>По персонажам</p>
            <p><input type="checkbox" name="category" value="ch_box_hists"/>По историям</p>
        </form>
    )
}

function SearchResultPanel(props) {
    if (props.error) {
        return <Wrap className="error">Произошла ошибка, невозможно получить данные с сервера!{props.error.message}</Wrap>
    } else if (!props.isLoaded) {
        return <Wrap className="load">Идет загрузка</Wrap>
    } else {
        const search = props.searchResult.search
        let searchList = []
        for (let category of search) {
            const itemName = category.item
            const item = category[itemName]
            if (!item) continue
            searchList.push(...item.map(value => {
                const path = itemName == "characters"? value.ID : `${value.CharacterID}/histories/${value.ID}/chapters`
                return <li key={value && value.ID+itemName}><ViewItem key={value && value.ID} item={value} path={path}/></li>
            }))
        }
        return (
            <ul>
                {searchList}
            </ul>
        )
    }
}

// copied from characters.html

function ViewItem(props) {
    const item = props.item || {}
    return (
        <div class="preview-content-wrap"  style={{"background":`white url('/data/images/${item.photo}') no-repeat center`, "backgroundSize": "cover"}}>
            <a class="preview-link" style={{"display":"block"}} href={`characters/${props.path}`}>
                <div class="preview-char-text-info preview-text-info-wrap">
                    <div class="preview-char-name preview-title-wrap">
                        <p>{ item.name || item.title}:</p>
                    </div>
                    <div class="preview-char-about">
                        <p>{ item.about }</p>
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