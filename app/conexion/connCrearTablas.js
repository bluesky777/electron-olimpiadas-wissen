require('dotenv').config();




sqlImages = "CREATE TABLE IF NOT EXISTS images ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nombre` varchar(255) NOT NULL collate nocase, " +
    "`user_id` int(11) DEFAULT NULL, " +
    "`publica` int(1) DEFAULT NULL, " +
    "`created_by` int(11) DEFAULT NULL, " +
    "`updated_by` int(11) DEFAULT NULL, " +
    "`deleted_by` int(11) DEFAULT NULL, " +
    "`deleted_at` timestamp DEFAULT NULL, " +
    "`created_at` timestamp DEFAULT NULL, " +
    "`updated_at` timestamp DEFAULT NULL)"; 

sqlPermission_role = "CREATE TABLE IF NOT EXISTS permission_role ( " +
    "`permission_id` int(10) DEFAULT NULL, " +
    "`role_id` int(10) DEFAULT NULL)"; 

sqlPermissions = "CREATE TABLE IF NOT EXISTS permissions ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`name` varchar(255) NOT NULL collate nocase, " +
    "`display_name` varchar(255) DEFAULT NULL collate nocase, " +
    "`description` varchar(255) DEFAULT NULL collate nocase, " +
    "`created_at` timestamp DEFAULT NULL, " +
    "`updated_at` timestamp DEFAULT NULL)"; 

sqlPids = "CREATE TABLE IF NOT EXISTS pids ( " +
    "`id` int(10) DEFAULT  NULL, " +
    "`codigo` text NOT NULL collate nocase)"; 

sqlQrcodes = "CREATE TABLE IF NOT EXISTS qrcodes ( " +
    "  `id` int(10) DEFAULT NULL, " +
    "`codigo` varchar(255) NOT NULL, " +
    "`comando` varchar(255) DEFAULT NULL, " +
    "`parametro` varchar(255) DEFAULT NULL, " +
    "`reconocido` int(1) NOT NULL DEFAULT '0', " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlRoles = "CREATE TABLE IF NOT EXISTS roles ( " +
    "`id` int(10) NULL , " +
    "`name` varchar(255) NOT NULL collate nocase, " +
    "`display_name` varchar(255) DEFAULT NULL collate nocase, " +
    "`description` varchar(255) DEFAULT NULL collate nocase, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlRole_user = "CREATE TABLE IF NOT EXISTS role_user ( " +
    "`user_id` int(10) NOT NULL, " +
    "`role_id` int(10) NOT NULL)"; 

sqlUsers = "CREATE TABLE IF NOT EXISTS users ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nombres` varchar(255) NOT NULL collate nocase, " +
    "`apellidos` varchar(255) DEFAULT NULL collate nocase, " +
    "`sexo` varchar(255) NOT NULL DEFAULT 'M' collate nocase, " +
    "`username` varchar(255) NOT NULL collate nocase, " +
    "`password` varchar(60) NOT NULL DEFAULT '', " +
    "`email` varchar(255) DEFAULT NULL collate nocase, " +
    "`entidad_id` int(10) DEFAULT NULL, " +
    "`is_superuser` int(1) NOT NULL DEFAULT '0', " +
    "`cell` varchar(255) DEFAULT NULL collate nocase, " +
    "`edad` int(11) DEFAULT NULL, " +
    "`imagen_id` int(10) DEFAULT NULL, " +
    "`idioma_main_id` int(10) DEFAULT '1', " +
    "`evento_selected_id` int(10) DEFAULT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`remember_token` varchar(100) DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_categorias_king = "CREATE TABLE IF NOT EXISTS ws_categorias_king ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nombre` varchar(255) DEFAULT NULL collate nocase, " +
    "`nivel_id` int(10) DEFAULT NULL, " +
    "`disciplina_id` int(10) DEFAULT NULL, " +
    "`evento_id` int(10) NOT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_categorias_traduc = "CREATE TABLE IF NOT EXISTS ws_categorias_traduc ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nombre` varchar(255)  DEFAULT NULL collate nocase, " +
    "`abrev` varchar(255)  DEFAULT NULL collate nocase, " +
    "`categoria_id` int(10) NOT NULL, " +
    "`descripcion` varchar(255) DEFAULT NULL collate nocase, " +
    "`idioma_id` int(10) NOT NULL, " +
    "`traducido` int(1) DEFAULT '0', " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_contenido_traduc = "CREATE TABLE IF NOT EXISTS ws_contenido_traduc ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`definicion` text  collate nocase, " +
    "`grupo_pregs_id` int(10) NOT NULL, " +
    "`idioma_id` int(10) NOT NULL, " +
    "`traducido` int(1) DEFAULT '0', " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_disciplinas_king = "CREATE TABLE IF NOT EXISTS ws_disciplinas_king ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nombre` varchar(255) DEFAULT NULL collate nocase, " +
    "`evento_id` int(10) NOT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 


sqlWs_disciplinas_traduc = "CREATE TABLE IF NOT EXISTS ws_disciplinas_traduc ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nombre` varchar(255) DEFAULT NULL collate nocase, " +
    "`disciplina_id` int(10) NOT NULL, " +
    "`descripcion` varchar(255) DEFAULT NULL collate nocase, " +
    "`idioma_id` int(10) NOT NULL, " +
    "`traducido` tinyint(1) DEFAULT '0', " +
    "`created_by` int(10) DEFAULT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_entidades = "CREATE TABLE IF NOT EXISTS ws_entidades ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nombre` varchar(255) NOT NULL collate nocase, " +
    "`lider_id` int(10) DEFAULT NULL, " +
    "`lider_nombre` varchar(255) DEFAULT NULL collate nocase, " +
    "`logo_id` int(10) DEFAULT NULL, " +
    "`telefono` varchar(255) DEFAULT NULL collate nocase, " +
    "`alias` varchar(255) DEFAULT NULL collate nocase, " +
    "`evento_id` int(10) NOT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_evaluaciones = "CREATE TABLE IF NOT EXISTS ws_evaluaciones ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`categoria_id` int(10) DEFAULT NULL, " +
    "`evento_id` int(10) NOT NULL, " +
    "`actual` int(1) DEFAULT '0', " +
    "`descripcion` varchar(255) DEFAULT NULL collate nocase, " +
    "`duracion_preg` int(11) DEFAULT NULL, " +
    "`duracion_exam` int(11) DEFAULT NULL, " +
    "`one_by_one` int(1) DEFAULT NULL, " +
    "`puntaje_por_promedio` int(11) DEFAULT '1', " +
    "`created_by` int(10) DEFAULT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_eventos = "CREATE TABLE IF NOT EXISTS ws_eventos ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nombre` varchar(255) NOT NULL collate nocase, " +
    "`alias` varchar(255) DEFAULT NULL collate nocase, " +
    "`descripcion` varchar(255) DEFAULT NULL collate nocase, " +
    "`password` varchar(255) DEFAULT NULL, " +
    "`mostrar_nombre_punto` int(1) NOT NULL DEFAULT '1', " +
    "`gran_final` int(1) DEFAULT '0', " +
    "`with_pay` int(1) DEFAULT NULL, " +
    "`por_sumatoria_puntos` int(1) DEFAULT '0', " +
    "`actual` int(1) DEFAULT '0', " +
    "`mostrar_si_acierta` int(1) NOT NULL DEFAULT '0', " +
    "`precio1` int(11) DEFAULT NULL, " +
    "`precio2` int(11) DEFAULT NULL, " +
    "`precio3` int(11) DEFAULT NULL, " +
    "`precio4` int(11) DEFAULT NULL, " +
    "`precio5` int(11) DEFAULT NULL, " +
    "`precio6` int(11) DEFAULT NULL, " +
    "`idioma_principal_id` int(10) DEFAULT NULL, " +
    "`es_idioma_unico` int(1) DEFAULT '0', " +
    "`enable_public_chat` int(1) DEFAULT NULL, " +
    "`enable_private_chat` int(1) DEFAULT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_examen_respuesta = "CREATE TABLE IF NOT EXISTS ws_examen_respuesta ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`inscripcion_id` int(10) NOT NULL, " +
    "`evaluacion_id` int(10) NOT NULL, " +
    "`idioma_id` int(10) NOT NULL DEFAULT '1', " +
    "`categoria_id` int(10) NOT NULL, " +
    "`active` int(1) NOT NULL DEFAULT '1', " +
    "`gran_final` int(1) NOT NULL DEFAULT '0', " +
    "`terminado` int(1) NOT NULL DEFAULT '0', " +
    "`timeout` int(1) NOT NULL DEFAULT '1', " +
    "`res_correctas` int(11) DEFAULT NULL, " +
    "`res_incorrectas` int(11) DEFAULT NULL, " +
    "`res_by_promedio` int(1) DEFAULT '1', " +
    "`res_promedio` decimal(6,3) DEFAULT NULL, " +
    "`res_puntos` int(11) DEFAULT NULL, " +
    "`res_cant_pregs` int(11) DEFAULT NULL, " +
    "`res_tiempo` int(11) DEFAULT NULL, " +
    "`res_tiempo_format` varchar(255) DEFAULT NULL collate nocase, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 
    
sqlWs_grupos_preguntas = "CREATE TABLE IF NOT EXISTS ws_grupos_preguntas ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`descripcion` varchar(255) DEFAULT NULL collate nocase, " +
    "`categoria_id` int(10) NOT NULL, " +
    "`is_cuadricula` int(1) DEFAULT '0', " +
    "`added_by` int(10) DEFAULT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_idiomas = "CREATE TABLE IF NOT EXISTS ws_idiomas ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nombre` varchar(255) DEFAULT NULL collate nocase, " +
    "`abrev` varchar(255) DEFAULT NULL collate nocase, " +
    "`original` varchar(255) DEFAULT NULL collate nocase, " +
    "`used_by_system` int(1) DEFAULT '0', " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_idiomas_registrados = "CREATE TABLE IF NOT EXISTS ws_idiomas_registrados ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`evento_id` int(10) NOT NULL, " +
    "`idioma_id` int(10) NOT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_inscripciones = "CREATE TABLE IF NOT EXISTS ws_inscripciones ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`categoria_id` int(10) NOT NULL, " +
    "`user_id` int(10) NOT NULL, " +
    "`allowed_to_answer` int(1) DEFAULT '1', " +
    "`signed_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_niveles_king = "CREATE TABLE IF NOT EXISTS ws_niveles_king ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nombre` varchar(255)  DEFAULT NULL collate nocase, " +
    "`evento_id` int(10) NOT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_niveles_traduc = "CREATE TABLE IF NOT EXISTS ws_niveles_traduc ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nombre` varchar(255)  DEFAULT NULL collate nocase, " +
    "`nivel_id` int(10) NOT NULL, " +
    "`descripcion` varchar(255) DEFAULT NULL collate nocase, " +
    "`idioma_id` int(10) NOT NULL, " +
    "`traducido` int(1) DEFAULT '0', " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_nivel_participante = "CREATE TABLE IF NOT EXISTS ws_nivel_participante ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`nivel_id` int(10) NOT NULL, " +
    "`user_id` int(10) NOT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_opciones = "CREATE TABLE IF NOT EXISTS ws_opciones ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`definicion` text collate nocase, " +
    "`pregunta_traduc_id` int(10) NOT NULL, " +
    "`image_id` int(10) DEFAULT NULL, " +
    "`orden` int(10) DEFAULT NULL, " +
    "`is_correct` int(1) DEFAULT '0', " +
    "`added_by` int(10) DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_opciones_agrupadas = "CREATE TABLE IF NOT EXISTS ws_opciones_agrupadas ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`definicion` varchar(255) DEFAULT NULL collate nocase, " +
    "`preg_agrupada_id` int(10) NOT NULL, " +
    "`orden` int(10) DEFAULT NULL, " +
    "`is_correct` int(1) DEFAULT NULL, " +
    "`added_by` int(10) DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_opciones_cuadricula = "CREATE TABLE IF NOT EXISTS ws_opciones_cuadricula ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`definicion` varchar(255) DEFAULT NULL, " +
    "`contenido_traduc_id` int(10) NOT NULL, " +
    "`icono` varchar(255) DEFAULT NULL, " +
    "`added_by` int(10) DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_pregunta_evaluacion = "CREATE TABLE IF NOT EXISTS ws_pregunta_evaluacion ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`evaluacion_id` int(10) DEFAULT NULL, " +
    "`pregunta_id` int(10) DEFAULT NULL, " +
    "`grupo_pregs_id` int(10) DEFAULT NULL, " +
    "`orden` int(10) DEFAULT NULL, " +
    "`aleatorias` int(1) DEFAULT '0', " +
    "`added_by` int(10) DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_preguntas_agrupadas = "CREATE TABLE IF NOT EXISTS ws_preguntas_agrupadas ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`enunciado` text collate nocase, " +
    "`ayuda` varchar(255) DEFAULT NULL collate nocase, " +
    "`contenido_id` int(10) NOT NULL, " +
    "`duracion` int(10) DEFAULT NULL, " +
    "`tipo_pregunta` varchar(255) DEFAULT NULL collate nocase, " +
    "`puntos` int(10) NOT NULL DEFAULT '0', " +
    "`aleatorias` int(1) DEFAULT '0', " +
    "`orden` int(10) DEFAULT NULL, " +
    "`added_by` int(10) DEFAULT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_preguntas_king = "CREATE TABLE IF NOT EXISTS ws_preguntas_king ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`descripcion` varchar(255) DEFAULT NULL collate nocase, " +
    "`tipo_pregunta` varchar(255) DEFAULT NULL collate nocase, " +
    "`duracion` int(10) DEFAULT NULL, " +
    "`categoria_id` int(10) NOT NULL, " +
    "`puntos` int(10) NOT NULL DEFAULT '0', " +
    "`aleatorias` int(1) DEFAULT '0', " +
    "`added_by` int(10) DEFAULT NULL, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_pregunta_traduc = "CREATE TABLE IF NOT EXISTS ws_pregunta_traduc ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`enunciado` text collate nocase, " +
    "`ayuda` varchar(255) DEFAULT NULL collate nocase, " +
    "`pregunta_id` int(10) NOT NULL, " +
    "`idioma_id` int(10) NOT NULL, " +
    "`texto_arriba` varchar(255) DEFAULT NULL collate nocase, " +
    "`texto_abajo` varchar(255) DEFAULT NULL collate nocase, " +
    "`deleted_by` int(10) DEFAULT NULL, " +
    "`traducido` int(1) DEFAULT '0', " +
    "`deleted_at` timestamp NULL DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_respuestas = "CREATE TABLE IF NOT EXISTS ws_respuestas ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`examen_respuesta_id` int(10) DEFAULT NULL, " +
    "`pregunta_king_id` int(10) DEFAULT NULL, " +
    "`preg_traduc_id` int(10) DEFAULT NULL, " +
    "`grupo_preg_id` int(10) DEFAULT NULL, " +
    "`pregunta_agrupada_id` int(10) DEFAULT NULL, " +
    "`tiempo` int(20) DEFAULT NULL, " +
    "`tiempo_aproximado` int(20) DEFAULT NULL, " +
    "`idioma_id` int(10) DEFAULT NULL, " +
    "`tipo_pregunta` varchar(255) DEFAULT NULL collate nocase, " +
    "`puntos_maximos` int(10) DEFAULT NULL, " +
    "`puntos_adquiridos` int(10) DEFAULT NULL, " +
    "`opcion_id` int(10) DEFAULT NULL, " +
    "`opcion_agrupada_id` int(10) DEFAULT NULL, " +
    "`opcion_cuadricula_id` int(10) DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

sqlWs_user_event = "CREATE TABLE IF NOT EXISTS ws_user_event ( " +
    "`id` int(10) DEFAULT NULL, " +
    "`user_id` int(10) DEFAULT NULL, " +
    "`evento_id` int(10) DEFAULT NULL, " +
    "`nivel_id` int(10) DEFAULT NULL, " +
    "`pagado` int(11) DEFAULT NULL, " +
    "`pazysalvo` int(1) DEFAULT '0', " +
    "`ganador` int(1) NOT NULL DEFAULT '0', " +
    "`signed_by` int(10) DEFAULT NULL, " +
    "`created_at` timestamp NULL DEFAULT NULL, " +
    "`updated_at` timestamp NULL DEFAULT NULL)"; 

    

            

function createTable() {
    
    return new Promise(function(resolve, reject) {
    
        db = require('../conexion/connWeb');
        //db = new db();
        db.query(sqlImages).then(function(res){
            console.log('tabla imagenes creada');
            return db.query(sqlPermission_role);
        }).then(function(res){
            console.log('tabla Permission_role creada');
            return db.query(sqlPermissions);
        }).then(function(res){
            console.log('tabla Permissions creada');
            return db.query(sqlPids);
        }).then(function(res){
            console.log('tabla Pids creada');
            return db.query(sqlQrcodes);
        }).then(function(res){
            console.log('tabla Qrcodes creada');
            return db.query(sqlRoles);
        }).then(function(res){
            console.log('tabla Roles creada');
            return db.query(sqlRole_user);
        }).then(function(res){
            console.log('tabla Role_user creada');
            return db.query(sqlUsers);
        }).then(function(res){
            console.log('tabla Users creada');
            return db.query(sqlWs_categorias_king);
        }).then(function(res){
            console.log('tabla categorias_king creada');
            return db.query(sqlWs_categorias_traduc);
        }).then(function(res){
            console.log('tabla categorias_traduc creada');
            return db.query(sqlWs_contenido_traduc);
        }).then(function(res){
            console.log('tabla contenido_traduc creada');
            return db.query(sqlWs_disciplinas_king);
        }).then(function(res){
            console.log('tabla disciplinas_king creada');
            return db.query(sqlWs_disciplinas_traduc);
        }).then(function(res){
            console.log('tabla disciplinas_traduc creada');
            return db.query(sqlWs_entidades);
        }).then(function(res){
            console.log('tabla entidades creada');
            return db.query(sqlWs_evaluaciones);
        }).then(function(res){
            console.log('tabla evaluaciones creada');
            return db.query(sqlWs_eventos);
        }).then(function(res){
            console.log('tabla eventos creada');
            return db.query(sqlWs_examen_respuesta);
        }).then(function(res){
            console.log('tabla examen_respuesta creada');
            return db.query(sqlWs_grupos_preguntas);
        }).then(function(res){
            console.log('tabla grupos_preguntas creada');
            return db.query(sqlWs_idiomas);
        }).then(function(res){
            console.log('tabla idiomas creada');
            return db.query(sqlWs_idiomas_registrados);
        }).then(function(res){
            console.log('tabla idiomas_registrados creada');
            return db.query(sqlWs_inscripciones);
        }).then(function(res){
            console.log('tabla inscripciones creada');
            return db.query(sqlWs_niveles_king);
        }).then(function(res){
            console.log('tabla niveles_king creada');
            return db.query(sqlWs_niveles_traduc);
        }).then(function(res){
            console.log('tabla niveles_traduc creada');
            return db.query(sqlWs_nivel_participante);
        }).then(function(res){
            console.log('tabla nivel_participante creada');
            return db.query(sqlWs_opciones);
        }).then(function(res){
            console.log('tabla opciones creada');
            return db.query(sqlWs_opciones_agrupadas);
        }).then(function(res){
            console.log('tabla opciones_agrupadas creada');
            return db.query(sqlWs_opciones_cuadricula);
        }).then(function(res){
            console.log('tabla opciones_cuadricula creada');
            return db.query(sqlWs_pregunta_evaluacion);
        }).then(function(res){
            console.log('tabla pregunta_evaluacion creada');
            return db.query(sqlWs_preguntas_agrupadas);
        }).then(function(res){
            console.log('tabla preguntas_agrupadas creada');
            return db.query(sqlWs_preguntas_king);
        }).then(function(res){
            console.log('tabla preguntas_king creada');
            return db.query(sqlWs_pregunta_traduc);
        }).then(function(res){
            console.log('tabla pregunta_traduc creada');
            return db.query(sqlWs_respuestas);
        }).then(function(res){
            console.log('tabla respuestas creada');
            return db.query(sqlWs_user_event);
        }).then(function(res){
            console.log('tabla user_event creada');
            console.log('TODAS LAS TABLAS CREADAS');
            resolve()
        })
        
    });
    
        
}


module.exports = createTable;

