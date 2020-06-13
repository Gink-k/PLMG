import React from "react"
import ReactDOM from "react-dom"
import {Wrap, IMAGE_STORAGE} from "./utils"

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
    const [request, setRequest] = React.useState("")
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
                props.setIsLoaded(true)},
            reason => props.setError(reason))
    }, [request])

    function onChange(event) {
        event.preventDefault()
        setRequest(event.target.value)
    }
    return (
        <form ref={formRef}>
            <input type="text" name="search" value={request} onChange={onChange}/>
            {/* <input type="submit"/> */}
            <fieldset>
                <label><input type="checkbox" name="category" value="ch_box_chars" defaultChecked={true}/>По персонажам</label>
                <label><input type="checkbox" name="category" value="ch_box_hists"/>По историям</label>
            </fieldset>
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
    const about = item.about && <div className="preview-char-about"><p>{ item.about }</p></div>
    return (
        <div className="preview-content-wrap"  style={{"background":`white url('${IMAGE_STORAGE}${item.photo}') no-repeat center`, "backgroundSize": "cover"}}>
            <a className="preview-link" style={{"display":"block"}} href={`characters/${props.path}`}>
                <div className="preview-char-text-info preview-text-info-wrap">
                    <div className="preview-char-name preview-title-wrap">
                        <p>{ item.name || item.title}:</p>
                    </div>
                    {about}
                </div>
            </a>
        </div>
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