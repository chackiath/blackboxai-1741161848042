const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true
    }
});

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    clientName: {
        type: String,
        required: true
    },
    clientAddress: {
        type: String,
        required: true
    },
    clientEmail: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    items: [invoiceItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    taxRate: {
        type: Number,
        default: 0.20 // 20% tax rate
    },
    tax: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'cancelled'],
        default: 'draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
invoiceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate totals before saving
invoiceSchema.pre('save', function(next) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    
    // Calculate tax
    this.tax = this.subtotal * this.taxRate;
    
    // Calculate total
    this.total = this.subtotal + this.tax;
    
    next();
});

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await mongoose.model('Invoice').countDocuments();
        this.invoiceNumber = `PRF-${new Date().getFullYear()}${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
