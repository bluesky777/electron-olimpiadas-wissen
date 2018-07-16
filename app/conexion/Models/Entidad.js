db = require('../connWeb');


class Entidad {
    
    static crear(codigo, comando) {
        let consulta 	= `INSERT INTO ws_entidades(codigo, comando) VALUES (?,?)`;
        return db.query(consulta, [codigo, comando]);
    }
    
    static todas($evento_id) {
        let promesa = new Promise(function(resolve, reject){
            let $consulta = "SELECT e.rowid, e.id, e.nombre, e.lider_id, e.lider_nombre, e.logo_id, " +
						"e.telefono, e.alias, e.evento_id as idioma, " +
						"e.logo_id, IFNULL(i.nombre, 'system/avatars/no-photo.jpg') as logo_nombre, i.publica " +
					"FROM ws_entidades e " +
					"left join images i on i.rowid=e.logo_id and i.deleted_at is null " +
					"where e.evento_id=? and e.deleted_at is null";

            db.query($consulta, [$evento_id] ).then(($entidades)=>{
                resolve($entidades);
            })
            
        })
        return promesa;
    }
    
};

module.exports = Entidad;

