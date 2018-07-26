var express         = require('express');
var router          = express.Router();
var Evento          = require('../conexion/Models/Evento');
var User            = require('../conexion/Models/User');
var db              = require('../conexion/connWeb');

// Enrutadores
router.route('/').get(getIndex);
router.route('/usuarios').get(getUsuarios);
router.route('/store-intacta').post(postStoreIntacta);

    


// Funciones
function getIndex(req, res) {
    
        
        
    Evento.todos().then((result)=>{
        
        let eventos     = result;
        let promises    = [];
        
        for (i=0; i < eventos.length; i++) { 
            idiomas_all(i);
        }
        
        function idiomas_all(i){
            let idioma_promise = Evento.idiomas_all(eventos[i].rowid, eventos[i]);
            promises.push(idioma_promise);
            
            idioma_promise.then((idiomas)=>{
                eventos[i].idiomas = idiomas;
            });
        }
        
        
        Promise.all(promises).then(function(values) {
            res.json( eventos );
        });
    });

}



function getUsuarios(req, res)
{
    User.fromToken(req).then((result_user)=>{
        $user = result_user;
        
        $respuesta = {};
        
        let perfil_path = User.$perfil_path;

        $cons = 'SELECT i.*, "' + perfil_path + '" || i.nombre as nombre  ' +
                'FROM images i WHERE i.user_id=? and i.deleted_at is null;';
                
        db.query($cons, [$user.rowid]).then((result)=>{
            $respuesta['imagenes'] = result;

            // Todos los usuarios
            if ($user['is_superuser']) {
                $cons = "SELECT u.*, i.nombre as imagen_nombre, " +
                        "u.imagen_id, IFNULL('" + perfil_path + "' || i.nombre, CASE WHEN u.sexo='F' THEN '" + User.$default_female + "' ELSE '" + User.$default_male + "' END ) as imagen_nombre   " +
                        "FROM users u   " +
                        "LEFT JOIN images i on i.id=u.imagen_id and i.deleted_at is null " +
                        "where u.deleted_at is null order by u.id DESC;";

                db.query($cons).then((result2)=>{

                    $respuesta['usuarios'] = result2;
                    if($user.roles[0].name = 'Asesor'){
            
                        $cons = 'SELECT u.*, i.nombre as imagen_nombre,  ' +
                                'u.imagen_id, IFNULL("' + perfil_path + '" || i.nombre, CASE WHEN u.sexo="F" THEN "' + User.$default_female + '" ELSE "' + User.$default_male + '" END ) as imagen_nombre   ' +
                                'FROM users u   ' +
                                'LEFT JOIN images i on i.id=u.imagen_id and i.deleted_at is null ' +
                                'WHERE u.is_superuser = 0 and u.deleted_at is null order by u.id DESC;';
                        db.query($cons).then((result_usuarios)=>{
                            $respuesta['usuarios'] = result_usuarios;
                            res.send($respuesta);
                        });
                    }

                });
            }
            
        });
    })


}



function postStoreIntacta(req, res)
{
    console.log(req);
    User.fromToken(req).then(($user)=>{
        $folderName     = 'user_' + $user.rowid;
        $folder         = 'perfil/'+$folderName;
        
        var fs          = require('fs');
        const path      = require('path');
        var $folder     = path.join(__dirname, '../images/'+$folder);

        
        if (!fs.existsSync($folder)){
            fs.mkdirSync($folder);
        }
        
        
        
    })


}



module.exports = router;