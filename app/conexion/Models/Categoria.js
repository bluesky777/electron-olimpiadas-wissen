db = require('../connWeb');


class Categoria {
    
    static crear(codigo, comando) {
        let consulta 	= `INSERT INTO ws_categorias(codigo, comando) VALUES (?,?)`;
        return db.query(consulta, [codigo, comando]);
    }
    
    static all(evento_id) {
        let consulta 	= `SELECT *, rowid, rowid as id FROM ws_categorias_king WHERE evento_id=? and deleted_at is null`;
        return db.query(consulta, [evento_id]);
    }
    
    
    
    static traduc($kings) {
        let promesa = new Promise(function(resolve, reject){
            
            let promises    = [];

            for(let $i=0; $i < $kings.length; $i++){
                traducidos($i);
            }
            
            function traducidos($i){
                
                let $consulta = "SELECT t.id, t.rowid, t.nombre, t.abrev, t.categoria_id, t.descripcion, t.idioma_id, t.traducido, i.nombre as idioma " +
                    "FROM ws_categorias_traduc t, ws_idiomas i " +
                    "WHERE i.id=t.idioma_id and t.categoria_id =? and t.deleted_at is null";

                let $promise_trads = db.query($consulta, [$kings[$i].rowid] );
                
                $promise_trads.then((result_trads)=>{
                    $kings[$i].categorias_traducidas = result_trads;
                });

                promises.push($promise_trads);
            }
            
            Promise.all(promises).then((result)=>{
                resolve($kings);
            })
            
        })
        return promesa;
    }
    
    
    
    static traducciones_single($king) {
        let promesa = new Promise(function(resolve, reject){
            

            let $consulta = "SELECT t.id, t.rowid, t.nombre, t.abrev, t.categoria_id, t.descripcion, t.idioma_id, t.traducido, i.nombre as idioma  " +
                "FROM ws_categorias_traduc t, ws_idiomas i " +
                "where i.rowid=t.idioma_id and t.categoria_id =? and t.deleted_at is null";

            db.query($consulta, [$king.rowid] ).then((result_trads)=>{
                $king.categorias_traducidas = result_trads;
                resolve($king);
            });
            
        })
        return promesa;
    }
  
    
    static updateTraduc(rowid, nombre, abrev, descripcion, traducido) {
        let promesa = new Promise(function(resolve, reject){
            
            let now = window.fixDate(new Date(), true);
            let $consulta = "UPDATE ws_categorias_traduc SET nombre=?, abrev=?, descripcion=?, traducido=?, updated_at=? WHERE rowid=?";

            db.query($consulta, [nombre, abrev, descripcion, traducido, now, rowid] )
            
            .then((result_trads)=>{
                resolve('Guardado');
            });
            
            
        })
        return promesa;
    }
    
    
    
};

module.exports = Categoria;

