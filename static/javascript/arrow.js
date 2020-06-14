
window.addEventListener("load", () => {
    let scrollArrow = document.querySelector(".scroll-arrow")
    scrollArrow.onmousedown = (e) => {e.preventDefault()}
    scrollArrow.onclick = onClickArrow
})

window.addEventListener("scroll", () => {
    let scrollArrow = document.querySelector(".scroll-arrow")
    handleArrowState(scrollArrow)
})

function onClickArrow(event) { 
    const commentsSection = document.querySelector("#comments-section")
    if (event.target.classList.contains("rotate180")) {
        window.scrollTo({
            top:0,
            behavior:"smooth",})
    } else {
        commentsSection.scrollIntoView({behavior:"smooth"})
    }
}

function handleArrowState(arrow) {
    const yOffset = window.pageYOffset
    const scrollHeight = getScrollHeight()
    if (yOffset > scrollHeight / 1.5 && !arrow.classList.contains("rotate180")) {
        arrow.classList.add("rotate180")
    }
    if (yOffset < scrollHeight / 5  && arrow.classList.contains("rotate180")) {
        arrow.classList.remove("rotate180")
    }
}

function getScrollHeight() {
    return Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
}