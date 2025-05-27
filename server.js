const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

console.log('Starting server...');

// Load environment variables
dotenv.config();
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
console.log('PORT:', process.env.PORT || 5000);

const app = express();

// Initialize Supabase
let supabase;
try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log('Supabase connected');
} catch (error) {
    console.log('Supabase error:', error.message);
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve files from public folder
console.log('Middleware set');

// Serve index.html
app.get(['/', '/index.html'], (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate application ID
async function generateAppId() {
    try {
        const { data, error } = await supabase
            .from('applications')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);
        if (error) throw error;
        const lastId = data.length > 0 ? parseInt(data[0].id.replace('APP', '')) : 0;
        return `APP${(lastId + 1).toString().padStart(4, '0')}`;
    } catch (error) {
        console.log('ID error:', error.message);
        throw error;
    }
}

// API Routes
app.get('/api/applications', async (req, res) => {
    try {
        const { data, error } = await supabase.from('applications').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.log('Fetch error:', error.message);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

app.post('/api/applications', async (req, res) => {
    try {
        const application = {
            id: await generateAppId(),
            ...req.body,
            status: 'Submitted',
            timestamp: new Date().toISOString()
        };
        const { error } = await supabase.from('applications').insert([application]);
        if (error) throw error;
        res.json({ message: 'Application submitted', id: application.id });
    } catch (error) {
        console.log('Submit error:', error.message);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
}).on('error', (error) => {
    console.log('Server error:', error.message);
});

module.exports = app;