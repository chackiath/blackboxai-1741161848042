const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Lead = require('../models/Lead');

// @route   GET /api/invoices
// @desc    Get all invoices
// @access  Private
router.get('/', async (req, res) => {
    try {
        const query = {};

        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by created user if sales agent
        if (req.user.role === 'sales_agent') {
            query.createdBy = req.user._id;
        }

        const invoices = await Invoice.find(query)
            .populate('client', 'companyName contactPerson email')
            .populate('createdBy', 'username name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            invoices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/invoices/:id
// @desc    Get a single invoice
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('client', 'companyName contactPerson email')
            .populate('createdBy', 'username name');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Check if user has access to this invoice
        if (req.user.role === 'sales_agent' && invoice.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this invoice'
            });
        }

        res.json({
            success: true,
            invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/invoices
// @desc    Create a new invoice
// @access  Private
router.post('/', async (req, res) => {
    try {
        const {
            clientId,
            items,
            notes,
            dueDate
        } = req.body;

        // Verify client exists and is in 'won' status
        const client = await Lead.findById(clientId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        if (client.status !== 'won') {
            return res.status(400).json({
                success: false,
                message: 'Can only create invoices for won deals'
            });
        }

        // Create invoice
        const invoice = await Invoice.create({
            client: clientId,
            clientName: client.companyName,
            clientAddress: client.address || 'No address provided',
            clientEmail: client.email,
            items,
            notes,
            dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            createdBy: req.user._id
        });

        const populatedInvoice = await Invoice.findById(invoice._id)
            .populate('client', 'companyName contactPerson email')
            .populate('createdBy', 'username name');

        res.status(201).json({
            success: true,
            invoice: populatedInvoice
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/invoices/:id
// @desc    Update an invoice
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Check if user has access to update this invoice
        if (req.user.role === 'sales_agent' && invoice.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this invoice'
            });
        }

        // Don't allow updates if invoice is paid
        if (invoice.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update a paid invoice'
            });
        }

        // Update invoice fields
        Object.keys(req.body).forEach(key => {
            invoice[key] = req.body[key];
        });

        const updatedInvoice = await invoice.save();
        const populatedInvoice = await Invoice.findById(updatedInvoice._id)
            .populate('client', 'companyName contactPerson email')
            .populate('createdBy', 'username name');

        res.json({
            success: true,
            invoice: populatedInvoice
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/invoices/:id
// @desc    Delete an invoice
// @access  Private (Admin/Manager/Accountant only)
router.delete('/:id', async (req, res) => {
    try {
        // Only admin, manager, and accountant can delete invoices
        if (!['admin', 'manager', 'accountant'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete invoices'
            });
        }

        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Don't allow deletion of paid invoices
        if (invoice.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a paid invoice'
            });
        }

        await invoice.remove();

        res.json({
            success: true,
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PATCH /api/invoices/:id/status
// @desc    Update invoice status
// @access  Private (Admin/Manager/Accountant only)
router.patch('/:id/status', async (req, res) => {
    try {
        // Only admin, manager, and accountant can update invoice status
        if (!['admin', 'manager', 'accountant'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update invoice status'
            });
        }

        const { status } = req.body;
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        invoice.status = status;
        const updatedInvoice = await invoice.save();

        const populatedInvoice = await Invoice.findById(updatedInvoice._id)
            .populate('client', 'companyName contactPerson email')
            .populate('createdBy', 'username name');

        res.json({
            success: true,
            invoice: populatedInvoice
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
