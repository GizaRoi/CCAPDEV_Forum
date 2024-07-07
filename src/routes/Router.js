const Router = require('express');

const router = Router();

router.get('/', function(req, resp){
    resp.render('guesthome', {
        layout: 'homelayout',
        title: 'FoRoom'
    })
})

router.get('/login', (req, resp) => {
    resp.render('login', {
        layout: 'loginlayout',
        title: 'Login'
    })
})

router.get('/register', (req, resp) => {
    resp.render('register', {
        layout: 'loginlayout',
        title: 'Register'
    })
})
module.exports = router;