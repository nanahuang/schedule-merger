const cron = require('cron-validator');
const validUrl = require('valid-url');
const moment = require('moment')

class Validator {
  static validateConfig(scheduleConfigs) {
    scheduleConfigs = Validator._navigateAry('schedules', scheduleConfigs, (config) => {
      config.cron = Validator._cron('schedule.cron', config.cron)
      config.url = Validator._url('schedule.url', config.url)
      return config;
    })
    return scheduleConfigs;
  }
  static isJsonStr(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
  static isCron(expression) {
    return cron.isValidCron(expression, { seconds: true, allowBlankDay: true })
  }
  static isIsoDate(date) {
    return moment(date, moment.ISO_8601, true).isValid()
  }
  static _cron(key, src, defaultValue = "1970-01-01T00:00:00Z") {
    if (Validator.isCron(src) || Validator.isIsoDate(src)) {
      return src
    } else {
      console.log(`${key} is unaviliable, set from ${src} to ${defaultValue}`);
      return defaultValue;
    }
  }
  static _url(key, src, defaultValue = '') {
    if (typeof (src) === 'string' && validUrl.isUri(src)) {
      return src;
    } else {
      console.log(`${key} is unaviliable, set from ${src} to ${defaultValue}`);
      return defaultValue;
    }
  }
  static _navigateAry(key, ary, handler, defaultValue = []) {
    if (Array.isArray(ary)) {
      return ary.map(handler).filter((item) => item !== null);
    }
    else {
      console.log(`set ${key} from ${ary} to default value  ${defaultValue}`)
      return defaultValue;
    }
  }
}

module.exports = Validator
