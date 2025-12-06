const express = require('express');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database
let db;
const dbPath = 'financebay.db';

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'financebay-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Helper function to save database
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Helper function to run SQL with auto-save
function runSQL(sql, params = []) {
  try {
    db.run(sql, params);
    saveDatabase();
  } catch (error) {
    console.error('SQL Error:', error);
    throw error;
  }
}

// Helper function to get SQL results
function getSQL(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  } catch (error) {
    console.error('SQL Error:', error);
    throw error;
  }
}

// Initialize Database Tables
async function initializeDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Users table
  runSQL(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // List of Values (LoV) table
  runSQL(`
    CREATE TABLE IF NOT EXISTS list_of_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field_name TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER
    )
  `);

  // Expenses table
  runSQL(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      entry_date DATE NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      quantity REAL NOT NULL,
      uom TEXT NOT NULL,
      category TEXT NOT NULL,
      expense_type TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Budget table
  runSQL(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Income table
  runSQL(`
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Traffic log table
  runSQL(`
    CREATE TABLE IF NOT EXISTS traffic_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      page TEXT NOT NULL,
      action TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Error logs table
  runSQL(`
    CREATE TABLE IF NOT EXISTS error_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      error_message TEXT NOT NULL,
      error_stack TEXT,
      page TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create admin user if not exists
  const adminExists = getSQL('SELECT * FROM users WHERE username = ?', ['admin']);
  if (adminExists.length === 0) {
    const hashedPassword = bcrypt.hashSync('Admin@123', 10);
    runSQL('INSERT INTO users (username, email, password, is_admin, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      ['admin', 'admin@financebay.com', hashedPassword, 1]
    );
    console.log('\n===========================================');
    console.log('Admin User Created!');
    console.log('Username: admin');
    console.log('Password: Admin@123');
    console.log('===========================================\n');
  }

  // Initialize default List of Values
  const lovCount = getSQL('SELECT COUNT(*) as count FROM list_of_values');
  if (lovCount[0].count === 0) {
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

    uomValues.forEach(val => runSQL('INSERT INTO list_of_values (field_name, value, created_by, created_at) VALUES (?, ?, ?, datetime("now"))', ['uom', val, 1]));
    categoryValues.forEach(val => runSQL('INSERT INTO list_of_values (field_name, value, created_by, created_at) VALUES (?, ?, ?, datetime("now"))', ['expense_category', val, 1]));
    expenseTypeValues.forEach(val => runSQL('INSERT INTO list_of_values (field_name, value, created_by, created_at) VALUES (?, ?, ?, datetime("now"))', ['expense_type', val, 1]));
    paymentMethodValues.forEach(val => runSQL('INSERT INTO list_of_values (field_name, value, created_by, created_at) VALUES (?, ?, ?, datetime("now"))', ['payment_method', val, 1]));
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
  return (req, res, next) => {
    if (req.session.userId) {
      runSQL('INSERT INTO traffic_log (user_id, page, action, timestamp) VALUES (?, ?, ?, datetime("now"))',
        [req.session.userId, page, action]
      );
    }
    next();
  };
}

// Routes

// Auth routes
app.post('/api/signup', (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    try {
      // Check if username or email already exists
      const existingUser = getSQL('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
      if (existingUser.length > 0) {
        return res.json({ success: false, message: 'Username or email already exists' });
      }

      runSQL('INSERT INTO users (username, email, password, is_admin, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        [username, email, hashedPassword, 0]
      );
      
      res.json({ success: true, message: 'User registered successfully' });
    } catch (err) {
      throw err;
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.json({ success: false, message: 'Registration failed' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    const users = getSQL('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }
    
    const user = users[0];
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
app.post('/api/expenses', requireAuth, (req, res) => {
  try {
    const { description, amount, quantity, uom, category, expenseType, paymentMethod, entryDate } = req.body;
    
    if (!description || !amount || !quantity || !uom || !category || !expenseType || !paymentMethod) {
      return res.json({ success: false, message: 'Please fill all the fields' });
    }
    
    runSQL(`
      INSERT INTO expenses (user_id, entry_date, description, amount, quantity, uom, category, expense_type, payment_method, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))
    `, [req.session.userId, entryDate, description, amount, quantity, uom, category, expenseType, paymentMethod]);
    
    res.json({ success: true, message: 'Expense logged successfully' });
  } catch (error) {
    console.error('Expense log error:', error);
    runSQL('INSERT INTO error_logs (user_id, error_message, error_stack, page, timestamp) VALUES (?, ?, ?, ?, datetime("now"))',
      [req.session.userId, error.message, error.stack, 'Daily Xpense Logger']
    );
    res.json({ success: false, message: 'Failed to log expense' });
  }
});

app.get('/api/expenses', requireAuth, (req, res) => {
  try {
    const expenses = getSQL(`
      SELECT * FROM expenses 
      WHERE user_id = ? 
      ORDER BY entry_date DESC, created_at DESC
    `, [req.session.userId]);
    
    res.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.json({ success: false, message: 'Failed to fetch expenses' });
  }
});

// List of Values routes
app.get('/api/lov/:fieldName', (req, res) => {
  try {
    const values = getSQL('SELECT value FROM list_of_values WHERE field_name = ? ORDER BY value', [req.params.fieldName]);
    res.json({ success: true, data: values.map(v => v.value) });
  } catch (error) {
    console.error('Get LoV error:', error);
    res.json({ success: false, message: 'Failed to fetch values' });
  }
});

app.get('/api/lov', requireAdmin, (req, res) => {
  try {
    const lovs = getSQL('SELECT * FROM list_of_values ORDER BY field_name, value');
    res.json({ success: true, data: lovs });
  } catch (error) {
    console.error('Get all LoV error:', error);
    res.json({ success: false, message: 'Failed to fetch values' });
  }
});

app.post('/api/lov', requireAdmin, (req, res) => {
  try {
    const { fieldName, value } = req.body;
    
    runSQL('INSERT INTO list_of_values (field_name, value, created_by, created_at) VALUES (?, ?, ?, datetime("now"))',
      [fieldName, value, req.session.userId]
    );
    
    res.json({ success: true, message: 'Value added successfully' });
  } catch (error) {
    console.error('Add LoV error:', error);
    res.json({ success: false, message: 'Failed to add value' });
  }
});

app.delete('/api/lov/:id', requireAdmin, (req, res) => {
  try {
    runSQL('DELETE FROM list_of_values WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Value deleted successfully' });
  } catch (error) {
    console.error('Delete LoV error:', error);
    res.json({ success: false, message: 'Failed to delete value' });
  }
});

// Admin routes
app.get('/api/admin/users', requireAdmin, (req, res) => {
  try {
    const users = getSQL('SELECT id, username, email, is_admin, created_at FROM users');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.json({ success: false, message: 'Failed to fetch users' });
  }
});

app.get('/api/admin/traffic', requireAdmin, (req, res) => {
  try {
    const traffic = getSQL(`
      SELECT t.*, u.username 
      FROM traffic_log t 
      LEFT JOIN users u ON t.user_id = u.id 
      ORDER BY timestamp DESC 
      LIMIT 1000
    `);
    res.json({ success: true, data: traffic });
  } catch (error) {
    console.error('Get traffic error:', error);
    res.json({ success: false, message: 'Failed to fetch traffic data' });
  }
});

app.get('/api/admin/errors', requireAdmin, (req, res) => {
  try {
    const errors = getSQL(`
      SELECT e.*, u.username 
      FROM error_logs e 
      LEFT JOIN users u ON e.user_id = u.id 
      ORDER BY timestamp DESC 
      LIMIT 1000
    `);
    res.json({ success: true, data: errors });
  } catch (error) {
    console.error('Get errors error:', error);
    res.json({ success: false, message: 'Failed to fetch error logs' });
  }
});

// Budget routes
app.get('/api/budgets', requireAuth, (req, res) => {
  try {
    const budgets = getSQL(`
      SELECT * FROM budgets 
      WHERE user_id = ? 
      ORDER BY year DESC, month DESC
    `, [req.session.userId]);
    
    res.json({ success: true, data: budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.json({ success: false, message: 'Failed to fetch budgets' });
  }
});

app.post('/api/budgets', requireAuth, (req, res) => {
  try {
    const { month, year, amount } = req.body;
    
    if (!month || !year || !amount) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    // Check if budget already exists for this month/year
    const existing = getSQL(`
      SELECT * FROM budgets 
      WHERE user_id = ? AND month = ? AND year = ?
    `, [req.session.userId, month, year]);

    if (existing.length > 0) {
      return res.json({ success: false, message: 'Budget already exists for this month and year. Please edit it instead.' });
    }
    
    runSQL(`
      INSERT INTO budgets (user_id, month, year, amount, created_at)
      VALUES (?, ?, ?, ?, datetime("now"))
    `, [req.session.userId, month, year, amount]);
    
    res.json({ success: true, message: 'Budget saved successfully' });
  } catch (error) {
    console.error('Save budget error:', error);
    runSQL('INSERT INTO error_logs (user_id, error_message, error_stack, page, timestamp) VALUES (?, ?, ?, ?, datetime("now"))',
      [req.session.userId, error.message, error.stack, 'Budget Manager']
    );
    res.json({ success: false, message: 'Failed to save budget' });
  }
});

app.put('/api/budgets/:id', requireAuth, (req, res) => {
  try {
    const { month, year, amount } = req.body;
    const budgetId = req.params.id;
    
    if (!month || !year || !amount) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    // Verify budget belongs to user
    const budget = getSQL('SELECT * FROM budgets WHERE id = ? AND user_id = ?', [budgetId, req.session.userId]);
    if (budget.length === 0) {
      return res.json({ success: false, message: 'Budget not found' });
    }

    // Check if another budget exists for this month/year (excluding current one)
    const existing = getSQL(`
      SELECT * FROM budgets 
      WHERE user_id = ? AND month = ? AND year = ? AND id != ?
    `, [req.session.userId, month, year, budgetId]);

    if (existing.length > 0) {
      return res.json({ success: false, message: 'Budget already exists for this month and year.' });
    }
    
    runSQL(`
      UPDATE budgets 
      SET month = ?, year = ?, amount = ?
      WHERE id = ? AND user_id = ?
    `, [month, year, amount, budgetId, req.session.userId]);
    
    res.json({ success: true, message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Update budget error:', error);
    runSQL('INSERT INTO error_logs (user_id, error_message, error_stack, page, timestamp) VALUES (?, ?, ?, ?, datetime("now"))',
      [req.session.userId, error.message, error.stack, 'Budget Manager']
    );
    res.json({ success: false, message: 'Failed to update budget' });
  }
});

app.delete('/api/budgets/:id', requireAuth, (req, res) => {
  try {
    const budgetId = req.params.id;
    
    // Verify budget belongs to user
    const budget = getSQL('SELECT * FROM budgets WHERE id = ? AND user_id = ?', [budgetId, req.session.userId]);
    if (budget.length === 0) {
      return res.json({ success: false, message: 'Budget not found' });
    }
    
    runSQL('DELETE FROM budgets WHERE id = ? AND user_id = ?', [budgetId, req.session.userId]);
    
    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    runSQL('INSERT INTO error_logs (user_id, error_message, error_stack, page, timestamp) VALUES (?, ?, ?, ?, datetime("now"))',
      [req.session.userId, error.message, error.stack, 'Budget Manager']
    );
    res.json({ success: false, message: 'Failed to delete budget' });
  }
});

// Error logging endpoint
app.post('/api/log-error', (req, res) => {
  try {
    const { errorMessage, errorStack, page } = req.body;
    runSQL('INSERT INTO error_logs (user_id, error_message, error_stack, page, timestamp) VALUES (?, ?, ?, ?, datetime("now"))',
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

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 FinanceBay Server running on http://localhost:${PORT}`);
    console.log(`📱 Open in browser to access the app\n`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
