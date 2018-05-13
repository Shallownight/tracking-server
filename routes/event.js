var express = require('express');
var router = express.Router();

var db = require("../config/db");

router.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials','true');
  next();
});

router.post('/click', function(req, res) {
	console.log(req.body)
	var user = 'user' + req.body.user + '_event'
	var eventName = req.body.eventName
	var day = req.body.day

	db.query(`select * from ${user} where eventName = "${eventName}" AND day = "${day}"`,function(err,result){
		if(err){
			res.send(err)
			console.log(err)
		}
		else{
			//如果为空时，插入语句
			if(result.length == 0){
				db.query(`insert into ${user}(eventName,day,click) values ("${eventName}","${day}",0)`, function(err,result){
					if(err){
						res.send(err)
						console.log(err)
					}
					else{
						res.send("OK")
						console.log("create new data")
					}
				})
			}
			//如果不为空时，更新click
			else {
				db.query(`update ${user} set click = click + 1 where eventName = "${eventName}" AND day = "${day}"`, function(err,result){
					if(err){
						res.send(err)
						console.log(err)
					}
					else{
						res.send("OK")
						console.log("update click")
					}
				})
			}

		}
	})
});

//事件名称接口
router.post('/getEvent', function(req, res) {
	var user = req.body.user
	db.query(`select eventName from _event where user = "${user}"`,function(err,result){
		if(err){
			res.send(err)
			console.log(err)
		}
		else{
			res.send(result)
		}
	})
})

//echarts数据接口
function GetDateStr(AddDayCount) { 
	var dd = new Date(); 
	dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期 
	var y = dd.getFullYear(); 
	var m = dd.getMonth()+1;//获取当前月份的日期 
	var d = dd.getDate(); 
	return y+"-"+m+"-"+d; 
  }

router.post('/getEventData',function(req, res){
	var user = req.body.user + '_event'
	var eventName = req.body.eventName
	console.log(eventName)
	var data = {
		one: 0,
		tow: 0,
		three: 0,
		four: 0,
		five: 0,
		six: 0,
		seven: 0
	}
	var date = {
		one: GetDateStr(-6),
		tow: GetDateStr(-5),
		three: GetDateStr(-4),
		four: GetDateStr(-3),
		five: GetDateStr(-2),
		six: GetDateStr(-1),
		seven: GetDateStr(0)
	}
	//第一天
	db.query(`select click from ${user} where eventName = "${eventName}" AND day = "${date.one}"`,function(err,result){
		if(err){ console.log(err) }
		else { 
			var item = JSON.stringify(result)
			item = JSON.parse(item)
			if(item.length !== 0){
				data.one = item[0].click
			}
			else{
				data.one = 0
			}
			//第二天
			db.query(`select click from ${user} where eventName = "${eventName}" AND day = "${date.two}"`,function(err,result){
				if(err){ console.log(err) }
				else { 
					var item = JSON.stringify(result)
					item = JSON.parse(item)
					if(item.length !== 0){
						data.two = item[0].click
					}
					else{
						data.two = 0
					}
					//第三天
					db.query(`select click from ${user} where eventName = "${eventName}" AND day = "${date.three}"`,function(err,result){
						if(err){ console.log(err) }
						else { 
							var item = JSON.stringify(result)
							item = JSON.parse(item)
							if(item.length !== 0){
								data.three = item[0].click
							}
							else{
								data.three = 0
							}
							//第四天
							db.query(`select click from ${user} where eventName = "${eventName}" AND day = "${date.four}"`,function(err,result){
								if(err){ console.log(err) }
								else { 
									var item = JSON.stringify(result)
									item = JSON.parse(item)
									if(item.length !== 0){
										data.four = item[0].click
									}
									else{
										data.four = 0
									}
									//第五天
									db.query(`select click from ${user} where eventName = "${eventName}" AND day = "${date.five}"`,function(err,result){
										if(err){ console.log(err) }
										else { 
											var item = JSON.stringify(result)
											item = JSON.parse(item)
											if(item.length !== 0){
												data.five = item[0].click
											}
											else{
												data.five = 0
											}
										}
										//第六天
										db.query(`select click from ${user} where eventName = "${eventName}" AND day = "${date.six}"`,function(err,result){
											if(err){ console.log(err) }
											else { 
												var item = JSON.stringify(result)
												item = JSON.parse(item)
												if(item.length !== 0){
													data.six = item[0].click
												}
												else{
													data.six = 0
												}
											}
											//第七天
											db.query(`select click from ${user} where eventName = "${eventName}" AND day = "${date.seven}"`,function(err,result){
												if(err){ console.log(err) }
												else { 
													var item = JSON.stringify(result)
													item = JSON.parse(item)
													if(item.length !== 0){
														data.seven = item[0].click
													}
													else{
														data.seven = 0
													}
													res.send(data)
												}
											})
											//第七天结束
										})
										//第六天结束
									})
									//第五天结束
								}
							})
							//第四天结束
						}
					})
					//第三天结束
				}
			})
			//第二天结束
		}
	})
})

module.exports = router;