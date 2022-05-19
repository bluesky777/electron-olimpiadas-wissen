var express         = require('express');
var router          = express.Router();
var ImageModel      = require('../conexion/Models/ImagenModel');
var User            = require('../conexion/Models/User');
var db              = require('../conexion/connWeb');

// Enrutadores
router.route('/').get(getIndex);
router.route('/usuarios').get(getUsuarios);
router.route('/store').post(postStore);
router.route('/store-intacta').post(postStoreIntacta);
router.route('/cambiar-img-usuario').put(putCambiarImgUsuario);
router.route('/cambiar-imagen-perfil').put(putCambiarImagenPerfil);
router.route('/cambiar-logo').put(putCambiarLogo);
router.route('/destroy').put(putDestroy);

    


// Funciones
function getIndex(req, res) {
    User.fromToken(req).then((result_user)=>{
        consulta = 'SELECT *, rowid, rowid as id FROM images WHERE user_id=? OR publica=1';
        db.query(consulta, [result_user.rowid]).then((result)=>{
            res.send(result);
        });
    });
}



function getUsuarios(req, res)
{
    User.fromToken(req).then((result_user)=>{
        $user = result_user;
        
        $respuesta = {};
        
        let perfil_path = User.$perfil_path;

        $cons = 'SELECT i.*, i.rowid, "' + perfil_path + '" || i.nombre as nombre  ' +
                'FROM images i WHERE i.user_id=? and i.deleted_at is null;';
                
        db.query($cons, [$user.rowid]).then((result)=>{
            $respuesta['imagenes'] = result;

            // Todos los usuarios
            if ($user['is_superuser']) {
                $cons = "SELECT u.*, u.rowid, i.nombre as imagen_nombre, " +
                    "u.imagen_id, IFNULL('" + perfil_path + "' || i.nombre, CASE WHEN u.sexo='F' THEN '" + User.$default_female + "' ELSE '" + User.$default_male + "' END ) as imagen_nombre   " +
                    "FROM users u   " +
                    "LEFT JOIN images i on i.rowid=u.imagen_id and i.deleted_at is null " +
                    "WHERE u.deleted_at is null order by u.rowid DESC;";
             
                db.query($cons).then((result2)=>{
                    $respuesta['usuarios'] = result2;
                    res.send($respuesta);
                });
            }else if($user.roles[0].name == 'Asesor' || $user.roles[0].name == 'Ejecutor'){
            
                $cons = 'SELECT u.*, u.rowid, i.nombre as imagen_nombre,  ' +
                    'u.imagen_id, IFNULL("' + perfil_path + '" || i.nombre, CASE WHEN u.sexo="F" THEN "' + User.$default_female + '" ELSE "' + User.$default_male + '" END ) as imagen_nombre   ' +
                    'FROM users u   ' +
                    'LEFT JOIN images i on i.rowid=u.imagen_id and i.deleted_at is null ' +
                    'WHERE u.is_superuser = 0 and u.deleted_at is null order by u.rowid DESC;';
                
                db.query($cons).then((result_usuarios)=>{
                    $respuesta['usuarios'] = result_usuarios;
                    res.send($respuesta);
                });
            
            }else{
                res.send($respuesta);
            }

            
        });
    })


}



function putCambiarImgUsuario(req, res)
{
    User.fromToken(req).then(($user)=>{
        let consulta = 'UPDATE users SET imagen_id=? WHERE rowid=?';
        db.query(consulta, [req.body.imgUsuario, req.body.usu_id]).then((result)=>{
            res.send({ rowid: req.body.usu_id, imagen_id: req.body.imgUsuario });
        })
    })
}



function putCambiarImagenPerfil(req, res)
{
    User.fromToken(req).then(($user)=>{
        let consulta = 'UPDATE users SET imagen_id=? WHERE rowid=?';
        db.query(consulta, [req.body.imagen_id, req.body.usu_id]).then((result)=>{
            res.send({ rowid: req.body.usu_id, imagen_id: req.body.imagen_id });
        })
    })
}


function putCambiarLogo(req, res)
{
    User.fromToken(req).then(($user)=>{
        res.status(500).send('Aún no se puede');
    })
}



function putDestroy(req, res)
{
    User.fromToken(req).then(($user)=>{
        db.find('images', req.body.im_id).then(($img)=>{
            var fs          = require('fs');
            let $filename   = 'images/perfil/' + $img.nombre;
            
            // Debería crear un código que impida borrar si la imagen es usada.
            if (fs.existsSync($filename)) {
                fs.unlinkSync($filename);
            }
            

        
            let consulta    = 'UPDATE users SET imagen_id=NULL WHERE imagen_id=?';
            db.query(consulta, [req.body.img_id]).then((result)=>{
                consulta    = 'DELETE FROM images WHERE rowid=?';
                db.query(consulta, [req.body.img_id]).then((result)=>{

                    res.send({ imagen_id: req.body.img_id });                    
    
                })
            })
        })
    })
}


function postStore(req, res)
{
    User.fromToken(req).then(($user)=>{
        
		if ( req.body.foto ) {
            // Falta !!!!!!!
            guardar_imagen_tomada($user, req.body.foto, 1, res).then((newImg)=>{
                res.send(newImg);
            });

		}else{
			
            guardar_image($user, req.files, 1, res).then((newImg)=>{
                res.send(newImg);
            });
		}
        
    })

}



function postStoreIntacta(req, res)
{
    User.fromToken(req).then(($user)=>{
        guardar_image($user, req.files, 1, res).then((newImg)=>{
            res.send(newImg);
        });
    })


}



function guardar_imagen_tomada($user, foto, publica, res) {
    return new Promise((resolve, reject)=>{

        $folderName     = 'user_' + $user.rowid;
        $folder         = 'perfil/'+$folderName;
        
        var fs          = require('fs');
        const path      = require('path');
        var $folder     = path.join(__dirname, '../images/'+$folder+'/');

        
        if (!fs.existsSync($folder)){
            fs.mkdirSync($folder);
        }
        
        db.query("SELECT *, rowid, rowid as id FROM images ORDER BY rowid DESC LIMIT 1").then(($ulti)=>{
            $ulti = $ulti[0];
            
            //asignamos de nuevo el nombre de la imagen completo
            $miImg = ($ulti.rowid + 1) + '.jpg';
            
            var base64Img = require('base64-img');

            base64Img.img('data:image/jpeg;base64,'+foto, $folder, ''+($ulti.rowid + 1), function(err, filepath) {
                if (err)
                    return res.status(500).send(err);

                ImageModel.insert($folderName + '/' + $miImg, $user.rowid, publica).then((newImg)=>{
                    newImg.nombre = 'perfil/' + newImg.nombre;
                    resolve(newImg);
                })
            
            })
        });
		
    })
}




function guardar_image($user, files, publica, res) {
    return new Promise((resolve, reject)=>{

        var homedir     = require('os').homedir();
        
        $folderName     = 'user_' + $user.rowid;
        $folder         = 'perfil/'+$folderName;
        
        var fs          = require('fs');
        const path      = require('path');
        var $folder     = path.join(homedir, 'images_olimpiadas_wissen/'+$folder+'/');

        console.log(path.join(homedir, 'images_olimpiadas_wissen/perfil/'));
        if (!fs.existsSync(path.join(homedir, 'images_olimpiadas_wissen/perfil/'))){
            fs.mkdirSync(path.join(homedir, 'images_olimpiadas_wissen/perfil/'));
        }
        if (!fs.existsSync($folder)){
            fs.mkdirSync($folder);
        }
        console.log('Sale');
        let archivo     = files.file;
        let nombre      = archivo.name;
        let solo        = archivo.name.split('.');

        console.log($folder);
        //mientras el nombre exista iteramos y aumentamos i
        $i = 0;
        while(fs.existsSync($folder + nombre)){
            $i++;
            nombre = solo[0] + "(" + $i + ")" + "." + solo[1];              
        }
        
        
        // Use the mv() method to place the file somewhere on your server
        archivo.mv($folder + nombre, function(err) {
            if (err){
                console.log(err);
                return res.status(500).send(err);                
            }

            ImageModel.insert($folderName + '/' + nombre, $user.rowid, publica).then((newImg)=>{
                newImg.nombre = 'perfil/' + newImg.nombre;
                resolve(newImg);
            })
        
        })
    })
}



module.exports = router;