db      = require('../connWeb');



let _default_female      = 'perfil/system/avatars/female1.png';
let _default_male 	    = 'perfil/system/avatars/male1.png';
let _perfil_path 		= 'perfil/';


class ImagenModel {
    
    static get default_female() { return _default_female; }
    static get default_male() { return _default_male; }
    static get perfil_path() { return _perfil_path; }
    
    
    static imagen_de_usuario(sexo, imagen_id) {
        
        return new Promise(function(resolve, reject){
        
            if (imagen_id) {

            
                consulta 	= `SELECT * FROM images WHERE id=? and deleted_at is null`;
                db.query(consulta, [imagen_id]).then(function (result) {
    
                    if( result.length > 0 ){
                        resolve('perfil/' + result[0].nombre);
                    }else{
                        resolve(ImagenModel.default_image_name(sexo));
                    }
                    
                });
            
            }else{
                resolve(ImagenModel.default_image_name(sexo));
            }
        })
        
        
    }
    
    
	static default_image_id(sexo)
	{
		if (sexo == 'F') {
			return 2;
		}else{
			return 1; // ID de la imagen masculina
		}
	}
    
     static default_image_name(sexo)
	{
		if (sexo == 'F') {
			return ImagenModel.default_female;
		}else{
			return ImagenModel.default_male;
		}
	}


    
};

module.exports = ImagenModel;

