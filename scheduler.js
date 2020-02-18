const { Validator, isValid } = require('./validator')
const CronManager = require('./cronManager')
const configPath = require('./config').configPath || './schedule-config.json';

const schedule = require('node-schedule')
const axios = require('axios')
const fs = require('fs')

let example_url = "https://api-internal-dev.eztable.com/campaign/health"
let example_config = {
  schedules: [
    {
      cron: "0 * * ? * *",
      url: example_url
    },
    {
      cron: "2020-02-29T23:59:59+08:00",
      url: example_url
    },
    {
      cron: "2020-02-29T23:59:59.000+08:00",
      url: example_url
    }
  ]
}

/** reference: https://gist.github.com/gordonbrander/2230317 */
const generateUuid = () => {
  return ( Math.random().toString(36).substr(2, 5) + Date.now().toString(36) + Math.random().toString(36).substr(2, 5) ).toUpperCase()
}
const uniqueId = (origins = []) => {
  let uuid = generateUuid();
  while ( origins.includes(uuid) ){
    uuid = generateUuid();
  }
  return uuid;
}
class Scheduler { 

  constructor(path){
    this._configPath = path || configPath;
  }

  get configPath(){ return this._configPath; }
  set configPath(path){ this._configPath = path; }

  async reboot() {
    const json = await this._read(this._configPath);
    await this.update(json.schedules);
  }
  async update(schedules) {
    if (!isValid(schedules)) throw new Error(`config is not valid`)

    await this._write(this._configPath, { schedules })

    for (let jobName in schedule.scheduledJobs) {
      schedule.scheduledJobs[jobName].cancel()
    }

    schedules.forEach(config => {
      let id = uniqueId(Object.keys(schedule.scheduledJobs));
      
      schedule.scheduleJob(id, config.cron, async () => {
        await axios.get(config.url)
          .then(res => {
            if (res.status !== 200)
              throw new Error(`response status is ${res.status}`)
          })
          .catch(error => {
            console.error(error)
          });
      });
      schedule.scheduledJobs[id].cron = config.cron;
      schedule.scheduledJobs[id].url = config.url;
    })

    console.log(`${new Date().toISOString()}\tRunning:`, await this.get())
  }

  get() {
    let schedules = Object.keys(schedule.scheduledJobs).map(name => {
      return {
        name: schedule.scheduledJobs[name].name,
        cron: schedule.scheduledJobs[name].cron,
        url: schedule.scheduledJobs[name].url,
        nextInvocation: (schedule.scheduledJobs[name].nextInvocation() !== null ? schedule.scheduledJobs[name].nextInvocation().toString() : '')
      }
    })
    return Promise.resolve({ schedules })
  }

  async _read(path) {

    if (!fs.existsSync(path)) 
      throw new Error(`Schedule config (${path}) not found`);

    let data = await fs.readFileSync(path, 'utf8');

    let jsonObj = JSON.parse(data);

    return jsonObj;

  }

  async _write(path, config) {

    const output = JSON.stringify(config);
    
    await fs.writeFileSync(path, output, 'utf8');

  }

}

module.exports = Scheduler