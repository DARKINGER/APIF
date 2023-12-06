// import { Config } from 'dotenv'
require('dotenv').config()

// config()

const PORT = process.env.DB_PORT || 8085
const HOST = process.env.DB_HOST || 'localhost'
const USER = process.env.DB_USER || 'admin'
const PASSWORD = process.env.DB_PASSWORD || 'Dima.zdla1'
const DATABASE = process.env.DB_DATABASE || 'hola'
// export const HOST = process.env.HOST || 'localhost'

module.exports = {
    PORT, HOST, USER, PASSWORD, DATABASE
}
