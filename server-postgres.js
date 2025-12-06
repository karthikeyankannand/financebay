const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  } else {
    console.log('✅ PostgreSQL connected successfully!');
  }
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'financebay-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production' // HTTPS only in production
  }
}));

// Initialize Database Tables
async function initializeDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // List of Values table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS list_of_values (
        id SERIAL PRIMARY KEY,
        field_name TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER
      )
    `);

    // Expenses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        entry_date DATE NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        uom TEXT NOT NULL,
        category TEXT NOT NULL,
        expense_type TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Budgets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Income table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS income (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        date DATE NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Traffic log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS traffic_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        page TEXT NOT NULL,
        action TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Error logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        error_message TEXT NOT NULL,
        error_stack TEXT,
        page TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created/verified');

    // Create admin user if not exists
    const adminCheck = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync('Admin@123', 10);
      await pool.query(
        'INSERT INTO users (username, email, password, is_admin, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
        ['admin', 'admin@financebay.com', hashedPassword, 1]
      );
      console.log('\n===========================================');
      console.log('Admin User Created!');
      console.log('Username: admin');
      console.log('Password: Admin@123');
      console.log('===========================================\n');
    }

    // Initialize default List of Values
    const lovCount = await pool.query('SELECT COUNT(*) as count FROM list_of_values');
    if (lovCount.rows[0].count == 0) {
      const uomValues = ['g', 'Kg', 'mL', 'L', 'mm', 'm', 'kWh', 'each', 'nos'];
      const categoryValues = [
        'Rent', 'Provisions', 'Vegetables & Fruits', 'Fuel', 'Electricity', 'Debt',
        'Restaurant', 'Gas', 'Education', 'Home Essentials', 'Electronics', 'Machinery',
        'Savings & Investments', 'Lent Cash', 'Clothing', 'Fashion & Beauty',
        'Entertainment', 'Travel', 'Travel Accommodation', 'Junk Foods', 'Charity',
        'Misc', 'Medical', 'Insurance', 'Govt. Related Xpense', 'Fitness', 'Gift',
        'Mobile & Internet', 'Digital Subscriptions', 'Relocation', 'Equipment Maintenance',
        'Repair Works'
      ];
      const expenseTypeValues = ['Planned', 'Unplanned'];
      const paymentMethodValues = ['UPI', 'Debit Card', 'Credit Card', 'Cash'];

      for (const val of uomValues) {
        await pool.query('INSERT INTO list_of_values (field_name, value, created_by, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)', ['uom', val, 1]);
      }
      for (const val of categoryValues) {
        await pool.query('INSERT INTO list_of_values (field_name, value, created_by, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)', ['expense_category', val, 1]);
      }
      for (const val of expenseTypeValues) {
        await pool.query('INSERT INTO list_of_values (field_name, value, created_by, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)', ['expense_type', val, 1]);
      }
      for (const val of paymentMethodValues) {
        await pool.query('INSERT INTO list_of_values (field_name, value, created_by, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)', ['payment_method', val, 1]);
      }
      console.log('✅ Default List of Values initialized');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
}

function requireAdmin(req, res, next) {
  if (req.session.userId && req.session.isAdmin) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
}

// Traffic logging middleware
function logTraffic(page, action = 'visit') {
  return async (req, res, next) => {
    if (req.session.userId) {
      try {
        await pool.query(
          'INSERT INTO traffic_log (user_id, page, action, timestamp) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
          [req.session.userId, page, action]
        );
      } catch (error) {
        console.error('Traffic logging error:', error);
      }
    }
    next();
  };
}

// Auth routes
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Check if username or email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existingUser.rows.length > 0) {
      return res.json({ success: false, message: 'Username or email already exists' });
    }

    await pool.query(
      'INSERT INTO users (username, email, password, is_admin, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
      [username, email, hashedPassword, 0]
    );
    
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.json({ success: false, message: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }
    
    const user = result.rows[0];
    const passwordMatch = bcrypt.compareSync(password, user.password);
    
    if (!passwordMatch) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }
    
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.isAdmin = user.is_admin === 1;
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      isAdmin: user.is_admin === 1 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.json({ success: false, message: 'Login failed' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/session', (req, res) => {
  if (req.session.userId) {
    res.json({ 
      authenticated: true, 
      username: req.session.username,
      isAdmin: req.session.isAdmin 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Expense routes
app.post('/api/expenses', requireAuth, async (req, res) => {
  try {
    const { description, amount, quantity, uom, category, expenseType, paymentMethod, entryDate } = req.body;
    
    if (!description || !amount || !quantity || !uom || !category || !expenseType || !paymentMethod) {
      return res.json({ success: false, message: 'Please fill all the fields' });
    }
    
    await pool.query(`
      INSERT INTO expenses (user_id, entry_date, description, amount, quantity, uom, category, expense_type, payment_method, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
    `, [req.session.userId, entryDate, description, amount, quantity, uom, category, expenseType, paymentMethod]);
    
    res.json({ success: true, message: 'Expense logged successfully' });
  } catch (error) {
    console.error('Expense log error:', error);
    await pool.query('INSERT INTO error_logs (user_id, error_message, error_stack, page, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
      [req.session.userId, error.message, error.stack, 'Daily Xpense Logger']
    );
    res.json({ success: false, message: 'Failed to log expense' });
  }
});

app.get('/api/expenses', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM expenses 
      WHERE user_id = $1 
      ORDER BY entry_date DESC, created_at DESC
    `, [req.session.userId]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.json({ success: false, message: 'Failed to fetch expenses' });
  }
});

// Budget routes
app.get('/api/budgets', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM budgets 
      WHERE user_id = $1 
      ORDER BY year DESC, month DESC
    `, [req.session.userId]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.json({ success: false, message: 'Failed to fetch budgets' });
  }
});

app.post('/api/budgets', requireAuth, async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    
    if (!month || !year || !amount) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    // Check if budget already exists
    const existing = await pool.query(`
      SELECT * FROM budgets 
      WHERE user_id = $1 AND month = $2 AND year = $3
    `, [req.session.userId, month, year]);

    if (existing.rows.length > 0) {
      return res.json({ success: false, message: 'Budget already exists for this month and year. Please edit it instead.' });
    }
    
    await pool.query(`
      INSERT INTO budgets (user_id, month, year, amount, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `, [req.session.userId, month, year, amount]);
    
    res.json({ success: true, message: 'Budget saved successfully' });
  } catch (error) {
    console.error('Save budget error:', error);
    await pool.query('INSERT INTO error_logs (user_id, error_message, error_stack, page, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
      [req.session.userId, error.message, error.stack, 'Budget Manager']
    );
    res.json({ success: false, message: 'Failed to save budget' });
  }
});

app.put('/api/budgets/:id', requireAuth, async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    const budgetId = req.params.id;
    
    if (!month || !year || !amount) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    // Verify budget belongs to user
    const budget = await pool.query('SELECT * FROM budgets WHERE id = $1 AND user_id = $2', [budgetId, req.session.userId]);
    if (budget.rows.length === 0) {
      return res.json({ success: false, message: 'Budget not found' });
    }

    // Check if another budget exists for this month/year
    const existing = await pool.query(`
      SELECT * FROM budgets 
      WHERE user_id = $1 AND month = $2 AND year = $3 AND id != $4
    `, [req.session.userId, month, year, budgetId]);

    if (existing.rows.length > 0) {
      return res.json({ success: false, message: 'Budget already exists for this month and year.' });
    }
    
    await pool.query(`
      UPDATE budgets 
      SET month = $1, year = $2, amount = $3
      WHERE id = $4 AND user_id = $5
    `, [month, year, amount, budgetId, req.session.userId]);
    
    res.json({ success: true, message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Update budget error:', error);
    await pool.query('INSERT INTO error_logs (user_id, error_message, error_stack, page, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
      [req.session.userId, error.message, error.stack, 'Budget Manager']
    );
    res.json({ success: false, message: 'Failed to update budget' });
  }
});

app.delete('/api/budgets/:id', requireAuth, async (req, res) => {
  try {
    const budgetId = req.params.id;
    
    // Verify budget belongs to user
    const budget = await pool.query('SELECT * FROM budgets WHERE id = $1 AND user_id = $2', [budgetId, req.session.userId]);
    if (budget.rows.length === 0) {
      return res.json({ success: false, message: 'Budget not found' });
    }
    
    await pool.query('DELETE FROM budgets WHERE id = $1 AND user_id = $2', [budgetId, req.session.userId]);
    
    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    await pool.query('INSERT INTO error_logs (user_id, error_message, error_stack, page, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
      [req.session.userId, error.message, error.stack, 'Budget Manager']
    );
    res.json({ success: false, message: 'Failed to delete budget' });
  }
});

// List of Values routes
app.get('/api/lov/:fieldName', async (req, res) => {
  try {
    const result = await pool.query('SELECT value FROM list_of_values WHERE field_name = $1 ORDER BY value', [req.params.fieldName]);
    res.json({ success: true, data: result.rows.map(v => v.value) });
  } catch (error) {
    console.error('Get LoV error:', error);
    res.json({ success: false, message: 'Failed to fetch values' });
  }
});

app.get('/api/lov', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM list_of_values ORDER BY field_name, value');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get all LoV error:', error);
    res.json({ success: false, message: 'Failed to fetch values' });
  }
});

app.post('/api/lov', requireAdmin, async (req, res) => {
  try {
    const { fieldName, value } = req.body;
    
    await pool.query('INSERT INTO list_of_values (field_name, value, created_by, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
      [fieldName, value, req.session.userId]
    );
    
    res.json({ success: true, message: 'Value added successfully' });
  } catch (error) {
    console.error('Add LoV error:', error);
    res.json({ success: false, message: 'Failed to add value' });
  }
});

app.delete('/api/lov/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM list_of_values WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Value deleted successfully' });
  } catch (error) {
    console.error('Delete LoV error:', error);
    res.json({ success: false, message: 'Failed to delete value' });
  }
});

// Admin routes
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, is_admin, created_at FROM users');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.json({ success: false, message: 'Failed to fetch users' });
  }
});

app.get('/api/admin/traffic', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.username 
      FROM traffic_log t 
      LEFT JOIN users u ON t.user_id = u.id 
      ORDER BY timestamp DESC 
      LIMIT 1000
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get traffic error:', error);
    res.json({ success: false, message: 'Failed to fetch traffic data' });
  }
});

app.get('/api/admin/errors', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.username 
      FROM error_logs e 
      LEFT JOIN users u ON e.user_id = u.id 
      ORDER BY timestamp DESC 
      LIMIT 1000
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get errors error:', error);
    res.json({ success: false, message: 'Failed to fetch error logs' });
  }
});

// Error logging endpoint
app.post('/api/log-error', async (req, res) => {
  try {
    const { errorMessage, errorStack, page } = req.body;
    await pool.query('INSERT INTO error_logs (user_id, error_message, error_stack, page, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
      [req.session.userId || null, errorMessage, errorStack || null, page]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging failed:', error);
    res.json({ success: false });
  }
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Health check endpoint for deployment
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Initialize database and start server
initializeDatabase().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 FinanceBay Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: PostgreSQL\n`);
  });
  
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', error);
    }
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
