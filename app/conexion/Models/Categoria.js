db = require('../connWeb');


class Categoria {
    
    static crear(codigo, comando) {
        let consulta 	= `INSERT INTO ws_categorias(codigo, comando) VALUES (?,?)`;
        return db.query(consulta, [codigo, comando]);
    }
    
    static all(evento_id) {
        let consulta 	= `SELECT *, rowid FROM ws_categorias_king WHERE evento_id=? and deleted_at is null`;
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
            

            let $consulta = "SELECT t.id, t.nombre, t.abrev, t.categoria_id, t.descripcion, t.idioma_id, t.traducido, i.nombre as idioma  " +
                "FROM ws_categorias_traduc t, ws_idiomas i " +
                "where i.id=t.idioma_id and t.categoria_id =? and t.deleted_at is null";

            db.query($consulta, [$king.rowid] ).then((result_trads)=>{
                $king.categorias_traducidas = result_trads;
                resolve($king);
            });
            
        })
        return promesa;
    }
    
    
    
};

module.exports = Categoria;

