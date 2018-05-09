var express = require('express');
var router = express.Router();
var fs= require('fs');  

var db = require("../config/db");

router.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials','true');
  next();
});

router.post('/addEvent', function(req, res) {
  console.log(req.body)
  var name = req.body.name
  var element = req.body.element
  var user = req.body.user
  db.query("insert into event(user,eventName,element) values ('"+ user +"','"+ name +"','"+ element +"')", function(err,result){
    if(err) {
      console.log(err)
      res.send(err)
    }
    else{

      // 层级转换
      var eleArr = element.split(">").reverse();
      var eleStr = ''
      for(var i=1; i<eleArr.length;i++){
        eleStr += '.children[' + eleArr[i] + ']'
      }

      var data = ''
      //写入用户命名JS埋点文件中，用于实现埋点
      data = `

document.getElementsByTagName("body")[0]${eleStr}.addEventListener("click",function(){
  var day = getNowFormatDate()
  var opts = {
    method: "POST",
    body: JSON.stringify({"user":"${user}","eventName": "${name}","day":day}),
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    },
  }
  fetch('http://127.0.0.1:3000/event/click',opts)
    .then()
    .catch(function(res){ console.log(res) })

})\n`

      fs.writeFile( './public/js/' + user + '.js' , data, {flag:'a',encoding:'utf-8'}, function(err) {
        if (err) {
            return console.error(err);
        }
      });

      console.log("is ok")
    }
  })
  res.send('respond with a resource');
});



module.exports = router;