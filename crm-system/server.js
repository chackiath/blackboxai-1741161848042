const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

const app = express();

// In-memory storage (for demo purposes)
const users = [
    { 
        id: 1,
        username: 'admin',
        password: '$2a$10$XQGsqRYvHVlGXhCv4Bjy.OPXwx3VqR.cO9B5F5TqYG8i8mz1mKqeq', // admin123
        role: 'admin',
        email: 'admin@crm.com',
        name: 'System Admin'
    },
    {
        id: 2,
        username: 'manager',
        password: '$2a$10$8KzaNdKIYKHGx7rZj8PK6.9bW4teGx0/paQHkXgvBzxltXwbvp93.', // manager123
        role: 'manager',
        email: 'manager@crm.com',
        name: 'Sales Manager'
    }
];

// Initial sample data
const leads = [
    {
        id: 1,
        companyName: 'Tech Solutions Inc',
        contactPerson: 'John Smith',
        email: 'john@techsolutions.com',
        phone: '(555) 123-4567',
        status: 'qualified',
        value: 50000,
        assignedTo: 1,
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
        assignedTo: 2,
        notes: 'Follow up scheduled for next week',
        createdAt: '2023-06-16'
    }
];

const invoices = [
    {
        id: 1,
        invoiceNumber: 'INV-2023001',
        clientName: 'Tech Solutions Inc',
        amount: 50000,
        status: 'paid',
        createdAt: '2023-06-20',
        createdBy: 1
    }
];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// JWT Authentication Middleware
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            // Get user from token
            req.user = users.find(u => u.id === decoded.id);

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Routes
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && password === 'admin123') { // Simplified auth for demo
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token: jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your-secret-key', {
                expiresIn: '30d'
            })
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
});

// Leads routes
app.get('/api/leads', protect, (req, res) => {
    res.json({ success: true, leads });
});

app.post('/api/leads', protect, (req, res) => {
    const newLead = {
        id: leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1,
        ...req.body,
        createdAt: new Date().toISOString().split('T')[0],
        assignedTo: req.user.id
    };
    leads.push(newLead);
    res.status(201).json({ success: true, lead: newLead });
});

app.put('/api/leads/:id', protect, (req, res) => {
    const leadId = parseInt(req.params.id);
    const leadIndex = leads.findIndex(l => l.id === leadId);
    
    if (leadIndex === -1) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    leads[leadIndex] = {
        ...leads[leadIndex],
        ...req.body,
        id: leadId
    };

    res.json({ success: true, lead: leads[leadIndex] });
});

app.patch('/api/leads/:id/status', protect, (req, res) => {
    const leadId = parseInt(req.params.id);
    const { status } = req.body;
    const leadIndex = leads.findIndex(l => l.id === leadId);
    
    if (leadIndex === -1) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    leads[leadIndex].status = status;
    res.json({ success: true, lead: leads[leadIndex] });
});

app.delete('/api/leads/:id', protect, (req, res) => {
    const leadId = parseInt(req.params.id);
    const leadIndex = leads.findIndex(l => l.id === leadId);
    
    if (leadIndex === -1) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    leads.splice(leadIndex, 1);
    res.json({ success: true, message: 'Lead deleted successfully' });
});

// Invoices routes
app.get('/api/invoices', protect, (req, res) => {
    res.json({ success: true, invoices });
});

app.get('/api/clients', protect, (req, res) => {
    // Return leads that can be used as clients (status is 'won')
    const clients = leads.filter(lead => lead.status === 'won').map(lead => ({
        id: lead.id,
        name: lead.companyName,
        contactPerson: lead.contactPerson,
        email: lead.email
    }));
    res.json({ success: true, clients });
});

app.post('/api/invoices', protect, (req, res) => {
    const newInvoice = {
        id: invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
        invoiceNumber: `INV-${new Date().getFullYear()}${String(invoices.length + 1).padStart(3, '0')}`,
        ...req.body,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: req.user.id
    };
    invoices.push(newInvoice);
    res.status(201).json({ success: true, invoice: newInvoice });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
