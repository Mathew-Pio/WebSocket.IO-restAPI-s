const User = require('../models/user');
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.postSignup = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
          message:'Validation of the request failed',
          errors: errors.array()
        })
      }
    const { email, password, name } = req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({email});
        if(existingUser){
            res.status(400).json({
                message: 'User already exists, Login instead'
            })
        }
    }catch(err){
        console.log(err)
    }

    const hashedPassword = bcrypt.hashSync(password);

    const user = new User({
        email,
        password: hashedPassword,
        name
    })

    try{
        await user.save();
    }catch(err){
        console.log(err);
    }

    res.status(201).json({
        message: 'New user created',
        User: user
    })
}

exports.login = async(req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({email})
    }catch(error){
        return res.status(500).json({message: 'Internal server error occured'})
    }

    if(!existingUser){
        return res.status(401).json({message: 'User with this email does not exist'});
    }

    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
    if(!isPasswordCorrect){
        return res.status(401).json({message: 'The password is incorect'})
    }

    const token = jwt.sign({
        email: existingUser.email,
        userId: existingUser._id.toString()
    }, 'myPrivateTokenGeneratedKey',  
        { expiresIn: '1h' }
    )
    return res.status(200).json({message: 'Login successfull', token: token, userId: existingUser._id.toString()})
}




