require('dotenv').config();




            

function crearDatosIniciales() {
    
    return new Promise(function(resolve, reject) {
    
        db = require('../conexion/connWeb');
        
        db.query('SELECT * FROM ws_idiomas WHERE deleted_at is null').then(function(result){
            return new Promise(function(resolve2, reject2) {
                if (result.length > 0) {
                    console.log('Idiomas ya estaban Insertados');
                    resolve2('Idiomas ya estaban Insertados');
                }else{
                    
                    consulta = "INSERT INTO `ws_idiomas` VALUES (1,'Español','ES','Español',1,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'), " + 
                        " (2,'Inglés','EN','English',1,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'), " + 
                        " (3,'Portugués','PT','Português',1,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'), " + 
                        " (4,'Francés','FR','Français',1,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'), " +
                        " (5,'Chino','ZH','中文',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'), " +
                        " (6,'Árabe','AR','العربية',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'), " +
                        " (7,'Ruso','RU','Русский',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'), " +
                        " (8,'Alemán','DE','Deutsch',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'), " +
                        " (9,'Hindi','HI','हिन्दी',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'), " +
                        " (10,'Japonés','JA','日本語',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'), " +
                        " (11,'Coreano','KO','한국어',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02'),  " +
                        " (12,'Italiano','IT','Italiano',0,NULL,'2016-08-11 19:06:02','2016-08-11 19:06:02')";
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
                        
                        bcrypt          = require('bcrypt');
                        hash_password   = bcrypt.hashSync('123', 10);
                        consulta        = "INSERT INTO `users` VALUES (1,'Joseth David','Guerrero Escobar','M','admin','" + hash_password + "','davidguerrero777@gmail.com',NULL,1,NULL,NULL,10,1,1,NULL,NULL,NULL,'2016-08-11 19:06:02','2018-05-20 21:55:22'), " +
                                            "(2,'Screen','Segunda','M','sc','" + hash_password + "',NULL,1,0,NULL,NULL,5,1,NULL,NULL,NULL,NULL,'2016-08-11 19:06:02','2017-07-14 20:17:18'), " +
                                            "(3,'Profesor','De La Redención','M','profesor','" + hash_password + "',NULL,16,0,NULL,NULL,NULL,1,1,NULL,NULL,NULL,'2018-05-02 12:48:09','2018-05-31 02:21:23'), " +
                                            "(4,'Presentador','De La Redención','M','Presentador','" + hash_password + "',NULL,16,0,NULL,NULL,NULL,1,1,NULL,NULL,NULL,'2018-05-02 12:48:09','2018-05-31 02:21:23'), " +
                                            "(5,'Ejecutor','Sistema','M','ejecutor','" + hash_password + "',NULL,16,0,NULL,NULL,NULL,1,1,NULL,NULL,NULL,'2018-05-02 12:48:09','2018-05-31 02:21:23'), " +
                                            "(6,'Asesor','Asesor','M','asesor','" + hash_password + "',NULL,23,0,NULL,NULL,NULL,1,1,NULL,NULL,NULL,'2017-05-22 14:38:21','2017-10-03 18:49:46')";
                        db.query(consulta).then(function(res){
                            resolve2('Usuarios Insertados');
                        })
                        
                    }
                })
            })
        })
        .then(function(data){
            return new Promise(function(resolve2, reject2) {
                db.query('SELECT * FROM ws_eventos WHERE deleted_at is null').then(function(result){
                
                    if (result.length > 0) {
                        resolve2('Usuarios ya estaban Insertados');
                    }else{
                        
                        consulta = "INSERT INTO `ws_eventos` (`id`, `nombre`, `alias`, `descripcion`, `password`, `mostrar_nombre_punto`, `gran_final`, `with_pay`, `por_sumatoria_puntos`, `actual`, `precio1`, `precio2`, `precio3`, `precio4`, `precio5`, `precio6`, `idioma_principal_id`, `es_idioma_unico`, `enable_public_chat`, `enable_private_chat`, `deleted_by`, `deleted_at`, `created_at`, `updated_at`) VALUES  " +
                            " (1, 'Olimpiadas Libertad 2018', 'OAF18', 'Olimpiadas Unión Colombiana del Norte', 'aei', 1, 0, 0, 0, 1, 2000, 3000, 4000, 5000, 5000, 5000, 1, 0, 0, 0, NULL, NULL, '2018-08-11 15:06:02', '2018-09-21 11:39:39'), " +
                            " (2, 'Boom Bíblico Campamento 2017', 'BoomBíblico7', NULL, NULL, 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 0, 0, NULL, NULL, '2018-08-14 19:46:22', '2018-08-14 19:47:00'), " + 
                            " (3, 'JESÚS el único superhéroe', 'Jesús-Super', 'Concurso infantil.', 'aei', 1, 0, 0, 0, 1, 2000, 3000, 4000, 5000, 5000, 5000, 1, 0, 0, 0, NULL, NULL, '2018-08-11 15:06:02', '2018-09-21 11:39:39'), " +
                            " (4, 'Boom Bíblico Campamento 2018', 'OAF18', 'CAMPAMENTO', 'aei', 1, 0, 0, 0, 1, 2000, 3000, 4000, 5000, 5000, 5000, 1, 0, 0, 0, NULL, NULL, '2018-08-11 15:06:02', '2018-09-21 11:39:39')";
                        db.query(consulta).then(function(res){
                            
                            consulta = "INSERT INTO `ws_user_event` (`id`, `user_id`, `evento_id`, `nivel_id`, `signed_by`) VALUES (1, 1, 1, 1, 1),(2, 2, 1, 1, 1),(3, 3, 1, 1, 1),(4, 4, 1, 1, 1),(5, 5, 1, 1, 1),(6, 6, 1, 1, 1)";
                            db.query(consulta).then(function(res){
                                resolve2('Eventos Insertados');
                            })
                            
                            resolve2('Eventos Insertados');
                        })
                        
                    }
                })
            })
        })
        .then(function(data){
            return new Promise(function(resolve2, reject2) {
                db.query('SELECT * FROM roles').then(function(result){
                
                    if (result.length > 0) {
                        resolve2('Roles ya estaban Insertados');
                    }else{
                        
                        consulta = "INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `created_at`, `updated_at`) VALUES " +
                            "(1, 'Admin', 'Admin', 'Es el master del sistema', '2016-08-11 19:06:02', '2016-08-11 19:06:02'), " +
                            "(2, 'Profesor', 'Profesor', NULL, '2016-08-11 19:06:02', '2016-08-11 19:06:02'), " +
                            "(3, 'Asesor', 'Asesor', NULL, '2016-08-11 19:06:02', '2016-08-11 19:06:02'), " +
                            "(4, 'Presentador', 'Presentador', NULL, '2016-08-11 19:06:02', '2016-08-11 19:06:02'), " +
                            "(5, 'Participante', 'Participante', NULL, '2016-08-11 19:06:02', '2016-08-11 19:06:02'), " +
                            "(6, 'Invitado', 'Invitado', NULL, '2016-08-11 19:06:02', '2016-08-11 19:06:02'), " +
                            "(7, 'Pantalla', 'Pantalla', 'Usuario que no interactúa, solo mostrará al Video Beam', '2016-08-11 19:06:02', '2016-08-11 19:06:02')," +
                            "(8, 'Ejecutor', 'Sistemas', 'Usuario que dirigirá el evento final sin modificar ni ver preguntas', '2018-08-11 19:06:02', '2018-08-11 19:06:02');";
                        db.query(consulta).then(function(res){
                            consulta = "INSERT INTO `permissions` (`id`, `name`, `display_name`, `description`, `created_at`, `updated_at`) VALUES " +
                                "(1, 'like_teacher', 'Puede ver actuar como profesor', 'Interactúa en la plataforma como un profesor', '2016-08-11 19:06:02', '2016-08-11 19:06:02'), " +
                                "(2, 'like_asesor', 'Puede ver actuar como asesor', 'Interactúa en la plataforma como un asesor', '2016-08-11 19:06:02', '2016-08-11 19:06:02'), " +
                                "(3, 'like_presentador', 'Puede ver actuar como presentador', 'Interactúa en la plataforma como un presentador', '2016-08-11 19:06:02', '2016-08-11 19:06:02'), " +
                                "(4, 'like_participante', 'Puede ver actuar como participante', 'Interactúa en la plataforma como un participante', '2016-08-11 19:06:02', '2016-08-11 19:06:02'), " +
                                "(5, 'like_invitado', 'Puede ver actuar como invitado', 'Interactúa en la plataforma como un invitado', '2016-08-11 19:06:02', '2016-08-11 19:06:02'), " +
                                "(6, 'like_pantalla', 'Puede mostrar todo', 'Interactúa en la plataforma como una pantalla', '2016-08-11 19:06:02', '2016-08-11 19:06:02')," +
                                "(7, 'like_ejecutor', 'Puede dirigir las pruebas', 'Interactúa en la plataforma como un ejecutor de sistemas', '2018-08-11 19:06:02', '2018-08-11 19:06:02');";
                            return db.query(consulta)
                        }).then(function(res){
                            consulta = "INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 7), (7, 8);";
                            return db.query(consulta)
                        }).then(function(res){
                            consulta = "INSERT INTO `role_user` (`user_id`, `role_id`) VALUES (1, 1),(2, 7),(3, 2),(4, 4),(5, 8),(6, 3)";
                            return db.query(consulta)
                        }).then(function(res){
                            resolve2('Roles y permisos Insertados');
                        })
                        
                    }
                })
            })
        })
        .then(function(data){
            resolve('Agregados');
        })
        

        
    });
    
        
}


module.exports = crearDatosIniciales;

