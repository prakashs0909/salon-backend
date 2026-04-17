// filepath: d:\project\reminder.js
const cron = require('node-cron');

// Schedule a reminder (e.g., every day at 9:00 AM)
cron.schedule('* * * * *', () => {
    console.log('Reminder: Time to check your tasks!');
    // You can add additional logic here, like sending an email or notification
});

console.log('Reminder has been scheduled.');