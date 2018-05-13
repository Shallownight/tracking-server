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
  
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

function getNowTime() {
    var date = new Date();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var time = hour + ':' + minute;
    return time;
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get("/getUser",function(req,res,next){
    db.query(`SELECT * from _user`, function(err,result){
        if(err){
            console.log(err)
        }
        else{
            res.send(result)
        }
    })
})

// 用于创建用户命名网站的表和js埋点文件
router.post("/createUser",function(req,res,next){
    var user = req.body.webName
    var eventTable = user + '_event'
    var visitTable = user + '_visit'
    var time = getNowFormatDate()
    var operator = req.body.operator
    var re = {}
    //查询表是否存在
    db.query(`SELECT userName from _user where userName="${user}"`, function(err,result){
        if(err){
            console.log(err)
        }
        else{
            if(result.length !== 0){
                re.status = 2
                res.send(re)
            }
            else{
                /******************************************* */
                //创建事件表
                db.query(`CREATE TABLE ${eventTable}(eventName varchar(30),day varchar(30),click int)`, function(err,result){
                    if(err){
                        console.log(err)
                        re.status = 0
                        res.send(re)
                    }
                    else{
                        //创建浏览表
                        db.query(`CREATE TABLE ${visitTable}(
                            ip varchar(20),
                            firstDate varchar(20),
                            lastDate varchar(20),
                            time varchar(15),
                            userVisit int(8),
                            pageVisit int(8)
                        )`, function(err,result){
                            if(err){
                                console.log(err)
                                re.status = 0
                                res.send(re)
                            }
                            else{
                                //向_user总表插入新站点数据
                                db.query(`insert into _user(userName,operator,time) values ("${user}","${operator}","${time}")`, function(err,result){
                                    if(err){
                                        console.log(err)
                                        re.status = 0
                                        res.send(re)
                                    }
                                    else{
                                        console.log("数据库操作成功")
                                    }
                                })
                            }
                        })
                    }
                })
                //提交浏览者信息，获取今日日期
                var data = ""
                data = `
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
                `
                //创建埋点js
                fs.writeFile('./public/js/' + user + '.js', data, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log("创建成功！");     
                    re.status = 1
                    res.send(re)
                });
                /******************************************* */
            }
        }
    })
})

//检测是否含有该用户
router.post("/checkUser",function(req,res,next){
    var user = req.body.user
    var re = {}
    db.query(`Select * from _user where userName = "${user}"`,function(err,result){
		if(err){
			console.log(err)
		}
		else{
			if(result.length == 0){
                re.status = 0
                res.send(re)
            }
            else {
                re.status = 1
                res.send(re)
            }
        }
    })
})

//获取访问者信息
router.get("/getUserMessage",function(req,res,next){
    var ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
    var date = getNowFormatDate();
    var time = getNowTime();
    // db.query("select * from user",function(err,result){
    //     if(err){
    //         console.log(err.message)
    //     }else {
    //         res.send(result)
    //     }
    // });
    var req = {
      "ip": ip,
      "date": date,
      "time": time
    };
    console.log(req)
    res.send("ok")
  });

module.exports = router;
