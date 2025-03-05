const express = require('express');
const router = express.Router();

// Mock invoices data (in a real app, this would be in a database)
let invoices = [
    {
        id: 1,
        invoiceNumber: 'PRF-2023001',
        clientId: 1,
        clientName: 'Tech Solutions Inc',
        clientAddress: '123 Tech Street, Silicon Valley, CA 94025',
        clientEmail: 'john@techsolutions.com',
        date: '2023-06-15',
        items: [
            {
                description: 'Enterprise Software License',
                quantity: 1,
                price: 50000,
                total: 50000
            }
        ],
        subtotal: 50000,
        tax: 10000,
        total: 60000,
        notes: 'Payment due within 30 days',
        status: 'draft',
        createdBy: 'sales1'
    }
];

// Get all invoices
router.get('/', (req, res) => {
    // In a real app, we would add pagination and filtering here
    res.json({
        success: true,
        invoices: invoices
    });
});

// Get a single invoice
router.get('/:id', (req, res) => {
    const invoice = invoices.find(i => i.id === parseInt(req.params.id));
    
    if (invoice) {
        res.json({
            success: true,
            invoice: invoice
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Invoice not found'
        });
    }
});

// Create a new invoice
router.post('/', (req, res) => {
    const {
        clientId,
        clientName,
        clientAddress,
        clientEmail,
        date,
        items,
        notes,
        createdBy
    } = req.body;

    // Validate required fields
    if (!clientId || !clientName || !items || !items.length) {
        return res.status(400).json({
            success: false,
            message: 'Client information and items are required'
        });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.20; // 20% tax rate
    const total = subtotal + tax;

    const newInvoice = {
        id: invoices.length + 1,
        invoiceNumber: `PRF-${new Date().getFullYear()}${String(invoices.length + 1).padStart(3, '0')}`,
        clientId,
        clientName,
        clientAddress,
        clientEmail,
        date: date || new Date().toISOString().split('T')[0],
        items,
        subtotal,
        tax,
        total,
        notes,
        status: 'draft',
        createdBy,
        createdAt: new Date().toISOString()
    };

    invoices.unshift(newInvoice);

    res.status(201).json({
        success: true,
        invoice: newInvoice
    });
});

// Update an invoice
router.put('/:id', (req, res) => {
    const invoiceId = parseInt(req.params.id);
    const invoiceIndex = invoices.findIndex(i => i.id === invoiceId);

    if (invoiceIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Invoice not found'
        });
    }

    // If items are being updated, recalculate totals
    let updatedInvoice = {
        ...invoices[invoiceIndex],
        ...req.body,
        id: invoiceId // Ensure ID doesn't change
    };

    if (req.body.items) {
        const subtotal = req.body.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const tax = subtotal * 0.20;
        const total = subtotal + tax;

        updatedInvoice = {
            ...updatedInvoice,
            subtotal,
            tax,
            total
        };
    }

    invoices[invoiceIndex] = updatedInvoice;

    res.json({
        success: true,
        invoice: updatedInvoice
    });
});

// Delete an invoice
router.delete('/:id', (req, res) => {
    const invoiceId = parseInt(req.params.id);
    const invoiceIndex = invoices.findIndex(i => i.id === invoiceId);

    if (invoiceIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Invoice not found'
        });
    }

    invoices = invoices.filter(i => i.id !== invoiceId);

    res.json({
        success: true,
        message: 'Invoice deleted successfully'
    });
});

// Update invoice status
router.patch('/:id/status', (req, res) => {
    const invoiceId = parseInt(req.params.id);
    const { status } = req.body;

    const invoiceIndex = invoices.findIndex(i => i.id === invoiceId);

    if (invoiceIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Invoice not found'
        });
    }

    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status is required'
        });
    }

    invoices[invoiceIndex].status = status;

    res.json({
        success: true,
        invoice: invoices[invoiceIndex]
    });
});

module.exports = router;
