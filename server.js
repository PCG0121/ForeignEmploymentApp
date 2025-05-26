const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files (HTML, CSS, JS)

// Helper to generate application ID
async function generateAppId() {
    const { data, error } = await supabase
        .from('applications')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
    if (error) throw error;
    const lastId = data.length > 0 ? parseInt(data[0].id.replace('APP', '')) : 0;
    return `APP${(lastId + 1).toString().padStart(4, '0')}`;
}

// API Routes
// Get all applications
app.get('/api/applications', async (req, res) => {
    try {
        const { data, error } = await supabase.from('applications').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Submit a new application
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
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Update application status or details
app.put('/api/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { error } = await supabase
            .from('applications')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
        res.json({ message: 'Application updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// Get application by ID
app.get('/api/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) {
            res.status(404).json({ error: 'Application not found' });
        } else {
            res.json(data);
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// Add a system user
app.post('/api/users', async (req, res) => {
    try {
        const user = req.body;
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('username')
            .eq('username', user.username)
            .single();
        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const { error } = await supabase.from('users').insert([user]);
        if (error) throw error;
        res.json({ message: 'User added' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add user' });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Delete a user
app.delete('/api/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('username', username);
        if (error) throw error;
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});