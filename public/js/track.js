var user = "cattery"
var trackIp = "127.0.0.1"
var eventTrakingOpen = true
var el = window.document.body
var activeElement = null
window.document.body.onmouseover = function(event){
    el = event.target
    var flag = availableElement(el.tagName)
    if(flag && el.contains(document.body) == false && !document.querySelector(".shallow-track-active") && !document.querySelector(".shallow-track-interface")){
        activeElement = el
        showCover(el)
    }
}


// 埋点可视化遮罩
function showCover(element){
    var width = element.offsetWidth
    var height = element.offsetHeight
    var left = getLeft(element)
    var top = getTop(element)
    createCover(width,height,left,top)

}
function getLeft(element){
    var left = element.offsetLeft
    if(element.offsetParent != null){
        left += getLeft(element.offsetParent)
    }
    return left
}
function getTop(element){
    var top = element.offsetTop
    if(element.offsetParent != null){
        top += getLeft(element.offsetParent)
    }
    return top
}


// 埋点点击的可视化界面
function createCover(width,height,left,top){
    var div = document.createElement("div")
    div.setAttribute('class','shallow-track-active')
    div.style.position = 'absolute'
    div.style.width = width + 'px'
    div.style.height = height + 'px'
    div.style.left = left + 'px'
    div.style.top = top + 'px'
    div.style.backgroundColor = 'rgba(0,238,118,0.4)'

    div.addEventListener("click",function(){
        createInterface(width,height,left,top)
    })

    div.addEventListener('mouseout',function(){
        let mouseEventElement = document.querySelector(".shallow-track-active")
        window.document.body.removeChild(mouseEventElement)
    })
    window.document.body.appendChild(div)
}

// 需要埋点的元素选择
function availableElement(tag){
    var reg = /^BUTTON|A|LI|IMG$/
    return reg.test(tag)
}

// 获取DOM节点索引
function domIndex(el){
    var elems = el.parentNode.children;
    for(var i=0;i<elems.length;i++){
        if( elems[i] == el ){
            return i;
        }
    }
}

function createInterface(width,height,left,top){
    left = left + width/2
    top = top + height
    // 界面warpper
    var interface = document.createElement("div")
    interface.setAttribute('class','shallow-track-interface')
    interface.style.width = "300px"
    interface.style.height = "200px"
    interface.style.position = "absolute"
    interface.style.left = left + "px"
    interface.style.top = top + "px"
    interface.style.backgroundColor = "white"
    interface.style.boxShadow = "0px 0px 10px grey"
    interface.style.borderRadius = "4px"
    window.document.body.appendChild(interface)

    // 增加标题
    var title = document.createElement("div")
    title.style.width = "300px"
    title.style.height = "30px"
    title.style.backgroundColor = "#e6f3f9"
    title.textContent = "创建事件"
    title.style.lineHeight = "30px"
    title.style.paddingLeft = "10px"
    title.style.boxSizing = "border-box"

    interface.appendChild(title)


    // 事件名称
    var userEvent = document.createElement("div")
    var userInput = document.createElement("input")
    userInput.className = "eventName"
    userInput.setAttribute("type","text")
    userInput.setAttribute("placeholder","输入事件名称")

    // 确定Button
    var confirmButton = document.createElement("button")
    confirmButton.innerText = "确认"
    confirmButton.addEventListener("click",function(){
        sendEvent()
        window.document.body.removeChild(interface)
    })


    //取消Button
    var cancelButton = document.createElement("button")
    cancelButton.innerText = "取消"
    cancelButton.addEventListener("click",function(){
        window.document.body.removeChild(interface)
    })


    userEvent.appendChild(userInput)
    userEvent.appendChild(confirmButton)
    userEvent.appendChild(cancelButton)
    
    interface.appendChild(userEvent)
}
document.getElementsByTagName("body")[0]
//埋点信息发送给后端
function sendEvent(){
    var name = document.querySelector('.eventName').value
    if(name == ''){
        alert("请输入事件名称")
    }
    else {
        var element = ''
        var item = activeElement
        while(item.tagName !== 'BODY' ){
            element += domIndex(item) + '>'
            item = item.parentNode
        }
        
        var opts = {
            method: "POST",
            body: JSON.stringify({"name": name, "element": element, "user": user}),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        }
        
        fetch(`http://${trackIp}:3000/createEvent/addEvent`,opts)
            .then(function(res){
                if(res.status == 200){
                    alert("埋点成功")
                }
                else{
                    alert("埋点失败")
                }
            })
            .catch(function(res){ alert("埋点失败: " + res) })

    }
}



// *************************************************************************************