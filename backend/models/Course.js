const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        courseId: {
            type: String,
            required: [true, 'Course ID is required'],
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: [20, 'Course ID must be at most 20 characters'],
            match: [/^[A-Za-z0-9 -]+$/, 'Course ID may contain only letters, digits, spaces, and hyphens'],
            // Collapse repeated spaces so "CIS  3339" and "CIS 3339" are the same course.
            set: (value) => (typeof value === 'string' ? value.replace(/\s+/g, ' ') : value),
        },
        name: {
            type: String,
            required: [true, 'Course name is required'],
            trim: true,
            maxlength: [150, 'Course name must be at most 150 characters'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
