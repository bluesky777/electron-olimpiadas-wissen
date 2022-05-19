db = require('../connWeb');


class Evento {
    
    static create(ev) {
        let promesa = new Promise(function(resolve, reject){
            let now         = window.fixDate(new Date(), true);
            
            if(ev.es_idioma_unico){
                ev.es_idioma_unico = 1;
            }else{
                ev.es_idioma_unico = 0;
            }
            
            if(ev.actual){
                ev.actual = 1;
            }else{
                ev.actual = 0;
            }
            
            let consulta 	= 'INSERT INTO ws_eventos(nombre, alias, descripcion, idioma_principal_id, es_idioma_unico, enable_public_chat, enable_private_chat, with_pay, actual, precio1, precio2, precio3, precio4, precio5, precio6, created_at)  ' +
                'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            db.query(consulta, [ev.nombre, ev.alias, ev.descripcion, ev.idioma_principal_id, ev.es_idioma_unico, ev.enable_public_chat, ev.enable_private_chat, ev.with_pay, ev.actual, ev.precio1, ev.precio2, ev.precio3, ev.precio4, ev.precio5, ev.precio6, now]).then(function (result) {

                resolve(result.insertId);
                                
            });
        })
        
        return promesa;
        
        
    }
    
    
    
    static actual() {
        let promesa = new Promise(function(resolve, reject){
            let consulta 	= `SELECT *, rowid, rowid as id FROM ws_eventos WHERE actual=1 and deleted_at is null`;
            db.query(consulta).then(function (result) {

                if( result.length == 0){
                    throw 'No existe un evento actual';
                }
                if( result.length > 1){
                    console.log('Existe más de un evento actual');
                }
                
                resolve(result[0]);
                
            });
        })
        
        return promesa;
        
        
    }
    
    
    static todos() {
        let promesa = new Promise(function(resolve, reject){
            let consulta 	= `SELECT *, rowid, rowid as id FROM ws_eventos where deleted_at is null`;
            db.query(consulta).then(function (eventos) {

                if( eventos.length == 0){
                    throw 'No existen eventos';
                    reject('No existen eventos')
                }
                
                let promises    = [];
                
                for(let i=0; i < eventos.length; i++){
                    selectIdiomasExtras(i);
                    selectIdiomas(i, eventos[i].rowid, eventos[i]);
                }
                
                function selectIdiomasExtras(i){
                    
                    consulta = 'SELECT i.id, ir.id as idioma_reg_id, i.nombre, i.abrev, i.original, i.used_by_system ' +
                        ' FROM ws_idiomas i, ws_idiomas_registrados ir ' + 
                        ' WHERE i.id=ir.idioma_id and ir.evento_id =? and ir.deleted_at is null';
                    
                    let idioma_promise = db.query(consulta, [eventos[i].rowid] );
                    promises.push(idioma_promise);
                    
                    idioma_promise.then(function(idiomas){
                        eventos[i].idiomas_extras   = idiomas;
                    })
                       
                }
                
                function selectIdiomas(i, $evento_id, $evento){
                    let promiIdiomas = Evento.idiomas_all($evento_id, $evento);
                    promiIdiomas.then((idiomas_all)=>{
                        $evento.idiomas = idiomas_all;
                    })
                    promises.push(promiIdiomas);
                }
                
                Promise.all(promises).then(()=>{
                    resolve(eventos);
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
                    db.find('ws_eventos', evento_id).then((result)=>{
                        resolve_even(result);
                    });
                }else{
                    resolve_even(evento);
                }
                
            });
            
            promesa_evento.then((evento)=>{

                let consulta = '';

                if (evento.es_idioma_unico) {

                    consulta 	= 'SELECT *, rowid FROM ws_idiomas WHERE rowid=? and deleted_at is null';
                    db.query(consulta, [evento.idioma_principal_id] ).then((result)=>{
                        idiomas_all 	= result;
                        return resolve(idiomas_all);
                    });

                }else{
                    consulta    = 'SELECT i.id, i.rowid, ir.rowid as idioma_reg_id, i.nombre, i.abrev, i.original, i.used_by_system ' +
                            'FROM ws_idiomas i, ws_idiomas_registrados ir  ' +
                            'where i.rowid=ir.idioma_id and  ' +
                                'ir.evento_id =? and  ' +
                                'ir.deleted_at is null and i.deleted_at is null';

                    db.query(consulta, [evento.rowid] ).then((result)=>{
                        idiomas_all = result;
                        consulta    = 'SELECT *, rowid, rowid as id FROM ws_idiomas where rowid=? and deleted_at is null';
                        
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
