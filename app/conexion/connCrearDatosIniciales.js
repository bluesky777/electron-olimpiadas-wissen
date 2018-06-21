require('dotenv').config();




            

function crearDatosIniciales() {
    
    return new Promise(function(resolve, reject) {
    
        db = require('../conexion/connWeb');
        
        db.query('SELECT * FROM ws_idiomas WHERE deleted_at is null').then(function(result){
            return new Promise(function(resolve2, reject2) {
                if (result.length > 0) {
                    resolve2('Idiomas ya estaban Insertados');
                }else{
                    
                    consulta = "INSERT INTO `ws_idiomas` VALUES (1,'Español','ES','Español',1,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),(2,'Inglés','EN','English',1,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),(3,'Portugués','PT','Português',1,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),(4,'Francés','FR','Français',1,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),(5,'Chino','ZH','中文',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),(6,'Árabe','AR','العربية',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),(7,'Ruso','RU','Русский',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),(8,'Alemán','DE','Deutsch',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),(9,'Hindi','HI','हिन्दी',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),(10,'Japonés','JA','日本語',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),(11,'Coreano','KO','한국어',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),(12,'Italiano','IT','Italiano',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02')";
                    db.query(consulta).then(function(res){
                        resolve2('Idiomas Insertados');
                    })
                    
                }
            })
        })
        .then(function(data){
            return new Promise(function(resolve2, reject2) {
                db.query('SELECT * FROM users WHERE deleted_at is null').then(function(result){
                
                    if (result.length > 0) {
                        resolve2('Usuarios ya estaban Insertados');
                    }else{
                        
                        consulta = "INSERT INTO `users` VALUES (1,'Joseth David','Guerrero Escobar','M','admin','123','davidguerrero777@gmail.com',NULL,1,NULL,NULL,10,1,4,NULL,NULL,NULL,'2016-08-11 19:06:02','2018-05-20 21:55:22'),(2,'Screen','Segunda','M','sc','123',NULL,1,0,NULL,NULL,5,1,NULL,NULL,NULL,NULL,'2016-08-11 19:06:02','2017-07-14 20:17:18'),(3,'EDUARDO','BARBOSA','M','eduardobd','123','eduardobd@gmail.com',16,0,NULL,NULL,NULL,1,1,NULL,NULL,NULL,'2017-05-02 12:48:09','2017-05-31 02:21:23'),(4,'Asesor','Asesor','M','asesor','123',NULL,23,0,NULL,NULL,NULL,1,1,NULL,NULL,NULL,'2017-05-22 14:38:21','2017-10-03 18:49:46')";
                        db.query(consulta).then(function(res){
                            resolve2('Usuarios Insertados');
                        })
                        
                    }
                })
            })
        })
        .then(function(data){
            resolve('agregados');
        })
        
        
    });
    
        
}


module.exports = crearDatosIniciales;

