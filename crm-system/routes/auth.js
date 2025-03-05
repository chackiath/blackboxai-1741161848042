const express = require('express');
const router = express.Router();

// Mock user data (in a real app, this would be in a database)
const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'manager', password: 'manager123', role: 'manager' },
    { id: 3, username: 'accountant', password: 'accountant123', role: 'accountant' },
    { id: 4, username: 'sales1', password: 'sales123', role: 'sales_agent' }
];

// Login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // In a real app, we would generate a JWT token here
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    // In a real app, we would invalidate the JWT token here
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
