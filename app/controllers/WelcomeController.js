var express     = require('express');
var router      = express.Router();
db              = require('../conexion/connWeb');

// Enrutadores
router.route('/')
    .get(getRouteHandler)
    .post(postRouteHandler);

router.route('/crear-tablas').get(getCrearTablas);
router.route('/descargar-datos').get(getDescargarDatos);
router.route('/borrar-datos').get(getBorrarDatos);
router.route('/descargar-excel').get(getDescargarExcel);



// Funciones
function getRouteHandler(req, res) {
    
    var ip = require('ip');
    var ip = ip.address();
    var Eventos = require('../conexion/Models/Evento');
    
    Eventos.actual().then(function(result){
        promesa = new Promise(function(resolve, reject){
            evento      = result;
            evento.ip   = ip;
            
            if (req.qr == false || !req.qr) {
                let QrCodes = require('../conexion/Models/QrCode');
                let numero  = (Math.floor(Math.random() * Math.floor(9999))).toString();
                
                QrCodes.crear(numero, 'let_in').then(function(result2){
                    evento.qr   = numero;
                    resolve(evento);
                });
                
            }else{
                resolve(evento);
            }
        });
        return promesa;
    })
    .then(function(evento){        
        res.json(evento);
    });
    

}

function postRouteHandler(req, res) {
    //handle POST route here
}

function getCrearTablas(req, res) {
    crear = require('../conexion/connCrearTablas')().then(()=>{
        require('../conexion/connCrearDatosIniciales')().then(()=>{
            res.send('Tablas Creadas y datos iniciales agregados');
        });
    });
}



function getDescargarDatos(req, res) {
    require('../conexion/connDescargarDatos')().then(()=>{
        res.send('Datos descargados');
    }, (r2)=>{
        res.send('Hubo un error descargando Datos');
        console.log(r2)
    });
}





function getDescargarExcel(req, res) {
    const excel = require('node-excel-export');
 
    // You can define styles as json object
    const styles = {
      headerDark: {
        fill: {
          fgColor: {
            rgb: 'FF000000'
          }
        },
        font: {
          color: {
            rgb: 'FFFFFFFF'
          },
          sz: 14,
          bold: true,
          underline: true
        }
      },
      cellPink: {
        fill: {
          fgColor: {
            rgb: 'FFFFCCFF'
          }
        }
      },
      cellGreen: {
        fill: {
          fgColor: {
            rgb: 'FF00FF00'
          }
        }
      }
    };
     
    //Array of objects representing heading rows (very top)
    const heading = [
      [{value: 'a1', style: styles.headerDark}, {value: 'b1', style: styles.headerDark}, {value: 'c1', style: styles.headerDark}],
      ['a2', 'b2', 'c2'] // <-- It can be only values
    ];
     
    //Here you specify the export structure
    const specification = {
      customer_name: { // <- the key should match the actual data key
        displayName: 'Customer', // <- Here you specify the column header
        headerStyle: styles.headerDark, // <- Header style
        cellStyle: function(value, row) { // <- style renderer function
          // if the status is 1 then color in green else color in red
          // Notice how we use another cell value to style the current one
          return (row.status_id == 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible 
        },
        width: 120 // <- width in pixels
      },
      status_id: {
        displayName: 'Status',
        headerStyle: styles.headerDark,
        cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          return (value == 1) ? 'Active' : 'Inactive';
        },
        width: '10' // <- width in chars (when the number is passed as string)
      },
      note: {
        displayName: 'Description',
        headerStyle: styles.headerDark,
        cellStyle: styles.cellPink, // <- Cell style
        width: 220 // <- width in pixels
      }
    }
     
    // The data set should have the following shape (Array of Objects)
    // The order of the keys is irrelevant, it is also irrelevant if the
    // dataset contains more fields as the report is build based on the
    // specification provided above. But you should have all the fields
    // that are listed in the report specification
    const dataset = [
      {customer_name: 'IBM', status_id: 1, note: 'some note', misc: 'not shown'},
      {customer_name: 'HP', status_id: 0, note: 'some note'},
      {customer_name: 'MS', status_id: 0, note: 'some note', misc: 'not shown'}
    ]
     
    // Define an array of merges. 1-1 = A:1
    // The merges are independent of the data.
    // A merge will overwrite all data _not_ in the top-left cell.
    const merges = [
      { start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
      { start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
      { start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
    ]
     
    // Create the excel report.
    // This function will return Buffer
    const report = excel.buildExport(
      [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
        {
          name: 'Report', // <- Specify sheet name (optional)
          heading: heading, // <- Raw heading array (optional)
          merges: merges, // <- Merge cell ranges
          specification: specification, // <- Report specification
          data: dataset // <-- Report data
        }
      ]
    );
     
    // You can then return this straight
    //res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers)
    //return res.send(report);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  	res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    res.end(report, 'binary');
}






function getBorrarDatos(req, res) {
    db.query('DELETE FROM images;')
    .then(()=>{
        return db.query('DELETE FROM permission_role;')
    }).then(()=>{
        return db.query('DELETE FROM permissions;')
    }).then(()=>{
        return db.query('DELETE FROM pids;')
    }).then(()=>{
        return db.query('DELETE FROM qrcodes;')
    }).then(()=>{
        return db.query('DELETE FROM role_user;')
    }).then(()=>{
        return db.query('DELETE FROM roles;')
    }).then(()=>{
        return db.query('DELETE FROM users;')
    }).then(()=>{
        return db.query('DELETE FROM ws_categorias_king;')
    }).then(()=>{
        return db.query('DELETE FROM ws_categorias_traduc;')
    }).then(()=>{
        return db.query('DELETE FROM ws_contenido_traduc;')
    }).then(()=>{
        return db.query('DELETE FROM ws_disciplinas_king;')
    }).then(()=>{
        return db.query('DELETE FROM ws_disciplinas_traduc;')
    }).then(()=>{
        return db.query('DELETE FROM ws_entidades;')
    }).then(()=>{
        return db.query('DELETE FROM ws_evaluaciones;')
    }).then(()=>{
        return db.query('DELETE FROM ws_eventos;')
    }).then(()=>{
        return db.query('DELETE FROM ws_examen_respuesta;')
    }).then(()=>{
        return db.query('DELETE FROM ws_grupos_preguntas;')
    }).then(()=>{
        return db.query('DELETE FROM ws_idiomas;')
    }).then(()=>{
        return db.query('DELETE FROM ws_idiomas_registrados;')
    }).then(()=>{
        return db.query('DELETE FROM ws_inscripciones;')
    }).then(()=>{
        return db.query('DELETE FROM ws_nivel_participante;')
    }).then(()=>{
        return db.query('DELETE FROM ws_niveles_king;')
    }).then(()=>{
        return db.query('DELETE FROM ws_niveles_traduc;')
    }).then(()=>{
        return db.query('DELETE FROM ws_opciones;')
    }).then(()=>{
        return db.query('DELETE FROM ws_opciones_agrupadas;')
    }).then(()=>{
        return db.query('DELETE FROM ws_opciones_cuadricula;')
    }).then(()=>{
        return db.query('DELETE FROM ws_pregunta_evaluacion;')
    }).then(()=>{
        return db.query('DELETE FROM ws_pregunta_traduc;')
    }).then(()=>{
        return db.query('DELETE FROM ws_preguntas_agrupadas;')
    }).then(()=>{
        return db.query('DELETE FROM ws_preguntas_king;')
    }).then(()=>{
        return db.query('DELETE FROM ws_respuestas;')
    }).then(()=>{
        return db.query('DELETE FROM ws_user_event;')
    }).then(()=>{
        res.send('Datos borrados');
    }, (r2)=>{
        res.send('Hubo un error al borrar Datos');
        console.log(r2)
    });
}

module.exports = router;