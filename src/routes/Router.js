const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/Users");
const Room = require("../models/Rooms");
const { Post, Reply, ChildReply } = require("../models/Posts");
const router = express.Router();
const fs = require("fs");

const multer = require('multer');
const path = require('path');

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    }, 
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }

});

const upload = multer({storage: storage});

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

// Handle search requests
router.get('/search', async (req, res) => {
    const query = req.query.query;
    try {
        const userResults = await User.find({ username: new RegExp(query, 'i') }).exec();
        const postResults = await Post.find({ title: new RegExp(query, 'i') }).populate('author').exec();
        
        const mappedUsers = userResults.map(user => ({
            _id: user._id.toString(),
            username: user.username,
            profilePicture: user.profilePicture,
            bio: user.bio
        }));
        
        const mappedPosts = postResults.map(post => ({
            _id: post._id.toString(),
            title: post.title,
            description: post.description,
            createdAt: post.createdAt,
            room: post.room,
            roomImage: post.roomImage,
            upvote: post.upvote,
            downvote: post.downvote,
            replynum: post.replynum,
            author: {
                _id: post.author._id.toString(),
                username: post.author.username,
                profilePicture: post.author.profilePicture
            }
        }));
        
        res.render('search-results', {
            layout: 'searchlayout',
            users: mappedUsers,
            posts: mappedPosts,
            title: 'Search Results',
            isLoggedIn: req.session.user ? true : false,
            username: req.session.user ? req.session.user.username : null,
            profilePicture: req.session.user ? req.session.user.profilePicture : null,

            // Assuming jsonData is available
            //popularPosts: jsonData ? jsonData.popularPosts : [],
            //posts: jsonData ? jsonData.posts : [],
            popularRooms: jsonData ? jsonData.popularRooms : []
        });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).render('error', {
            layout: 'searchlayout',
            title: 'Error',
            message: 'An error occurred while searching. Please try again.'
        });
    }
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

router.post('/createpost', async (req, res) => {
    const post = Post({
        user: req.session.user.username,
        title: req.body.title,
        room: req.body.room,
        post: req.body.content
    })

    await post.save();
    res.redirect('/home');
});


router.get('/post/:id', async (req, res) => {
    var post = await Post.findOne({_id: req.params.id});
    const user = await User.findOne({ username: post.user });
    const room = await Room.findOne({room: post.room});

    var postwithDetails = {
            ...post.toObject(),
            userImage: 'images/' + user.profilePicture,
            roomImage: room.pic,
            content: post['post'],
            postTitle: post['title']
        };  

    post = postwithDetails;

    console.log(postwithDetails);

    res.render('post', {
        layout: 'postlayout',
        title: 'Post',
        userImage: post.userImage,
        user: post.user,
        date: post.date,
        roomImage: post.room,
        room: post.room,
        postTitle: post.title,
        content: post.content,
        up: post.up,
        down: post.down
    });
});


// Logged in home
router.get('/home', isAuthenticated, async(req, res) => {
    const posts = await Post.find().exec();

    var postsWithUserDetails = await Promise.all(posts.map(async (post) => {
        const user = await User.findOne({ username: post.user }).exec();
        const room = await Room.findOne({room: post.room}).exec();
        return {
            ...post.toObject(),
            userImage: 'images/' + user.profilePicture,
            roomImage: room.pic,
            id: post['_id'],
            content: post['post']
        };  
    }));
    
    res.render('home', {
        popularPosts: jsonData.popularPosts,
        posts: postsWithUserDetails,
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
        isLoggedIn: true,
        username: req.session.user.username,
        profilePicture: req.session.user.profilePicture
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

router.post('/customize', isAuthenticated, async (req, res) => {
    const { profilepicture, bio } = req.body;

    try {
        const user = await User.findById(req.session.user._id);

        // Store only the filename for the profile picture
        if (profilepicture) {
            user.profilePicture = profilepicture; // Store the filename only
        }
        user.bio = bio || user.bio;

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
        profilePicture: req.session.user.profilePicture,
        bio: user.bio
    });
});

router.get('/profile/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
        return res.status(404).render('error', {
            title: 'User Not Found',
            message: 'The user you are looking for does not exist.'
        });
        }

        res.render('profile2', {
        layout: 'profilelayout',
        user: {
            _id: user._id.toString(),
            username: user.username,
            profilePicture: user.profilePicture,
            bio: user.bio
        },
        title: `${user.username}'s Profile`
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).render('error', {
        title: 'Error',
        message: 'An error occurred while fetching the user profile. Please try again.'
        });
    }
    });




// Render edit profile route
router.get('/editprofile', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user._id);
    res.render('editprofile', {
        layout: 'profilelayout',
        title: 'Edit Profile',
        username: user.username,
        profilePicture: req.session.user.profilePicture,
        bio: user.bio
    });
});

//Handles edit profile
router.post('/editprofile', isAuthenticated, upload.single('profilepicture'), async (req, res) => {
    const { bio } = req.body;
    const profilePicture = req.file ? req.file.filename : req.session.user.profilePicture;

    try {
        const user = await User.findById(req.session.user._id);
        user.profilePicture = profilePicture;
        if (bio !== undefined && bio.trim() !== '') { //bio remains even if there are no changes made
            user.bio = bio;
        }
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

// Handle room creation
router.post("/room", isAuthenticated, async (req, res) => {
    const { roomname, imgUrl } = req.body;
    try {
        const newRoom = new Room({
        name: roomname,
        img: imgUrl,
        });
        await newRoom.save();
        res.status(201).send("New room successfully created.");
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).send("Error creating room.");
    }
});

  // Handle post creation
router.post("/post", isAuthenticated, async (req, res) => {
    const { title, post, room } = req.body;
    try {
        const newPost = new Post({
        user: req.session.user._id,
        title,
        post,
        date: new Date(),
        room,
        up: 0,
        down: 0,
        });
        await newPost.save();
        res.status(201).send("New post successfully created.");
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).send("Error creating post.");
    }
    });

    // Handle commenting
    router.post("/reply", isAuthenticated, async (req, res) => {
    try {
        const { postId, reply } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
        return res.status(404).send("Post not found.");
        }

        const newReply = new Reply({
            user: req.session.user._id,
            reply,
            date: new Date(),
            up: 0,
            down: 0,
        });

        await newReply.save();
        post.replies.push(newReply._id);
        await post.save();

        res.status(201).send("New reply successfully created.");
    } catch (error) {
        console.error("Error replying to post:", error);
        res.status(500).send("Error replying to post.");
    }
    });

    module.exports = router;
