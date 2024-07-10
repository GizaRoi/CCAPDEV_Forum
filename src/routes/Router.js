const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/Users');
const router = express.Router();
const fs = require('fs');

// Read data from JSON file for home page
let data = {};
const dataPath = 'home.json';
if (fs.existsSync(dataPath)) {
    try {
        data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log(`File ${dataPath} found.`);
    } catch (error) {
        console.error('Error reading home.json:', error);
    }
} else {
    console.warn(`File ${dataPath} NOT found.`);
}

router.get('/', (req, res) => {
    res.render('guesthome', {
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

router.get('/home', (req, res) => {
    res.render('home', {
        data: data,
        layout: 'homelayout',
        title: 'Homepage',
        isLoggedIn: true
    });
});

router.get('/home2', (req, res) => {
    res.render('home2', {
        layout: 'homelayout',
        title: 'Popular',
        isLoggedIn: true
    });
});

router.get('/profile', (req, res) => {
    res.render('profile', {
        layout: 'profilelayout',
        title: 'User Profile'
    });
});

router.get('/editprofile', (req, res) => {
    res.render('editprofile', {
        layout: 'editprofile',
        title: 'Edit Profile'
    });
});

router.get('/customize', (req, res) => {
    res.render('customize', {
        layout: 'customizelayout',
        title: 'Customize'
    });
});

// Handle registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Increased bcrypt rounds for security

    try {
        const newUser = new User({
            username,
            password: hashedPassword
        });
        await newUser.save();
        res.redirect(`/customize?username=${username}`);
    } catch (error) {
        console.error('Error registering user:', error);
        res.render('register', {
            layout: 'loginlayout',
            title: 'Register',
            error: 'Registration failed. Username might be already taken.'
        });
    }
});

// Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            res.render('login', {
                layout: 'loginlayout',
                title: 'Login',
                error: 'Username does not exist.'
            });
        } else if (user && await bcrypt.compare(password, user.password)) {
            res.render('home', {
                layout: 'homelayout',
                title: 'FoRoom',
                username: user.username
            });
        } else {
            res.render('login', {
                layout: 'loginlayout',
                title: 'Login',
                error: 'Invalid Username or Password'
            });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.render('login', {
            layout: 'loginlayout',
            title: 'Login',
            error: 'An error occurred. Please try again.'
        });
    }
});

// Handle profile update
router.post('/editprofile', async (req, res) => {
    const { username, profilepicture, bio } = req.body;
    try {
        await User.findOneAndUpdate({ username }, { profilepicture, bio });
        res.render('profile', {
            layout: 'profilelayout',
            title: 'Profile',
            message: 'Updated Profile.'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.render('editprofile', {
            layout: 'editprofile',
            title: 'Update Profile',
            error: 'Updating profile failed. Please try again.',
            username: username
        });
    }
});

module.exports = router;
