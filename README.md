# FinanceBay - Mobile Expense Tracking App

## 📱 Overview
FinanceBay is a comprehensive mobile-responsive web application for tracking personal expenses, managing budgets, and analyzing spending behavior.

## 🚀 Features

### User Features
- **Daily Expense Logger**: Track daily expenses with detailed categorization
- **Budget Manager**: Set monthly budgets
- **Budget Analyzer**: Review historical budget data
- **Expense Analyzer**: Analyze spending patterns (monthly, yearly, category-wise)
- **Income Tracker**: Record income sources
- **Multi-theme Support**: Light, Dark, and Grey themes
- **Responsive Design**: Works on all mobile devices and screen orientations

### Admin Features
- **User Database Management**: View all registered users
- **List of Values (LoV) Manager**: Add/Delete dropdown values dynamically
- **Traffic Dashboard**: Monitor user activity and page visits
- **Error Logs**: Track and debug system errors
- **System Statistics**: Overview of users, traffic, and errors

## 🔐 Database Credentials

**Database Type**: SQLite (File-based database - `financebay.db`)

### Admin Account
```
Username: admin
Password: Admin@123
Email: admin@financebay.com
```

**Note**: The admin account is automatically created when the server starts for the first time.

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   - Open your browser and navigate to: `http://localhost:3000`
   - The server runs on port 3000 by default

## 🗄️ Database Structure

### Tables
1. **users** - Stores user accounts and authentication data
2. **list_of_values** - Stores dropdown/combobox values (dynamically manageable)
3. **expenses** - Records all user expense entries
4. **budgets** - Stores monthly budget settings
5. **income** - Tracks income records
6. **traffic_log** - Logs user activity and page visits
7. **error_logs** - Stores application errors for debugging

## 🎨 Theme Options
- **Light Theme**: Default bright interface
- **Dark Theme**: Dark mode for low-light environments
- **Grey Theme**: Neutral grey color scheme

Theme preferences are saved in browser's local storage.

## 📄 Pages

### 1. Login/Signup Page
- User authentication
- New user registration
- Theme selector

### 2. Daily Xpense Logger
Features:
- Auto-capture entry date (static, doesn't change)
- Expense description (text)
- Amount (float)
- Quantity (float)
- UOM dropdown (g, Kg, mL, L, mm, m, kWh, each, nos)
- Expense Category combobox (30+ categories)
- Expense Type dropdown (Planned, Unplanned)
- Payment Method dropdown (UPI, Debit Card, Credit Card, Cash)
- Validation: "Please fill all the fields" message
- Recent expenses list view

### 3. Admin Panel
- Dashboard with statistics
- User database viewer
- LoV Manager for dynamic value management
- Traffic monitoring
- Error log viewer

## 🔒 Security Features
- Password hashing using bcryptjs
- Session-based authentication
- Admin-only protected routes
- CSRF protection through session management

## 💾 Data Storage
All data is stored in a local SQLite database file (`financebay.db`). This includes:
- User signup data
- Admin LoV additions/deletions
- All user expense inputs
- Budget settings
- Income records
- Traffic logs
- Error logs

## 🌐 Responsive Design
The application is fully responsive and optimized for:
- Mobile phones (portrait and landscape)
- Tablets
- Desktop browsers
- All screen sizes with dynamic UI adjustments

## 📝 API Endpoints

### Authentication
- `POST /api/signup` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/session` - Check session status

### Expenses
- `POST /api/expenses` - Log new expense
- `GET /api/expenses` - Get user expenses

### List of Values
- `GET /api/lov/:fieldName` - Get values for specific field
- `GET /api/lov` - Get all LoV (admin only)
- `POST /api/lov` - Add new value (admin only)
- `DELETE /api/lov/:id` - Delete value (admin only)

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/traffic` - Get traffic logs
- `GET /api/admin/errors` - Get error logs

### Error Logging
- `POST /api/log-error` - Log client-side errors

## 🛠️ Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **Authentication**: bcryptjs, express-session
- **Styling**: Custom CSS with CSS Variables for theming

## 📱 Mobile Optimization
- Viewport meta tag for proper mobile rendering
- Touch-friendly UI elements
- Responsive grid layouts
- Collapsible navigation for small screens
- Optimized for portrait and landscape modes
- Smooth transitions and animations

## 🐛 Debugging Features
- Automatic error logging to database
- Admin panel to view all errors
- Client-side error tracking
- Detailed error stack traces

## 🔄 Future Enhancements (Not yet implemented)
- Budget Manager page
- Budget Analyzer page
- Expense Analyzer page
- Income Tracker page
- Export data functionality
- Charts and visualizations
- Email notifications
- Multi-currency support

## 📞 Support
For issues or questions, please check the error logs in the admin panel.

## 📄 License
This project is created for expense tracking purposes.

---

**Created**: 2024
**Version**: 1.0.0
**Status**: Development Phase 1 Complete (Daily Expense Logger)
