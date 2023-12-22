const AlumniManager = require('../models/alumniManager');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register an alumni manager
exports.registerAlumniManager = async (req, res) => {
    try {
        const existingManager = await AlumniManager.findOne({ emailAddress: req.body.emailAddress });
        if (existingManager) {
            return res.render('alumniManagerRegistration', {
                title: 'UConnect - Register as Alumni Manager', // Updated title
                message: 'Email address is already registered. Please use a different email.'
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const alumniManager = new AlumniManager({
            ...req.body,
            password: hashedPassword,
        });

        const newAlumniManager = await alumniManager.save();
        res.redirect('/login-options'); // Updated redirect path
    } catch (error) {
        res.status(500).render('loginOptions', {
            message: 'An error occurred during registration. Please try again.'
        });
    }
};

// Login an alumni manager
exports.loginAlumniManager = async (req, res) => {
    try {
        const alumniManager = await AlumniManager.findOne({ emailAddress: req.body.emailAddress });
        if (alumniManager && (await bcrypt.compare(req.body.password, alumniManager.password))) {
            const token = jwt.sign({ id: alumniManager._id }, process.env.ACCESS_TOKEN_SECRET);
            res.cookie('token', token, { httpOnly: true });
            res.redirect('/alumni-manager/dashboard'); // Updated redirect path
        } else {
            res.status(400).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
