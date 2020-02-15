// console.log(`Your key is ${process.env.CONFIG_PATH}`); // undefined
const dotenv = require('dotenv');
dotenv.config();
// console.log(`Your key is ${process.env.CONFIG_PATH}`); // './schedule_config.json'
const {
  CONFIG_PATH
} = process.env;

module.exports = {
  configPath: CONFIG_PATH
}
