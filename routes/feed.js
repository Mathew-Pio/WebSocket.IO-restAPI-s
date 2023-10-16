const express = require('express');

const { check } = require('express-validator');
const path = require('path');
const multer = require('multer');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const upload = multer({ storage, fileFilter});

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post('/posts', isAuth, [
    check('title').trim().isLength({min: 5}),
    check('content').trim().isLength({min: 5})
], upload.single('image') , feedController.createPost);

router.get('/post/:postId',isAuth, feedController.getPost);
router.put('/post/:postId', isAuth, feedController.updatePost);
router.delete('/post/:postId', isAuth, feedController.deletePost);
module.exports = router;