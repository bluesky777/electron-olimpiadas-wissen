require('dotenv').config();

var db              = require('../connWeb');
var bcrypt          = require('bcryptjs');
var jwt             = require('jsonwebtoken');
var Role            = require('./Role');
var Evento          = require('./Evento');
var Inscripcion     = require('./Inscripcion');
var Categoria       = require('./Categoria');
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
			let consulta 	= `SELECT *, rowid, rowid as id FROM users WHERE rowid=? AND deleted_at is null`;
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
	
	
	static create(nombres, apellidos, sexo, username, password, email, is_superuser, cell, edad, entidad_id, evento_selected_id, nivel_id, signed_by, idioma_main_id) {
		let promesa = new Promise(function(resolve, reject){
			let now         = window.fixDate(new Date(), true);
			let user_id     = -1;
			
			email           = email         || null;
			is_superuser    = is_superuser  || 0;
			cell            = cell          || null;
			edad            = edad          || null;
			entidad_id      = entidad_id    || null;
			idioma_main_id  = idioma_main_id || 1;
			
			let consulta 	= 'INSERT INTO users(nombres, apellidos, sexo, username, password, email, is_superuser, cell, edad, entidad_id, idioma_main_id, evento_selected_id, created_at)  ' +
				'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)';
			db.query(consulta, [nombres, apellidos, sexo, username, password, email, is_superuser, cell, edad, entidad_id, idioma_main_id, evento_selected_id, now])
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
	
	
	static update($usuario_new, $usuario_old, $evento_id) {
		let promesa = new Promise(function(resolve, reject){
			let now         = window.fixDate(new Date(), true);
			
			
			if ($usuario_new.imgUsuario) {
				$usuario_new.imagen_id 	= $usuario_new.imgUsuario['rowid'];
			}
		
			
			let nombres         = $usuario_new.nombres       || $usuario_old.nombres;
			let apellidos       = $usuario_new.apellidos     || $usuario_old.apellidos;
			let sexo            = $usuario_new.sexo          || $usuario_old.sexo;
			let username        = $usuario_new.username      || $usuario_old.username;
			let email           = $usuario_new.email         || $usuario_old.email;
			let is_superuser    = $usuario_new.is_superuser  || $usuario_old.is_superuser;
			let cell            = $usuario_new.cell          || $usuario_old.cell;
			let edad            = $usuario_new.edad          || $usuario_old.edad;
			let entidad_id      = $usuario_new.entidad_id    || $usuario_old.entidad_id;
			let password        = '';
			let nivel_id        = parseInt($usuario_new.nivel_id);
			
			let $pass = $usuario_new.password;
			let passSql = '';
			
			if ($pass) {
				password = bcrypt.hashSync($pass, 10);
				passSql = '';
			}else{
				password = $usuario_old.password;
			}
			
			
			if ($usuario_new.entidad) {
				entidad_id = $usuario_new.entidad_id;
			}
			
			let consulta 	= 'UPDATE users SET nombres=?, apellidos=?, sexo=?, username=?, password=?, email=?, is_superuser=?, cell=?, edad=?, entidad_id=?, updated_at=? ' +
				'WHERE rowid=?';
			db.query(consulta, [nombres, apellidos, sexo, username, password, email, is_superuser, cell, edad, entidad_id, now, $usuario_new.rowid])
			.then(function (result_event) {
				if (!$evento_id) return resolve($usuario_new);
				if (nivel_id>0) {
					consulta = 'UPDATE ws_user_event SET nivel_id='+nivel_id+' WHERE user_id=? and evento_id=? ';
				}else{
					consulta = 'UPDATE ws_user_event SET nivel_id=NULL WHERE user_id=? and evento_id=? ';
				}
				
				return db.query(consulta, [$usuario_new.rowid, $evento_id])
			}).then((user_event)=>{
				resolve($usuario_new);
			});
		})
		
		return promesa;
		
		
	}
	
	static fromToken(req, token_auth) {
		let promesa = new Promise(function(resolve, reject){
			
			let token   = '';
			
			if (token_auth) {
				token   = token_auth;
			}else{
				token   = req.headers.authorization.slice(7);
			}
			
			let $user 	= {};
			
			
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

			db.query('SELECT *, rowid, rowid as id FROM users WHERE username=? and deleted_at is null', [user_data.username]).then(function(result){

				if(result.length > 0){
					let user = result[0];
					

					let compatible = User.comparar(user_data.password, user.password);
					if (! compatible) reject('invalid_password');

					let token               = jwt.sign({ rowid: user.rowid }, process.env.JWT_SECRET);
					user.token     = token;
					delete user.password;

					resolve(user);
				}else{
					reject('invalid_username: ', user_data.username)
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
					

					if(Role.hasRole(user.roles, 'Admin') || Role.hasRole(user.roles, 'Asesor') || Role.hasRole(user.roles, 'Ejecutor') || Role.hasRole(user.roles, 'Profesor') || Role.hasRole(user.roles, 'Presentador')){
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
				return new Promise((resolve_categs, reject_ev)=>{
					
					if(Role.hasRole(user.roles, 'Pantalla') ){
						consulta = 'SELECT *, rowid, rowid as id FROM ws_categorias_king WHERE evento_id=?';
						db.query(consulta, [$evento_id]).then(($categorias_evento)=>{
							
							Categoria.traduc($categorias_evento).then((result_categorias)=>{ // Paso por referencia las categorias_king
								user.categorias_evento = result_categorias;
								resolve_categs();
							});
							
						})
					}else{
						resolve_categs();
					}

				})
			}).then(()=>{

				return new Promise((resolve_user_eve, reject_ev)=>{
					// Verifico si está registrado en este evento actual. Si no, traemos el evento al que realmente pertenece
					if ( !Role.hasRole(user.roles, 'Admin') && !Role.hasRole(user.roles, 'Invitado') && !Role.hasRole(user.roles, 'Pantalla') ) {   // Estos 3 roles interactuan en cualquier evento
						
						let consulta = 'SELECT * FROM ws_user_event ue WHERE ue.user_id=? ';
						db.query(consulta, [ user.rowid ] ).then(($eventos_registrados)=>{
							
							let $registrado_en_actual   = false;
							
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
									let $ultimo = $eventos_registrados.length-1;
									db.find('ws_eventos', $eventos_registrados[ $ultimo ].evento_id).then((ult_evento)=>{
										user.evento_actual = ult_evento; // que trabaje en el último evento al que se inscribió
										resolve_ult();
									})                                
								}
							});
							
						}).then(()=>{
							resolve_user_eve();
						});
					}else{
						resolve_user_eve();
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

