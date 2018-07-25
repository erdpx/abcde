// Routes related to query database and render html

const User = require('../models/user');
const Curriculum = require('../models/curriculum').Curriculum;
const SavedCurriculum = require('../models/curriculum').SavedCurriculum;

module.exports = function(router) {

router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/user/' + req.session.user);
    } else {
        res.render('index');
    }
});

router.get('/curriculum', (req, res) => {
    if (req.session.user) 
        res.render('curriculumForm');
    else
        res.render('index')
});

// render curricula of given user - :username
router.get('/user/:username', (req, res, next) => {

    if (!req.params.username) {
        let newErr = new Error('must submit username');
        newErr.status = 400;
        return next(newErr);
    }

    User.findOne({username: req.params.username}, (err, user) => {
        if (err) next(err);

        if (user === undefined || user.length == 0) {
            let newErr = new Error('check username')
            newErr.status = 404;
            return next(newErr);
        }

        Curriculum.find({userId: user._id}, (err, curricula) => {
            if (err) next(err);

            return res.render('userCurricula', {curricula: curricula, username: req.params.username});
        });
        
    });
});

// render specific curriculum
router.get('/curriculum/:id', (req, res, next) => {

    if (!req.params.id) {
        let newErr = new Error('must submit curriculum id');
        newErr.status = 400;
        return next(newErr);
    }

    Curriculum.findById(req.params.id, (err, curriculum) => {
        if (err) return next(err);
        
        if (curriculum == undefined || curriculum.length == 0) {
            let newErr = new Error('curriculum does not exist');
            newErr.status = 404;
            return next(newErr);
        }

        return res.render('userCurriculum', {curriculum: curriculum, saved: false});
    });
});

// render edit user's curriculum form
router.get('/curriculum/edit/:id', (req, res, next) => {

    if (!req.session.user) {
        let newErr = new Error('must be logged in to visit this url');
        newErr.status = 400;
        return next(newErr);
    }

    User.findOne({username: req.session.user}, (err, user) => {
        if (err) return next(err);

        Curriculum.findById(req.params.id, (err, curriculum) => {
            if (err) return next(err);
            
            if (curriculum == undefined || curriculum.length == 0) {
                let newErr = new Error('curriculum does not exist');
                newErr.status = 404;
                return next(newErr);
            }

            if (!user._id.equals(curriculum.userId)) {
                let newErr = new Error('you do not have the permission to modify this curriculum');
                newErr.status = 403;
                return next(newErr);
            }
    
            return res.render('editCurriculum', {curriculum: curriculum, saved: false});
        });
    });
});

// render user's saved curricula
router.get('/curricula/saved', (req, res, next) => {

    if (!req.session.user) {
        let newErr = new Error('must be logged in to visit this url');
        newErr.status = 400;
        return next(newErr);
    }

    User.findOne({username: req.session.user}, (err, user) => {
        if (err) return next(err);

        SavedCurriculum.find({userId: user._id}, (err, curricula) => {
            if (err) return next(err);
            
            if (curricula == undefined) {
                let newErr = new Error('curricula does not exist');
                newErr.status = 404;
                return next(newErr);
            }
    
            return res.render('savedCurricula', {curricula: curricula, username: req.session.user});
        });
    });
});

// render user's saved curriculum
router.get('/curricula/saved/:id', (req, res, next) => {

    if (!req.session.user) {
        let newErr = new Error('must be logged in to visit this url');
        newErr.status = 400;
        return next(newErr);
    }

    User.find({username: req.session.user}, (err, user) => {
        if (err) next(err);

        if (user === undefined) {
            let newErr = new Error('could not find user')
            newErr.status = 400;
            return next(newErr);
        }

        SavedCurriculum.findOne({_id: req.params.id}, (err, curriculum) => {
            if (err) return next(err);
            
            if (curriculum == undefined || curriculum.length == 0) {
                let newErr = new Error('curriculum does not exist');
                newErr.status = 404;
                return next(newErr);
            }
    
            return res.render('userCurriculum', {curriculum: curriculum, saved: true});
        });
    });
});

// render edit user's saved curriculum form
router.get('/saved/curriculum/edit/:id', (req, res, next) => {

    if (!req.session.user) {
        let newErr = new Error('must be logged in to visit this url');
        newErr.status = 400;
        return next(newErr);
    }

    User.findOne({username: req.session.user}, (err, user) => {
        if (err) return next(err);

        SavedCurriculum.findById(req.params.id, (err, curriculum) => {
            if (err) return next(err);
            
            if (curriculum == undefined || curriculum.length == 0) {
                let newErr = new Error('curriculum does not exist');
                newErr.status = 404;
                return next(newErr);
            }

            if (!user._id.equals(curriculum.userId)) {
                let newErr = new Error('you do not have the permission to modify this curriculum');
                newErr.status = 403;
                return next(newErr);
            }
    
            return res.render('editSavedCurriculum', {curriculum: curriculum, saved: false});
        });
    });
});

// get curricula with given title - provided by search box input in html
router.get('/curriculum/get/:title', (req, res, next) => {
    
    Curriculum.find({curriculumTitle: {"$regex": req.params.title, "$options" : "i"}})
    .populate('userId')
    .exec()
    .then(curricula => {
        
        let curriculums = [];

        curricula.forEach(curriculum => {
            curriculums.push({
                user: curriculum.userId.username,
                curriculum: {
                    curriculumTitle: curriculum.curriculumTitle,
                    curriculumExplanation: curriculum.curriculumExplanation,
                    curriculumSections: curriculum.curriculumSections,
                    _id: curriculum._id
                }
            });
        });

        return res.send(JSON.stringify(curriculums));
    })
    .catch(() => res.sendStatus(404));
});

router.get('/userexists/:username', (req, res, next) => {
    if (!req.params.username) {
        let newErr = new Error('must submit username');
        newErr.status = 400;
        return next(newErr);
    }

    User.find({username: req.params.username}, (err, user) => {
        if (err) next(err);
        
        let userExists = false;

        if (user.length !== 0)
            userExists = true
        
        res.json(userExists);
    });
});
};