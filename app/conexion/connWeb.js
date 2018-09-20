require('dotenv').config();


var db;





class Database {
    
    constructor( ) {
        this.connection = window.openDatabase("OlimpiadasWissen.db", '1', 'OlimpiadasWissen', 1024 * 1024 * 49);
    }
    
    query( sql, datos ) {
        return new Promise( ( resolve, reject ) => {
            
            if(typeof datos === "undefined") {
                datos = [];
            }
        
            this.connection.transaction(function (tx) {
    
                tx.executeSql(sql, datos, function (tx, result) {
                    
                    if (sql.substring(0,6).toLowerCase() == 'insert') {
                        resolve(result);
                    };
                    
                    var items = [];
                    for (let i = 0; result.rows.length > i; i++) {
                        items.push(result.rows.item(i));
                    }
                    
                    resolve(items);
                }, function(tx,error){
                    
                    console.log("Error", sql, datos);
                    reject(error);
                })
            })
            
        } );
    }
    
    find( tabla, id ) {

        let self = this;
        let promesa = new Promise(function(resolve, reject){
            
            let consulta 	= `SELECT *, rowid FROM `+tabla+` WHERE rowid=? AND deleted_at is null`;
            self.query(consulta, [id]).then(function (result) {

                if( result.length == 0){
                    resolve({});
                }else{
                    resolve(result[0]);
                }
                                
            });
        })
        
        return promesa;
    }
    
};

module.exports = new Database();

