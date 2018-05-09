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
  

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get("/1",function(req,res,next){
  db.query("select * from user",function(err,result){
      if(err){
          console.log(err.message)
      }else {
          res.send(result)
      }
  });
});

// 用于创建用户命名网站的表和js埋点文件
router.post("/createUser",function(req,res,next){
    var user = req.body.webName
    var operator = req.body.operator
    var re = {}
    //查询表是否存在
    db.query(`SELECT userName from user where userName="${user}"`, function(err,result){
        if(err){console.log(err)}
        else{
            if(result.length !== 0){
                re.status = 2
                res.send(re)
            }
            else{
                /******************************************* */
                //创建表
                db.query(`CREATE TABLE ${user}(eventName varchar(30),day varchar(30),click int)`, function(err,result){
                    if(err){
                        console.log(err)
                        re.status = 0
                        res.send(re)
                    }
                    else{
                        db.query(`insert into user(uid,userName,operator) values (null,"${user}","${operator}")`, function(err,result){
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
                //获取几天日期
                var data = ""
                data = `
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

router.post("/checkUser",function(req,res,next){
    console.log(req.ip)
    var user = req.body.user
    var re = {}
    db.query(`Select * from user where userName = "${user}"`,function(err,result){
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


module.exports = router;
