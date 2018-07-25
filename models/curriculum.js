const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const curriculumSchema = new Schema ({
    curriculumTitle: String,
    curriculumSections: [{
        sectionTitle: [String],
        content: [String],
        contentLink: [String],
        sectionExplanation: String
    }],
    curriculumExplanation: String,
    isSaved: {type: Boolean, default: false},
    userId: {type: mongoose.Schema.Types.ObjectId, ref : 'User'}
});

const Curriculum = mongoose.model('Curriculum', curriculumSchema);
const SavedCurriculum = mongoose.model('SavedCurriculum', curriculumSchema);

module.exports = {schema: curriculumSchema, Curriculum: Curriculum, SavedCurriculum: SavedCurriculum};