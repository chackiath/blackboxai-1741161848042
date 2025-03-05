const express = require('express');
const router = express.Router();

// Mock leads data (in a real app, this would be in a database)
let leads = [
    {
        id: 1,
        companyName: 'Tech Solutions Inc',
        contactPerson: 'John Smith',
        email: 'john@techsolutions.com',
        phone: '(555) 123-4567',
        status: 'qualified',
        value: 50000,
        assignedTo: 'sales1',
        notes: 'Interested in enterprise package',
        createdAt: '2023-06-15'
    },
    {
        id: 2,
        companyName: 'Digital Innovations',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@digitalinnovations.com',
        phone: '(555) 987-6543',
        status: 'contacted',
        value: 25000,
        assignedTo: 'sales2',
        notes: 'Follow up scheduled for next week',
        createdAt: '2023-06-16'
    }
];

// Get all leads
router.get('/', (req, res) => {
    // In a real app, we would add pagination and filtering here
    res.json({
        success: true,
        leads: leads
    });
});

// Get a single lead
router.get('/:id', (req, res) => {
    const lead = leads.find(l => l.id === parseInt(req.params.id));
    
    if (lead) {
        res.json({
            success: true,
            lead: lead
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }
});

// Create a new lead
router.post('/', (req, res) => {
    const {
        companyName,
        contactPerson,
        email,
        phone,
        status,
        value,
        assignedTo,
        notes
    } = req.body;

    // Validate required fields
    if (!companyName || !contactPerson || !email) {
        return res.status(400).json({
            success: false,
            message: 'Company name, contact person, and email are required'
        });
    }

    const newLead = {
        id: leads.length + 1,
        companyName,
        contactPerson,
        email,
        phone,
        status: status || 'new',
        value: value || 0,
        assignedTo,
        notes,
        createdAt: new Date().toISOString().split('T')[0]
    };

    leads.unshift(newLead);

    res.status(201).json({
        success: true,
        lead: newLead
    });
});

// Update a lead
router.put('/:id', (req, res) => {
    const leadId = parseInt(req.params.id);
    const leadIndex = leads.findIndex(l => l.id === leadId);

    if (leadIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    const updatedLead = {
        ...leads[leadIndex],
        ...req.body,
        id: leadId // Ensure ID doesn't change
    };

    leads[leadIndex] = updatedLead;

    res.json({
        success: true,
        lead: updatedLead
    });
});

// Delete a lead
router.delete('/:id', (req, res) => {
    const leadId = parseInt(req.params.id);
    const leadIndex = leads.findIndex(l => l.id === leadId);

    if (leadIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    leads = leads.filter(l => l.id !== leadId);

    res.json({
        success: true,
        message: 'Lead deleted successfully'
    });
});

// Update lead status (for Kanban board)
router.patch('/:id/status', (req, res) => {
    const leadId = parseInt(req.params.id);
    const { status } = req.body;

    const leadIndex = leads.findIndex(l => l.id === leadId);

    if (leadIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status is required'
        });
    }

    leads[leadIndex].status = status;

    res.json({
        success: true,
        lead: leads[leadIndex]
    });
});

module.exports = router;
