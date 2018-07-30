require('dotenv').config();




            

function descargarDatos() {
    
    return new Promise(function(resolve, reject) {
    
        db = require('../conexion/connWeb');
        const axios = require('axios');
        
        const ip = require('ip').address();

        let promesa_http = new Promise(function(resolve_http, reject_http) {
        
            axios.get('http://localhost/wissenLaravel/public/api/datos-laravel/descargar').then(response => {
                resolve_http(response.data);
            
            }).catch(error => {
                console.log('NO HAY LOCALHOST');
                
                axios.get('https://ws.micolevirtual.com/wissenLaravel/public/api/datos-laravel/descargar').then(response => {
                    resolve_http(response.data);
                    
                }).catch(error => {
                    console.log(error);
                    reject_http(error);
                })
                
            })
        
        })
        promesa_http.then(function(datos){
            
            let argum   = '';
            function getValues(data, parentesis){
                let result  = [];
                argum       = ''; // La reiniciamos
                
                for (let index = 0; index < data.length; index++) {
                    var element = data[index];
                    
                    valoresArray = Object.keys(element).map(function(clave){
                        return (element[clave] instanceof Array ? false : element[clave]);
                    })
                    //valoresArray.unshift(valoresArray[0]); // Para el rowid, pero ya está llegando
                    result = result.concat(valoresArray);
                    argum += parentesis;
                }
                argum = argum.substring(0, argum.length - 1) // Para quitar la cómo del final
                return result;
            }
            
            
            
            let entidades = getValues(datos.entidades, '(?,?,?,?,?,?,?,?,?),');
            
            consulta = 'INSERT INTO ws_entidades(rowid, id, nombre, lider_id, lider_nombre, logo_id, telefono, alias, evento_id) VALUES '+argum;
            db.query(consulta, entidades).then((respo)=>{
                console.log(respo);
                let niveles = getValues(datos.niveles, '(?,?,?,?),');
                consulta = 'INSERT INTO ws_niveles_king(rowid, id, nombre, evento_id) VALUES '+argum;
                return db.query(consulta, niveles)
                
            }).then((resp)=>{
                console.log(resp);
                let niveles_traducidas = getValues(datos.niveles_traducidas, '(?,?,?,?,?,?,?),');
                consulta = 'INSERT INTO ws_niveles_traduc(rowid, id, nombre, nivel_id, descripcion, idioma_id, traducido) VALUES '+argum;
                return db.query(consulta, niveles_traducidas)
            }).then((resp)=>{
                console.log(resp);
                let disciplinas = getValues(datos.disciplinas, '(?,?,?,?),');
                consulta = 'INSERT INTO ws_disciplinas_king(rowid, id, nombre, evento_id) VALUES '+argum;
                return db.query(consulta, disciplinas)
            }).then((resp)=>{
                console.log(resp);
                let disciplinas_traducidas = getValues(datos.disciplinas_traducidas, '(?,?,?,?,?,?,?),');
                consulta = 'INSERT INTO ws_disciplinas_traduc(rowid, id, nombre, disciplina_id, descripcion, idioma_id, traducido) VALUES '+argum;
                return db.query(consulta, disciplinas_traducidas)
            }).then((resp)=>{
                console.log(resp);
                let categorias = getValues(datos.categorias, '(?,?,?,?,?,?),');
                consulta = 'INSERT INTO ws_categorias_king(rowid, id, nombre, nivel_id, disciplina_id, evento_id) VALUES '+argum;
                return db.query(consulta, categorias)
            }).then((resp)=>{
                console.log(resp);
                let categorias_traducidas = getValues(datos.categorias_traducidas, '(?,?,?,?,?,?,?,?),');
                consulta = 'INSERT INTO ws_categorias_traduc(rowid, id, nombre, abrev, categoria_id, descripcion, idioma_id, traducido) VALUES '+argum;
                return db.query(consulta, categorias_traducidas)
            }).then((resp)=>{
                console.log(resp);
                let evaluaciones = getValues(datos.evaluaciones, '(?,?,?,?,?,?,?,?,?,?),');
                consulta = 'INSERT INTO ws_evaluaciones(rowid, id, categoria_id, evento_id, actual, descripcion, duracion_preg, duracion_exam, one_by_one, puntaje_por_promedio) VALUES '+argum;
                return db.query(consulta, evaluaciones)
            }).then((resp)=>{
                console.log(resp);
                let promesas_preg = [];
                for (let i = 0; i < datos.preguntas.length; i++) {
                    insertPreg(i);
                }
                
                function insertPreg(i){
                    preg        = datos.preguntas[i];
                    consulta    = 'INSERT INTO ws_preguntas_king(rowid, id, descripcion, tipo_pregunta, duracion, categoria_id, puntos, aleatorias, added_by) VALUES (?,?,?,?,?,?,?,?,?)';
                    let prome   = db.query(consulta, Object.keys(preg).map((clave)=> preg[clave]) );
                    promesas_preg.push(prome);
                }
                
                return Promise.all(promesas_preg);
            }).then((resp)=>{
                console.log(resp);
                let promesas_preg = [];
                for (let i = 0; i < datos.preguntas_traducidas.length; i++) {
                    insertPreg(i);
                }
                
                function insertPreg(i){
                    preg        = datos.preguntas_traducidas[i];
                    consulta    = 'INSERT INTO ws_pregunta_traduc(rowid, id, enunciado, ayuda, pregunta_id, idioma_id, texto_arriba, texto_abajo, traducido) VALUES (?,?,?,?,?,?,?,?,?)';
                    let prome   = db.query(consulta, Object.keys(preg).map((clave)=> preg[clave]) );
                    promesas_preg.push(prome);
                }
                
                return Promise.all(promesas_preg);
            }).then((resp)=>{
                console.log(resp);
                let promesas_opc = [];
                for (let i = 0; i < datos.opciones.length; i++) {
                    insertPreg(i);
                }
                
                function insertPreg(i){
                    opc         = datos.opciones[i];
                    consulta    = 'INSERT INTO ws_opciones(rowid, id, definicion, pregunta_traduc_id, image_id, orden, is_correct, added_by) VALUES (?,?,?,?,?,?,?,?)';
                    let prome   = db.query(consulta, Object.keys(opc).map((clave)=> opc[clave]) );
                    promesas_opc.push(prome);
                }
                
                return Promise.all(promesas_opc);
            }).then((resp)=>{
                console.log(resp);
                let promesas_opc = [];
                for (let i = 0; i < datos.pregunta_evaluacion.length; i++) {
                    insertPregEv(i);
                }
                
                function insertPregEv(i){
                    opc         = datos.pregunta_evaluacion[i];
                    consulta    = 'INSERT INTO ws_pregunta_evaluacion(rowid, id, evaluacion_id, pregunta_id, grupo_pregs_id, orden, aleatorias, added_by) VALUES (?,?,?,?,?,?,?,?)';
                    let prome   = db.query(consulta, Object.keys(opc).map((clave)=> opc[clave]) );
                    promesas_opc.push(prome);
                }
                
                return Promise.all(promesas_opc);
            }).then((resp)=>{
                resolve('Agregados');
            })
            
            
        })
        
    });
    
        
}


module.exports = descargarDatos;

