// Database operations related routes

const User = require('../models/user');
const Curriculum = require('../models/curriculum').Curriculum;
const SavedCurriculum = require('../models/curriculum').SavedCurriculum;

const saveCurriculum = require('./helpers').saveCurriculum;
const clearEmptySpacesInArray = require('./helpers').clearEmptySpacesInArray;

module.exports = function(router) {
    
router.post('/register', (req, res, next) => {
    if (!req.body.username || !req.body.email || !req.body.password) {
        let err = new Error('username, email and password are required');
        err.status = 400;
        return next(err)
    }

    if (!(/^([a-zA-Z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,})(\.[a-z]{2,})?$/.test(req.body.email))) {
        let err = new Error('invalid email');
        err.status = 400;
        return next(err)
    }

    let userData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    };

    User.create(userData, (err, user) => {
        if (err) {
            let err = new Error('Could not register.');
            err.status = 400;
            return next(err)
        }

        return res.render('index', {
            flashMsg: 'you have successfully registered, now you can log in'
        });
    });
});

router.post('/login', (req, res, next) => {
    
    if (!req.body.username || !req.body.password) {
        return res.render('index', {
            flashMsg: 'make sure username and password are correct!'
        })
    } 

    // authentication process of user.js file
    User.auth(req.body.username, req.body.password, (err, isMatch) => {
        if (err) {
            return res.render('index', {
                flashMsg: 'make sure username and password are correct!'
            });
        }

        if (!isMatch) {
            return res.render('index', {
                flashMsg: 'make sure username and password are correct!'
            });
        }
        
        req.session.user = req.body.username;
        return res.redirect('/user/' + req.session.user);
    });

});

router.get('/logout', (req, res, next) => {
    if (req.session) req.session.destroy(err => {
        if (err) return next(err);

        return res.redirect('/');
    });
});

// save curriculum into database
router.post('/curriculum', (req, res, next) => {
    if (!req.body.curriculumTitle || 
        clearEmptySpacesInArray(req.body['sectionContent0']).length == 0 || 
        clearEmptySpacesInArray(req.body['contentLink0']).length == 0) {
        let err = new Error('must submit curriculum title and at least one section with content and section link');
        err.status = 404
        return next(err);
    }

    let curriculumData = saveCurriculum(req.body);

    User.findOne({username: req.session.user}, function(err, user) {
        if (err) return next(err);

        if (user === undefined || user.length == 0) {
            let newErr = new Error('check username')
            newErr.status = 404;
            return next(newErr);
        }

        let curriculumObj = new Curriculum({
            curriculumTitle: curriculumData.curriculumTitle,
            curriculumSections: curriculumData.curriculumSections,
            curriculumExplanation: curriculumData.curriculumExplanation || null,
            userId: user._id
        });
        
        curriculumObj.save((err, curriculum) => {  
            if(err) return next(err)

            user.curricula.push(curriculum._id);
            user.save((err) => { if (err) return next(err) });
        });
    });

    // 'saved' tells view engine to not show 'save curriculum' button at the page's end
    return res.render('userCurriculum', {curriculum: curriculumData, saved: true});
});

// update curriculum of id equals to :id in database
router.post('/curriculum/edit/:id', (req, res, next) => {

    if (!req.body.curriculumTitle || 
        clearEmptySpacesInArray(req.body['sectionContent0']).length == 0 || 
        clearEmptySpacesInArray(req.body['contentLink0']).length == 0) {
        let err = new Error('must submit curriculum title and at least one section with content and section link');
        err.status = 404
        return next(err);
    }

    let curriculumData = saveCurriculum(req.body);
    
    Curriculum.findByIdAndUpdate(req.params.id, 
        { $set: {
            curriculumTitle: curriculumData.curriculumTitle,
            curriculumSections: curriculumData.curriculumSections,
            curriculumExplanation: curriculumData.curriculumExplanation || null,
        }}, 
        err => { return next(err) });

    return res.render('userCurriculum', {curriculum: curriculumData, saved: true});
});

// save curriculum, of id equals to :id, into user database
router.post('/curriculum/save/:id', (req, res, next) => {

    if (!req.session.user) {
        let newErr = new Error('must be logged in to visit this url');
        newErr.status = 400;
        return next(newErr);
    }

    Curriculum.findById(req.params.id, (err, curriculum) => {

        if (curriculum == undefined || curriculum.length == 0 || err) {
            let newErr = new Error('curriculum does not exist');
            newErr.status = 404;
            return next(newErr);
        }
        
        User.findOne({username: req.session.user}, (err, user) => {
            if (err) return next(err);

            if (user === undefined || user.length == 0) {
                let newErr = new Error('check username')
                newErr.status = 404;
                return next(newErr);
            }

            let curriculumObj = new SavedCurriculum({
                curriculumTitle: curriculum.curriculumTitle,
                curriculumSections: curriculum.curriculumSections,
                curriculumExplanation: curriculum.curriculumExplanation || null,
                userId: user._id
            });
            
            curriculumObj.save((err, newCurriculum) => {  
                if(err) return next(err)
    
                user.savedCurricula.push(newCurriculum._id);
                user.save((err) => { if (err) return next(err) });
            });
        });
    });
    res.send();
});

// update saved curriculum of id equals to :id in database
router.post('/saved/curriculum/edit/:id', (req, res, next) => {

    if (!req.body.curriculumTitle || 
        clearEmptySpacesInArray(req.body['sectionContent0']).length == 0 || 
        clearEmptySpacesInArray(req.body['contentLink0']).length == 0) {
        let err = new Error('must submit curriculum title and at least one section with content and section link');
        err.status = 404
        return next(err);
    }

    let curriculumData = saveCurriculum(req.body);

    SavedCurriculum.findByIdAndUpdate(req.params.id, { $set: {
        curriculumTitle: curriculumData.curriculumTitle,
        curriculumSections: curriculumData.curriculumSections,
        curriculumExplanation: curriculumData.curriculumExplanation || null
    }}, (err) => next(err));

    return res.render('userCurriculum', {curriculum: curriculumData, saved: true});
});

// delete curriculum with id equals to :id from database
router.delete('/curriculum/delete/:id', (req, res, next) => {

    if (!req.session.user) {
        let newErr = new Error('must be logged in to visit this url');
        newErr.status = 400;
        return next(newErr);
    }    
    
    User.findOne({username: req.session.user}, (err, user) => {
        if (err) return next(err);

        if (user === undefined || user.length == 0) {
            let newErr = new Error('check username')
            newErr.status = 404;
            return next(newErr);
        }

        Curriculum.findOneAndRemove({userId: user._id, _id: req.params.id}, err => {
            if (err) return next(err);
            
            return res.send(JSON.stringify({"ok": 1}));
        });
    });
            
});

// delete saved curriculum with id equals to :id from database
router.delete('/saved/curricula/delete/:id', (req, res, next) => {

    if (!req.session.user) {
        let newErr = new Error('must be logged in to visit this url');
        newErr.status = 400;
        return next(newErr);
    }        
    
    User.findOne({username: req.session.user}, (err, user) => {
        if (err) return next(err);

        if (user === undefined || user.length == 0) {
            let newErr = new Error('check username')
            newErr.status = 404;
            return next(newErr);
        }

        SavedCurriculum.findOneAndRemove({userId: user._id, _id: req.params.id}, err => {
            if (err) return next(err);
            
            return res.send(JSON.stringify({"ok": 1}));
        });
    });
});
};