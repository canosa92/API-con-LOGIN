


const express= require('express')
const app = express();
const session = require('express-session');
const {hashedSecret} = require('./crypto/config')
const router = require('./routes/routes')


app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use(session({
    secret: hashedSecret,
    resave: false,
    saveUninitialized: true,
    cookie:{secure: false},
}));

app.use('/', router)


app.listen(3002,()=>{
    console.log('servido escuchadno en el http://localhost:3002')
})