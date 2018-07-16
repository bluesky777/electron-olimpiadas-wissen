var express         = require('express');
var User            = require('../conexion/Models/User');
var Role            = require('../conexion/Models/Role');
var Inscripcion     = require('../conexion/Models/Inscripcion');
var router          = express.Router();

router.route('/')
    .get(getRouteHandler)
    .post(postRouteHandler);

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
                promesa_categs = Inscripcion.todas($usuarios[$i].rowid, $evento_id);
                promises.push(promesa_categs);    
                
                promesa_categs.then(($categs)=>{
                
                    $usuarios[$i].inscripciones = $categs;

                    Role.deUsuario($usuarios[$i]).then(($roles)=>{
                        $usuarios[$i].roles = $roles;
                    });
                        
                });            
            }
            
            Promise.all(promises).then(()=>{
                res.send($usuarios);
            })

        });


    })
}

function postRouteHandler(req, res) {
    //handle POST route here
}

module.exports = router;