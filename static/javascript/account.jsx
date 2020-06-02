const API_URL = "http://localhost:8000/api/profile"
const IMAGE_STORAGE = "/data/images/"

function Account(props) {
    const [section, setSection] = React.useState(getSection() || "account")
    const [userInfo, setUserInfo] = React.useState({})
    const [wrapHeight, setWrapHeight] = React.useState("")
    const parentWrapRef = React.useRef()
    React.useEffect(() => {
        let acc = getUserInfo()
        setUserInfo(acc)
    }, [])
    React.useEffect(() => {
        saveSection(section)
    }, [section])
    function getUserInfo() {
        return document.querySelector('#account-data').dataset
    }
    function handleNavClick(e, sectionName) {
        setSection(sectionName)
    }
    function handleNavHeight(event) {
        if (event.target.closest(".item-control-button")) {
            const height = wrapHeight + "px"
            let nav = document.querySelector(".acc-nav-wrap")
            nav.style.height = height
            parentWrapRef.current.height = height
        } else if (event.target.closest(".acc-create-char-button")) {
            const oldParentHeight = parentWrapRef.current.scrollHeight.toString()
            setWrapHeight(oldParentHeight)
            setTimeout(() => {
                const parentHeight = parentWrapRef.current.scrollHeight.toString()
                let nav = document.querySelector(".acc-nav-wrap")
                nav.style.height = parentHeight + "px"
            }, 10)
        }
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
    } // _ref={parentWrapRef} parent={parentWrapRef.current}
    return (
        <Wrap _ref={parentWrapRef} onClick={handleNavHeight} className="acc"> 
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
        else setState("active")
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
            <Wrap className={"date-line-wrap " + className + "-createdat"}>
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
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [pathName, setPathName] = React.useState("/characters")
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        if (!props.user.id) return
        const url =  `${getCurrentApiUrl() + pathName}?user_id=${props.user.id}`
        fetch(url)
        .then(res => res.json())
        .then(
            result => {
                setResponse(result)
                setIsLoaded(true)
            })
        .catch(reason => setError(reason))
    }, [pathName, props.user])

    if (error) {
        return <Wrap className="error">Произошла ошибка, невозможно получить данные с сервера!{error}</Wrap>
    } else if (!isLoaded) {
        return <Wrap className="load">Идет загрузка</Wrap>
    } else {
        return <Wrap className="profile-panel "><ItemPanel user={props.user} response={response} pathName={pathName} handleClick={(e, path)=>setPathName(path)}/></Wrap>
    }
}

function ItemPanel(props) {
    const [header, setHeader] = React.useState(null)
    let [items, itemName] = [{}, ""]
    let elements = []
    if (props.response) {
        itemName = props.response.item
        items = props.response[itemName]
        console.log(props.response)
        //items = items[itemName]
    }

    function handleClick(e, path) {
        e.preventDefault()
        const list_item = e.target.closest(".acc-view")
        const id = list_item && +list_item.id
        setHeader(elements[id])
        props.handleClick(e, path)
    }
    elements = items.map((value, index) => {return <ItemRow id={index} item={value} itemName={itemName} pathName={props.pathName} handleCLick={handleClick}/>})
    
    return (
        <Wrap className="acc-item-list">
            {header}
            {elements}
            <ItemRow state={3} itemName={itemName} pathName={props.pathName}/>
        </Wrap>
    )
}

function ItemRow(props) {
    const [state, setState] = React.useState(props.state || 0)
    const {item, itemName} = props
    const path = item ? props.pathName + "/" + item.ID : props.pathName
    function handleClick(e, newState) {
        e.preventDefault()
        setState(newState)
    }

    switch (state) {
        case 0: return <ItemView id={props.id} item={item} itemName={itemName} pathName={path} handleDetailsClick={props.handleCLick} handleEditClick={e=>handleClick(e, 1)}/>
        case 1: return <ItemEdit id={props.id} item={item} itemName={itemName} pathName={path} handleBackClick={e=>handleClick(e, 0)}/> 
        case 2: return <ItemCreate id={props.id} itemName={itemName} pathName={path} handleBackClick={e=>handleClick(e, 3)}/>
        case 3: return <a className="acc-create-item-button" onClick={e=>handleClick(e, 2)}>Создать</a>
    }
}

const mainItems = {
    "characters" : {
        "view": ViewChar,
        "edit": CharForm,
        "create": CharForm,
        "next": "histories",
    },
    "histories" : {
        "view": ViewHist,
        "edit": HistForm,
        "create": HistForm,
        "next": "chapters",
    },
    "chapters" : {
        "view": ViewChap,
        "edit": ChapForm,
        "create": ChapForm,
        "next": "characters",
    },
}

function ItemView(props) {
    const {CreatedAt, UpdatedAt, DeletedAt, photo, ...content} = props.item
    const {ID, UserID, HistoryID, CharacterID, ...textContent} = content
    const date = {CreatedAt, UpdatedAt}
    const compObj = mainItems[props.itemName]
    const Elem = compObj && compObj.view
    const View = Elem ? <Elem textContent={textContent}/> : ""
    function handleDetailsClick(e) {
        if (!compObj) return
        const path = `${props.pathName}/${compObj.next}`
        console.log(path)
        props.handleDetailsClick(e, path)
    }
    return (
        <Wrap class="acc-view" id={props.id}>
            <ControlPanel values={["изменить"]} onClick={[props.handleEditClick]}/>
            <ViewItemProps item={date} className="item-date"/>
            <ImageWrap name={photo} className="acc-item-photo"/>
            {View}
            <a onClick={handleDetailsClick}>Детали</a>
        </Wrap>
    )
}
function ItemEdit(props) {
    const compObj = mainItems[props.itemName]
    const Elem = compObj && compObj.edit
    const Edit = Elem ? <Elem item={props.item} handleBackClick={props.handleBackClick}/> : "" 
    return(
        <Wrap class="acc-view" id={props.id}>
            <ControlPanel values={["Назад"]} onClick={[props.handleBackClick]}>
                <DeleteForm url={props.url}/>
            </ControlPanel>
            <PutForm url={props.pathName}>
                <input type="file" name="photo_file" accept="image/*"/>
                {Edit}
            </PutForm>
        </Wrap>
    )
}
function ItemCreate(props) {
    console.log(props.itemName)
    const compObj = mainItems[props.itemName]
    const Elem = compObj && compObj.create
    const Create = Elem ? <Elem handleBackClick={props.handleBackClick}/> : "" 
    return (
        <Wrap class="acc-view" id={props.id}>
            <ControlPanel values={["Назад"]} onClick={[props.handleBackClick]}/>
            <PostForm url={props.pathName}>
                <input type="file" name="photo_file" accept="image/*"/>
                {Create}
            </PostForm>
        </Wrap>
    )
}

function ViewChar(props) {
    return <ViewItemProps item={props.textContent} titles={{"about": "Обо мне", "excerpt": "Отрывок", "name": "Имя"}} className="char-content"/>
}

function CharForm(props) {
    const char = props.item || {}
    const [name, setName] = React.useState(char.name || "")
    function handleChange(e) {
        setName(e.target.value)
    }
    return (
        <LabelAdder labels={["Имя", "Обо мне", "Отрывок"]}>
                <input id="form-char-name" type="text" name="name" value={name} onChange={handleChange}/>   
                <textarea id="form-char-about" name="about">{char.about}</textarea>
                <textarea id="form-char-excerpt" name="excerpt">{char.excerpt}</textarea>
        </LabelAdder>
    )
}

function ViewHist(props) {
    return <ViewItemProps item={props.textContent} titles={{"title": "Заглавие"}} className="hist-content"/>
}

function HistForm(props) {
    const hist = props.item || {}
    const [name, setName] = React.useState(hist.title || "")
    function handleChange(e) {
        setName(e.target.value)
    }
    return (
        <ComponentsWrapper>
            <label for="form-hist-name">Заглавие:</label>
            <input id="form-hist-name" type="text" name="title" value={name} onChange={handleChange}/>
        </ComponentsWrapper>
    )
}
function ViewChap(props) {
    return <ViewItemProps item={props.textContent} titles={{"text": "Текст", "title": "Заглавие"}} className="chap-content"/>
}

function ChapForm(props) {
    const chap = props.item || {}
    const [name, setName] = React.useState(chap.name || "")
    function handleChange(e) {
        setName(e.target.value)
    }
    return (
        <LabelAdder labels={["Заглавие", "Текст"]}>
            <input id="form-chap-title" type="text" name="name" value={name} onChange={handleChange}/>
            <textarea id="form-chap-text" name="excerpt">{char.excerpt}</textarea>
        </LabelAdder>
    )
}

function ViewItemProps(props) {
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

function PutForm(props) {
    return <FormComp method="PUT" url={props.url} onSubmit={props.onSubmit}>{props.children}</FormComp>
    
}

function PostForm(props) {
    return <FormComp method="POST" url={props.url} onSubmit={props.onSubmit}>{props.children}</FormComp>
}

function DeleteForm(props) {
    return (
        <FormComp method="DELETE" url={props.url} onSubmit={props.onSubmit} submitValue="Удалить" className="control-btn-wrap" submitClass="item-control-button">
            {props.children}
        </FormComp>
    )
}

function FormComp(props) {
    const className = props.className ? props.className + " acc-form" : "acc-form"
    function handleSubmit(event) {
        typeof props.onSubmit == "function" && props.onSubmit(event)
        const url = getCurrentApiUrl() + props.url 
        const formData = new FormData(event.target)
        event.preventDefault()
        fetch(url, {
            method: props.method,
            body: formData
        })//.finally(() => window.location.reload())
    }
    return (
        <form className={className} onSubmit={handleSubmit}>
            <input type="hidden" name="user_id" value={getUserID()}/>
            {props.children}
            <input type="submit" className={props.submitClass || ""} value={props.submitValue || "Сохранить"}/>
        </form>
    )
}

function ControlPanel(props) {
    return (
        <Wrap className="acc-control-panel">
            {props.values.map((value, index)=>{
                return (<Wrap className="control-btn">
                    <a class="item-control-button" onClick={props.onClick[index]}>{value}</a>
                </Wrap>)
            })}
            {props.children}
        </Wrap>
    )
}

function ListItem(props) {
    const {children, ...rest} = props
    return (
        <li {...rest}>{children}</li>
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
    let {className, children, _ref, ...restProps} = props
    className = className ? className + "-wrap" : "wrap"
    return (
        <div className={className} ref={_ref} {...restProps}>{children}</div>
    ) 
}

function ImageWrap(props) {
    const imgName = props.name ? props.name : "plmg_icon.jpg"
    return (
        <Wrap className={props.className}>
            <img src={`/data/images/${imgName}`}/>    
        </Wrap>
    )
}

function ComponentsWrapper(props) {
    const comps = props.children.map(value => {
        return <Wrap className={props.className}>{value}</Wrap>
    })
    return comps
}

function LabelAdder(props) {
    const comps = props.children.map((value, index) => {
        return <label for={value.id}>{props.labels[index]}{value}</label>
    })
    return comps
}

function saveSection(sectionName) {
    sessionStorage.setItem("section", JSON.stringify({"section": sectionName, "href": window.location.href}))
}

function getSection() {
    let acc = JSON.parse(sessionStorage.getItem("section"))
    return acc && acc.section
}

function getCurrentApiUrl() {
    let {origin} = window.location
    return `${origin}/api`  
}

function getUserID() {
    const path = window.location.pathname
    return path.slice(path.lastIndexOf("/") + 1)
}

function updateQueryStringParameter(uri, key, value) {
    uri = uri || window.location.href
    let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    let separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
      return uri + separator + key + "=" + value;
    }
} 

ReactDOM.render(
    <Account/>,
    document.getElementById("account-data")
)