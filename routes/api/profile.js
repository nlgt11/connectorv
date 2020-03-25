const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'Frofile not found '});
        }

        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error!')
    }
});

// @route   POST api/profile
// @desc    Create/update user's profile
// @access  Private
router.post('/', [auth, [
    check('status', 'Status is required')
        .not()
        .isEmpty(),
    check('skills', "Skills is required")
        .not()
        .isEmpty()
    ]
], 
async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // Build profile fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = req.body.company;
    if (website) profileFields.website = req.body.website;
    if (location) profileFields.location = req.body.location;
    if (bio) profileFields.bio = req.body.bio;
    if (status) profileFields.status = req.body.status;
    if (githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',').map(skill => skill.trim());
    }
    // Social
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = req.body.youtube;
    if (twitter) profileFields.social.twitter = req.body.twitter;
    if (facebook) profileFields.social.facebook = req.body.facebook;
    if (linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (instagram) profileFields.social.instagram = req.body.instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id });
        
        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });

            return res.json(profile);
        }

        // Create
        profile = new Profile(profileFields);
        await profile.save();
        return res.json(profile);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error!')
    }

});


// @route   GET api/profile
// @desc    GET all profiles
// @access  Public
router.get('/', async (req,res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error')
    }
});

// @route   GET api/profile/user/:user_id
// @desc    GET profile by user
// @access  Public
router.get('/user/:user_id', async (req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            res.status(400).json({ msg: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }

        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile
// @desc    Delete profile, user and posts
// @access  Private
router.delete('/', auth, async (req,res) => {
    try {
        // Remove user post
        await Post.deleteMany({ user: req.user.id });

        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error')
    }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put('/experience', 
    [
        auth, 
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //console.log(validationResult())

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.push(newExp);
            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error!');
        }
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        const removeIndex = profile.experience.map(item => item._id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error!');
    }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put('/education', 
    [
        auth, 
        [
            check('school', 'School is required').not().isEmpty(),
            check('degree', 'Degree is required').not().isEmpty(),
            check('fieldofstudy', 'Field of Study date is required').not().isEmpty(),
            check('from', 'From date date is required').not().isEmpty(),
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //console.log(validationResult())

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.education.push(newEdu);
            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error!');
        }
});

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        const removeIndex = profile.education.map(item => item._id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error!');
    }
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from github 
// @access  Private
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        }

        request(options, (error, response, body) => {
            if(error) console.log(error);

            if(response.statusCode !== 200) {
                console.log(response.statusCode)
                console.log(response.body);
                return res.status(404).json({ msg: 'Github profile not found' });
            }

            return res.json(JSON.parse(body));
        });

    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
})

module.exports = router;