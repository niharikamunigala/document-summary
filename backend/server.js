const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDB } = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Global variables
global.latestExtractedText = '';
global.latestDocumentId = null;

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Legislative Document Summarizer API is running!' });
});

// Initialize database and start server
async function startServer() {
    try {
        await connectDB();
        console.log('\n✓ Database ready, loading routes...');
        
        // Load routes AFTER database is connected
        const uploadRoute = require('./routes/upload');
        const chatRoute = require('./routes/chat');
        const translateRoute = require('./routes/translate');
        const remindersRoute = require('./routes/reminders');
        
        app.use('/upload', uploadRoute);
        app.use('/chat', chatRoute);
        app.use('/translate', translateRoute);
        app.use('/reminders', remindersRoute);
        
        app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ API ready at http://localhost:${PORT}\n`);
        });
    } catch (error) {
        console.error('✗ Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
