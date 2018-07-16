db = require('../connWeb');


class Evento {
    
    static find(id) {
        let promesa = new Promise(function(resolve, reject){
            let consulta 	= `SELECT *, rowid FROM ws_eventos WHERE rowid=? AND deleted_at is null`;
            db.query(consulta, [id]).then(function (result) {

                if( result.length == 0){
                    resolve({});
                }else{
                    resolve(result[0]);
                }
                                
            });
        })
        
        return promesa;
        
        
    }
    
    
    
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
    
    
    static todos() {
        let promesa = new Promise(function(resolve, reject){
            let consulta 	= `SELECT *, rowid FROM ws_eventos where deleted_at is null`;
            db.query(consulta).then(function (result) {

                if( result.length == 0){
                    throw 'No existen eventos';
                    reject('No existen eventos')
                }
                
                let promises    = [];
                
                for(let i=0; i < result.length; i++){
                    selectIdiomas(i)
                }
                
                function selectIdiomas(i){
                    
                    consulta = 'SELECT i.id, ir.id as idioma_reg_id, i.nombre, i.abrev, i.original, i.used_by_system ' +
                        ' FROM ws_idiomas i, ws_idiomas_registrados ir ' + 
                        ' WHERE i.id=ir.idioma_id and ir.evento_id =? and ir.deleted_at is null';
                    
                    let idioma_promise = db.query(consulta, [result[i].rowid] );
                    promises.push(idioma_promise);
                    
                    idioma_promise.then(function(idiomas){
                        result[i].idiomas_extras   = idiomas;
                    })
                       
                }
                
                Promise.all(promises).then(function(values) {
                    resolve(result);
                });
                
                
            });
        })
        
        return promesa;
        
        
    }
    
    
    static idiomas_all(evento_id, evento) {
        let promesa = new Promise(function(resolve, reject){
            
            let idiomas_all = [];
            
            let promesa_evento = new Promise(function(resolve_even, reject_even){

                if (!evento) {
                    evento = Evento.find(evento_id).then((result)=>{
                        resolve_even(result);
                    });
                }else{
                    resolve_even(evento);
                }
                
            });
            
            promesa_evento.then((evento)=>{
                


                if (evento.es_idioma_unico) {

                    let consulta 		= 'SELECT *, rowid FROM ws_idiomas WHERE rowid=? and deleted_at is null';
                    db.query(consulta, [evento.idioma_principal_id] ).then((result)=>{
                        idiomas_all 	= result;
                        return resolve(idiomas_all);
                    });

                }else{
                    let consulta = 'SELECT i.id, i.rowid, ir.rowid as idioma_reg_id, i.nombre, i.abrev, i.original, i.used_by_system ' +
                            'FROM ws_idiomas i, ws_idiomas_registrados ir  ' +
                            'where i.rowid=ir.idioma_id and  ' +
                                'ir.evento_id =? and  ' +
                                'ir.deleted_at is null and i.deleted_at is null';

                    db.query(consulta, [evento.rowid] ).then((result)=>{

                        idiomas_all     = result;
                        consulta 		= 'SELECT * FROM ws_idiomas where rowid=? and deleted_at is null';
                        
                        return db.query(consulta, [ evento.idioma_principal_id ] )
                        
                    }).then((result)=>{
                            
                        idiomas_all.unshift(result[0]);
                        resolve(idiomas_all);
                    });

                }
                    
            })
            
            
        })
        return promesa;
    }
    
    
};

module.exports = Evento;

