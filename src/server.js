require('dotenv').config()
const express = require('express')
const axios = require('axios')

const app = express()
const port = process.env.SERVER_PORT || 5000

const apiKey = process.env.API_KEY
const token = process.env.TOKEN

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



app.listen(port, () =>{
    console.log(`Servidor rodando em http://localhost:${port}`)
})
