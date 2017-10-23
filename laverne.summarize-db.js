var mysql = require('mysql');
var credentials = require('./credentials.json');
credentials.host = "ids.morris.umn.edu";
var connection = mysql.createConnection(credentials);

var data = {};
var processed = {};


function allZero(object){
    var allZero = true;
    for(obj in object){
        if(object[obj]!=0){
            allZero = false;
        }
    }
    return allZero;
}

function protectString(str){
    return "`" + str + "`";
}

sql = "SHOW DATABASES";
connection.query(sql, function(err, rows, fields){
    if(err){
        console.log('Error looking up databases');
        connection.end();
    } else {
        processDBFs(rows);
    }
});

function processDBFs(dbfs){
    for(var index in dbfs) {
        var dbf = dbfs[index].Database;
        var sql = 'SHOW TABLES IN ' + protectString(dbf);
        data[dbf] = Number.POSITIVE_INFINITY;
        connection.query(sql, (function(dbf){
            return function(err, tables, fields){
                if(err){
                    console.log('Error finding tables in dbf ' + dbf);
                    connection.end();
                } else {
                    processTables(tables, dbf);
                }
            };
        })(dbf));
    }
}

function processTables(tables, dbf){
    data[dbf] = tables.length;
    processed[dbf] = 0;
    for(var index in tables){
        var tableObj = tables[index];
        // There is only one key in tableObj, but the for-loop allows us to avoid knowing what it is.
        for(key in tableObj){
            var table = tableObj[key];
            var sql = 'DESCRIBE ' + protectString(dbf) + "." + protectString(table);
            connection.query(sql, (function(table, dbf){
                return function(err, desc, fields){
                    if(err){
                        console.log('Error describing table ' + table);
                    } else {
                        processDescription(desc, table, dbf);
                    }
                };
            })(table, dbf));
        }
    }
}

function processDescription(desc, table, dbf){
    data[dbf]--; //Processed one table from this database
    if(processed[dbf]==0){
        processed[dbf] = 1;
        console.log('---|' + dbf + '>');
    }
    console.log('.....|' + dbf + '.' + table + '>');
    desc.map(function(field){
        console.log("\tFieldName: " + protectString(field.Field) + " \t(" + field.Type + ")");
    });

    if(allZero(data)){
        connection.end();
    }
}
