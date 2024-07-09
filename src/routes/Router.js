const express = require('express');
const bcrypt = require('bcrypt'); // Add this line to import bcrypt
const User = require('../models/Users');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('guesthome', {
        layout: 'homelayout',
        title: 'FoRoom',
        isLoggedIn: false
    })
})

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
        layout: 'homelayout',
        title: 'Homepage',
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




// // Handle registration
// router.post('/register', async (req, res) => {
//     const { username, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 4);

//     try {
//         const newUser = new User({
//             username,
//             password: hashedPassword
//         });
//         await newUser.save();
//         res.render('login', {
//             layout: 'loginlayout',
//             title: 'Login',
//             message: 'Registration successful! Please log in.'
//         });
//     } catch (error) {
//         console.error('Error registering user:', error);
//         res.render('register', {
//             layout: 'loginlayout',
//             title: 'Register',
//             error: 'Registration failed. Username might be already taken.'
//         });
//     }
// });

// Handle registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 4);

    try {
        const newUser = new User({
            username,
            password: hashedPassword
        });
        await newUser.save();
        // Redirect to customize page after successful registration
        res.redirect(`/customize?username=${username}`);
        console.error('customizing user');
    } catch (error) {
        console.error('Error registering user:', error);
        res.render('register', {
            layout: 'loginlayout',
            title: 'Register',
            error: 'Registration failed. Username might be already taken.'
        });
    }
});

router.get('/customize', (req, res) => {
    const { username } = req.query;
    res.render('customize', {
        layout: 'customizelayout',
        title: 'Customize',
        username: username
    });
});

router.post('/customize', async (req, res) => {
    const { username, profilepicture, bio } = req.body;

    try {
        // Update user profile with customization details
        await User.findOneAndUpdate({ username }, { profilepicture, bio });
        // Redirect to login page after customization
        res.render('login', {
            layout: 'loginlayout',
            title: 'Login',
            message: 'Profile customization successful! Please log in.'
        });
    } catch (error) {
        console.error('Error customizing profile:', error);
        res.render('customize', {
            layout: 'customizelayout',
            title: 'Customize',
            error: 'Customization failed. Please try again.',
            username: username
        });
    }
});

// Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            res.render('home2', {
                layout: 'homelayout',
                title: 'FoRoom',
                username: user.username
            });
        } else {
            res.render('login', {
                layout: 'loginlayout',
                title: 'Login',
                error: 'Invalid username or password.'
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

module.exports = router;
