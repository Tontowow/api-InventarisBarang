// Import libraries
const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadsDir));

// --- Database Connection ---
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
      user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
waitForConnections: true,
connectionLimit: 10,
       queueLimit: 0
});

// --- Session and Passport Setup ---
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.google_id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [rows] = await dbPool.query('SELECT * FROM users WHERE google_id = ?', [id]);
        done(null, rows[0]);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.APP_URL}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const [existingUser] = await dbPool.query('SELECT * FROM users WHERE google_id = ?', [profile.id]);

            if (existingUser.length > 0) {
                return done(null, existingUser[0]);
            }

            const newUser = {
                google_id: profile.id,
                display_name: profile.displayName,
                email: profile.emails[0].value
            };
            await dbPool.query('INSERT INTO users SET ?', newUser);
            return done(null, newUser);
        } catch (err) {
            return done(err, null);
        }
    }
));

// --- Middleware to check if user is authenticated ---
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized. Please login first.' });
}

// --- Image Upload (Multer) Setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `<span class="math-inline">\{Date\.now\(\)\}\-</span>{path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// --- Routes ---

// ## Authentication Routes ##
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login-failed' }),
    (req, res) => {
        res.redirect('/profile'); // Redirect to a profile page or send a success message
    }
);

app.get('/profile', isAuthenticated, (req, res) => {
    res.json({ message: 'Welcome!', user: req.user });
});

app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.json({ message: 'Successfully logged out.' });
    });
});

// ## Barang (Item) CRUD Routes ##

// GET all items (Public)
app.get('/barang', async (req, res) => {
    try {
        const [rows] = await dbPool.query('SELECT * FROM barang ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching items', error: err.message });
    }
});

// GET one item by ID (Public)
app.get('/barang/:id', async (req, res) => {
    try {
        const [rows] = await dbPool.query('SELECT * FROM barang WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching item', error: err.message });
    }
});

// POST a new item (Protected)
app.post('/barang', isAuthenticated, upload.single('gambar_barang'), async (req, res) => {
    const { nama_barang, deskripsi_barang } = req.body;
    if (!nama_barang) {
        return res.status(400).json({ message: 'nama_barang is required' });
    }

    const gambar_url = req.file ? `<span class="math-inline">\{process\.env\.APP\_URL\}/uploads/</span>{req.file.filename}` : null;
    
    try {
        const [result] = await dbPool.query(
            'INSERT INTO barang (nama_barang, deskripsi_barang, gambar_barang) VALUES (?, ?, ?)',
            [nama_barang, deskripsi_barang, gambar_url]
        );
        res.status(201).json({ id: result.insertId, nama_barang, deskripsi_barang, gambar_barang: gambar_url });
    } catch (err) {
        res.status(500).json({ message: 'Error creating item', error: err.message });
    }
});

// PUT/UPDATE an item by ID (Protected)
app.put('/barang/:id', isAuthenticated, upload.single('gambar_barang'), async (req, res) => {
    const { nama_barang, deskripsi_barang } = req.body;
    const { id } = req.params;

    try {
        // Check if item exists
        const [item] = await dbPool.query('SELECT * FROM barang WHERE id = ?', [id]);
        if (item.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        // Handle new image upload
        let gambar_url = item[0].gambar_barang;
        if (req.file) {
             // Optionally delete old image file
            if (item[0].gambar_barang) {
                const oldFilename = path.basename(new URL(item[0].gambar_barang).pathname);
                fs.unlink(path.join(uploadsDir, oldFilename), err => {
                    if (err) console.error("Error deleting old file:", err.message);
                });
            }
            gambar_url = `<span class="math-inline">\{process\.env\.APP\_URL\}/uploads/</span>{req.file.filename}`;
        }

        await dbPool.query(
            'UPDATE barang SET nama_barang = ?, deskripsi_barang = ?, gambar_barang = ? WHERE id = ?',
            [nama_barang || item[0].nama_barang, deskripsi_barang || item[0].deskripsi_barang, gambar_url, id]
        );
        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating item', error: err.message });
    }
});

// DELETE an item by ID (Protected)
app.delete('/barang/:id', isAuthenticated, async (req, res) => {
    try {
        // Find item to delete its image
        const [item] = await dbPool.query('SELECT gambar_barang FROM barang WHERE id = ?', [req.params.id]);
        if (item.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Delete image file if it exists
        if (item[0].gambar_barang) {
            const filename = path.basename(new URL(item[0].gambar_barang).pathname);
            fs.unlink(path.join(uploadsDir, filename), err => {
                if (err) console.error("Error deleting file:", err.message);
            });
        }
        
        // Delete from database
        await dbPool.query('DELETE FROM barang WHERE id = ?', [req.params.id]);
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting item', error: err.message });
    }
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
