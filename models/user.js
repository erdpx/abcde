const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

curriculumSchema = require('./curriculum').schema;

const userSchema = new Schema ({
    username: {
        type: String,
        required: [true, 'Name field is required!'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required!']
    },
    email: {
        type: String,
        required: [true, 'email is required!'],
        unique: true
    },
    curricula: [{type: [Schema.Types.ObjectId], ref: 'Curriculum'}],
    savedCurricula: [{type: [Schema.Types.ObjectId], ref: 'Curriculum'}],
});

// bcrypt salt rounds
const saltRounds = 10;

// pre save configuration
userSchema.pre('save', function(next) { 

    // continue if password is new or not modified
    if(!this.isModified('password')) return next();

    bcrypt.hash(this.password, saltRounds, (err, hash) => {
        if (err) return next(err);

        this.password = hash;
        next();
    });
});

// add an authentication static method to userSchema 
userSchema.statics.auth = function(username, password, next) {

    User.findOne({ username: username }, function(err, user) {
        if (err) return next(err);

        if (!user) return next();

        // compare passwords and return true if passwords do match
        bcrypt.compare(password, user.password).then(function(res) {
            return (res === true) ? next(null, res) : next(res);
        })
    });
};

// User is created at collection 'user' based on userSchema
const User = mongoose.model('User', userSchema);

module.exports = User;