db = require('../connWeb');


class Idioma {
    
    static registrar(idioma_id, evento_id) {
        let promesa = new Promise(function(resolve, reject){
            let now         = window.fixDate(new Date());
            
            let consulta 	= 'INSERT INTO ws_evento(nombres, alias, descripcion, idioma_principal_id, es_idioma_unico, enable_public_chat, enable_private_chat, with_pay, actual, precio1, precio2, precio3, precio4, precio5, precio6, created_at)  ' +
                'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            db.query(consulta, [ev.nombre, ev.alias, ev.descripcion, ev.idioma_principal_id, ev.es_idioma_unico, ev.enable_public_chat, ev.enable_private_chat, ev.with_pay, ev.actual, ev.precio1, ev.precio2, ev.precio3, ev.precio4, ev.precio5, ev.precio6, now]).then(function (result) {

                resolve(result.insertId);
                                
            });
        })
        
        return promesa;
        
        
    }
    
    
};

module.exports = Idioma;

