
function sendMessage() {
    fetch('http://127.0.0.1:3000/users/getUserMessage',{method: "GET"})
        .then()
        .catch(function(res){ console.log(res) })
    }
sendMessage()

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}
                