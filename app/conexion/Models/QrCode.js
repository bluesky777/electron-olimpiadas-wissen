db = require('../connWeb');


class QrCodes {
    
    static crear(codigo, comando) {
        let consulta 	= `INSERT INTO qrcodes(codigo, comando) VALUES (?,?)`;
        return db.query(consulta, [codigo, comando]);
    }
    
};

module.exports = QrCodes;

