window.addEventListener("load", () => {
    let locations = document.querySelectorAll('input[name="location"]');
    let href = window.location.href
    for (let loc of locations) {
        switch (loc.value) {
            case ".": loc.value = href
                break
            case "..": loc.value = href.slice(0, href.lastIndexOf("/")) 
                break
        }
    }
})

window.addEventListener("click", (event) => {
    let login_form = this.document.querySelector('#login-form-container');
    if (event.target.closest('#login-btn-wrap')) {
        login_form.style.display = 'block'
    } else if (!event.target.closest('#login-form-container') && login_form) {
        login_form.style.display = 'none'
    }
})

window.addEventListener("load", () => {
    let aTags = document.querySelectorAll("a");
    let controlBtns = document.querySelectorAll(".control-btn-wrap");
    for (let a of [...aTags, ...controlBtns]) {
        a.addEventListener("mousedown", () => {return false})
    }
})

window.addEventListener("load", () => {
    let itemName = "section"
    let sec = JSON.parse(sessionStorage.getItem(itemName)) || {}
    if (sec.href !== window.location.href) sessionStorage.removeItem(itemName)
})