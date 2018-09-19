db = require('../connWeb');


class Pregunta {
	

	static deEvaluacion($evaluacion_id, $exa_resp_id) {
		let promesa = new Promise(function(resolve, reject){
			
			$exa_resp_id = $exa_resp_id || 0;
			
			let $consulta = "SELECT p.*, p.rowid, pe.evaluacion_id, pe.orden FROM ws_preguntas_king p " +
				"inner join ws_pregunta_evaluacion pe on pe.pregunta_id=p.rowid " +
				"where pe.evaluacion_id=? and p.deleted_at is null order by orden;";

			db.query($consulta, [$evaluacion_id] ).then(($preguntas_king)=>{
				
				let promises    = [];

				for(let $i=0; $i < $preguntas_king.length; $i++){
					traducidos($i);
				}
				function traducidos($i){
					let $promesa_pregs_trad = Pregunta.traducidas($preguntas_king, $i, $exa_resp_id);
					promises.push($promesa_pregs_trad);
				}
				
				Promise.all(promises).then((result)=>{
					resolve($preguntas_king);
				})
			})
			
		})
		return promesa;
	}
	
	
	static traducidas($preguntas_king, $i, $exa_resp_id){
		return new Promise(function(resolve_pregs_traducidas, reject_pregs_evaluacioines){
			let $consulta = "SELECT t.id, t.rowid, t.enunciado, t.ayuda, t.pregunta_id, r.rowid as respuesta_id, r.tiempo, " +
					"t.idioma_id, t.traducido, i.nombre as idioma " +
				"FROM ws_pregunta_traduc t, ws_idiomas i " +
				"LEFT JOIN ws_respuestas r ON r.preg_traduc_id=t.rowid and r.examen_respuesta_id=? " + 
				"where i.id=t.idioma_id and t.pregunta_id =? and t.deleted_at is null";

			db.query($consulta, [ $exa_resp_id, $preguntas_king[$i].rowid ] ).then((result_trads)=>{

				$preguntas_king[$i].preguntas_traducidas = result_trads;
			
				let mapeando_preguntas_traducidas = $preguntas_king[$i].preguntas_traducidas.map((pregunta_traducida, $i)=>{
					let $promesa_pregs_evaluaciones = new Promise(function(resolve_opciones, reject_opciones){
					
						
						$consulta = 'SELECT o.id, o.rowid, o.definicion, o.orden, o.pregunta_traduc_id, o.is_correct ' + 
								'FROM ws_opciones o ' + 
								'WHERE o.pregunta_traduc_id =?';

						db.query($consulta, [pregunta_traducida.rowid] ).then((opciones)=>{
							pregunta_traducida.opciones = opciones;

							if ($exa_resp_id) {
								
								let mapeando_opciones = pregunta_traducida.opciones.map((opcion, $i)=>{
									let $promesa_opciones = new Promise(function(resolve_respuesta, reject_respuesta){
										
										
										$consulta = 'SELECT r.*, r.rowid FROM ws_respuestas r ' + 
												'WHERE r.opcion_id=? and r.examen_respuesta_id=? and pregunta_agrupada_id is null';

										db.query($consulta, [opcion.rowid, $exa_resp_id] ).then(($respuesta)=>{
											
											if ($respuesta.length > 0) {
												opcion.elegida       = true;
												opcion.respondida    = true;
											}
											resolve_respuesta(opcion); // Para Promise.all(mapeando_opciones)
										});
									})
									return $promesa_opciones;
								})
								
								return Promise.all(mapeando_opciones)
							}else{
								return new Promise((resolve_dumb)=> resolve_dumb() );
							}
							
						}).then(()=>{
							resolve_opciones(); // Para Promise.all(mapeando_opciones)
						});

						
					})
					return $promesa_pregs_evaluaciones;
				})

				return Promise.all(mapeando_preguntas_traducidas)
			}).then((result)=>{
				resolve_pregs_traducidas(result)
			});
		});

	}
	
	

	static unaPGPregunta($idioma_id, $pg_id) {
		let promesa = new Promise(function(resolve, reject){
			
			let $pg_pregunta = {};
			
			// Traemos la pregunta creada con sus datos traducidos
			let $consulta = 'SELECT pk.rowid as pg_id, 1 as is_preg, pk.descripcion, pk.tipo_pregunta, pk.duracion, pk.categoria_id, pk.puntos, pk.aleatorias, pk.added_by, pk.created_at as gp_created_at, pk.updated_at as gp_updated_at,  ' +
					'pt.rowid as pg_traduc_id, pt.enunciado, NULL as definicion, pt.ayuda, pt.idioma_id, pt.texto_arriba, pt.texto_abajo, pt.traducido, pt.updated_at as pgt_updated_at ' +
				'FROM ws_preguntas_king pk ' +
				'INNER JOIN ws_pregunta_traduc pt on pt.pregunta_id=pk.rowid and pt.idioma_id=? and pt.deleted_at is null ' +
				'WHERE pk.rowid=?';

			db.query($consulta, [$idioma_id, $pg_id] ).then((pg_pregunta)=>{
				$pg_pregunta = pg_pregunta[0];
				// Le traemos las opciones
				$consulta = 'SELECT o.rowid, o.definicion, o.orden, o.pregunta_traduc_id, o.is_correct, o.added_by, o.created_at, o.updated_at  ' +
						'FROM ws_opciones o ' +
						'WHERE o.pregunta_traduc_id=?';

				return db.query($consulta, [$pg_pregunta.pg_traduc_id] );
				
			}).then(($opciones)=>{
				$pg_pregunta.opciones = $opciones;
				resolve($pg_pregunta);
			})
		})
		return promesa;
	}
	
	
	
};

module.exports = Pregunta;

