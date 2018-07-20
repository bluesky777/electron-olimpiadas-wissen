var express         = require('express');
var User            = require('../conexion/Models/User');
var Role            = require('../conexion/Models/Role');
var Inscripcion     = require('../conexion/Models/Inscripcion');
var ImagenModel     = require('../conexion/Models/ImagenModel');
var router          = express.Router();

router.route('/').get(getRouteHandler);
router.route('/store').post(postStore)
router.route('/cambiar-entidad').put(putCambiarEntidad);




function getRouteHandler(req, res) {
    User.fromToken(req).then(($user)=>{

        $evento_id  = $user.evento_selected_id;
        $consulta 	= "SELECT u.id, u.rowid, u.nombres, u.apellidos, u.sexo, u.username, u.email, u.is_superuser, " +
						"u.cell, u.edad, u.idioma_main_id, u.evento_selected_id,  " +
						"IFNULL(e.nivel_id, '') as nivel_id, e.pagado, e.pazysalvo, u.entidad_id,  " +
						"u.imagen_id, IFNULL('perfil/' || i.nombre, CASE WHEN u.sexo='F' THEN '"+User.$default_female+"' ELSE '"+User.$default_male+"' END) as imagen_nombre, " +
						"en.nombre as nombre_entidad, en.lider_id, en.lider_nombre, en.logo_id, en.alias    " +
					"FROM users u  " +
					"inner join ws_user_event e on e.user_id = u.rowid and e.evento_id = ?  " +
					"left join images i on i.rowid=u.imagen_id and i.deleted_at is null  " +
					"left join ws_entidades en on en.rowid=u.entidad_id and en.deleted_at is null " +
					"where u.deleted_at is null order by u.rowid DESC";

		db.query($consulta, [$evento_id] ).then(($usuarios)=>{
            promises    = [];
            $cant       = $usuarios.length;

            for(let $i = 0; $i < $cant; $i++){
                todasLasInscripciones($i);
            }
            
            function todasLasInscripciones($i){
                
                let prome_v = new Promise((resolve, reject)=>{
                    Inscripcion.todas($usuarios[$i].rowid, $evento_id).then(($categs)=>{
                    
                        $usuarios[$i].inscripciones = $categs;
                        return Role.deUsuario($usuarios[$i])
                            
                    }).then(($roles)=>{
                        $usuarios[$i].roles = $roles;
                        resolve();
                    });
                })
                promises.push(prome_v);
                   
            }
            
            Promise.all(promises).then(()=>{
                res.send($usuarios);
            })

        });


    })
}

function postStore(req, res) {

    User.fromToken(req).then(($user)=>{
        
		dat 		    = req.body;
		$evento_id      = $user.evento_selected_id;
        bcrypt          = require('bcrypt');
        signed_by       = $user.rowid;
        entidad_id	    = req.body.entidad.rowid;
        
        
		$nivel_id = req.body.nivel_id;
		if ($nivel_id == ''){
			$nivel_id = null;
		}
		if ($nivel_id == "-1" || $nivel_id == -1) {
			$nivel_id = 0;
		}

        
        User.create(dat.nombres, dat.apellidos, dat.sexo, dat.username, bcrypt.hashSync(dat.password, 10), 
            dat.email, 0, dat.cell, dat.edad, entidad_id, $evento_id, $nivel_id, signed_by).then((insert_user)=>{

            return User.find(insert_user)
            
        }).then(($usuario)=>{

            $inscripciones_nuevas   = [];
            $inscripciones          = req.body.inscripciones;
            let promises            = [];
            
            for(let $i=0; $i < $inscripciones.length; $i++){
                aInscribir($i);
            }
            
            function aInscribir($i){
                promesa = Inscripcion.inscribir($usuario.rowid, $inscripciones[$i]['categoria_id'], $user.rowid);
                promises.push(promesa);
            }

            Promise.all(promises).then(($inscripciones_nuevas)=>{
                
                $usuario.inscripciones  = $inscripciones_nuevas;

                ImagenModel.imagen_de_usuario($usuario.sexo, $usuario.imagen_id).then((result_img)=>{
                    $usuario.imagen_nombre  = result_img;
                    $usuario.nivel_id       = $nivel_id;
                    
                    res.send($usuario);
                })
            })
            
        })
        
    })
}


function putCambiarEntidad(req, res) {
    User.fromToken(req).then(($user)=>{
        
		$user_id 		    = req.body.user_id;
		$entidad_id 	    = req.body.entidad_id;

		db.query('UPDATE users SET entidad_id=? WHERE rowid=?', [$entidad_id, $user_id]).then(($entidad)=>{
           res.send([$entidad_id]);
        })
        
    })
}

module.exports = router;