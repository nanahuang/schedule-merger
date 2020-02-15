const cron = require('cron-validator');

// console.log(cron.isValidCron('* * * * *'))
// console.log(cron.isValidCron('* * * * * *'))
// console.log(cron.isValidCron('0 6 * * ?'))
// console.log(cron.isValidCron('0 0 6 * *'))
// console.log(cron.isValidCron('0 0 6 * * *'))
// console.log(cron.isValidCron('0 0 6 * * ?'))
// console.log('===============')
// console.log(cron.isValidCron('* * * * *', { seconds: true }))
// console.log(cron.isValidCron('* * * * * *', { seconds: true }))
// console.log(cron.isValidCron('0 0 6 * *', { seconds: true }))
// console.log(cron.isValidCron('0 0 6 * * *', { seconds: true }))
// console.log(cron.isValidCron('0 0 6 * * ?', { seconds: true }))
// console.log('===============')
// console.log(cron.isValidCron('2020-12-20T08:00:00.000Z'))
// console.log(cron.isValidCron('2020-12-20T08:00:00.000Z', { seconds: true }))

console.log(cron.isValidCron('0 */2 * ? * *'))
console.log(cron.isValidCron('0 */2 * ? * *', { seconds: true }))
console.log('======')
console.log(cron.isValidCron('0 1/2 * ? * *'))
console.log(cron.isValidCron('0 1/2 * ? * *', { seconds: true }))
console.log('======')
console.log(cron.isValidCron('0 */2 * * * *'))
console.log(cron.isValidCron('0 */2 * * * *', { seconds: true }))
console.log('======')
console.log(cron.isValidCron('0 1/2 * * * *'))
console.log(cron.isValidCron('0 1/2 * * * *', { seconds: true }))