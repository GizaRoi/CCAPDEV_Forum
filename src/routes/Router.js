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

router.get('/home', (req, resp) =>{
    resp.render('home', {
        layout: 'homelayout',
        title: 'Homepage'
    });
});

router.get('/profile', (req, resp) => {
    resp.render('profile', {
        layout: 'profilelayout',
        title: 'User Profile'
    });
});

router.get('/editprofile', (req, resp) =>{
    resp.render('editprofile', {
        layout: 'editprofile',
        title: 'Edit Profile'
    });
});
module.exports = router;