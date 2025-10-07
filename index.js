require('dotenv').config(); // Add this line at the very top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Define a port

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Use an environment variable for the database connection string
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => console.log('✅ Successfully connected to MongoDB Atlas'))
  .catch(err => console.error('❌ Could not connect to MongoDB Atlas', err));

// --- Mongoose Schemas & Models ---
const userSchema = new mongoose.Schema({ 
    username: { type: String, required: true, unique: true }, 
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true } 
});
const User = mongoose.model('User', userSchema);

const carSchema = new mongoose.Schema({ 
    make: { type: String, required: true }, 
    model: { type: String, required: true }, 
    year: { type: Number, required: true }, 
    kilometers: { type: Number, required: true }, 
    ownership: { type: String, required: true }, 
    condition: { type: String, required: true }, 
    issues: { type: String }, 
    sellerName: { type: String, required: true }, 
    sellerPhone: { type: String, required: true }, 
    sellerEmail: { type: String, required: true },
    submissionDate: { type: Date, default: Date.now } 
});
const Car = mongoose.model('Car', carSchema);

const contactSchema = new mongoose.Schema({ 
    name: { type: String, required: true }, 
    email: { type: String, required: true }, 
    message: { type: String, required: true }, 
    receivedAt: { type: Date, default: Date.now } 
});
const Contact = mongoose.model('Contact', contactSchema);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) { 
            return res.status(400).json({ message: "An account with this email already exists." }); 
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created successfully!" });
    } catch (error) { 
        res.status(500).json({ message: "Server error during signup." }); 
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) { 
            return res.status(404).json({ message: "Invalid credentials." }); 
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { 
            return res.status(400).json({ message: "Invalid credentials." }); 
        }
        if (!user.username) {
            return res.status(500).json({ message: "Account error: Username is missing. Please sign up again." });
        }
        res.status(200).json({ token: 'simulated-jwt-token', username: user.username });
    } catch (error) { 
        res.status(500).json({ message: "Server error during login." }); 
    }
});

app.post('/api/sell-car', async (req, res) => {
    try {
        const newCarSubmission = new Car(req.body);
        await newCarSubmission.save();
        res.status(201).json({ message: "Valuation request received! We will contact you shortly." });
    } catch (error) { 
        res.status(500).json({ message: "Server error during car submission." }); 
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        const newContactMessage = new Contact(req.body);
        await newContactMessage.save();
        res.status(201).json({ message: "Message received. We will get back to you shortly!" });
    } catch (error) { 
        res.status(500).json({ message: "Server error while sending message." }); 
    }
});

// Catch-all route to serve the main HTML file for client-side routing
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});