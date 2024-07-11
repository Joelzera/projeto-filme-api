require('dotenv').config()
const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const mysql = require('./config/mysql')

const app = express()
const port = process.env.SERVER_PORT || 5000

const apiKey = process.env.API_KEY
const token = process.env.TOKEN

app.use(bodyParser.json())

//rota inicial da pagina home onde mostra os filmes em cartaz
app.get('/filmes-em-cartaz', async(req, res) => { 

    try {
        const url = process.env.API


        const response = await axios.get(url,{
            params : {
                key : apiKey,
                language: 'pt-BR'
            },
            headers : {
                'Authorization': `Bearer ${token}`
            }
        })

        const filmes = response.data.results

        res.json(filmes)
       
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'erro ao fazer a busca'})
    }
})

//rota onde o usuario faz a busca do filme pelo nome
app.get('/filmes/:filme', async(req , res) =>{
        
        const {filme} = req.params

        try {
            const url = process.env.SEARCH

            const response = await axios.get(url,{
                params : {
                    key : apiKey,
                    language: 'pt-BR',
                    query : filme
                },
                headers : {
                    'Authorization': `Bearer ${token}`
                }
            })
            const filmes = response.data.results

            res.json(filmes)
            
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'erro ao fazer a busca'})
        }

})

//rota do usuario onde ele faz o login pelo email
//ainda preciso acrescentar algumas coisas, como autenticação do usuario atraves de um token
app.get('/user/login', async(req, res) =>{
    try {
        const query = 'SELECT * FROM users WHERE email = ?'
        const result = await mysql.execute(query, [req.body.email])
        console.log(result)
        res.send(result)
    } catch (error) {
        res.send(error)
    }
})

//rota onde o usuario cria sua conta
//ainda preciso incrementar uma senha criptografada
app.post('/user', async(req, res) =>{
    try {
        const query = 'INSERT INTO users (email, name, password, created_at) VALUES (?, ?, ?, ?)'
        const result = await mysql.execute(query, [
            req.body.email,
            req.body.name,
            req.body.password,
            new Date().toISOString().slice(0, 19).replace('T', ' ')
        ])
        console.log(result)
        res.send(result)
    } catch (error) {
        res.send(error)
    }
})



app.listen(port, () =>{
    console.log(`Servidor rodando em http://localhost:${port}`)
})
