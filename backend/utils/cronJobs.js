const cron = require('node-cron');
const Booking = require('../models/Booking');
const User = require('../models/User');

const initCronJobs = () => {
  // 1. Auto-Cancel Stale Bookings (Every hour)
  // Cancels 'pending' bookings created more than 2 hours ago
  cron.schedule('0 * * * *', async () => {
    console.log('🕒 Running Auto-Cancel Job...');
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    try {
      const result = await Booking.updateMany(
        { 
          status: 'pending', 
          createdAt: { $lt: twoHoursAgo } 
        },
        { 
          status: 'cancelled',
          notes: 'Auto-cancelled due to provider inactivity (2h limit).' 
        }
      );
      console.log(`✅ Auto-cancelled ${result.modifiedCount} stale bookings.`);
    } catch (error) {
      console.error('❌ Auto-cancel job failed:', error);
    }
  });

  // 2. Nightly Reliability Score Refresh (At 2 AM)
  // Recalculates scores for all active providers
  cron.schedule('0 2 * * *', async () => {
    console.log('📊 Running Nightly Reliability Refresh...');
    try {
      const providers = await User.find({ role: 'provider' });
      
      for (const provider of providers) {
        const stats = await Booking.aggregate([
          { $match: { provider: provider._id } },
          { $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
          }}
        ]);

        if (stats.length > 0 && stats[0].total > 5) {
          const score = Math.round((stats[0].completed / stats[0].total) * 100);
          provider.reliabilityScore = score;
          
          // Auto-badge award
          if (score >= 95 && stats[0].total >= 10) {
            if (!provider.badges.includes('Trusted Local Worker')) {
              provider.badges.push('Trusted Local Worker');
            }
          }
          await provider.save();
        }
      }
      console.log('✅ Nightly reliability scores updated.');
    } catch (error) {
      console.error('❌ Reliability refresh failed:', error);
    }
  });

  // 3. Cleanup Old Notifications (Every Sunday at midnight)
  cron.schedule('0 0 * * 0', async () => {
    console.log('🧹 Cleaning up old notifications...');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    try {
      const Notification = require('../models/Notification');
      const result = await Notification.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
      console.log(`✅ Deleted ${result.deletedCount} old notifications.`);
    } catch (error) {
      console.error('❌ Notification cleanup failed:', error);
    }
  });
};

module.exports = initCronJobs;
