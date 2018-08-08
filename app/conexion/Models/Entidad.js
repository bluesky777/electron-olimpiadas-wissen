db = require('../connWeb');


class Entidad {
    
    static crear(dat) {
        dat.lider_id        = dat.lider_id      || null;
        dat.lider_nombre    = dat.lider_nombre  || null;
        dat.logo_id         = dat.logo_id       || null;
        dat.telefono        = dat.telefono      || null;
        dat.alias           = dat.alias         || null;
        let now             = window.fixDate(new Date(), true);
        
        let consulta 	= `INSERT INTO ws_entidades(nombre, evento_id, lider_id, lider_nombre, logo_id, telefono, alias, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)`;
        return db.query(consulta, [dat.nombre, dat.evento_id, dat.lider_id, dat.lider_nombre, dat.logo_id, dat.telefono, dat.alias, now, now]);
    }
    
    static find($id) {
        let promesa = new Promise(function(resolve, reject){
            let $consulta = "SELECT e.rowid, e.id, e.nombre, e.lider_id, e.lider_nombre, e.logo_id, " +
						"e.telefono, e.alias, e.evento_id as idioma, " +
						"e.logo_id, IFNULL(i.nombre, 'system/avatars/no-photo.jpg') as logo_nombre, i.publica " +
					"FROM ws_entidades e " +
					"left join images i on i.rowid=e.logo_id and i.deleted_at is null " +
					"where e.rowid=? and e.deleted_at is null";

            db.query($consulta, [$id] ).then(($entidades)=>{
                if ($entidades.length > 0) {
                    resolve($entidades[0]);
                }else{
                    resolve([]);
                }
            })
            
        })
        return promesa;
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

