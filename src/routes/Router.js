const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/Users');
const router = express.Router();
const fs = require('fs');

// Read data from JSON file for home page
let jsonData = {}; // Corrected variable name
const dataPath = './data/home.json';
if (fs.existsSync(dataPath)) {
    try {
        jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log(`File ${dataPath} found.`);
    } catch (error) {
        console.error('Error reading home.json:', error);
    }
} else {
    console.warn(`File ${dataPath} NOT found.`);
}

// Middleware to check session
const checkAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// GUESTHOME
router.get('/', (req, res) => {
    res.render('guesthome', {
        popularPosts: jsonData.popularPosts,
        posts: jsonData.posts,
        popularRooms: jsonData.popularRooms,
        layout: 'homelayout',
        title: 'FoRoom',
        isLoggedIn: false
    });
});

router.get('/login', (req, res) => {
    res.render('login', {
        layout: 'loginlayout',
        title: 'Login'
    });
});

router.get('/register', (req, res) => {
    res.render('register', {
        layout: 'loginlayout',
        title: 'Register'
    });
});

router.get('/post', (req, res) => {
    res.render('post', {
        rooms: jsonData.rooms,
        replies: jsonData.replies,
        children: jsonData.children,
        layout: 'postlayout',
        title: 'Post'
    });
});

router.get('/home', (req, res) => {
    if (req.session.user) {
        console.log('Session user:', req.session.user); // Debugging line
        res.render('home', {
            popularPosts: jsonData.popularPosts,
            posts: jsonData.posts,
            popularRooms: jsonData.popularRooms,
            layout: 'homelayout',
            title: 'Homepage',
            isLoggedIn: true,
            username: req.session.user.username // Ensure this is correct
        });
    } else {
        console.log('No user in session');
        res.redirect('/login');
    }
});



// What's popular
router.get('/home2', (req, res) => {
    res.render('home2', {
        posts: jsonData.posts,
        popularPosts: jsonData.popularPosts,
        popularRooms: jsonData.popularRooms,
        layout: 'homelayout',
        title: 'Popular',
        isLoggedIn: true
    });
});

router.get('/customize', (req, res) => {
    if (req.user) {
        res.render('customize', {
            layout: 'customizelayout',
            title: 'Customize',
            username: req.session.user.username
        });
    } else {
        res.status(401).redirect('/login'); // Unauthorized
    }
});

// Handle registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = new User({
            username,
            password: hashedPassword
        });
        await newUser.save();
        res.redirect(`/customize?username=${username}`);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).render('register', {
            layout: 'loginlayout',
            title: 'Register',
            error: 'Registration failed. Username might be already taken.',
            errorCode: 'REGISTRATION_ERROR'
        });
    }
});

// Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found');
            res.status(404).render('login', {
                layout: 'loginlayout',
                title: 'Login',
                error: 'Username does not exist.',
                errorCode: 'USER_NOT_FOUND'
            });
        } else if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user; // Store user in session
            console.log('User logged in:', req.session.user); // Debugging line
            res.redirect('/home');
        } else {
            console.log('Invalid credentials');
            res.status(401).render('login', {
                layout: 'loginlayout',
                title: 'Login',
                error: 'Invalid Username or Password',
                errorCode: 'INVALID_CREDENTIALS'
            });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).render('login', {
            layout: 'loginlayout',
            title: 'Login',
            error: 'An error occurred. Please try again.',
            errorCode: 'LOGIN_ERROR'
        });
    }
});


router.get('/profile', (req, res) => {
    res.render('profile', {
        layout: 'profilelayout',
        title: 'Profile',
        username: req.session.user.username
    });
});

// Render edit profile route
router.get('/editprofile', (req, res) => {
    res.render('editprofile', {
        layout: 'profilelayout',
        title: 'Edit Profile'
    });
});

router.get('/post', (req, res) => {
    res.render('post', {
        layout: 'postlayout',
        title: 'Post | FoRoom',
        isPost: true
    });
});

router.get('/createpost', (req, res) => {
    res.render('createpost', {
        layout: 'createpostlayout',
        title: 'Create Post',
    });
});

router.get('/editcomment', (req, res) => {
    res.render('editcomment', {
        layout: 'editcommentlayout',
        title: 'Edit Comment',
    });
});

router.get('/editpost', (req, res) => {
    res.render('editpost', {
        layout: 'editpostlayout',
        title: 'Edit Post',
    });
});

module.exports = router;
