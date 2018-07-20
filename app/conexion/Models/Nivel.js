db = require('../connWeb');


class Nivel {
    
    static crear(codigo, comando) {
        let consulta 	= `INSERT INTO ws_entidades(codigo, comando) VALUES (?,?)`;
        return db.query(consulta, [codigo, comando]);
    }
    
    
    static traduc($niveles_king) {
        let promesa = new Promise(function(resolve, reject){
            
            let promises    = [];
            let $cant_dis   = $niveles_king.length;

            for(let $i=0; $i < $cant_dis; $i++){
                traducidos($i);
            }
            
            function traducidos($i){
                
                let $consulta = "SELECT t.id, t.rowid, t.nombre, t.nivel_id, t.descripcion, t.idioma_id, t.traducido, i.nombre as idioma   " +
                    "FROM ws_niveles_traduc t, ws_idiomas i " +
                    "where i.id=t.idioma_id and t.nivel_id =:nivel_id and t.deleted_at is null";

                let $promise_trads = db.query($consulta, [$niveles_king[$i].rowid] );
                
                $promise_trads.then((result_trads)=>{
                    $niveles_king[$i].niveles_traducidos = result_trads;
                });

                promises.push($promise_trads);
            }
            
            Promise.all(promises).then((result)=>{
                resolve($niveles_king);
            })
            
        })
        return promesa;
    }
    
};

module.exports = Nivel;

