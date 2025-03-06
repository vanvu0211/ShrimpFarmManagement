import "./Loading.css"

function Loading({ showText = true }) {
    return (
        // <div className="fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">

        <div className="fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-100%]">
            <div className="spin"></div>
            {showText && <h1>Loading...</h1>}
        </div>
        // </div>
    )
}

export default Loading
