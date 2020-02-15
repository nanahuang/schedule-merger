var CronJob = require('cron').CronJob;

new CronJob('* * * * * *', function () {
  const now = new Date();
  console.log(`You will see this message every second.  ${now.toISOString()}`);
}, null, true, 'Asia/Taipei');