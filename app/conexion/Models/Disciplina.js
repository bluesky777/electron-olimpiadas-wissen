db = require('../connWeb');


class Categoria {
    
    static crear(codigo, comando) {
        let consulta 	= `INSERT INTO ws_disciplinas_king(codigo, comando) VALUES (?,?)`;
        return db.query(consulta, [codigo, comando]);
    }
    
    
    static traduc($kings) {
        let promesa = new Promise(function(resolve, reject){
            
            let promises    = [];
            let $cant_dis   = $kings.length;

            for(let $i=0; $i < $cant_dis; $i++){
                traducidos($i);
            }
            
            function traducidos($i){
                
                let $consulta = "SELECT t.id, t.rowid, t.nombre, t.disciplina_id, t.descripcion, t.idioma_id, t.traducido, i.nombre as idioma   " +
                    "FROM ws_disciplinas_traduc t, ws_idiomas i " +
                    "where i.id=t.idioma_id and t.disciplina_id =? and t.deleted_at is null";

                let $promise_trads = db.query($consulta, [$kings[$i].rowid] );
                
                $promise_trads.then((result_trads)=>{
                    $kings[$i].disciplinas_traducidas = result_trads;
                });

                promises.push($promise_trads);
            }
            
            Promise.all(promises).then((result)=>{
                resolve($kings);
            })
            
        })
        return promesa;
    }
    
    
    static updateTraduc(rowid, nombre, descripcion, traducido) {
        let promesa = new Promise(function(resolve, reject){
            
            let now = window.fixDate(new Date(), true);
            let $consulta = "UPDATE ws_disciplinas_traduc SET nombre=?, descripcion=?, traducido=?, updated_at=? WHERE rowid=?";

            db.query($consulta, [nombre, descripcion, traducido, now, rowid] )
            
            .then((result_trads)=>{
                resolve('Guardado');
            });
            
            
        })
        return promesa;
    }
    
};

module.exports = Categoria;

