db = require('../connWeb');


class Role {
    
    static crear(codigo, comando) {
        let consulta 	= `INSERT INTO ws_entidades(codigo, comando) VALUES (?,?)`;
        return db.query(consulta, [codigo, comando]);
    }
    
    
    static deUsuario($user) {
        let promesa = new Promise(function(resolve, reject){
            
            let promises    = [];
            
            $consulta = "SELECT r.*, r.rowid   " +
                "FROM roles r, role_user ru " +
                "WHERE ru.user_id=? and r.rowid =ru.role_id";
                
            db.query($consulta, [$user.rowid] ).then((roles)=>{
                resolve(roles);
            });

        })
        return promesa;
    }
    
    static hasRole(roles, role_to_compare){
        if (roles) {
            for (let i = 0; i < roles.length; i++) {
                const rol = roles[i];
                if(rol.name == role_to_compare){
                    return true;
                }
            }
            
        }else{
            return;
        }
    }
    
};

module.exports = Role;

