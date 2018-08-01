db = require('../connWeb');


class ExamenRespuesta {
    
    static formatMilliseconds($milliseconds) {
        let $seconds        = Math.floor($milliseconds / 1000);
		let $minutes        = Math.floor($seconds / 60);
		let $hours          = Math.floor($minutes / 60);
		$milliseconds       = $milliseconds % 1000;
		$seconds            = $seconds % 60;
		$minutes            = $minutes % 60;
        let $time           = '';
        
        
        if ($seconds < 10) {
            $seconds = '0' + $seconds;
        }
        if ($minutes < 10) {
            $minutes = '0' + $minutes;
        }
        if ($milliseconds < 10) {
            $milliseconds = '0' + $milliseconds;
        }
        
        
		if ($hours == 0) {
			$time = '' + $minutes +':'+ $seconds +':'+ $milliseconds;
		}else{
			$time = '' + $hours +':'+ $minutes +':'+ $seconds +':'+ $milliseconds;
		}
		
        //return rtrim($time, '0');
        return $time;
    }
    
    
    
    static calcular($examen) {
        let promesa = new Promise(function(resolve, reject){
            
            let $respuestas     = [];
            
            let $correctas 		= 0;
            let $incorrectas 	= 0;
            let $puntos 		= 0;
            let $tiempo 		= 0;
            let $cantidad_pregs = 0;
            
            let consulta = 'SELECT *, rowid FROM ws_respuestas WHERE examen_respuesta_id=?';
            db.query(consulta, [$examen.examen_id]).then((respuestas)=>{
                $respuestas = respuestas;
                return ExamenRespuesta.cantidadPreguntas($examen.evaluacion_id)
            }).then((cantidad_pregs)=>{
                $cantidad_pregs = cantidad_pregs;
                consulta        = 'SELECT SUM(tiempo) as duracion FROM ws_respuestas WHERE examen_respuesta_id=?';
                return db.query(consulta, [$examen.examen_id])
            }).then((duracion)=>{
                $tiempo = duracion[0].duracion;
                
                let promesas = $respuestas.map((respuesta, $i)=>{
                    let promResp = new Promise(function(resolveResp, rejectResp){
                        
                        if (respuesta.opcion_id) {
                            $consulta 	= 'SELECT *, rowid FROM ws_opciones where rowid=?';
                            db.query($consulta, [ respuesta.opcion_id ] ).then(($opcion)=>{
                                let promPuntos = new Promise(function(resolvePunt, rejectPunt){
                                    
                                    if ($opcion.length > 0) { $opcion = $opcion[0]; }
                                    
                                    if ($opcion.is_correct) {
                                        $correctas++;
                                        $consulta 	= 'SELECT *, rowid FROM ws_preguntas_king where deleted_at is null and rowid=?';
                                        db.query($consulta, [ respuesta.pregunta_king_id ] ).then(($preg_king)=>{
                                            
                                            if ($preg_king.length > 0) { $preg_king = $preg_king[0]; }

                                            $puntos         = $puntos + $preg_king.puntos;
                                            resolvePunt();
                                        });

                                    }else{
                                        $incorrectas++;
                                        resolvePunt();
                                    }
                                })
                                return promPuntos;
                            }).then(()=>{
                                resolveResp();
                            });
                            
                            
                        }else if(respuesta.opcion_agrupada_id){
                            db.query('SELEC *, rowid FROM ws_opcion_agrupada WHERE opcion_agrupada_id=?').then(($opcion)=>{
                                if ($opcion.length > 0) { 
                                    $opcion = $opcion[0]; 
                                    if ($opcion.is_correct) {
                                        $correctas++;
                                        return db.find('ws_preguntas_agrupadas', respuesta.pregunta_agrupada_id)
                                    }
                                }
                                
                            }).then(($preg_agrup)=>{
                                $puntos = $puntos + $preg_agrup.puntos;
                                resolveResp();
                            })
                        }
                        
                    })
                    return promResp;
                })
                return Promise.all(promesas);
            }).then(()=>{
                
                // Calculamos por promedio
                let $promedio = 0;
                if ($cantidad_pregs > 0) {
                    $promedio = $correctas * 100 / $cantidad_pregs;
                }
                        
                let $res 			    = {};
                $res.por_promedio 		= $examen.res_by_promedio;
                $res.promedio 			= $promedio;
                $res.puntos 			= $puntos;
                $res.cantidad_pregs 	= $cantidad_pregs;
                $res.correctas          = $correctas;
                $res.incorrec_reales 	= $incorrectas;
                $res.tiempo 			= parseInt($tiempo);

                $res.tiempo_format      = ExamenRespuesta.formatMilliseconds($res.tiempo);

                var result = Object.assign({}, $examen, $res);
                resolve(result);
            })
            
        })
        return promesa;
    }
    
    
    static cantidadPreguntas($evaluacion_id){
        let promesa = new Promise(function(resolve, reject){
            
            let $cant       = 0;
            let $preguntas  = [];
            let consulta    = 'SELECT *, rowid FROM ws_pregunta_evaluacion WHERE evaluacion_id=?';
            
            db.query(consulta, [$evaluacion_id]).then((preguntas)=>{
                $preguntas = preguntas;
                
                let promesas = $preguntas.map(function($pregunta, $i){
                    let proPreg = new Promise(function(resolvePreg, rejectPreg){

                        if ($pregunta.pregunta_id) {
                            $cant = $cant + 1;
                            resolvePreg();
                        }else{
                            ExamenRespuesta.cantPreguntasEnGrupo($pregunta.grupo_pregs_id).then(($cant_preg_grupo)=>{
                                $cant = $cant + $cant_preg_grupo;
                                resolvePreg();
                            });
                            
                        }	
                    })
                    return proPreg;
                })
                
                return Promise.all(promesas);
                
            }).then(()=>{
                resolve($cant);
            })
            
        })
        return promesa;
    }
    
};

module.exports = ExamenRespuesta;

