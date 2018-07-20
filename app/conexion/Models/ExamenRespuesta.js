db = require('../connWeb');


class ExamenRespuesta {
    
    static crear(codigo, comando) {
        let consulta 	= `INSERT INTO ws_examen_respuesta(codigo, comando) VALUES (?,?)`;
        return db.query(consulta, [codigo, comando]);
    }
    
    static calcularExamen($examen_id) {
        let promesa = new Promise(function(resolve, reject){
            resolve();
            
        })
        return promesa;
    }
    
};

module.exports = ExamenRespuesta;

