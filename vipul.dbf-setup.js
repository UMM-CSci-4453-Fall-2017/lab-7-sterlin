var credentials = require('./credentials.json');

var mysql = require('mysql');
var Promise = require('bluebird');
var using = Promise.using;

Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);

credentials.host = 'ids';
var connection = mysql.createConnection(credentials);
var pool = mysql.createPool(credentials);

function getConnection() {
    return pool.getConnectionAsync().disposer(
        function(connection){
            return connection.release();
        }
    );
}

function query(command) { // SQL comes in and a promise comes out
    return using(getConnection(), function(connection){
        return connection.queryAsync(command);
    });
}

function endPool(){
    pool.end(function(err){});
}

exports.query = query;
exports.releaseDBF = endPool;
