const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // For demo purposes, we'll use a free MongoDB Atlas cluster
        const mongoURI = 'mongodb+srv://demo-user:demo-pass-123@demo-cluster.mongodb.net/crm?retryWrites=true&w=majority';
        
        const conn = await mongoose.connect(process.env.MONGODB_URI || mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority'
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
