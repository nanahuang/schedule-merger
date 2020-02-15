const Validator = require('./validator')
// const { logWithTime, errorWithTime } = require('./logger')
const moment = require('moment-timezone')

class CronManager {
  async mergeCrons(schedules) {
    console.log(`${new Date().toISOString()}\t`,'Schedule (before merge)', schedules)
    let cronCollection = await this._collect(schedules)
    for (let url in cronCollection) {
      cronCollection[url] = await this._merge(cronCollection[url])
    }
    let configs = await this._dispatch(cronCollection)
    console.log(`${new Date().toISOString()}\t`,'Schedule (after merge)', configs)
    return configs
  }
  _collect(schedules) {
    let cronCollection = {}
    for (let config of schedules) {
      if (config.url in cronCollection) {
        cronCollection[config.url].push(config.cron)
      }
      else {
        cronCollection[config.url] = [config.cron]
      }
    }
    return cronCollection
  }
  _merge(crons) {
    let distinctCrons = {
      cron: [],
      isodt: []
    }
    crons.forEach( src => {
      if (Validator.isCron(src)) {
        if (!(distinctCrons.cron.includes(src))) {
          distinctCrons.cron.push(src)
        }
      }
      if (Validator.isIsoDate(src)) {
        let found = 0;
        for (let date of distinctCrons.isodt) {
          if (moment(src).isSame(date)) {
            found = 1;
            break;
          }
        }
        if (!found) {
          distinctCrons.isodt.push(src)
        }
      }
    });
    let mergedCrons = distinctCrons.cron.concat(distinctCrons.isodt)
    return mergedCrons
  }
  _dispatch(cronCollection) {
    let configs = []
    for (let url in cronCollection){
      let config = cronCollection[url].map( cron => { 
        return {
          cron: cron,
          url: url
        }
      });
      configs = configs.concat(config)
    }
    return configs
  }
}
module.exports = CronManager