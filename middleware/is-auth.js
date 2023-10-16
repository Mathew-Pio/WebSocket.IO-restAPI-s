const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeaders = req.get('Authorization');
    if(!authHeaders){
        return res.status(401).json({message: 'Auth headers not found'})
    }
    const token = authHeaders.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'myPrivateTokenGeneratedKey')
    }catch(error){
        return res.status(500).json({error})
    }
    if(!decodedToken){
        return res.status(401).json({message: 'Not Authenticated'})
    }
    req.userId = decodedToken.userId;

    next();
}