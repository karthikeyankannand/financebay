# 🚀 FinanceBay - Installation & Credentials

## ✅ Application Successfully Created!

Your FinanceBay mobile expense tracking application is now ready to use!

---

## 🔐 DATABASE CREDENTIALS

### Database Information
- **Database Type**: SQLite (File-based)
- **Database File**: `financebay.db` (auto-created in the project root)
- **Location**: Same directory as server.js

### Admin Account Credentials
```
Username: admin
Password: Admin@123
Email: admin@financebay.com
```

**Note**: This admin account has full access to:
- User Database Management
- List of Values (LoV) Manager
- Traffic Dashboard
- Error Logs
- Debug Features

---

## 🎯 How to Run the Application

### 1. Install Dependencies (One-time setup)
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
or
```bash
node server.js
```

### 3. Access the Application
Open your web browser and navigate to:
```
http://localhost:3000
```

The server runs on **port 3000** by default.

---

## 📱 Application Features Implemented

### ✅ Phase 1 - COMPLETED (As Per Your Requirements)

#### User Features:
1. **Login & Signup Page**
   - User registration with email validation
   - Secure login with password hashing
   - Session management
   - Theme selector (Light, Dark, Grey)

2. **Daily Xpense Logger Page** ✅
   - **Entry Date**: Auto-captured and stored statically (doesn't change)
   - **Xpense Description**: Text input
   - **Amount**: Float input (currency)
   - **Quantity**: Float input
   - **UOM Dropdown**: g, Kg, mL, L, mm, m, kWh, each, nos
   - **Xpense Category Combobox**: 32 categories including:
     - Rent, Provisions, Vegetables & Fruits, Fuel, Electricity, Debt
     - Restaurant, Gas, Education, Home Essentials, Electronics
     - Savings & Investments, Medical, Insurance, Travel, etc.
   - **Xpense Type Dropdown**: Planned, Unplanned
   - **Xpense Method Dropdown**: UPI, Debit Card, Credit Card, Cash
   - **Log Button**: Saves all data to database
   - **Validation**: Shows "Please fill all the fields" if incomplete
   - **Recent Expenses List**: View all logged expenses

#### Admin Features:
3. **Admin Dashboard**
   - System statistics (Users, Traffic, Errors)
   - User Database viewer
   - List of Values (LoV) Manager
   - Traffic monitoring
   - Error logs viewer
   - Debug features

#### Design Features:
4. **Responsive UI**
   - Works on all mobile device sizes
   - Portrait and landscape mode support
   - Dynamic layout adjustments
   - Touch-friendly interface

5. **Theme Support**
   - Light Theme (default)
   - Dark Theme
   - Grey Theme
   - Theme preference saved in browser

---

## 🗄️ Database Features

### All Data is Automatically Stored:
✅ User signup data → `users` table
✅ User login sessions → Express session management
✅ Admin LoV additions/deletions → `list_of_values` table
✅ All expense entries → `expenses` table
✅ Traffic logs → `traffic_log` table
✅ Error logs → `error_logs` table

### Database Tables:
1. **users** - User accounts and authentication
2. **list_of_values** - Dropdown/combobox values (dynamically manageable by admin)
3. **expenses** - All user expense entries with static dates
4. **budgets** - Monthly budget settings (table ready for future use)
5. **income** - Income tracking (table ready for future use)
6. **traffic_log** - User activity monitoring
7. **error_logs** - Application error tracking

---

## 🎨 How to Use

### For Regular Users:

1. **Sign Up**
   - Open http://localhost:3000
   - Click "Sign Up" link
   - Enter username, email, and password
   - Click "Sign Up" button

2. **Log Expenses**
   - Login with your credentials
   - Fill in all fields on the Daily Xpense Logger page
   - Click "Log" button
   - The date is automatically captured and stored permanently
   - View your recent expenses below the form

3. **Change Theme**
   - Click the theme buttons (☀️ 🌙 ⚫) in the top navigation
   - Your preference is saved automatically

### For Admin:

1. **Login as Admin**
   - Username: `admin`
   - Password: `Admin@123`

2. **Access Admin Panel**
   - After login, you'll be redirected to the admin dashboard
   - View system statistics, users, traffic, and errors

3. **Manage List of Values**
   - Go to "LoV Manager" section
   - Add new values to dropdowns/comboboxes
   - Delete existing values
   - All changes are recorded in the database

---

## 🔒 Security Features

- ✅ Password hashing using bcryptjs
- ✅ Session-based authentication
- ✅ Admin-only protected routes
- ✅ Input validation on all forms
- ✅ SQL injection prevention
- ✅ CSRF protection through sessions

---

## 📊 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (sql.js - pure JavaScript implementation)
- **Authentication**: bcryptjs, express-session
- **Styling**: Custom CSS with CSS Variables for theming

---

## 🌐 Responsive Design

The application automatically adapts to:
- 📱 Mobile phones (portrait and landscape)
- 📱 Tablets
- 💻 Desktop browsers
- All screen sizes with dynamic UI
- Touch-friendly buttons and inputs

---

## 📝 Testing the Application

### Test User Registration:
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Enter test credentials
4. Verify successful registration message

### Test Expense Logging:
1. Login with your account
2. Fill all fields in Daily Xpense Logger
3. Click "Log" button
4. Verify success message
5. Check the date is captured correctly
6. View the expense in the list below

### Test Admin Features:
1. Login as admin (credentials above)
2. View dashboard statistics
3. Check user database
4. Add/delete LoV values
5. Monitor traffic logs
6. View error logs

### Test Validation:
1. Try clicking "Log" without filling all fields
2. Verify "Please fill all the fields" message appears

### Test Themes:
1. Click each theme button
2. Verify the UI changes accordingly
3. Refresh the page - theme should persist

---

## 🐛 Troubleshooting

### Server won't start:
- Check if port 3000 is available
- Verify Node.js is installed: `node --version`
- Reinstall dependencies: `npm install`

### Database issues:
- Delete `financebay.db` file to reset database
- Restart the server (admin account will be recreated)

### Cannot access application:
- Ensure server is running (should show "Server running" message)
- Try http://127.0.0.1:3000 instead of localhost
- Check firewall settings

---

## 📂 Project Structure

```
Xpense Tracker/
├── server.js                  # Backend server
├── package.json              # Dependencies
├── financebay.db            # SQLite database (auto-created)
├── public/
│   ├── login.html           # Login/Signup page
│   ├── daily-expense.html   # Daily Xpense Logger page
│   ├── admin.html           # Admin panel
│   ├── styles.css           # Responsive CSS with themes
│   └── app.js               # Client-side JavaScript
└── README.md                # Documentation
```

---

## ⚠️ Important Notes

1. **Static Date Entry**: When you log an expense, the date is captured at that moment and stored permanently. It will NOT change when the next day starts.

2. **Admin Access**: The admin account has special privileges and sees the admin panel instead of regular user pages after login.

3. **Data Persistence**: All data is stored in the SQLite database file (`financebay.db`). Keep this file safe - deleting it will erase all data.

4. **Browser Compatibility**: Works best on modern browsers (Chrome, Firefox, Safari, Edge).

5. **Mobile Testing**: For best mobile experience, use browser developer tools to simulate mobile devices or access from an actual mobile device on the same network.

---

## 🎉 What's Working

✅ User signup and login
✅ Admin account creation
✅ Daily Xpense Logger with all required fields
✅ Static date capture for each entry
✅ Database storage for all inputs
✅ Admin panel with dashboard
✅ User database viewer
✅ LoV Manager (add/delete values)
✅ Traffic logging
✅ Error logging
✅ Three theme options
✅ Fully responsive design
✅ Mobile-friendly UI
✅ Form validation
✅ Session management

---

## 📞 Quick Reference

**Application URL**: http://localhost:3000
**Admin Username**: admin
**Admin Password**: Admin@123
**Database File**: financebay.db

---

## 🚀 Next Steps (Future Enhancements)

The following pages are planned but not yet implemented:
- Budget Manager
- Budget Analyzer
- Xpense Analyzer
- Income Tracker

The database tables for these features are already created and ready for implementation.

---

**Application Status**: ✅ Phase 1 Complete - Daily Xpense Logger Fully Functional!

**Created**: 2024
**Version**: 1.0.0
