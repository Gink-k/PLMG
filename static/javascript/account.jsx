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
        return <Wrap className="profile-panel acc-char-info-panel"><CharPanel user={props.user} characters={response.characters}/></Wrap>
    }
}

function CharPanel(props) {
    const [createFlag, setCreateFlag] = React.useState(false)
    const elements = props.characters.map(value => <ListItem key={value.ID}><CharRow char={value}/></ListItem>)
    return (
        <Wrap className="acc-char-list">
            <ul>{elements}</ul>
            <CharRow state={3}/>
        </Wrap>
    )
}

function CharRow(props) {
    const [state, setState] = React.useState(props.state || 0)
    const char = props.char
    let url = "/characters"
    url = char ? url + "/" + char.ID : url
    function handleClick(e, newState) {
        e.preventDefault()
        setState(newState)
    }

    switch (state) {
        case 0: return <ViewChar char={char} url={url} handleEditClick={e=>handleClick(e, 1)}/>
        case 1: return <EditChar char={char} url={url} handleBackClick={e=>handleClick(e, 0)}/> 
        case 2: return <CreateChar url={url} handleBackClick={e=>handleClick(e, 3)}/>
        case 3: return <a className="acc-create-char-button" onClick={e=>handleClick(e, 2)}>Создать персонажа</a>
    }
}

function ViewChar(props) {
    const {CreatedAt, UpdatedAt, DeletedAt, ID, UserID, photo, ...textContent} = props.char
    const date = {CreatedAt, UpdatedAt} // titles={{"CreatedAt": "Дата создания", "UpdatedAt": "Дата обновления"}}
    return (
        <Wrap class="acc-char-view">
            <ControlPanel values={["изменить"]} onClick={[props.handleEditClick]}/>
            <ViewItem item={date} className="char-date"/>
            <ImageWrap name={photo} className="acc-char-photo"/>
            <ViewItem item={textContent} titles={{"about": "Обо мне", "excerpt": "Отрывок", "name": "Имя"}} className="char-content"/>
        </Wrap>
    )
}

function EditChar(props) {
    return (
        <Wrap>
            <ControlPanel values={["назад"]} onClick={[props.handleBackClick]}/>
            <DeleteForm url={props.url}/>    
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
        <ComponentsWrapper>
            <input type="file" name="photo_file" accept="image/*"/>
            <label for="form-char-name">Имя</label>
            <input id="form-char-name" type="text" name="name" value={char.name} title="Имя"/>
            <label for="form-char-about">Обо мне</label>
            <textarea id="form-char-about" name="about" title="Обо мне">{char.about}</textarea>
            <label for="form-char-excerpt">Отрывок</label>
            <textarea id="form-char-excerpt" name="excerpt" title="Отрывок">{char.excerpt}</textarea>
        </ComponentsWrapper>
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

function PutForm(props) {
    return <FormComp method="PUT" url={props.url} onSubmit={props.onSubmit}>{props.children}</FormComp>
    
}

function PostForm(props) {
    return <FormComp method="POST" url={props.url} onSubmit={props.onSubmit}>{props.children}</FormComp>
}

function DeleteForm(props) {
    return <FormComp method="DELETE" url={props.url} onSubmit={props.onSubmit} submitValue="Удалить">{props.children}</FormComp>
    
}

function FormComp(props) {    
    function handleSubmit(event) {
        typeof props.onSubmit == "function" && props.onSubmit(event)
        const url = getCurrentApiUrl() + props.url 
        const formData = new FormData(event.target)
        fetch(url, {
            method: props.method,
            body: formData
        }).finally(() => window.location.reload(true))
    }
    return (
        <form className="acc-form" onSubmit={handleSubmit}>
            {props.children}
            <input type="submit" value={props.submitValue || "Сохранить"}/>
        </form>
    )
}

function ControlPanel(props) {
    return (
        <Wrap className="control-btn">{props.values.map((value, index)=><a class="item-control-button" onClick={props.onClick[index]}>{value}</a>)}</Wrap>
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
    let {className, children, _ref, ...restProps} = props
    className = className ? className + "-wrap" : "wrap"
    return (
        <div className={className} ref={_ref} {...restProps}>{children}</div>
    ) 
}

function ImageWrap(props) {
    return (
        <Wrap className={props.className}>
            <img src={`/data/images/${props.name}`}/>    
        </Wrap>
    )
}

function ComponentsWrapper(props) {
    const comps = props.children.map(value => {
        return <Wrap className={props.className}>{value}</Wrap>
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

function getItemFromLocalStorage(itemName) {
    return JSON.parse(sessionStorage.getItem(itemName))
}

function getCurrentApiUrl() {
    let {origin, pathname} = window.location
    return `${origin}/api${pathname}`  
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

function useClientRect() {
    const [rect, setRect] = React.useState(null);
    const ref = React.useCallback(node => {
      if (node !== null) {
        setRect(node);
      }
    }, []);
    return [rect, ref];
  }
  

ReactDOM.render(
    <Account/>,
    document.getElementById("account-data")
)