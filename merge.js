const CronManager = require('./cronManager')
const moment = require('moment-timezone')
const axios = require('axios')
const admin = require("firebase-admin");
const serviceAccount = require("./staging.json");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount.credential),
  databaseURL: serviceAccount.databaseUrl
});

const getYears = () => {
  return [moment().tz("Asia/Taipei").add({ years: -1 }).year(), moment().tz("Asia/Taipei").year()];
}
const getSchedules = async () => {
  let dates = []
  getYears().forEach(async year => {
    await firebase.database().ref(`/sync/campaigns/${year}`).once('value').then(snapshot => {
      let campaigns = snapshot.val()
      if (!campaigns) return
      for (let campaignUuid in campaigns) {
        if (!campaigns[campaignUuid].schedules) continue
        let schedules = campaigns[campaignUuid].schedules;
        for (let name in schedules) {
          if (schedules[name].bookableBegin) dates.push(schedules[name].bookableBegin)
          if (schedules[name].bookableEnd) dates.push(schedules[name].bookableEnd)
        }
      }

    }).catch( error => console.error(error))
  });
  await firebase.database().ref(`/sync/sponsors`).once('value').then(snapshot => {
    let sponsors = snapshot.val();
    if (!sponsors) return
    for (let id in sponsors) {
      for (let config of sponsors[id]) {
        if (!config.period) continue
        if (config.period.from) dates.push(config.period.from)
        if (config.period.to) dates.push(config.period.to)
      }
    }
  }).catch( error => console.error(error))


  return dates.map(date => {return {
    cron:  date,
    url: "https://api-internal-dev.eztable.com/campaign/health"
  }})
}

const mergeSchedules = async () => {
  let schedules = await getSchedules()
  let cronManager = new CronManager();
  let configs = await cronManager.mergeCrons(schedules)
  await axios.post('https://api-internal-dev.eztable.com/schedule/all', { schedules: configs })
}

mergeSchedules()

module.exports = {
  mergeSchedules
}