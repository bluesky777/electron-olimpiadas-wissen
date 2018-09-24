db = require('../connWeb');


class Inscripcion {
    
	static todas($user_id, $evento_id)
	{

        let promesa = new Promise(function(resolve, reject){
            let $consulta = "SELECT i.id, i.rowid, i.categoria_id, i.allowed_to_answer " +
                            "FROM ws_inscripciones i  " +
                            "inner join ws_categorias_king c on c.deleted_at is null and c.rowid=i.categoria_id and c.evento_id = ? " +
                            "where i.user_id=? and i.deleted_at is null ";

            db.query($consulta, [$evento_id, $user_id] ).then(($inscripciones)=>{
                let promises = [];

                for (let index = 0; index < $inscripciones.length; index++) {
                    inscripciones(index);
                }
                
                function inscripciones(i){
                    let promesa_exa = db.query("SELECT *, rowid FROM ws_examen_respuesta WHERE inscripcion_id=? ", [$inscripciones[i].rowid]);
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

    
    static inscribir($user_id, $categoria_id, $yo_id) {
        let promesa = new Promise(function(resolve, reject){
            
            // Traer la inscripción si existe, esté eliminada o activa.
            Inscripcion.one_uncare($user_id, $categoria_id).then(($inscripcion)=>{
                
                let $consulta = '';
                
                new Promise(function(resolve_insc, reject){
                    if ($inscripcion.length > 0 ) {

                        // Si no es null, lo pondremos null para activarlo
                        if ($inscripcion[0].deleted_at) {
                            // Ya está inscripto y activo, no hay problema supuestamente
                            resolve_insc();
                        }else{
                            
                            $consulta = 'UPDATE ws_inscripciones SET deleted_at=NULL WHERE rowid=?';
                            db.query($consulta, [ $inscripcion[0].rowid ] ).then((result)=>{
                                resolve_insc();
                            });

                        }
                    // Si no encontramos ni uno, debemos crearlo
                    }else{
                        let now         = window.fixDate(new Date(), true);
                        $consulta       = 'INSERT INTO ws_inscripciones(user_id, categoria_id, signed_by, created_at) VALUES(?,?,?,?)';
                        db.query($consulta, [ $user_id, $categoria_id, $yo_id, now] ).then((insc_id)=>{
                            resolve_insc();
                        });
                    
                    }
                    
                }).then(()=>{
                    Inscripcion.one($user_id, $categoria_id).then(($inscripcion)=>{
                        resolve($inscripcion);
                    });
                });
            });
            
        })
        return promesa;
    }
    
    
    static desinscribir($user_id, $categoria_id) {
        let promesa = new Promise(function(resolve, reject){
            let consulta = 'DELETE FROM ws_inscripciones WHERE user_id=? and categoria_id=?';
            
            db.query(consulta, [$user_id, $categoria_id]).then(()=>{
                resolve();
            })
            
        })
        return promesa;
    }
    
    
    static one_uncare($user_id, $categoria_id) {
        let $consulta = 'SELECT i.id, i.rowid, i.categoria_id, i.allowed_to_answer, i.deleted_at ' + 
            'FROM ws_inscripciones i ' + 
            'where i.user_id=? and i.categoria_id=?';

        return db.query($consulta, [ $user_id, $categoria_id] );

    }
    
    
    static one($user_id, $categoria_id) {
        let promesa = new Promise(function(resolve, reject){
            let $consulta = 'SELECT i.id, i.rowid, i.categoria_id, i.user_id, i.allowed_to_answer, i.deleted_at ' +
                'FROM ws_inscripciones i  ' +
                'WHERE i.user_id=? and i.categoria_id=? and i.deleted_at is null';

            db.query($consulta, [ $user_id, $categoria_id] ).then(($inscripcion)=>{
                if ($inscripcion.length > 0){
                    resolve($inscripcion[0]);
                }else{
                    resolve();
                }
            });

        })
        return promesa;
    }
    
};

module.exports = Inscripcion;

