require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('./config/mysql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const fileUpload = require('express-fileupload')

const app = express()
const port = process.env.SERVER_PORT || 5000



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true, limit : '50mb', parameterLimit: '500000'}))
app.use(cors())
app.use(fileUpload())


app.post('/user/login', async (req, res) => {
    try {
        const query = 'SELECT * FROM usuarios WHERE email = ?'
        const result = await mysql.execute(query, [req.body.email])

        if (bcrypt.compareSync(req.body.password, result[0].password)) {
            const token = jwt.sign({
                id: result.id,
                email: req.body.email,
            }, process.env.SECRET, { expiresIn: '8d' })
            res.status(200).json({ msg: 'autorizado', email: result[0].email, id: result[0].id, token })
        }
        else {
            res.status(400).json({ msg: 'nao autorizado' })
        }
    } catch (error) {
        res.send(error)
    }
})

app.get('/user/:id', async (req, res) => {
    try {
        const query = 'SELECT * FROM usuarios WHERE id = ?'
        const result = await mysql.execute(query, [req.params.id])
        res.send(result)
    } catch (error) {
        res.send(error)
    }
})

app.post('/user/email', async (req, res) =>{
    try {
        const query = 'SELECT email FROM usuarios'
        const result = await mysql.execute(query)
        console.log(req.body.email)
        res.send(result)
    } catch (error) {
        res.send(error)
    }
})

app.post('/user/:id', async (req, res) => {
    try {

        if (!req.files || !req.files.file) {
            return res.status(400).send('Nenhum arquivo foi enviado.');
        }

        const imagem = req.files.file

        const uploadPath = __dirname+'/arquivos/'+imagem.name

        await imagem.mv(uploadPath, async (err) => {
            if(err){
                return res.status(500).send('erro ao enviar ao diretorio')
            }

            const query = `UPDATE usuarios SET img = ? WHERE id = ?`;
            const result = await mysql.execute(query, [imagem.name, req.params.id])
            
            console.log(imagem.name)
            res.send(result);
        })
       
    } catch (error) {
        res.send(error)
    }
})


app.get('/user/img/:id', async (req, res) =>{
    try {
        const query = 'SELECT img FROM usuarios WHERE id= ?'
        const result = await mysql.execute(query,[req.params.id])
        res.send(result)
    } catch (error) {
        res.send(error)
    }
})

app.get('/imagens/:name', (req, res) => {
    res.sendFile(__dirname + '/arquivos/' + req.params.name);
});

app.post('/user', async (req, res) => {
    try {
        const query1 = 'SELECT email FROM usuarios'
        const result1 = await mysql.execute(query1)

        const emailExistente = result1.some(user => user.email === req.body.email)
        if(emailExistente){
            console.log('email existente')
            return res.status(400).json({error})
        }

        if(req.body.name === '' || req.body.email === '' || req.body.password === ''){
                return res.status(400).json({error : 'os campos não foram preenchidos'})
        }

        const saltRounds = 10
        const hash = bcrypt.hashSync(req.body.password, saltRounds)
        const query = 'INSERT INTO usuarios ( name, email, password, created_at) VALUES (?, ?, ?, ?)'
        const result = await mysql.execute(query, [
            req.body.name,
            req.body.email,
            hash,
            new Date().toISOString().slice(0, 19).replace('T', ' ')
        ])

        console.log(result)
        res.send(result)

    } catch (error) {
        res.send(error)
    }
})

app.patch('/user/:id', async (req, res) =>{
    try {

        const data = 'SELECT * FROM usuarios WHERE id = ?'
        const resultData = await mysql.execute(data, [req.params.id])

        if(resultData.length === 0){
            return res.status(400).json('nao encontrado')
        }

        const dataUser = resultData[0]

       
        const name = req.body.name !== undefined && req.body.name !== '' ? req.body.name : dataUser.name;
        const email = req.body.email !== undefined && req.body.email !== '' ? req.body.email : dataUser.email;
        
        const query = 'UPDATE usuarios SET name = ?, email = ? WHERE id = ?'
        const result = await mysql.execute(query, [
            name,
            email,
            req.params.id
        ])
        res.send(result)
    } catch (error) {
        res.send(error)
    }
})


app.post('/filmes-favoritos', async(req, res) =>{
    try {
        const query = 'INSERT INTO filme_usuario_favorito ( idFilme, idUser, title, overview, poster_path, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        const result = await mysql.execute(query, [
            req.body.idFilme,
            req.body.idUser,
            req.body.title,
            req.body.overview,
            req.body.poster_path,
            new Date().toISOString().slice(0, 19).replace('T', ' '),
        ])
        console.log(result)
        res.send(result)
    } catch (error) {
        res.send(error)
    }
})

app.get('/filmes-favoritos/:idUser', async (req, res) =>{
    try {
        const query = 'SELECT * FROM filme_usuario_favorito WHERE idUser = ?'
        const result = await mysql.execute(query, [req.params.idUser])
        res.send(result)
    } catch (error) {
        res.send(error)
    }
})

app.delete('/filmes-favoritos/delete', async(req, res) =>{
    try {
        const query = 'DELETE FROM filme_usuario_favorito WHERE idFilme = ?'
        const result = await mysql.execute(query, [req.body.idFilme, req.body.idUser])
        console.log(result)
        res.send(result)
    } catch (error) {
        res.send(error)
    }
})

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
})
