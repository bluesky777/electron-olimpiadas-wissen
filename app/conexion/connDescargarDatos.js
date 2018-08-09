require('dotenv').config();




            

function descargarDatos(evento_id) {
    if (!evento_id){ evento_id = 1 };
    
    return new Promise(function(resolve, reject) {
    
        db = require('../conexion/connWeb');
        const axios = require('axios');
        
        const ip = require('ip').address();

        let promesa_http = new Promise(function(resolve_http, reject_http) {
        
            axios.get('http://localhost/wissenLaravel/public/api/datos-laravel/descargar?evento_id='+evento_id).then(response => {
                resolve_http(response.data);
            
            }).catch(error => {
                console.log('NO HAY LOCALHOST, DESCARGAREMOS DE INTERNET');
                
                axios.get('https://ws.micolevirtual.com/wissenLaravel/public/api/datos-laravel/descargar?evento_id='+evento_id).then(response => {
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
                let now     = window.fixDate(new Date(), true);
                
                for (let index = 0; index < data.length; index++) {
                    var element = data[index];
                    
                    valoresArray = Object.keys(element).map(function(clave){
                        return (element[clave] instanceof Array ? false : element[clave]);
                    })
                    valoresArray.push(now);
                    result = result.concat(valoresArray);
                    argum += parentesis;
                }
                argum = argum.substring(0, argum.length - 1) // Para quitar la cómo del final
                return result;
            }
            
            let promesas    = [];
            
            
            if (datos.entidades.length > 0) {
                let entidades   = getValues(datos.entidades, '(?,?,?,?,?,?,?,?,?,?),');
                
                consulta = 'INSERT INTO ws_entidades(rowid, id, nombre, lider_id, lider_nombre, logo_id, telefono, alias, evento_id, created_at) VALUES '+argum;
                let pEnt = db.query(consulta, entidades).then((respo)=>{
                    console.log(respo);
                })
                promesas.push(pEnt);
            }
            
            
            let niveles = getValues(datos.niveles, '(?,?,?,?,?),');
            consulta = 'INSERT INTO ws_niveles_king(rowid, id, nombre, evento_id, created_at) VALUES '+argum;
            let pNiv = db.query(consulta, niveles).then((resp)=>{
                console.log(resp);
            })
            promesas.push(pNiv);
            
            let niveles_traducidas = getValues(datos.niveles_traducidas, '(?,?,?,?,?,?,?,?),');
            consulta = 'INSERT INTO ws_niveles_traduc(rowid, id, nombre, nivel_id, descripcion, idioma_id, traducido, created_at) VALUES '+argum;
            let pNivT = db.query(consulta, niveles_traducidas).then((resp)=>{
                console.log(resp);
            })
            promesas.push(pNivT);
            
            let disciplinas = getValues(datos.disciplinas, '(?,?,?,?,?),');
            consulta = 'INSERT INTO ws_disciplinas_king(rowid, id, nombre, evento_id, created_at) VALUES '+argum;
            let pDis = db.query(consulta, disciplinas).then((resp)=>{
                console.log(resp);
            })
            promesas.push(pDis);
             
            let disciplinas_traducidas = getValues(datos.disciplinas_traducidas, '(?,?,?,?,?,?,?,?),');
            consulta = 'INSERT INTO ws_disciplinas_traduc(rowid, id, nombre, disciplina_id, descripcion, idioma_id, traducido, created_at) VALUES '+argum;
            let pDisT = db.query(consulta, disciplinas_traducidas).then((resp)=>{
                console.log(resp);
            })
            promesas.push(pDisT);
            
            let categorias = getValues(datos.categorias, '(?,?,?,?,?,?,?),');
            consulta = 'INSERT INTO ws_categorias_king(rowid, id, nombre, nivel_id, disciplina_id, evento_id, created_at) VALUES '+argum;
            let pCat = db.query(consulta, categorias).then((resp)=>{
                console.log(resp);
            })
            promesas.push(pCat);
            
            let categorias_traducidas = getValues(datos.categorias_traducidas, '(?,?,?,?,?,?,?,?,?),');
            consulta = 'INSERT INTO ws_categorias_traduc(rowid, id, nombre, abrev, categoria_id, descripcion, idioma_id, traducido, created_at) VALUES '+argum;
            let pCatT = db.query(consulta, categorias_traducidas).then((resp)=>{
                console.log(resp);
            })
            promesas.push(pCatT);
            
            let evaluaciones = getValues(datos.evaluaciones, '(?,?,?,?,?,?,?,?,?,?,?),');
            consulta = 'INSERT INTO ws_evaluaciones(rowid, id, categoria_id, evento_id, actual, descripcion, duracion_preg, duracion_exam, one_by_one, puntaje_por_promedio, created_at) VALUES '+argum;
            let pEva = db.query(consulta, evaluaciones).then((resp)=>{
                console.log(resp);
            })
            promesas.push(pEva);
            
            Promise.all(promesas).then((resp)=>{
                console.log(resp);
            });
            
            
            let now             = window.fixDate(new Date(), true);
            let promesas_preg   = [];
            for (let i = 0; i < datos.preguntas.length; i++) {
                insertPreg(i);
            }
            
            function insertPreg(i){
                preg        = datos.preguntas[i];
                preg.fech   = now;
                consulta    = 'INSERT INTO ws_preguntas_king(rowid, id, descripcion, tipo_pregunta, duracion, categoria_id, puntos, aleatorias, added_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)';
                let prome   = db.query(consulta, Object.keys(preg).map((clave)=> preg[clave]) );
                promesas_preg.push(prome);
            }
            Promise.all(promesas_preg).then((resp)=>{
                console.log(resp);
            })
            
            
            promesas_pregT = [];
            for (let i = 0; i < datos.preguntas_traducidas.length; i++) {
                insertPregT(i);
            }
            
            function insertPregT(i){
                preg        = datos.preguntas_traducidas[i];
                preg.fech   = now;
                consulta    = 'INSERT INTO ws_pregunta_traduc(rowid, id, enunciado, ayuda, pregunta_id, idioma_id, texto_arriba, texto_abajo, traducido, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)';
                let prome   = db.query(consulta, Object.keys(preg).map((clave)=> preg[clave]) );
                promesas_pregT.push(prome);
            }
            
            Promise.all(promesas_pregT).then((resp)=>{
                console.log(resp);
            })
            
            
            let promesas_preg_ev = [];
            for (let i = 0; i < datos.pregunta_evaluacion.length; i++) {
                insertPregEv(i);
            }
            
            function insertPregEv(i){
                opc         = datos.pregunta_evaluacion[i];
                opc.fech    = now;
                consulta    = 'INSERT INTO ws_pregunta_evaluacion(rowid, id, evaluacion_id, pregunta_id, grupo_pregs_id, orden, aleatorias, added_by, created_at) VALUES (?,?,?,?,?,?,?,?,?)';
                let prome   = db.query(consulta, Object.keys(opc).map((clave)=> opc[clave]) );
                promesas_preg_ev.push(prome);
            }
            
            Promise.all(promesas_preg_ev).then((resp)=>{
                console.log(resp);
            })
            
            
            
            let promesas_opc=[];
            for (let i = 0; i < datos.opciones.length; i++) {
                insertOpc(i);
            }
            
            function insertOpc(i){
                opc         = datos.opciones[i];
                opc.fech    = now;
                consulta    = 'INSERT INTO ws_opciones(rowid, id, definicion, pregunta_traduc_id, image_id, orden, is_correct, added_by, created_at) VALUES (?,?,?,?,?,?,?,?,?)';
                let prome   = db.query(consulta, Object.keys(opc).map((clave)=> opc[clave]) );
                promesas_opc.push(prome);
            }
            
            Promise.all(promesas_opc).then((resp)=>{
                resolve('Agregados');
            })
            
            
        })
        
    });
    
        
}


module.exports = descargarDatos;

