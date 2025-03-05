const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// @route   GET /api/leads
// @desc    Get all leads
// @access  Private
router.get('/', async (req, res) => {
    try {
        const query = {};
        
        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by assigned agent if not admin/manager
        if (req.user.role === 'sales_agent') {
            query.assignedTo = req.user._id;
        }

        // Add search functionality
        if (req.query.search) {
            query.$or = [
                { companyName: { $regex: req.query.search, $options: 'i' } },
                { contactPerson: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const leads = await Lead.find(query)
            .populate('assignedTo', 'username name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            leads
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/leads/:id
// @desc    Get a single lead
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('assignedTo', 'username name')
            .populate('history.updatedBy', 'username name');

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        // Check if user has access to this lead
        if (req.user.role === 'sales_agent' && lead.assignedTo._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this lead'
            });
        }

        res.json({
            success: true,
            lead
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private
router.post('/', async (req, res) => {
    try {
        const {
            companyName,
            contactPerson,
            email,
            phone,
            status,
            value,
            notes
        } = req.body;

        const lead = await Lead.create({
            companyName,
            contactPerson,
            email,
            phone,
            status: status || 'new',
            value: value || 0,
            assignedTo: req.user._id,
            notes,
            history: [{
                status: status || 'new',
                updatedBy: req.user._id,
                notes: 'Lead created'
            }]
        });

        const populatedLead = await Lead.findById(lead._id)
            .populate('assignedTo', 'username name')
            .populate('history.updatedBy', 'username name');

        res.status(201).json({
            success: true,
            lead: populatedLead
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/leads/:id
// @desc    Update a lead
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        // Check if user has access to update this lead
        if (req.user.role === 'sales_agent' && lead.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this lead'
            });
        }

        // Add to history if status is changed
        if (req.body.status && req.body.status !== lead.status) {
            lead.history.push({
                status: req.body.status,
                updatedBy: req.user._id,
                notes: req.body.notes || `Status changed to ${req.body.status}`
            });
        }

        // Update lead fields
        Object.keys(req.body).forEach(key => {
            if (key !== 'history') {
                lead[key] = req.body[key];
            }
        });

        const updatedLead = await lead.save();
        const populatedLead = await Lead.findById(updatedLead._id)
            .populate('assignedTo', 'username name')
            .populate('history.updatedBy', 'username name');

        res.json({
            success: true,
            lead: populatedLead
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead
// @access  Private (Admin/Manager only)
router.delete('/:id', async (req, res) => {
    try {
        // Only admin and manager can delete leads
        if (!['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete leads'
            });
        }

        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        await lead.remove();

        res.json({
            success: true,
            message: 'Lead deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PATCH /api/leads/:id/status
// @desc    Update lead status (for Kanban board)
// @access  Private
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        // Check if user has access to update this lead
        if (req.user.role === 'sales_agent' && lead.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this lead'
            });
        }

        // Add to history
        lead.history.push({
            status,
            updatedBy: req.user._id,
            notes: req.body.notes || `Status changed to ${status}`
        });

        lead.status = status;
        const updatedLead = await lead.save();

        const populatedLead = await Lead.findById(updatedLead._id)
            .populate('assignedTo', 'username name')
            .populate('history.updatedBy', 'username name');

        res.json({
            success: true,
            lead: populatedLead
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
