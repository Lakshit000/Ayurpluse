# Doctor Portal Debug Guide

## Steps to Debug the Blank Screen Issue:

### 1. Open Browser Console
- Press **F12** or **Ctrl+Shift+I** (Windows)
- Click on the **Console** tab

### 2. Clear Console
- Click the "Clear console" button (🚫 icon) or press **Ctrl+L**

### 3. Try Logging In Again
- Go to http://localhost:5174
- Click "Doctor Portal"
- Enter credentials:
  - Email: arushi@gmail.com
  - Password: [your password]
- Click "Login as Doctor"

### 4. Check Console Logs
Look for these log messages in order:
1. `[App] onLogin callback received data: {role, doctorName, email, id}`
2. `[App] Setting view to: doctorDashboard`
3. `[App] Rendering Doctor Dashboard with userData: {name, role, id}`
4. `[DoctorDashboard] Rendering with: {doctorName, userId, activeTab}`
5. `[DoctorDashboard] Rendering content for tab: dashboard`

### 5. Look for Errors
Check for any **RED** error messages like:
- `Uncaught Error: ...`
- `TypeError: ...`
- `ReferenceError: ...`

### 6. Common Issues:

**If you see "Cannot read property ... of undefined":**
- The login data isn't being passed correctly

**If you see errors about missing modules:**
- A component import is failing

**If logs stop at a certain point:**
- That's where the error is occurring

### 7. Send Me the Console Output
Copy the console logs and any errors you see, and I can fix the exact issue!

## Quick Fix Options:

If the console shows specific errors, I can:
1. Fix component import errors
2. Fix data passing issues
3. Add error boundaries
4. Fix any broken dependencies
