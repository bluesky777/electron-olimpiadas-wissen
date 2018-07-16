db = require('../connWeb');


class Categoria {
    
    static crear(codigo, comando) {
        let consulta 	= `INSERT INTO ws_categorias(codigo, comando) VALUES (?,?)`;
        return db.query(consulta, [codigo, comando]);
    }
    
    
    static traduc($categoria_king) {
        let promesa = new Promise(function(resolve, reject){
            
            let promises    = [];
            let $cant_dis   = $categoria_king.length;

            for(let $i=0; $i < $cant_dis; $i++){
                traducidos($i);
            }
            
            function traducidos($i){
                
                $consulta = "SELECT t.id, t.rowid, t.nombre, t.abrev, t.categoria_id, t.descripcion, t.idioma_id, t.traducido, i.nombre as idioma   " +
                    "FROM ws_categorias_traduc t, ws_idiomas i " +
                    "where i.id=t.idioma_id and t.categoria_id =? and t.deleted_at is null";

                $promise_niv_trads = db.query($consulta, [$categoria_king[$i].rowid] );
                
                $promise_niv_trads.then((result_cat_trads)=>{
                    $categoria_king[$i].categorias_traducidas = result_cat_trads;
                });

                promises.push($promise_niv_trads);
            }
            
            Promise.all(promises).then((result)=>{
                resolve($categoria_king);
            })
            
        })
        return promesa;
    }
    
};

module.exports = Categoria;

