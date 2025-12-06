# 🧪 FinanceBay - Testing Guide

## Quick Test Checklist

Use this guide to verify all features are working correctly.

---

## ✅ Pre-Testing Setup

1. **Ensure server is running**
   ```bash
   node server.js
   ```
   Expected output:
   ```
   ===========================================
   Admin User Created!
   Username: admin
   Password: Admin@123
   ===========================================
   
   🚀 FinanceBay Server running on http://localhost:3000
   📱 Open in browser to access the app
   ```

2. **Open browser**
   Navigate to: `http://localhost:3000`

---

## 🔐 Test 1: User Registration

### Steps:
1. Click "Sign Up" link on the login page
2. Enter the following:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123`
3. Click "Sign Up" button

### Expected Results:
✅ "Registration successful! Please login." message appears
✅ Form switches back to login form after 1.5 seconds
✅ Data is stored in database

---

## 🔑 Test 2: User Login

### Steps:
1. On the login form, enter:
   - Username: `testuser`
   - Password: `test123`
2. Click "Login" button

### Expected Results:
✅ "Login successful! Redirecting..." message appears
✅ Redirected to Daily Xpense Logger page
✅ Navigation bar shows all menu items
✅ Theme buttons are visible

---

## 📝 Test 3: Expense Logging (Complete Form)

### Steps:
1. On Daily Xpense Logger page, fill in:
   - **Xpense Description**: "Grocery Shopping"
   - **Amount**: 1500.50
   - **Quantity**: 5
   - **UOM**: Select "Kg"
   - **Xpense Category**: Type or select "Provisions"
   - **Xpense Type**: Select "Planned"
   - **Xpense Method**: Select "UPI"
2. Click "Log" button

### Expected Results:
✅ "Expense logged successfully!" message appears in green
✅ Form clears after submission
✅ New expense appears in "Recent Expenses" section below
✅ Entry date matches today's date
✅ All entered data is displayed correctly

---

## ⚠️ Test 4: Form Validation

### Steps:
1. Clear all form fields (refresh page if needed)
2. Fill in only:
   - **Xpense Description**: "Test"
   - **Amount**: 100
3. Leave other fields empty
4. Click "Log" button

### Expected Results:
✅ "Please fill all the fields" message appears in red
✅ Form does NOT submit
✅ No new entry in Recent Expenses section

---

## 📅 Test 5: Static Date Verification

### Steps:
1. Log an expense with current date
2. Note the date shown in Recent Expenses
3. Wait a few seconds
4. Refresh the page
5. Check the date of the previously logged expense

### Expected Results:
✅ Date remains the same as when it was logged
✅ Date does not change to current date after refresh
✅ Date is stored statically in database

---

## 🎨 Test 6: Theme Switching

### Steps:
1. Click the ☀️ (Sun) button in navigation bar
2. Observe the UI changes
3. Click the 🌙 (Moon) button
4. Observe the UI changes
5. Click the ⚫ (Grey circle) button
6. Refresh the page

### Expected Results:
✅ Light theme: White background, dark text
✅ Dark theme: Dark background, light text
✅ Grey theme: Grey background, light text
✅ Theme persists after page refresh
✅ Smooth transitions between themes

---

## 👨‍💼 Test 7: Admin Login

### Steps:
1. Logout (click Logout in navigation)
2. On login page, enter:
   - Username: `admin`
   - Password: `Admin@123`
3. Click "Login" button

### Expected Results:
✅ "Login successful! Redirecting..." message appears
✅ Redirected to Admin Panel (not Daily Xpense Logger)
✅ Dashboard shows statistics
✅ Admin navigation shows: Dashboard, Users, LoV Manager, Traffic, Error Logs

---

## 📊 Test 8: Admin Dashboard

### Steps:
1. Ensure you're logged in as admin
2. View the dashboard statistics

### Expected Results:
✅ "Total Users" card shows at least 2 (admin + testuser)
✅ "Page Visits" card shows traffic count
✅ "Error Logs" card shows error count
✅ All stat cards are visible and styled

---

## 👥 Test 9: User Database Viewer

### Steps:
1. In admin panel, click "Users" in navigation
2. View the users table

### Expected Results:
✅ Table shows all registered users
✅ Shows: ID, Username, Email, Admin status, Created date
✅ "admin" user shows "✅ Yes" for Admin column
✅ "testuser" shows "❌ No" for Admin column

---

## 📋 Test 10: List of Values (LoV) Manager

### Steps:
1. Click "LoV Manager" in admin navigation
2. In the "Add New Value" form:
   - **Field Name**: Select "expense_category"
   - **Value**: Type "Pet Care"
3. Click "Add Value" button
4. Scroll down to view the existing values table

### Expected Results:
✅ "Value added successfully!" message appears
✅ New value appears in the table
✅ Table shows: Field Name, Value, Created At, Action button
✅ All default values are listed

---

## 🗑️ Test 11: Delete LoV Value

### Steps:
1. In LoV Manager, find "Pet Care" in the table
2. Click "Delete" button for that row
3. Confirm deletion in the popup

### Expected Results:
✅ Confirmation dialog appears
✅ After confirming, the row disappears from table
✅ Value is removed from database

---

## 🚦 Test 12: Traffic Monitoring

### Steps:
1. Click "Traffic" in admin navigation
2. View the traffic log table

### Expected Results:
✅ Table shows user activity
✅ Shows: User, Page, Action, Timestamp
✅ Recent page visits are logged
✅ Sorted by most recent first

---

## 🐛 Test 13: Error Logs

### Steps:
1. Click "Error Logs" in admin navigation
2. View the error logs table

### Expected Results:
✅ Table shows any errors that occurred
✅ Shows: User, Error Message, Page, Timestamp
✅ If no errors: "No errors logged" message appears

---

## 📱 Test 14: Mobile Responsiveness

### Steps:
1. Open browser Developer Tools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select different mobile devices:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPad (768x1024)
4. Try both portrait and landscape orientations
5. Test all features in mobile view

### Expected Results:
✅ UI adapts to screen size
✅ Navigation collapses to hamburger menu (☰) on mobile
✅ Forms are easy to use with touch
✅ All buttons are tap-friendly
✅ Text is readable at all sizes
✅ No horizontal scrolling
✅ Landscape mode works properly

---

## 🔄 Test 15: Multiple Expense Entries

### Steps:
1. Logout from admin, login as `testuser`
2. Log 5 different expenses with different:
   - Categories (Rent, Fuel, Restaurant, Medical, Entertainment)
   - Types (Planned and Unplanned mix)
   - Payment methods (UPI, Cash, Debit Card, Credit Card)
   - Amounts (varying)

### Expected Results:
✅ All 5 expenses are logged successfully
✅ Each entry shows correct data
✅ Expenses are sorted by date (most recent first)
✅ No data loss or corruption
✅ Each entry has its own static date

---

## 🔍 Test 16: Data Persistence

### Steps:
1. Log an expense as a regular user
2. Note the expense details
3. Logout
4. **Stop the server** (Ctrl+C in terminal)
5. **Restart the server** (`node server.js`)
6. Login again
7. Check Recent Expenses

### Expected Results:
✅ Server restarts successfully
✅ All previously logged expenses are still there
✅ No data is lost
✅ Database file `financebay.db` persists

---

## 📝 Test 17: Combobox Functionality

### Steps:
1. In Daily Xpense Logger, click on "Xpense Category" field
2. Start typing "Veg"
3. Select "Vegetables & Fruits" from suggestions
4. Clear the field
5. Type a custom value: "My Custom Category"
6. Complete the form and submit

### Expected Results:
✅ Dropdown suggestions appear while typing
✅ Can select from predefined categories
✅ Can also type custom values
✅ Both predefined and custom values are accepted and saved

---

## 🔐 Test 18: Session Management

### Steps:
1. Login as any user
2. Navigate to Daily Xpense Logger
3. **Close the browser tab** (not the browser)
4. **Open a new tab**
5. Go to `http://localhost:3000`

### Expected Results:
✅ User is still logged in
✅ Redirected to appropriate page (user or admin)
✅ Session persists for 24 hours
✅ Can continue using the app

---

## 🚫 Test 19: Unauthorized Access Protection

### Steps:
1. Logout completely
2. Try to access directly:
   - `http://localhost:3000/daily-expense.html`
   - `http://localhost:3000/admin.html`

### Expected Results:
✅ Redirected to login page
✅ Cannot access protected pages without authentication
✅ Session check works correctly

---

## 🎯 Test 20: End-to-End Workflow

### Steps:
Complete workflow:
1. Sign up as new user
2. Login
3. Change theme to Dark
4. Log 3 expenses
5. Logout
6. Login as admin
7. View user database (verify new user)
8. Add new LoV value
9. Check traffic logs (verify activity)
10. Logout

### Expected Results:
✅ All steps complete without errors
✅ Data is properly stored
✅ Admin can see user activity
✅ LoV changes are reflected
✅ Theme persists throughout

---

## 📊 Testing Summary

After completing all tests, verify:

| Test # | Feature | Status |
|--------|---------|--------|
| 1 | User Registration | ✅ |
| 2 | User Login | ✅ |
| 3 | Expense Logging | ✅ |
| 4 | Form Validation | ✅ |
| 5 | Static Date | ✅ |
| 6 | Theme Switching | ✅ |
| 7 | Admin Login | ✅ |
| 8 | Admin Dashboard | ✅ |
| 9 | User Database | ✅ |
| 10 | LoV Manager (Add) | ✅ |
| 11 | LoV Manager (Delete) | ✅ |
| 12 | Traffic Monitoring | ✅ |
| 13 | Error Logs | ✅ |
| 14 | Mobile Responsive | ✅ |
| 15 | Multiple Entries | ✅ |
| 16 | Data Persistence | ✅ |
| 17 | Combobox | ✅ |
| 18 | Session Management | ✅ |
| 19 | Auth Protection | ✅ |
| 20 | End-to-End | ✅ |

---

## 🐛 If Tests Fail

### Server Issues:
```bash
# Stop any running servers
# Find process: Get-Process node
# Kill process: Stop-Process -Name node

# Restart fresh
node server.js
```

### Database Issues:
```bash
# Backup current database
copy financebay.db financebay.db.backup

# Delete database to start fresh
del financebay.db

# Restart server (will recreate database)
node server.js
```

### Browser Issues:
- Clear browser cache and cookies
- Try incognito/private mode
- Try different browser

---

## ✅ All Tests Passed?

If all tests pass, your FinanceBay application is working perfectly! 🎉

You now have a fully functional expense tracking app with:
- User authentication
- Admin panel
- Dynamic data management
- Responsive design
- Multiple themes
- Complete database integration

**Ready for production use!**
