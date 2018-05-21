var mysql = require("mysql");

var pool = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"1234",
    prot: 3306, 
    database:"track"
});

function query(sql,callback){
    pool.getConnection(function(err,connection){
        connection.query(sql, function (err,rows) {
            callback(err,rows);
            connection.release();
        });
    });
}

exports.query = query;