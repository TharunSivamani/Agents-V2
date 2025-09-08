# PocketTasks - Task Manager

A simple and clean Chrome extension for managing your daily tasks.

## Features

- ✅ Add, edit, and delete tasks
- ⏰ Set due dates with visual indicators
- 🔔 Get notifications for upcoming tasks
- 📱 Clean popup interface
- 💾 Tasks saved locally in Chrome storage

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `Task-Manager` folder
5. The PocketTasks icon will appear in your Chrome toolbar

## Usage

- Click the PocketTasks icon to open the task manager
- Add tasks by typing in the input field
- Set due dates using the date picker
- Mark tasks as complete with the ✓ button
- Edit tasks by clicking the ✎ button
- Delete tasks with the ✕ button
- Drag and drop to reorder tasks

## Permissions

- **Storage**: Saves your tasks locally
- **Alarms**: Schedules notifications for due tasks
- **Notifications**: Shows reminders for upcoming tasks

## Files

- `popup.html` - Main interface
- `popup.js` - Task management logic
- `styles.css` - Styling
- `background.js` - Notification handling
- `options.html` - Settings page
- `manifest.json` - Extension configuration