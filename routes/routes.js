const express = require('express')
const router=express.Router()
const users= require('../data/users.js')
const { generateToken, verifyToken } = require('../middleware/middleware.js');
const axios = require('axios');
const url= 'https://rickandmortyapi.com/api/character/';

router.get('/',(req,res)=>{
    const token = req.session.token
    if(token){
        res.send(`<h1>home</h1>
        <a href="/search">Buscador</a>
        <form action="/logout" method="post">
            <button type="submit">Logout</button>
        </form>`)
    }else{
        const loginForm = `
        <form action="/login" method="post">
        <label for="username">Usuario:</label>
        <input type="text" id="username" name="username" required><br>
        
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" required><br>
        
            <button type="submit">Iniciar sesión</button>
            </form>            
        `;
        res.send(loginForm);
}})

router.post('/login', (req, res)=>{
    const {username, password} = req.body;
    const user = users.find((user)=> user.username === username && user.password === password);
    if(user){
        const token = generateToken(user);
        req.session.token = token;
        res.redirect('/search')
    }else{
        res.status(404).json({mensaje: 'credenciales incorrectas'});
    }
})

router.get('/search',verifyToken, (req,res)=>{
    const userId = req.user;
    const user = users.find((user)=> user.id === userId);
    if(user){
    res.send(`
            <h1>Buscador</h1>
            <form action='/characters/:name' method="post">
                <label for="name">Introduce un personaje</label>
                <input type="text" id="name" name="name">
                <button type="submit">Buscar</button>
            </form>
            </br>
            <form action="/logout" method="post">
                <button type="submit">Logout</button>
            </form>        
        `)
    }else{
        res.status(401).json({mensaje: 'usuario no encontrado'});
    }
})

router.get('/characters', verifyToken, async (req, res) => {
    try {
        const response = await axios.get(url )
        const characters=response.data.results
        res.json(characters)
    } catch(error) {
        res.status(500).json({message: 'No response!'})
    }
});

router.post('/characters/:name', verifyToken, async (req, res) => {    
    const name = req.body.name
    
    const urlName = `${url}?name=${name}`
    console.log(urlName);
    try {
        const response = await axios.get(urlName) 
        const character= response.data.results
        
        res.send(`${character.map(u=>`<div class="card">
                            <h3>Nombre:${u.name}</h3>
                            <h5>Genero: ${u.gender}</h5>
                            <img src='${u.image}' alt='${u.name}'/>
                            <h5>status: ${u.status}</h5> </div>`).join('')}`)       
        
    } catch(error) {
        res.status(404).json({message: 'No character found!'})
    }
});






router.post('/logout', (req, res)=>{
    req.session.destroy();
    res.redirect('/');
})

module.exports = router