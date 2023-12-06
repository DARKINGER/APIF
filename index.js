const express = require('express');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const redoc = require('redoc-express')
const fs = require('fs');
const path = require('path');
const app = express();

const {PORT, HOST, USER, PASSWORD, DATABASE} = require('./config');


const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const { SwaggerTheme } = require('swagger-themes');


const theme = new SwaggerTheme('v3');

const options = {
    explorer: true,
    customCss: theme.getBuffer('monokai')
};


const PORT = 8085;

// var con =  {
//     host:'localhost', 
//     user:'admin', 
//     password:'Dima.zdla1', 
//     database:'vehiculos'
// };

const con = {
    host:HOST, 
    user:USER, 
    password:PASSWORD, 
    database:DATABASE
}

// var accesLogStream = fs.createWriteStream(path.join(__dirname, 'acces.Log'), {flags: 'a'});
// app.use(morgan('combined', {stream: accesLogStream}));

//referente a el swagger fuera de index.js
const data = fs.readFileSync(path.join(__dirname,'./swagger.json'),{encoding:'utf8',flag:'r'})
const read = fs.readFileSync(path.join(__dirname,'./README.md'),{encoding:'utf8',flag:'r'})

// console.log(data)
const defObj = JSON.parse(data);
defObj.info.description = read;
const swaggerOptions = {
    definition:defObj,
    "apis": [`${path.join(__dirname,"index.js")}`]
}

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/info", async (req, res)=> {
    try {
        //const conn = await mysql.createConnection({host:'localhost', user:'admin', password:'Dima.zdla1', database:'hola'});
        const conn = await mysql.createConnection(con);
        // const [rows, fields] = await conn.query('SELECT * FROM hola.alumnos');
        res.json({host: HOST, user: USER, password:PASSWORD, database:DATABASE});
    } catch(err) {
        res.status(500).json({mensaje: err.sqlMessage});
    }
});



/**
 * @swagger
 * /vehiculos:
 *   get:
 *     tags:
 *       - Vehiculos
 *     summary: Consultar todos los vehiculos.
 *     description: Obtiene un JSON conteniendo todos los vehiculos de la BD.
 *     responses:
 *       200:
 *         description: Descripción de una petición GET global a los vehiculos.
 *       
 */
app.get("/vehiculos", async (req, res)=> {
    try{
        const conn = await mysql.createConnection(con);

        const [rows, fields] = await conn.query('SELECT * FROM vehiculos');
        res.json(rows);
    }catch(err){
        console.log(err);
        res.json({mensaje:'Error de conexion'});
    }
});

/**
 * @swagger
 * /vehiculos/error:
 *   get:
 *     summary: Obtener todos los vehiculos con posible error en la conexión a la base de datos.
 *     responses:
 *       200:
 *         description: Retorna la información de todos los vehiculos.
 *       500:
 *         description: Error en la conexión a la base de datos.
 */
app.get("/vehiculos/error", async (req, res)=> {
    try {
        const conn = await mysql.createConnection(con);

        const [rows, fields] = await conn.query('SELECT * FROM hola.vehiculos;');
        res.json(rows);
    } catch(err) {
        res.status(500).json({mensaje: err.sqlMessage});
    }
});

/**
 * @swagger
 * /vehiculos/{id}:
 *   get:
 *     summary: Obtener un vehiculo por su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del vehiculo a obtener.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retorna la información del vehiculo.
 *       404:
 *         description: Vehiculo no encontrado.
 */
app.get("/vehiculo/:id", async(req, res)=> {
    const conn = await mysql.createConnection(con);

    const parametros = req.params.id;
    console.log(parametros);

    const [rows, fields] = await conn.query('SELECT * FROM vehiculos WHERE id_vehiculo=' + req.params.id);
    if(rows.length == 0) {
        res.status(404).json({mensaje: 'Vehiculo no existe'});
    } else {
        res.json(rows);
    }
});

/**
 * @swagger
 * /vehiculos:
 *   delete:
 *     summary: Eliminar un vehiculo por su ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         description: ID del vehiculo a eliminar.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vehiculo eliminado correctamente.
 *       404:
 *         description: Vehiculo no encontrado.
 */
app.delete("/vehiculo", async(req, res)=> {
    console.log(req.query);
    try {
        const conn = await mysql.createConnection(con);

        const [rows, fields] = await conn.query(`DELETE FROM vehiculos WHERE id_vehiculo=+${req.query.id}`);
        res.json(rows);
    } catch(err) {
        res.status(404).json({mensaje: err.sqlMessage});
    }
});

/**
 * @swagger
 * /vehiculos:
 *   post:
 *     summary: Crear un nuevo vehiculo.
 *     parameters:
 *       - in: query
 *         name: nom_vehiculo
 *         description: Nombre del nuevo vehiculo.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoria
 *         description: Categoría del nuevo vehiculo.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vehiculo creado correctamente.
 *       400:
 *         description: Error en la solicitud.
 */
app.post("/vehiculo", async(req, res)=> {
    try {
        const conn = await mysql.createConnection(con);

        const [rows, fields] = await conn.query(`INSERT INTO vehiculos (nom_vehiculo, categoria) VALUES ("${req.query.nom_vehiculo}", ${req.query.categoria});`);
        res.json(rows);
    } catch(err) {
        res.json({mensaje: err.sqlMessage});
    }
});

/**
 * @swagger
 * /vehiculos/upload:
 *   put:
 *     summary: Actualizar datos de un vehiculo por su ID.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nom_vehiculo:
 *                 type: string
 *               categoria:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Datos de vehiculo actualizados correctamente.
 *       400:
 *         description: Error en la solicitud.
 */
app.put("/vehiculo/upload", async(req, res)=> {
    try {
        const conn = await mysql.createConnection(con);

        const objetoA = req.body;
        console.log(req.body);
        console.log(objetoA);
        let campos = Object.keys(objetoA);
        let valores = Object.values(objetoA);
        console.log(campos);

        let sentencia = "UPDATE vehiculos SET ";
        let sentencia2 = "";
        let where = "WHERE (id_vehiculo = ";

        campos.forEach(campo => {
            if(campo == "id") {
                for(i = 0; i < sentencia.length-2; i++ ) {
                    sentencia2 += sentencia[i];
                }
                where += objetoA[campo];
                sentencia2 += " " + where + ');';
                console.log(sentencia2);
            } else {
                if (campo == "nom_vehiculo") {
                    sentencia += campo + ' = "' + objetoA[campo] + '", ';
                } else {
                    sentencia += campo + ' = ' + objetoA[campo] + ', ';
                }
            }
        });

        const [rows, fields] = await conn.query(sentencia2);

        res.json({message: "Se han actualizado los datos"});
    } catch(err) {
        res.json({mensaje: err.sqlMessage});
    }
});

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use("/api-docs-json", (req, res)=>{
    res.json(swaggerDocs);
});

// Documentación con Redoc
app.get(
    '/api-redoc',
    redoc({
        title: 'API Docs',
        specUrl: '/api-docs-json',
    })
);

// Iniciar el servidor
app.listen(PORT, ()=> {
    console.log(`Server express escuchando en el puerto ${PORT}`);
});




