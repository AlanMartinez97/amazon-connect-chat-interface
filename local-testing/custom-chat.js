var contactFlowId = "5fbedcfe-9075-4681-87a4-8dc68131e2f4"; // TODO: Fill in
var instanceId = "820befb7-ea0f-4a41-b25c-27cd69311613"; // TODO: Fill in
var apiGatewayEndpoint = "https://7ikhq85r0f.execute-api.us-east-1.amazonaws.com/Prod/"; // TODO: Fill in with the API Gateway endpoint created by your CloudFormation template
var region = "us-east-1"; // TODO: Fill in

(function () {
    setChatSection()

    initializeButton()

    setTimeout(() => {
        connect.ChatInterface.init({
            containerId: 'root', // This is the id of the container where you want the widget to reside
            iconSrc: "https://amcham.com.ar/wp-content/uploads/2022/04/logo-institucional-web.jpg",
            closerElementId: "section-main",
            headerBackgroundColor: "#1D2583",
            chatWidth: "25vw",
            customPlaceHolder: "Escriba su mensaje"
        });
    }, "500")
})();

function setChatSection() {
    let mainDiv = document.createElement("div")
    mainDiv.id = "root"
    mainDiv.classList.add("fab-container")

    let section = document.createElement("section")
    section.id = "section-chat"
    section.classList.add("section-chat")
    section.style = "float: right; width: 50%; transition: opacity 1s; opacity: 0;"

    section.appendChild(mainDiv)

    document.body.appendChild(section)
}

function initializeChat() {
    connect.ChatInterface.initiateChat({
        name: "The client",
        region,
        apiGatewayEndpoint,
        featurePermissions: {
            "ATTACHMENTS": false,  // this is the override flag from user for attachments
        },
        supportedMessagingContentTypes: "text/plain", // enable rich messaging
        contactFlowId,
        instanceId
    },successHandler, failureHandler);
}

function successHandler(chatSession) {
    console.log("success!");
    document.getElementById('section-chat').style.opacity = 1;

    chatSession.onChatDisconnected(function(data) {
        document.getElementById('section-chat').style.opacity = 0;
    });
}

function failureHandler(error) {
    console.log("There was an error: ");
    console.log(error);
}

function initializeButton(){
    let fb = getFloatingButton()
    fb.onclick = () => initializeChat()

    setStyles()

    document.getElementsByTagName('body')[0].appendChild(fb)
}

function getFloatingButton(){
    let parentDiv = document.createElement("div")
    parentDiv.id = "chat-init-button"
    parentDiv.classList.add("fab-container")

    let childDiv = document.createElement("div")
    childDiv.classList.add("button", "iconbutton")

    let icon = document.createElement("i")
    icon.classList.add("fa-regular", "fa-comment")

    childDiv.appendChild(icon)
    parentDiv.appendChild(childDiv)

    return parentDiv
}

function setStyles(){
    let styles = ".fab-container{" +
                    "position:fixed;"+
                    "bottom:50px;" +
                    "right:50px;" +
                    "cursor:pointer;" +
                    "}"
    setStyle(styles)

    styles = " .iconbutton{" +
                "width:50px;" +
                "height:50px;" +
                "border-radius: 100%;" +
                "background: #FF4F79;" +
                "box-shadow: 10px 10px 5px #aaaaaa;" +
                "}"
    setStyle(styles)
                
    styles = " .button{" +
                "width:60px;" +
                "height:60px;" +
                "background:#1D2583;" +
                "}"

    setStyle(styles)

    styles = " .iconbutton i{" +
                "display:flex;" +
                "align-items:center;" +
                "justify-content:center;" +
                "height: 100%;" +
                "color:white;" +
                "font-size:25px;" +
                "}"
    setStyle(styles)

    setFontAwesome()
}

function setFontAwesome() {
    let link = document.createElement("link")
    link.setAttribute("rel", "stylesheet")
    link.setAttribute("href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css")

    document.head.appendChild(link)
}

function setStyle(css){
    let styleElem = document.createElement("style")
    styleElem.type = "text/css"

    styleElem.innerHTML = css

    document.querySelector("head").appendChild(styleElem)
} 