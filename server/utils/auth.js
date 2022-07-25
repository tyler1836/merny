//jwt is a bearer token set in http header/ other types of credentials eg key/value pair
const jwt = require('jsonwebtoken')
require('dotenv').config()

//secret is for server to check if it recognizes jwt/ jwt is not locked to a single site
const secret =  process.env.Secret
const expiration = '24h'

module.exports = {
    /*
    signToken takes in 3 items from user object 
    tree: pass function to resolvers
            resolvers finds user
            user holds all userdata from user model and schema
            destructure username email and id in this example
            can pass any data from any object sign token is called on 
            never pass in password here because jwt is universal encoder
            can extract destructured data from jwt.io
    */ 
    signToken: function({username, email, _id}){
        const payload = {username, email, _id}
        //jwt sign needs data object takes in *payload*
        return jwt.sign({data: payload}, secret, {expiresIn: expiration})
    },
    /* 
    set up middleware for access and verifying token
    */
    authMiddleware: function({req}){
        let token = req.body.token || req.query.token || req.headers.authorization

        //seperate bearer from token
        if(req.header.authorization){
            token = token.split(' ').pop().trim()
        }

        if(!token){
            return req
        }

        try{
            //decode and attach user datat to req object
            //if secret from token doesn't match secret in server catch fires off
            const {data} = jwt.verify(token, secret, {maxAge: expiration})
            req.user = data
        } catch {
            console.log(`Invalid Token`);
        }

        //return updated req object
        return req
    }
}