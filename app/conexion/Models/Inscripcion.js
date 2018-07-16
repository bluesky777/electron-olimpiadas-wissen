db = require('../connWeb');


class Inscripcion {
    
    static crear(codigo, comando) {
        let consulta 	= `INSERT INTO ws_categorias(codigo, comando) VALUES (?,?)`;
        return db.query(consulta, [codigo, comando]);
    }
    
	static todas($user_id, $evento_id)
	{
        let promesa = new Promise(function(resolve, reject){
            let $consulta = "SELECT i.id, i.categoria_id, i.allowed_to_answer " +
                            "FROM ws_inscripciones i  " +
                            "inner join ws_categorias_king c on c.deleted_at is null and c.id=i.categoria_id and c.evento_id = ? " +
                            "where i.user_id=? and i.deleted_at is null ";

            db.query($consulta, [$evento_id, $user_id] ).then(($inscripciones)=>{
                let promises = [];
                
                for (let index = 0; index < $inscripciones.length; index++) {
                    inscripciones(index);
                }
                
                function inscripciones(i){
                    promesa_exa = db.query("SELECT *, rowid FROM ws_examen_respuesta WHERE inscripcion_id=? ", [$inscripciones[i].rowid]);
                    promises.push(promesa_exa);
                    promesa_exa.then(($examenes)=>{
                        $inscripciones[i].examenes = $examenes;
                    });
                }
                Promise.all(promises).then(()=>{
                    resolve($inscripciones);
                })
            });

        })
        return promesa;
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

module.exports = Inscripcion;

