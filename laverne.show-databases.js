var credentials = require('./credentials.json');

var mysql = require("mysql");
var Promise = require('bluebird');
var using = Promise.using;
Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);

credentials.host = 'ids.morris.umn.edu';
var pool = mysql.createPool(credentials);

var getConnection = function(){
    return pool.getConnectionAsync().disposer(
        function(connection){
            return connection.release();
        }
    );
};

var query = function(command){
    return using(getConnection(),function(connection){
        return connection.queryAsync(command);
    });
};

sql='SHOW DATABASES';
var result = query(mysql.format(sql));
result
    .then(
        function(dbfs,err){
            console.log(dbfs);
        })
    .then(
        function(){
            pool.end();
        }
    );

