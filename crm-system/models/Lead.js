const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
        default: 'new'
    },
    value: {
        type: Number,
        default: 0
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: {
        type: String
    },
    history: [{
        status: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        notes: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
leadSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Lead', leadSchema);
