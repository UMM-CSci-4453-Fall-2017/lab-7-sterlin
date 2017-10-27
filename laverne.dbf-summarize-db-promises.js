Promise = require('bluebird');
mysql = require('mysql');
DBF = require('./laverne.dbf-setup.js');

function getDatabases(){
    var sql = 'SHOW DATABASES';
    return DBF.query(mysql.format(sql)); //return a promise
}

function processDBFs(queryResults){
    return Promise.all(queryResults.map(tableObjToPromise)).then(processTables);
}

function processTables(results){
    var descriptionPromises = results.map(tableAndDbfToPromise);
    var allTables = Promise.all(descriptionPromises).then(function(results){return results;});
    return allTables;
}

// Takes an object (as returned by showDatabases) and returns a promise that resolves
// to an array of object containing tables names for the dbf in the dbfObj
function tableObjToPromise(dbfObj){
    var dbf = dbfObj.Database;
    var sql = mysql.format("SHOW TABLES IN ??", dbf);
    var queryPromise = DBF.query(sql);
    return queryPromise.then(function(results){
        return {table: results, dbf: dbf};
    });
}


// Takes an object (as returned by showDatabases) and returns a promise that resolves
// to an array of objects containing table descriptions.
// This function creates helper functions:
//    describeTable()
//   which contains its own helper function printer(), for writing the output to console

function tableAndDbfToPromise(obj) {
    var dbf = obj.dbf;
    var tableObj = obj.table;
    var key = 'Tables_in_' + dbf;

    var tables = tableObj.map(function(val){return val[key];});

    var describeTable = function(val, index){
        var table = dbf + '.' + val;
        var printer = function(results){
            var desc = results;
            if(index == 0){
                console.log('---|' + dbf + '>');
            }
            console.log('.....|' + table + '>');
            desc.map(function(field){
                console.log('\tFieldName: `' + field.Field + '` \t(' + field.Type + ')');
            });
        };

        var describeSQL = mysql.format('DESCRIBE ??', table);
        var promise = DBF.query(describeSQL).then(printer);
        return promise;
    };

    var describePromises = tables.map(describeTable);
    return Promise.all(describePromises);
}

getDatabases()
    .then(processDBFs)
    .then(DBF.releaseDBF)
    .catch(function(err){console.log('DANGER: ', err);});
