require('dotenv').config();

var db              = require('../connWeb');
var bcrypt          = require('bcrypt');
var jwt             = require('jsonwebtoken');

var ImagenModel     = require('./ImagenModel');


let _$default_female     = 'perfil/system/avatars/female1.png';
let _$default_male       = 'perfil/system/avatars/male1.png';
let _$perfil_path        = 'perfil/';


class User {
    
    static get $default_female() { return _$default_female; }
    static get $default_male() { return _$default_male; }
    static get $perfil_path() { return _$perfil_path; }
    
    
    static find(id) {
        let promesa = new Promise(function(resolve, reject){
            let consulta 	= `SELECT *, rowid FROM users WHERE rowid=? AND deleted_at is null`;
            db.query(consulta, [id]).then(function (result) {

                if( result.length == 0){
                    resolve({});
                }else{
                    resolve(result[0]);
                }
                                
            });
        })
        
        return promesa;
        
        
    }
    
    static fromToken(req) {
        let promesa = new Promise(function(resolve, reject){
            
            let $user 	= {};
            let token   = req.headers.authorization.slice(7);
            
            jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
                if (err) {
                    console.log(err);
                    res.status(400).send({'error': 'Al parecer el token expiró'});
                }
                
                db.find('users', decoded.rowid).then((result)=>{
                    $user           = result;
                    $user.token     = token;
                    return User.datos_usuario_logueado($user);
                    
                }).then((user)=>{
                    
                    $user = user;
                    // Traemos la entidad
                    return db.find('users', $user.entidad_id);
                    
                }).then((result)=>{
                    let $entidad = result;
                    if ($entidad.rowid) { // Si trajo una entidad
                        $entidad.logo = ImagenModel.ruta_imagen($entidad.logo_id);
                        $usuario.entidad = $entidad;
                    }
            
                    resolve($user);
                });

                
            });

            

            


        })
        
        return promesa;
        
        
    }
    
    static login(user_data) {

        let promesa = new Promise(function(resolve, reject){

            db.query('SELECT *, rowid FROM users WHERE username=? and deleted_at is null', [user_data.username]).then(function(result){

                if(result.length > 0){
                    let user = result[0];
                    

                    let compatible = User.comparar(user_data.password, user.password);
                    if (! compatible) reject('invalid_password');

                    let token               = jwt.sign({ rowid: user.rowid }, process.env.JWT_SECRET);
                    user.token     = token;
                    delete user.password;

                    resolve(user);
                }else{
                    reject('invalid_username')
                }
                
            })

        });
        
        return promesa;
        
    }
    
    
    
    static comparar(password, hash_password) {
        return bcrypt.compareSync(password, hash_password);
    }
    
    
    static datos_usuario_logueado(user) {
        return new Promise((resolve, reject)=>{
            
            // Por ahora sólo le trae los roles, no los permisos
            User.roles_y_permisos(user).then((result)=>{
                let roles           = result;
                user.roles          = roles;
                
                return ImagenModel.imagen_de_usuario(user.sexo, user.imagen_id);
                
            }).then((nombre_img)=>{
                user.imagen_nombre  = nombre_img;
                resolve(user);
            });
            
        });
        
    }
    
    static roles_y_permisos(user) {
        return new Promise((resolve, reject)=>{
            let consulta = "SELECT r.* FROM roles r " +
                    "INNER JOIN role_user ru ON ru.role_id=r.id AND ru.user_id=?";
            db.query(consulta, [user.rowid]).then(function(result){
                let roles = result;
                resolve(roles);
            })
            
        });
        
    }
    
};

module.exports = User;

