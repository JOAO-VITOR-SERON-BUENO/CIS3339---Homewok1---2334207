const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student is required'],
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course is required'],
            index: true,
        },
    },
    { timestamps: true }
);

// A student can be enrolled in a given course only once.
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
