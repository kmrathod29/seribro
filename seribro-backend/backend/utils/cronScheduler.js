// backend/utils/cronScheduler.js
// Hinglish: Cron jobs scheduler - daily tasks

const cron = require('node-cron');
const { closeExpiredProjects } = require('../jobs/autoCloseProjects');

/**
 * Hinglish: Sab cron jobs initialize karo
 * Har roz midnight (00:00) par expired projects ko close kar do
 */
function initializeCronJobs() {
  try {
    console.log('\n⏰ Initializing Cron Jobs...');

    // Hinglish: Har roz 00:00 (midnight) par run karo
    // Cron format: minute hour day month day-of-week
    // '0 0 * * *' = Midnight every day
    const closeProjectsJob = cron.schedule('0 0 * * *', async () => {
      console.log('\n🔔 Cron Job: Auto-close projects started');
      try {
        await closeExpiredProjects();
      } catch (error) {
        console.error('❌ Cron job error:', error.message);
      }
    });

    console.log('✅ Auto-close projects job scheduled for midnight every day');

    // Hinglish: Dev mode mein test karne ke liye har 5 minute bhi karo (optional)
    if (process.env.NODE_ENV === 'development') {
      console.log('📌 [DEV MODE] Auto-close will also run every 5 minutes for testing');
      const testJob = cron.schedule('*/5 * * * *', async () => {
        console.log('\n🧪 TEST Cron Job: Auto-close projects started');
        try {
          await closeExpiredProjects();
        } catch (error) {
          console.error('❌ Test cron job error:', error.message);
        }
      });
    }

    console.log('✅ All cron jobs initialized successfully\n');
  } catch (error) {
    console.error('❌ Error initializing cron jobs:', error.message);
  }
}

module.exports = { initializeCronJobs };
