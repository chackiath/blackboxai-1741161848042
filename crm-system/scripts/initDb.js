const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const users = [
    {
        username: 'admin',
        password: 'admin123',
        email: 'admin@crm.com',
        name: 'System Admin',
        role: 'admin'
    },
    {
        username: 'manager',
        password: 'manager123',
        email: 'manager@crm.com',
        name: 'Sales Manager',
        role: 'manager'
    },
    {
        username: 'accountant',
        password: 'accountant123',
        email: 'accountant@crm.com',
        name: 'Finance Officer',
        role: 'accountant'
    },
    {
        username: 'sales1',
        password: 'sales123',
        email: 'sales1@crm.com',
        name: 'Sales Agent 1',
        role: 'sales_agent'
    }
];

const initializeDb = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create new users
        for (const userData of users) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            
            await User.create({
                ...userData,
                password: hashedPassword
            });
            console.log(`Created user: ${userData.username}`);
        }

        console.log('Database initialization completed');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
};

initializeDb();
