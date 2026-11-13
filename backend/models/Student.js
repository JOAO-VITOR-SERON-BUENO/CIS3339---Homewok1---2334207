const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: [true, 'Student ID is required'],
            unique: true,
            trim: true,
            match: [/^\d{1,10}$/, 'Student ID must be 1 to 10 digits'],
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name must be at most 100 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            match: [/^[0-9()+\-.\s]{7,20}$/, 'Phone number may contain only digits, spaces, and ( ) + - .'],
        },
        zip: {
            type: String,
            required: [true, 'ZIP code is required'],
            trim: true,
            match: [/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 digits (or ZIP+4, e.g. 77001-1234)'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
