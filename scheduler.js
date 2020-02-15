const Validator = require('./validator')
const CronManager = require('./cronManager')
const configPath = require('./config').configPath;
// const { logWithTime, errorWithTime } = require('./logger')
const schedule = require('node-schedule')
const axios = require('axios')
const fs = require('fs')

let example_url = "http://localhost:3000/campaign/health"
let example_config = {
  schedules: [
    {
      cron: "0 */2 * ? * *",
      url: example_url
    },
    {
      cron: "0 0 * ? * *",
      url: example_url
    },
    {
      cron: "0 0 6 * * ?",
      url: example_url
    },
    {
      cron: "0 0 6 * * ?",
      url: example_url
    },
    {
      cron: "0 0 6 * * ?",
      url: example_url
    },
    {
      cron: "*/10 * * * * ?",
      url: example_url
    },
    {
      cron: "2020-02-29T23:59:59+08:00",
      url: example_url
    },
    {
      cron: "2020-02-29T23:59:59.000+08:00",
      url: example_url
    },
    {
      cron: "2020-02-29T15:59:59Z",
      url: example_url
    },
    {
      cron: "2020-02-29T10:59:59T-05:00",
      url: example_url
    },
    {
      cron: "2020-02-29T23:59:59.000+08:00",
      url: example_url
    },
    {
      cron: "2020-02-29T23:59:59Z",
      url: example_url
    },
    {
      cron: "2020-02-29T23:59:59.000Z",
      url: example_url
    },
    {
      cron: "2020-02-29T23:59:59Z",
      url: example_url
    },
    {
      cron: "2020-02-29T23:59:59.000Z",
      url: example_url
    },
  ]
}

class Scheduler {
  constructor() {
    let defaultPath = 'schedule_config.json'
    if (!this.configPath) {
      console.error(`${new Date().toISOString()}\t`, `Config path is undefined, set configPath to ${defaultPath}`)
    }
    this.configPath = configPath || defaultPath;
  }
  async init() {
    let config = await this.read();
    if (config.schedules) {
      console.log(`${new Date().toISOString()}\t`, `Initial schedule from ${this.configPath}`)
      await this.update(config.schedules)
    }
  }
  get() {
    let schedules = Object.keys(schedule.scheduledJobs).map(name => {
      return {
        cron: schedule.scheduledJobs[name].cron,
        url: schedule.scheduledJobs[name].url
      }
    })
    return Promise.resolve({ schedules })
  }
  async delete() {
    console.log(`${new Date().toISOString()}\t`, 'ScheduledJobs snpashot (before delete):', await this.get())
    for (let jobName in schedule.scheduledJobs) {
      eval(`schedule.scheduledJobs.${jobName}.cancel()`);
    }
    let result = await this.get();
    await this.write(result);
    return Promise.resolve(result);
  }
  async create(configs) {
    for (let i = 0; i < configs.length; i++) {
      let jobName = `JOB_${i}`
      schedule.scheduleJob(jobName, configs[i].cron, async () => {
        if (configs[i].url !== "") {
          console.log(`${new Date().toISOString()}\t`, `Fire to ${configs[i].url} for ${configs[i].cron}`)

          await axios.get(configs[i].url)
            .then(response => {
              console.log(`${new Date().toISOString()}\t`, `Response: ${JSON.stringify({ status: response.status, ...response.data })}`)
            })
            .catch(error => {
              console.error(`${new Date().toISOString()}\t`, `Request fail for ${error.message}`)
            })
        }
        else {
          console.log(`${new Date().toISOString()}\t`, `Unfire because url is empty`)
        }
      })
      schedule.scheduledJobs[jobName].cron = configs[i].cron
      schedule.scheduledJobs[jobName].url = configs[i].url
    }
    console.log(`${new Date().toISOString()}\t`, 'ScheduledJobs snpashot (after create):', await this.get())
  }
  async update(schedules) {
    try {
      // console.log(`${new Date().toISOString()}\t`, 'Schedule (before validate)', schedules)
      let configs = Validator.validateConfig(schedules);
      // console.log(`${new Date().toISOString()}\t`, 'Schedule (after validate)', configs)
      await this.delete();
      await this.create(configs);
      let result = await this.get();
      await this.write(result);
      return Promise.resolve(result);
    }
    catch (error) {
      console.error(`${new Date().toISOString()}\t`, 'Update fail for', error)
      return Promise.reject(`Fail for error ${error}`)
    }
  }
  async merge(schedules) {
    if (schedules && Array.isArray(schedules)) {
      let cronManager = new CronManager();
      let configs = await cronManager.mergeCrons(schedules)
      await this.delete();
      await this.create(configs);
      let result = await this.get();
      await this.write(result);
      return Promise.resolve(result);
    }
    else {
      console.log(`${new Date().toISOString()}\t`, 'Merge Fail: schedules is invalid')
    }
  }
  async read() {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(this.configPath)) {
        console.log(`${new Date().toISOString()}\t`, `Read schedule config from ${this.configPath}`)
        fs.readFile(this.configPath, 'utf8', (err, data) => {
          if (err) {
            console.error(`${new Date().toISOString()}\t`, err)
            resolve({})
          }
          else {
            if (Validator.isJsonStr(data)) {
              resolve(JSON.parse(data))
            }
            else {
              console.log(`${new Date().toISOString()}\t`, `Schedule config from ${this.configPath} is not JSON-formate`)
              resolve({})
            }
          }
        });
      }
      else {
        console.error(`${new Date().toISOString()}\t`, `Schedule config is not existed`)
        resolve({})
      }
    });
  }
  async write(config) {
    const output = JSON.stringify(config);
    return new Promise((resolve, reject) => {
      fs.writeFile(this.configPath, output, 'utf8', function (err) {
        if (err) reject(err);
        else resolve("The file of schedule_config is updated!");
      });
    });
  }

}

module.exports = Scheduler