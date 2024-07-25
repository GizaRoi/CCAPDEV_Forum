const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/Users');
const router = express.Router();
const fs = require('fs');

// Read data from JSON file for home page
let jsonData = {};
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

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

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

router.get('/createpost', (req, res) => {
    res.render('createpost', {
        layout: 'createpostlayout',
        title: 'Create',
        username: req.session.user.username,
        profilePicture: req.session.user.profilePicture,
        isLoggedIn: true,
        popularPosts: jsonData.popularPosts,
        posts: jsonData.posts,
        popularRooms: jsonData.popularRooms
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


// Logged in home
router.get('/home', isAuthenticated, (req, res) => {
    res.render('home', {
        popularPosts: jsonData.popularPosts,
        posts: jsonData.posts,
        popularRooms: jsonData.popularRooms,
        layout: 'homelayout',
        title: 'Homepage',
        isLoggedIn: true,
        username: req.session.user.username,
        profilePicture: req.session.user.profilePicture
    });
});

// What's popular
router.get('/home2', isAuthenticated, (req, res) => {
    res.render('home2', {
        posts: jsonData.posts,
        popularPosts: jsonData.popularPosts,
        popularRooms: jsonData.popularRooms,
        layout: 'homelayout',
        title: 'Popular',
        isLoggedIn: true
    });
});

router.get('/customize', isAuthenticated, (req, res) => {
    res.render('customize', {
        layout: 'customizelayout',
        title: 'Customize',
        username: req.session.user.username
    });
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
        req.session.user = newUser; // Log the user in
        res.redirect('/customize');
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

// Handle customization
router.post('/customize', isAuthenticated, async (req, res) => {
    const { profilepicture, bio } = req.body;
    try {
        const user = await User.findById(req.session.user._id);
        user.profilePicture = profilepicture;
        user.bio = bio;
        await user.save();
        req.session.user = user; // Update session with new user data
        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).render('customize', {
            layout: 'customizelayout',
            title: 'Customize',
            username: req.session.user.username,
            error: 'Profile update failed. Please try again.',
            errorCode: 'PROFILE_UPDATE_ERROR'
        });
    }
});

// Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).render('login', {
                layout: 'loginlayout',
                title: 'Login',
                error: 'Username does not exist.',
                errorCode: 'USER_NOT_FOUND'
            });
        } else if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user; // Store user in session
            res.redirect('/home');
        } else {
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

router.get('/profile', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user._id);
    res.render('profile', {
        layout: 'profilelayout',
        title: 'Profile',
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio
    });
});

// Render edit profile route
router.get('/editprofile', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user._id);
    res.render('editprofile', {
        layout: 'profilelayout',
        title: 'Edit Profile',
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio
    });
});

router.post('/editprofile', isAuthenticated, async (req, res) => {
    const { profilepicture, bio } = req.body;
    try {
        const user = await User.findById(req.session.user._id);
        user.profilePicture = profilepicture;
        user.bio = bio;
        await user.save();
        req.session.user = user; // Update session with new user data
        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).render('editprofile', {
            layout: 'profilelayout',
            title: 'Edit Profile',
            username: req.session.user.username,
            profilePicture: req.session.user.profilePicture,
            bio: req.session.user.bio,
            error: 'Profile update failed. Please try again.',
            errorCode: 'PROFILE_UPDATE_ERROR'
        });
    }
});

// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out.');
        }
        res.redirect('/login');
    });
});

module.exports = router;
