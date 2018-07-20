require('dotenv').config();

var db              = require('../connWeb');
var bcrypt          = require('bcrypt');
var jwt             = require('jsonwebtoken');
var Role            = require('./Role');


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
                    let usuario  = result[0];
                    
                    consulta     = 'SELECT r.*, r.rowid FROM role_user u ' +
                        'INNER JOIN roles r ON r.rowid=u.role_id ' +
                        'WHERE u.user_id=?';
                        
                    db.query(consulta, [id]).then(function (roles) {
                        usuario.roles = roles;
                        resolve(usuario);
                    })
                }
                                
            });
        })
        
        return promesa;
        
        
    }
    
    
    static create(nombres, apellidos, sexo, username, password, email, is_superuser, cell, edad, entidad_id, evento_selected_id, nivel_id, signed_by) {
        let promesa = new Promise(function(resolve, reject){
            let now         = window.fixDate(new Date());
            let user_id     = -1;
            
            email           = email         || null;
            is_superuser    = is_superuser  || 0;
            cell            = cell          || null;
            edad            = edad          || null;
            entidad_id      = entidad_id    || null;
            
            let consulta 	= 'INSERT INTO users(nombres, apellidos, sexo, username, password, email, is_superuser, cell, edad, entidad_id, idioma_main_id, evento_selected_id, created_at)  ' +
                'VALUES(?,?,?,?,?,?,?,?,?,?,1,?,?)';
            db.query(consulta, [nombres, apellidos, sexo, username, password, email, is_superuser, cell, edad, entidad_id, evento_selected_id, now])
            .then(function (result) {
                user_id = result.insertId;
                return db.query('INSERT INTO role_user(user_id, role_id) VALUES(?,5)', [user_id])
            }).then(function (result_role) {
                return db.query('INSERT INTO ws_user_event(user_id, evento_id, nivel_id, signed_by, created_at) VALUES(?,?,?,?,?)', [user_id, evento_selected_id, nivel_id, signed_by, now])
            }).then(function (result_event) {
                resolve(user_id);
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
                        $user.entidad = $entidad;
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
            
            let $evento_id  = 0;
            let consulta    = '';
            
            // Por ahora sólo le trae los roles, no los permisos
            User.roles_y_permisos(user).then((result)=>{
                let roles           = result;
                user.roles          = roles;
                
                return ImagenModel.imagen_de_usuario(user.sexo, user.imagen_id);
                
            }).then((nombre_img)=>{
                user.imagen_nombre  = nombre_img;
                
                // Traemos la entidad
                return db.find('ws_entidades', user.entidad_id);

            }).then(($entidad)=>{
                
                return new Promise((resolve_logo, reject_logo)=>{
                    if ($entidad) {
                        ImagenModel.ruta_imagen($entidad.logo_id).then((logo)=>{
                            $entidad.logo       = logo;
                            user.entidad        = $entidad;
                            resolve_logo();
                        })
                        
                    }else{
                        ImagenModel.ruta_imagen($entidad.logo_id).then((logo)=>{
                            user.entidad    = { logo: logo };
                            resolve_logo();
                        })
                        
                    }
                })
                
            }).then(()=>{
                
                // Traemos evento o eventos
                return new Promise((resolve_ev, reject_ev)=>{
                    

                    if(Role.hasRole(user.roles, 'Admin') || Role.hasRole(user.roles, 'Asesor')){
                        Evento.todos().then((eventos)=>{
                            user.eventos    = eventos;
                            $evento_id      = user.evento_selected_id;
                            resolve_ev();
                        });
                        
                    }else{
                        Evento.actual().then((evento_actual)=>{
                            user.evento_actual  = evento_actual; 
                            $evento_id          = user.evento_actual.rowid;
                            resolve_ev();
                        });
                    }

                })
                
            }).then(()=>{
                
                // Si es Pantalla, mandamos las categorías del evento
                new Promise((resolve_ev, reject_ev)=>{
                    
                    if(Role.hasRole(user.roles, 'Pantalla') ){
                        consulta = 'SELECT *, rowid FROM ws_categorias_king WHERE evento_id=?';
                        db.query(consulta, [$evento_id]).then(($categorias_evento)=>{
                            
                            Categoria.traduc($categorias_evento).then((result_categorias)=>{ // Paso por referencia las categorias_king
                                user.categorias_evento = $categorias_evento;
                                resolve_ev();      
                            });
                            
                        })
                    }

                })
            }).then(()=>{
                return new Promise((resolve_ev, reject_ev)=>{
                    // Verifico si está registrado en este evento actual. Si no, traemos el evento al que realmente pertenece
                    if ( !Role.hasRole(user.roles, 'Admin') && !Role.hasRole(user.roles, 'Invitado') && !Role.hasRole(user.roles, 'Pantalla') ) {   // Estos 3 roles interactuan en cualquier evento
                        
                        consulta = 'SELECT * FROM ws_user_event ue WHERE ue.user_id=? ';
                        db.query($consulta, [ user.id ] ).then(($eventos_registrados)=>{
                            
                            $registrado_en_actual   = false;
                            
                            for (let i = 0; i < $eventos_registrados.length; i++) {
                                const regist = $eventos_registrados[i];
                                if (regist.evento_id == $evento_id) {
                                    $registrado_en_actual 	= true;
                                }
                            }
                            
                            user.eventos_registrados    = $eventos_registrados;
			                user.registrado_en_actual   = $registrado_en_actual;
                            
                            return new Promise((resolve_ult, reject_ult)=>{
                                if ($registrado_en_actual) {
                                    resolve_ult();
                                }else{
                                    let $ultimo = $eventos_resgistrados.length-1;
                                    db.find('ws_eventos', $eventos_resgistrados[ $ultimo ].evento_id).then((ult_evento)=>{
                                        user.evento_actual = ult_evento; // que trabaje en el último evento al que se inscribió
                                        resolve_ult();
                                    })                                
                                }
                            });
                            
                        }).then(()=>{
                            resolve_ev();
                        });
                    }else{
                        resolve_ev();
                    }
                });
            }).then(()=>{
                // Inscripciones
                return Inscripcion.todas(user.rowid, $evento_id)
            }).then(($inscripciones)=>{
                user.inscripciones = $inscripciones;
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

