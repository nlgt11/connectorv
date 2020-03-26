const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth, [
    check('text', 'Content of post is required')
        .not()
        .isEmpty()
]], async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(400).json({ msg: errors.array() });
    }
    try {
        const user = await User.findOne({ _id: req.user.id }).select('-password');

        const post = new Post({
            user: user.id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar
        });

        await post.save();

        return res.json(post);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server Error!');
    }
});

// @route   Get api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        return res.json(posts);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server Error!')
    }
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        return res.json(post);

    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        return res.status(500).send('Server Error!')
    }
});

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Check user authorization
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.remove();

        return res.json({ msg: 'Post removed' });

    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        return res.status(500).send('Server Error!')
    }
});

// @route   PUT api/posts/like/:id
// @desc    Like and unlike a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        const likeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        if (likeIndex === -1) {
            post.likes.push({ user: req.user.id });
        } else {
            post.likes.splice(likeIndex, 1)
        }
        await post.save();

        return res.json(post.likes);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server Error!')
    }
});


// @route   POST api/posts/:id/comment
// @desc    Post a comment
// @access  Private
// router.post('/:id/comment', [auth, [check('text', 'Content is required').not().isEmpty()]], async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.log(errors);
//         return res.json({ errors: errors.array() });
//     }

//     try {
//         const post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ msg:'Post not found' });
//         }
//         const user = await User.findById(req.user.id).select('-password');
//         const newComment = {
//             text: req.body.text,
//             user: req.user.id,
//             name: user.name,
//             avatar: user.avatar
//         }

//         post.comments.push(newComment);
        
//         await post.save();

//         return res.json(post.comments);
//     } catch (err) {
//         console.error(err);
//         return res.status(500).send('Server Error!')
//     }
// });

// @route   POST api/posts/:id/comment
// @desc    Post a comment
// @access  Private
router.post('/:id/comment', [auth, [check('text', 'Content is required').not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.json({ errors: errors.array() });
    }

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg:'Post not found' });
        }
        const user = await User.findById(req.user.id).select('-password');
        const newComment = {
            text: req.body.text,
            user: req.user.id,
            name: user.name,
            avatar: user.avatar
        }

        post.comments.push(newComment);
        
        await post.save();

        return res.json(post.comments);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server Error!')
    }
});

// @route   DELETE api/posts/:id/comment/:comment_id
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comment/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const removeIndex = post.comments.findIndex(comment => comment.id.toString() === req.params.comment_id);
        if (removeIndex === -1) {
            return res.status(404).json({ msg: 'comment not found' });
        } else {
            // Check user authorization
            if (post.comments[removeIndex].user.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'User not authorized' });
            }
            post.comments.splice(removeIndex, 1);
        }
        
        await post.save();

        return res.json(post.comments);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Comment not found' });
        }
        return res.status(500).send('Server Error!')
    }
});

module.exports = router;