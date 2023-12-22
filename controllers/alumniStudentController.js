const AlumniStudent = require('../models/alumniStudent');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registers a new alumni student
exports.registerAlumniStudent = async (req, res) => {
    try {
        let existingStudent = await AlumniStudent.findOne({ emailAddress: req.body.emailAddress.toLowerCase() });

        if (existingStudent) {
            return res.status(400).render('alumniStudentRegistration', {
                message: 'Email address is already registered. Please use a different email.'
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        let alumniStudent = new AlumniStudent({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress.toLowerCase(),
            password: hashedPassword,
            accountType: 'Alumni Student', // Only one valid option
            graduationYear: req.body.graduationYear
        });

        await alumniStudent.save();
        res.redirect('/login-options'); // Updated route
    } catch (error) {
        res.status(500).render('loginOptions', {
            message: 'An error occurred during registration. Please try again.'
        });
    }
};

// Logs in an alumni student
exports.loginAlumniStudent = async (req, res) => {
    try {
        const alumniStudent = await AlumniStudent.findOne({ emailAddress: req.body.emailAddress });

        if (alumniStudent && (await bcrypt.compare(req.body.password, alumniStudent.password))) {
            // Create a token with a 30-minute expiration and include the role
            const token = jwt.sign({ id: alumniStudent._id, role: 'Alumni Student' }, process.env.JWT_SECRET, {
                expiresIn: '30m', // 30 minutes
            });

            res.cookie('token', token, { 
                httpOnly: true 
            });
            res.redirect('/alumni-student/all-events'); // Updated route
        } else {
            res.status(400).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: "Login error. Please try again." });
    }
};

// Place this inside alumniStudentController.js

// Fetch alumni student details
exports.getAlumniStudentDetails = async (req, res) => {
    try {
        const userId = req.user.id;  // Extracted from the token by cookieJwtAuth middleware
        const alumniStudent = await AlumniStudent.findById(userId);

        if (!alumniStudent) {
            return res.status(404).send('Alumni student not found.');
        }

        res.render('alumniStudentEditAccount', {
            alumniStudent: alumniStudent, // Pass the alumni student details to the frontend
            message: null
        });
    } catch (error) {
        res.status(500).send('Error fetching alumni student details.');
    }
};


// Update alumni student details
exports.updateAlumniStudentDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, emailAddress, newPassword, description } = req.body;

        const alumniStudent = await AlumniStudent.findById(userId);

        if (!alumniStudent) {
            return res.status(404).send('Alumni student not found.');
        }

        // Update details
        alumniStudent.firstName = firstName;
        alumniStudent.lastName = lastName;
        alumniStudent.emailAddress = emailAddress.toLowerCase();
        alumniStudent.description = description;

        // Update password if provided
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            alumniStudent.password = hashedPassword;
        }

        await alumniStudent.save();

        // Set a flash message or a session variable to indicate successful update
        // This method avoids passing sensitive data in the URL.
        req.session.message = 'Your profile has been updated successfully.';

        // Redirect to profile page or appropriate route without sensitive data in URL
        res.redirect('/login-options/alumni-student');
    } catch (error) {
        res.status(500).send('Error updating alumni student details.');
    }
};


