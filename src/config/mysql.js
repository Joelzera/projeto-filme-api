const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'movie_user',
    port: 3306
})

 exports.execute = (query, params = []) => {
    return new Promise ((resolve, reject) =>{
        pool.query(query, params, (error, result) =>{
            if(error) { reject(error)} else { resolve(result)}
        })
    })
 }

 exports.poolDefault = pool