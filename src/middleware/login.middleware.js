const jwt = require('jsonwebtoken')

exports.required = async(req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decode = jwt.verify(token, process.env.SECRET);
        req.user = decode;
        next()
        console.log('autenticação funcionou')
    } catch (error) {
        console.log(error)
        return res.status(401).send({message: 'autenticação falhou'})
    }
}