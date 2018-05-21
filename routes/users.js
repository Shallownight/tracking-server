var express = require('express');
var router = express.Router();
var fs= require('fs');  
var parser = require('ua-parser-js');

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
    var plantformTable = user + '_plantform'
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
                                db.query(`CREATE TABLE ${plantformTable}(
                                    type varchar(20),
                                    name varchar(20),
                                    visit varchar(10)
                                )`, function(err,result){
                                    if(err){
                                        console.log(err)
                                    }
                                })
                                //向_user总表插入新站点数据
                                db.query(`insert into _user(userName,operator,time) values ("${user}","${operator}","${time}")`, function(err,result){
                                    if(err){
                                        console.log(err)
                                        re.status = 0
                                        res.send(re)
                                    }
                                    else{
                                        re.status = 1
                                        console.log("数据库操作成功")
                                        res.send(re)
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
    fetch('http://127.0.0.1:3000/users/getUserMessage',{
        method: "POST",
        body: JSON.stringify({"user":"${user}"}),
        headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        })
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
                    console.log("埋点Js文件创建成功！");     
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
            res.end(err)
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

router.post("/deleteUser",function(req,res,next){
    var user = req.body.user
    var eventTable = req.body.user + "_event"
    var plantformTable = req.body.user + "_plantform"
    var visitTable = req.body.user + "_visit"
    db.query(`drop table if exists ${eventTable}`,function(err,result){
        if(err){
            console.log(err)
            res.end(err)
        }
    })
    db.query(`drop table if exists ${plantformTable}`,function(err,result){
        if(err){
            console.log(err)
            res.end(err)
        }
    })
    db.query(`drop table if exists ${visitTable}`,function(err,result){
        if(err){
            console.log(err)
            res.end(err)
        }
    })
    fs.unlink('./public/js/' + user + '.js',function(err){
        if(err) {
            console.log(err)
        }
    })
    db.query(`delete from _user where userName = "${user}"`,function(err,result){
        if(err){
            console.log(err)
            res.end(err)
        }
        else{
            db.query(`delete from _event where user = "${user}"`,function(err,result){
                if(err){
                    console.log(err)
                    res.end(err)
                }
                else{
                    res.send("OK")
                }
            })
        }
    })
    
})

//获取访问者信息
router.post("/getUserMessage",function(req,res,next){
    var userVisit = req.body.user + '_visit'
    var ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
    var date = getNowFormatDate();
    var time = getNowTime();
    var ua = parser(req.headers['user-agent']);
    // db.query("select * from user",function(err,result){
    //     if(err){
    //         console.log(err.message)
    //     }else {
    //         res.send(result)
    //     }
    // });
    var message = {
      "ip": ip,
      "date": date,
      "time": time
    };

    //Browser Engine OS Device
    //获取平台信息
    platformMessage(req.body.user,ua)
    
    db.query(`Select * from ${userVisit} where ip = "${message.ip}"`,function(err,result){
        if(err){
            console.log(err)
            res.end(err)
        }
        // 初次浏览时
        else if(result.length == 0){
            db.query(`insert into ${userVisit}(ip,firstDate,lastDate,time,userVisit,pageVisit) values ("${message.ip}","${message.date}","${message.date}","${message.time}",1,1)`,function(err,result){
               if(err){res.end(err)}
               else{res.send("ok")}
            })
        }
        else if(result.length !== 0){
            //判断上次浏览日期，如果是今天则PV+1，如果不是则UV和PV都+1
            db.query(`Select lastDate from ${userVisit} where ip = "${message.ip}"`,function(err,result){
                if(err){res.end(err)}
                else{
                    if(result[0].lastDate == message.date){
                        db.query(`UPDATE ${userVisit} SET pageVisit = pageVisit + 1,time = "${message.time}" where ip= "${message.ip}" `,function(err,result){
                            if(err){console.log(err);res.end(err)}
                            else{res.send("OK")}
                        })
                    }
                    else{
                        // PV + 1
                        db.query(`update ${userVisit} set pageVisit=pageVisit + 1,userVisit=userVisit + 1,lastDate="${message.date}",time = "${message.time}" where ip="${message.ip}" `,function(err,result){
                            if(err){res.end(err)}
                            else{
                                // 更新日期
                                // db.query(`update ${userVisit} set lastDate="${message.date}",time = "${message.time}" where ip="${message.ip}" `,function(err,result){
                                //     res.send("ok")
                                // })
                                res.send("OK")
                            }
                        })
                    }
                }
            })
        }
    })

  });

  function platformMessage(user,ua) {
    var table = user + '_plantform'
    var browser = ua.browser.name
    var os = ua.os.name + ua.os.version
    if(browser !== ""){
        
        db.query(`select * from ${table} where type = "browser" and name = "${browser}"`,function(err,result){
            if(err){
                console.log(err)
            }
            else{
                console.log(result.length)
                if(result.length == 0){
                    db.query(`insert into ${table}(type,name,visit) values ("browser","${browser}",1)`,function(err,result){
                        if(err){ console.log(err)}
                    })
                }
                else {
                    db.query(`update ${table} set visit = visit + 1 where type = "browser" and name = "${browser}"`,function(err,result){
                        if(err){  console.log(err)  }
                    })
                }
            }
        })
        
    }
    if(os !== ""){
        db.query(`select * from ${table} where type = "os" and name = "${os}"`,function(err,result){
            if(err){
                console.log(err)
            }
            else{
                if(result.length == 0){
                    db.query(`insert into ${table}(type,name,visit) values ("os","${os}",1)`,function(err,result){
                        if(err){ console.log(err)}
                    })
                }
                else{
                    db.query(`update ${table} set visit = visit + 1 where type = "os" and name = "${os}"`,function(err,result){
                        if(err){  console.log(err)  }
                    })
                }
            }
        })
        
    }
  }

  router.post("/getIP",function(req,res,next){
      var userVisit = req.body.user + "_visit"
      db.query(`Select * from ${userVisit}`,function(err,result){
        if(err){
            console.log(err)
            res.end(err)
        }
        else{
            res.send(result)
        }
      })
  })

  router.post("/getPlantform",function(req,res,next){
    var table = req.body.user + "_plantform"
    db.query(`Select * from ${table}`,function(err,result){
      if(err){
          console.log(err)
          res.end(err)
        }
      else{
          res.send(result)
      }
    })
  })

  function GetDateStr(AddDayCount) { 
    var dd = new Date(); 
    dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期 
    var y = dd.getFullYear(); 
    var m = dd.getMonth()+1;//获取当前月份的日期 
    var d = dd.getDate(); 
    return y+"-"+m+"-"+d; 
  }

  router.post("/getNewUser",function(req,res,next){
    var table = req.body.user + "_visit"
    var date = {
      one: GetDateStr(0),
      tow: GetDateStr(-1),
      three: GetDateStr(-2),
      four: GetDateStr(-3),
      five: GetDateStr(-4),
      six: GetDateStr(-5),
      seven: GetDateStr(-6)
    }
    var tableData = []
    // 第一天
    db.query(`select * from ${table} where firstDate = "${date.one}"`,function(err,result){
      if(err) {
        console.log(err)
        res.end(err)
      }
      else {
        //第二天
        tableData.push(result)
        db.query(`select * from ${table} where firstDate = "${date.tow}"`,function(err,result){
          if(err){
            console.log(err)
            res.end(err)
          }
          else {
            //第三天
            tableData.push(result)
            db.query(`select * from ${table} where firstDate = "${date.three}"`,function(err,result){
              if(err){
                console.log(err)
                res.end(err)
              }
              else {
                //第四天
                tableData.push(result)
                db.query(`select * from ${table} where firstDate = "${date.four}"`,function(err,result){
                  if(err){
                    console.log(err)
                    res.end(err)
                  }
                  else {
                    //第五天
                    tableData.push(result)
                    db.query(`select * from ${table} where firstDate = "${date.five}"`,function(err,result){
                      if(err){
                        console.log(err)
                        res.end(err)
                      }
                      else {
                        //第六天
                        tableData.push(result)
                        db.query(`select * from ${table} where firstDate = "${date.six}"`,function(err,result){
                          if(err){
                            console.log(err)
                            res.end(err)
                          }
                          else {
                            //第七天
                            tableData.push(result)
                            db.query(`select * from ${table} where firstDate = "${date.seven}"`,function(err,result){
                              if(err){
                                console.log(err)
                                res.end(err)
                              }
                              else {
                                tableData.push(result)
                                res.send(tableData)
                              }
                            })
                            
                          }
                        })
                        
                      }
                    })
                    
                  }
                })
                
              }
            })

          }
        })
      }
    })

  })

module.exports = router;
