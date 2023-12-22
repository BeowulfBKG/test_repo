const express = require('express');
const router = express.Router();

const alumniStudentController = require('../controllers/alumniStudentController');
const alumniManagerController = require('../controllers/alumniManagerController');
const homeController = require('../controllers/homeController');
const eventsController = require('../controllers/eventsController');

// Models (assuming these exist)
const Events = require('../models/events'); // Update with the correct path
const AlumniStudent = require('../models/alumniStudent'); // Update with the correct path
const AlumniManager = require('../models/alumniManager'); // Update with the correct path

const { authenticateToken } = require('../middleware/authMiddleware');
const { cookieJwtAuth } = require('../middleware/cookieJwtAuth');


// Home routes
router.get('/', homeController.index);

// Registration options routes
router.get('/registration-options', (req, res) => res.render('registrationOptions', { title: 'UConnect - Registration Options' }));

// Login options routes
router.get('/login-options', (req, res) => res.render('loginOptions', { title: 'UConnect - Login Options' }));

// Alumni student registration and login routes
router.get('/registration-options/alumni-student', (req, res) => res.render('alumniStudentRegistration', { title: 'UConnect - Alumni Student Registration' }));
router.post('/registration-options/alumni-student', alumniStudentController.registerAlumniStudent);
router.get('/login-options/alumni-student', (req, res) => res.render('alumniStudentLogin', { title: 'UConnect - Alumni Student Login' }));
router.post('/login-options/alumni-student', alumniStudentController.loginAlumniStudent);

// Alumni manager registration and login routes
router.get('/registration-options/alumni-manager', (req, res) => res.render('alumniManagerRegistration', { title: 'UConnect - Alumni Manager Registration' }));
router.post('/registration-options/alumni-manager', alumniManagerController.registerAlumniManager);
router.get('/login-options/alumni-manager', (req, res) => res.render('alumniManagerLogin', { title: 'Alumni Manager Login' }));
router.post('/login-options/alumni-manager', alumniManagerController.loginAlumniManager);

router.get('/alumni-student/all-events', eventsController.displayAlumniStudentAllEvents);

router.get('/alumni-student/add-event', cookieJwtAuth('Alumni Student'), async (req, res) => {
    try {
        const alumniStudents = await AlumniStudent.find();
        const alumniManagers = await AlumniManager.find();
        const currentUser = req.user; 

        res.render('alumniStudentAddEventDashboard', {
            title: 'UConnect - Alumni Student Add New Event',
            alumniStudents,
            alumniManagers,
            currentUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/alumni-student/add-event', cookieJwtAuth('Alumni Student'), eventsController.alumniStudentAddEvent);



router.get('/alumni-student/edit-account', cookieJwtAuth('Alumni Student'), async (req, res) => {
    try {
        // Fetch the alumni student data based on the user ID or any other method you use for identification
        const alumniStudent = await AlumniStudent.findById(req.user.id);

        if (!alumniStudent) {
            return res.status(404).send('Alumni Student not found');
        }

        res.render('alumniStudentEditAccountDashboard', {
            title: 'UConnect - Alumni Student Edit Account',
            alumniStudent, // Pass the alumni student data to the template
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/alumni-student/edit-account', cookieJwtAuth('Alumni Student'), alumniStudentController.getAlumniStudentDetails);
router.post('/alumni-student/edit-account', [authenticateToken, cookieJwtAuth('Alumni Student')], alumniStudentController.updateAlumniStudentDetails);
module.exports = router;
