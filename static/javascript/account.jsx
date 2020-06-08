const API_URL = "http://localhost:8000/api/profile"
const IMAGE_STORAGE = "/data/images/"

function Account(props) {
    const [section, setSection] = React.useState(getSection() || "account")
    const [userInfo, setUserInfo] = React.useState({})
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
        if (section == sectionName) {
            setSection("")
        }
        setTimeout(() => setSection(sectionName))
    }
    function handleNavHeight(event) {
        if (event.target.closest("a") || event.type == "load") {
            setTimeout(() => {
                let nav = document.querySelector(".acc-nav-wrap")
                let profilePanel = document.querySelector(".profile-panel")
                nav.style.height = profilePanel.scrollHeight + "px"
            }, 50)
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
        default:
            panel = <Wrap/>
    } // _ref={parentWrapRef} parent={parentWrapRef.current}
    return (
        <Wrap onLoad={handleNavHeight} onClick={handleNavHeight} className="acc"> 
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
    },
}

function CharInfoPanel(props) {
    const [response, setResponse] = React.useState(null)
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [pathName, setPathName] = React.useState("/characters")
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        handleServerInfo(pathName)
    }, [props.user.id])

    function handleServerInfo(path) {
        if (!props.user.id) return
        const url =  `${getCurrentApiUrl() + path}?user_id=${props.user.id}`
        fetch(url)
        .then(res => res.json())
        .then(
            result => {
                setResponse(result)
                setIsLoaded(true)
            })
        .catch(reason => setError(reason))
        setPathName(path)
    }

    if (error) {
        return <Wrap className="error">Произошла ошибка, невозможно получить данные с сервера!{error}</Wrap>
    } else if (!isLoaded) {
        return <Wrap className="load">Идет загрузка</Wrap>
    } else {
        return <Wrap className="profile-panel "><ItemPanel user={props.user} response={response} pathName={pathName} handleServerInfo={handleServerInfo}/></Wrap>
    }
}

function ItemPanel(props) {
    const [allElements, setAllElements] = React.useState([])
    const [details, setDetails] = React.useState(null)
    let [items, itemName] = [{}, ""]
    let elements = []
    if (props.response) {
        itemName = props.response.item
        items = props.response[itemName]
    }
    React.useEffect(() => {
        const idStart = props.idStart || 0
        elements = items.map((value, index) => {
            return <ItemRow id={idStart + index} item={value} itemName={itemName} pathName={props.pathName} handleClick={handleClick}/>
        })
        setAllElements(elements)
        setDetailsButton()
    }, [])

    React.useEffect(() => {
        const fetchPath = getFetchPath()
        if (fetchPath) {
            const sectArr = fetchPath.split("/")
            const curPathArr = props.pathName.split("/")
            const pathLen = curPathArr.length
            if (sectArr.length <= pathLen + 1) {
                rmFetchPath()
                return
            }
            const newPath = `${props.pathName}/${sectArr[pathLen]}/${sectArr[pathLen+1]}`
            const header = document.querySelector(`.acc-view[data-item-id="${sectArr[pathLen]}"]`)
            if (!header) return
            animateList(header, slowlyRaise, (elem) => slowlyHide(elem, 1000))
            .then(result => {
                props.handleServerInfo(newPath)
            })
        }
    }, [allElements])
    
    React.useEffect(() => {
        if (allElements.length) {
            const deeperItemPanel = <ItemPanel idStart={allElements.length} response={props.response} pathName={props.pathName} handleServerInfo={props.handleServerInfo}/>
            setDetails(deeperItemPanel)
        }
    }, [props.response])

    function getDetailsButton() {
        return <ItemRow state={3} itemName={itemName} pathName={props.pathName}/>
    }
    function setDetailsButton() {
        setDetails(getDetailsButton())
    }
    function slowlyRaise(clickedElem, duration) {
        const elOffsetTop = clickedElem.offsetTop
        clickedElem.addEventListener("click", handlePrevSection)
        clickedElem.style.position = "absolute"
        clickedElem.style.top = elOffsetTop + "px"
        clickedElem.style.transition = `top ${duration}ms ease-in 0s`
        clickedElem.classList.add("header")
        clickedElem.parentElement.classList.add("header")
        clickedElem.parentElement.dataset.item = itemName
        animateHeader(clickedElem, slowlyHide)
        setTimeout(() => {
            clickedElem.style.top = "0"
            window.scrollTo({
                top:0,
                behavior:"smooth",
            })
        })
    }

    function slowlyGoDown(clickedElem, duration) {
        clickedElem.classList.remove("header")
        clickedElem.parentElement.classList.remove("header")
        animateHeader(clickedElem, slowlyShow)
    }

    function animateList(clickedElem, clickedElemAnimFunc, otherElemAnimFunc) {
        const elems = clickedElem.parentElement.children
        let delay = 1000
        Array.prototype.map.call(elems, (elem) => {
            if (elem.id == clickedElem.id) clickedElemAnimFunc(clickedElem, delay)
            else otherElemAnimFunc(elem, delay)
        })
        return new Promise((resolve) => {
            setTimeout(() => {
                clickedElem.style.position = "relative"
                resolve("готово!")
            }, delay + 50)
        })
    }

    function handlePrevSection(e) {
        let itemListElems = document.querySelectorAll(".acc-item-list-wrap")
        for (let elem of itemListElems) {
            if (elem.dataset.item != itemName) {
                if (!elem.classList.contains("header"))
                    elem.hidden = true
            }
            else animateList(this, slowlyGoDown, slowlyShow)
        }
        this.removeEventListener("click", handlePrevSection)
        setDetails(null)
    }
    
    async function handleClick(e, path) {
        e.preventDefault()
        const list_item = e.target.closest(".acc-view")
        await animateList(list_item, slowlyRaise, (elem) => slowlyHide(elem, 1000))
        props.handleServerInfo(path)
    }

    return (
        <Wrap className="acc-item-list" dataid={props.id}>
            <div className="header-anchor"></div>
            {allElements}
            {details}
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
        case 0: return <ItemView id={props.id} item={item} itemName={itemName} pathName={path} handleDetailsClick={props.handleClick} handleEditClick={e=>handleClick(e, 1)}/>
        case 1: return <ItemEdit id={props.id} item={item} itemName={itemName} pathName={path} handleBackClick={e=>handleClick(e, 0)}/> 
        case 2: return <ItemCreate id={props.id} itemName={itemName} pathName={path} handleBackClick={e=>handleClick(e, 3)}/>
        case 3: return <a className="acc-create-item-button" onClick={e=>handleClick(e, 2)}>Создать</a>
    }
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
        props.handleDetailsClick(e, path)
    }
    return (
        <ItemWrap itemName={props.itemName} id={props.id} itemID={ID}>
            <ControlPanel values={["изменить"]} onClick={[props.handleEditClick]}/>
            <ViewItemProps item={date} className="item-date"/>
            <ImageWrap name={photo} className="acc-item-photo"/>
            {View}
            {[1].map(() => {
                if (compObj.next) return <a onClick={handleDetailsClick}>Детали</a>
            })}
        </ItemWrap>
    )
}
function ItemEdit(props) {
    const compObj = mainItems[props.itemName]
    const Elem = compObj && compObj.edit
    const Edit = Elem ? <Elem item={props.item} handleBackClick={props.handleBackClick}/> : "" 
    return(
        <ItemWrap itemName={props.itemName} id={props.id} data-item-id={props.item.ID}>
            <ControlPanel values={["Назад"]} onClick={[props.handleBackClick]}>
                <DeleteForm url={props.url}/>
            </ControlPanel>
            <PutForm url={props.pathName}>
                <input type="file" name="photo_file" accept="image/*"/>
                {Edit}
            </PutForm>
        </ItemWrap>
    )
}
function ItemCreate(props) {
    const compObj = mainItems[props.itemName]
    const Elem = compObj && compObj.create
    const Create = Elem ? <Elem handleBackClick={props.handleBackClick}/> : "" 
    return (
        <ItemWrap itemName={props.itemName} id={props.id}>
            <ControlPanel values={["Назад"]} onClick={[props.handleBackClick]}/>
            <PostForm url={props.pathName}>
                <input type="file" name="photo_file" accept="image/*"/>
                {Create}
            </PostForm>
        </ItemWrap>
    )
}

function ItemWrap(props) {
    return <Wrap className="acc-view " id={props.id} data-item-id={props.itemID}>{props.children}</Wrap>
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
    const [name, setName] = React.useState(chap.title || "")
    function handleChange(e) {
        setName(e.target.value)
    }
    return (
        <LabelAdder labels={["Заглавие", "Текст"]}>
            <input id="form-chap-title" type="text" name="title" value={name} onChange={handleChange}/>
            <textarea id="form-chap-text" name="text">{chap.text}</textarea>
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
        }).finally(() => {
            saveFetchPath(props.url)
            window.location.reload()
        })
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
                return (
                    <Wrap className="control-btn" onMouseDown={(e)=>e.preventDefault()}>
                        <a class="item-control-button" onClick={props.onClick[index]}>{value}</a>
                    </Wrap>
                )
            })}
            {props.children}
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

function ImageWrap(props) {
    const imgName = props.name ? props.name : "plmg_icon.jpg"
    const imgSrc = IMAGE_STORAGE + imgName
    return (
        <img className={props.className + "-wrap"} src={imgSrc}/>
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

function slowlyHide(elem, timeout=0) {
    elem.style.opacity = "0"
    setTimeout(() => elem.style.display = "none", timeout)
}

function slowlyShow(elem, timeout=0) {
    elem.style.opacity = "1"
    setTimeout(() => elem.style.display = "", timeout)
}

function animateHeader(clickedElem, hideOrShowFunc) {
    for (let content of clickedElem.children) {
        if (content.classList.contains("acc-item-photo-wrap")) {
            content.classList.toggle("img-header")
            if (content.classList.contains("img-header")) 
                content.style.width = Math.floor(clickedElem.parentElement.getBoundingClientRect().width) - (30 + clickedElem.clientLeft * 2) + "px"
            else content.style.width = "250px"
            continue
        }
        if (/.*content-wrap/.test(content.className)) {
            for (let child of content.children) {
                if (/.*(name-wrap)|(title-wrap)/.test(child.className)) {
                    child.classList.toggle("name-in-img")
                    child.style.width = child.clientWidth + "px"
                    continue
                }
                hideOrShowFunc(child)
            }
            continue

        }
        hideOrShowFunc(content)
    }
}


function saveSection(sectionName, extra) {
    sessionStorage.setItem("section", JSON.stringify({"section": sectionName, "href": window.location.href, ...extra}))
}
function getSection() {
    const acc = JSON.parse(sessionStorage.getItem("section"))
    return acc && acc.section
}

function saveFetchPath(subSection) {
    sessionStorage.setItem("fetchPath", JSON.stringify(subSection))
}

function getFetchPath() {
    return JSON.parse(sessionStorage.getItem("fetchPath"))
}

function rmFetchPath() {
    sessionStorage.removeItem("fetchPath")
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