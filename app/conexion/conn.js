require('dotenv').config();
var mysql 		= require('mysql');

function get_datos_conn() {

    var datos = {
        host     : process.env.DB_HOST,
        user     : process.env.DB_USERNAME,
        password : process.env.DB_PASSWORD,
        database : process.env.DB_DATABASE
    };
    return datos;
}


const datos     = get_datos_conn();
var connection 	= mysql.createPool(datos);

connection.getConnection(function(err) {
    if (err) { console.error('error connecting: ' + err.stack); return reject(err); }
});


module.exports = connection;