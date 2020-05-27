const API_URL = "http://localhost:8000/api/profile"
const IMAGE_STORAGE = "/data/images/"

function Account(props) {
    const [section, setSection] = React.useState(getSectionFromLocalStorage() || "account")
    const [userInfo, setUserInfo] = React.useState({})
    React.useEffect(() => {
        let acc = getUserInfo()
        setUserInfo(acc)
    }, [])
    React.useEffect(() => {
        rmSectionFromLocalStorage()
    }, [])
    function getUserInfo() {
        return document.querySelector('#account-data').dataset
    }
    function handleNavClick(e, sectionName) {
        setSection(sectionName)
        saveSectionInLocalStorage(sectionName)
    }
    let panel = {}
    switch (section) {
        case "account":
            panel = <AccInfoPanel user={userInfo}/>
            break
        case "characters":
            panel = <CharInfoPanel user={userInfo}/>
            break
        case "comments":
    }
    return (
        <Wrap className="acc">
            <Navigation section={section} handleNavClick={handleNavClick}/>
            {panel}
        </Wrap>
    )
}

function Navigation(props) {
    return (
        <Wrap className="acc-nav">
            <NavBtn id="account" {...props}>Профиль</NavBtn>
            <NavBtn id="characters" {...props}>Персонажи</NavBtn>
            <NavBtn id="comments" {...props}>Комментарии</NavBtn>
        </Wrap>
    )
}

function NavBtn(props) {
    const [state, setState] = React.useState("")
    const className = "acc-nav-btn"

    React.useEffect(() => {
        if (props.id != props.section) setState("")
        if (props.id == getSectionFromLocalStorage()) setState("active")
    })
    
    function handleClick(e) {
        e.preventDefault()
        setState("active")
        props.handleNavClick(e, props.id)
    }
    const style = state ? {"borderBottom": "2px solid rgb(0, 47, 218)"} : {}
    return (
        <Wrap className={className} style={style}>
            <a onClick={handleClick} className={state ? className + "-" + state : className} id={props.id}>
                {props.children}
            </a>
        </Wrap>
    )
}

function AccInfoPanel(props) {
    const info = props.user
    const className = "acc-info-panel"
    let imgSrc = info.photo ? IMAGE_STORAGE + info.photo : IMAGE_STORAGE + "acc-icon.png"
    return (
        <Wrap className={"profile-panel " + className}>
            <Wrap className={className + "-createdat"}>
                <p>{info.createdat}</p>
            </Wrap>
            <Wrap className={className + "-img"} style={{"backgroundImage": `url(${imgSrc})`}}/>
            <Wrap className={className + "-name"}>
                <h2>{info.name + " " + info.surname}</h2>
            </Wrap>
        </Wrap>
    )
}

function CharInfoPanel(props) {
    const [response, setResponse] = React.useState(null)
    const [error, setError] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const url =  getCurrentApiUrl() + "/characters"

    React.useEffect(() => {
        fetch(url)
        .then(res => res.json())
        .then(
            result => {
                setResponse(result)
                setIsLoaded(true)
            })
        .catch(reason => setError(reason))
    }, [])

    if (error) {
        return <Wrap className="error">Произошла ошибка, невозможно получить данные с сервера!</Wrap>
    } else if (!isLoaded) {
        return <Wrap className="load">Идет загрузка</Wrap>
    } else {
        console.log(response)
        return <Wrap className="profile-panel acc-char-info-panel"><CharPanel user={props.user} characters={response.characters}/></Wrap>
    }
}

function CharPanel(props) {
    const [createFlag, setCreateFlag] = React.useState(false)
    const elements = props.characters.map(value => <ListItem><CharRow char={value}/></ListItem>)
    const lastElement = createFlag ? <CharRow state={2}/> : <a onClick={handleClick}>Создать персонажа</a>
    function handleClick(e) {
        e.preventDefault()
        setCreateFlag(true)
    }
    return (
        <Wrap className="acc-char-list">
            {elements}
            {lastElement}
        </Wrap>
    )
}

function CharRow(props) {
    const [state, setState] = React.useState(props.state || 0)
    let url = "/characters"
    url = props.char ? url + "/" + props.char.id : url
    function handleClick(e, newState) {
        e.preventDefault()
        setState(newState)
    }
    console.log(props.char)
    switch (state) {
        case 0: return <ViewChar char={props.char} url={url} handleEditClick={e=>handleClick(e, 1)}/>
        case 1: return <EditChar char={props.char} url={url} handleBackClick={e=>handleClick(e, 0)}/> 
        case 2: return <CreateChar url={url} handleBackClick={e=>handleClick(e, 0)}/> 
    }
}

function ViewChar(props) {
    return (
        <Wrap class="acc-char-view">
            <ControlPanel values={["изменить"]} onClick={[props.handleEditClick]}/>
            <ViewItem item={props.char} itemName="char"/>
        </Wrap>
    )
}

function EditChar(props) {
    return (
        <Wrap>
            <ControlPanel values={["назад"]} onClick={[props.handleBackClick]}/>    
            <PutForm url={props.url}><CharForm char={props.char}/></PutForm>
        </Wrap>
    )
}

function CreateChar(props) {
    return (
        <Wrap>
            <ControlPanel values={["назад"]} onClick={[props.handleBackClick]}/>
            <PostForm url={props.url}><CharForm char={props.char}/></PostForm>
        </Wrap>
    )
}

function CharForm(props) {
    const char = props.char || {}
    return (
        <React.Fragment>
            <input type="file" name="photo_file" accept="image/*"/>
            <input type="text" name="name" value={char.name}/>
            <textarea name="about">{char.about}</textarea>
            <textarea name="excerpt">{char.excerpt}</textarea>
        </React.Fragment>
    )
}


function ViewItem(props) {
    const item = props.item || {}
    const className = `acc-${props.itemName}-view`
    return (
        <Wrap className={className}>
            {Object.entries(item).map(([key, value]) => {
                const elem = key == "photo"? <img src={IMAGE_STORAGE + value}/> : <p>{value}</p>
                return <Wrap className={className + key}>{elem}</Wrap>
            })}
        </Wrap>
    )
}

function PutForm(props) {
    return <FormComp method="PUT" url={props.url}>{props.children}</FormComp>
    
}

function PostForm(props) {
    return <FormComp method="POST" url={props.url}>{props.children}</FormComp>
    
}

function DeleteForm(props) {
    return <FormComp method="DELETE" url={props.url} submitValue="Удалить">{props.children}</FormComp>
    
}

function FormComp(props) {    
    function handleSubmit(event) {
        event.preventDefault()
        const url = getCurrentApiUrl() + props.url 
        const formData = new FormData(event.target)
        fetch(url, {
            method: props.method,
            body: formData
        })
    }
    return (
        <form onSubmit={handleSubmit}>
            {props.children}
            <input type="submit" value={props.submitValue || "Сохранить"}/>
        </form>
    )
}

function ControlPanel(props) {
    return (
        <Wrap>{props.values.map((value, index)=><a class="item-control-button" onClick={props.onClick[index]}>{value}</a>)}</Wrap>
    )
}

function ListItem(props) {
    return (
        <li>{props.children}</li>
    )
}

function TableRow(props) {
    return (
        <tr class="acc-table-row">
            {props.children.map(child => 
                <td>{child}</td>
            )}
        </tr>
    )
}

function Wrap(props) {
    let {className, children, ...restProps} = props
    className = className ? className + "-wrap" : "wrap"
    return (
        <div className={className} {...restProps}>{children}</div>
    ) 
}

function saveSectionInLocalStorage(sectionName) {
    localStorage.setItem("accSection", sectionName)
}

function getSectionFromLocalStorage() {
    return localStorage.getItem("accSection")
}

function rmSectionFromLocalStorage() {
    localStorage.removeItem("accSection")
}

function getCurrentApiUrl() {
    let {origin, pathname} = window.location
    return `${origin}/api${pathname}`  
}

ReactDOM.render(
    <Account/>,
    document.getElementById("account-data")
)