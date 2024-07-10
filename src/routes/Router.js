const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/Users');
const router = express.Router();
const fs = require('fs');

// Read data from JSON file for home page
let jsonData = {}; // Corrected variable name
const dataPath = 'home.json';
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

let profileData = {};
const profiledetailPath = 'profiledetails.json';
if (fs.existsSync(profiledetailPath)) {
    try {
        profileData = JSON.parse(fs.readFileSync(profiledetailPath, 'utf8'));
        console.log(`File ${profiledetailPath} found.`);
    } catch (error) {
        console.error('Error reading home.json:', error);
    }
} else {
    console.warn(`File ${profiledetailPath} NOT found.`);
}

//GUESTHOME
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

//logged in home
router.get('/home', (req, res) => {
    res.render('home', {
        popularPosts: jsonData.popularPosts,
        posts: jsonData.posts,
        popularRooms: jsonData.popularRooms,
        layout: 'homelayout',
        title: 'Homepage',
        isLoggedIn: true,
        
    });
});

//whats popular
router.get('/home2', (req, res) => {
    res.render('home2', {
        popularPosts: jsonData.popularPosts,
        posts: jsonData.posts,
        popularRooms: jsonData.popularRooms,
        layout: 'homelayout',
        title: 'Popular',
        isLoggedIn: true
    });
});


router.get('/customize', (req, res) => {
    res.render('customize', {
        layout: 'customizelayout',
        title: 'Customize',
        username: user.username
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
            // res.render('/home', {
            //     layout: 'homelayout',
            //     title: 'FoRoom',
            //     username: user.username
            // });

            res.render('home', {
                popularPosts: jsonData.popularPosts,
                posts: jsonData.posts,
                popularRooms: jsonData.popularRooms,
                layout: 'homelayout',
                title: 'Homepage',
                isLoggedIn: true,
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


router.get('/profile', (req, res) => {
    res.render('profile', {
        username : profileData.username,
        profilepicture: profileData.profilepicture,
        bio: profileData.bio,
        layout: 'profilelayout',
        title: 'User Profile'
    });
});

router.get('/editprofile', (req, res) => {
    const username = req.query.username;
    User.findOne({ username }, (err, user) => {
        if (err) {
            console.error('Error fetching profile for edit:', err);
            return res.render('editprofile', {
                layout: 'editprofile',
                title: 'Edit Profile',
                error: 'Error fetching profile for edit.'
            });
        }
        res.render('editprofile', {
            layout: 'editprofile',
            title: 'Edit Profile',
            user
        });
    });
});

router.post('/editprofile', async (req, res) => {
    const { username, profilepicture, bio } = req.body;

    try {
        console.log('Updating profile for user:', username);
        console.log('Profile picture:', profilepicture);
        console.log('Bio:', bio);
        // Update user profile with customization details
        await User.findOneAndUpdate({ username }, { profilepicture, bio });
        // Redirect to profile page after customization
        res.redirect(`/profile?username=${username}`);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.render('editprofile', {
            layout: 'editprofile',
            title: 'Edit Profile',
            error: 'Updating profile failed. Please try again.',
            username: username
        });
    }
});

router.get('/post', (req, res) => {
    res.render('post', {
        layout: 'postlayout',
        title: 'Post | FoRoom',
        isPost: true
    })
});

module.exports = router;
