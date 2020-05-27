function Comment(props) {
    return (
        <Wrap className="comment">
            <Wrap style={{"backgroundColor": "red"}}>
                <img>eeeeeeeeee</img>
            </Wrap>
            <Wrap>
                <p></p>
                <p></p>
            </Wrap>
            <Wrap>
                <p></p>
            </Wrap>
        </Wrap>
    )
}

function Wrap(props) {
    const [className, children, ...restProps] = props
    className += "-wrap"
    return (
        <div className={className} {...restProps}>{children}</div>
    ) 
}



ReactDOM.render(
    <App/>,
    document.getElementById("root")
)