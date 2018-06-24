db = require('../connWeb');


class Evento {
    
    static actual() {
        let promesa = new Promise(function(resolve, reject){
            let consulta 	= `SELECT * FROM ws_eventos WHERE actual=1 and deleted_at is null`;
            db.query(consulta).then(function (result) {

                if( result.length == 0){
                    throw 'No existe un evento actual';
                }
                if( result.length > 1){
                    throw 'Existe más de un evento actual';
                }
                
                resolve(result[0]);
                
            });
        })
        
        return promesa;
        
        
    }
    
};

module.exports = Evento;

