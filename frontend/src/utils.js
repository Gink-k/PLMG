import React from "react"

export const IMAGE_STORAGE = "/data/images/"

export function Wrap(props) {
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

export function getCurrentApiUrl() {
    let {origin} = window.location
    return `${origin}/api`  
}

export function formatDate(date) {
    const reqDate = new Date(date)
    const now = new Date()
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

// function updateQueryStringParameter(uri, key, value) {
//     uri = uri || window.location.href
//     let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
//     let separator = uri.indexOf('?') !== -1 ? "&" : "?";
//     if (uri.match(re)) {
//       return uri.replace(re, '$1' + key + "=" + value + '$2');
//     }
//     else {
//       return uri + separator + key + "=" + value;
//     }
// }