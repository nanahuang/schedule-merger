const Scheduler = require('./scheduler')

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const router = express.Router()
const app = express()

app.use(cors());
app.use('/schedule', router)
router.use(bodyParser.json());

const port = 8000;

let scheduler = new Scheduler();
scheduler.init();

router.get('/', async (req, res) => {
  await scheduler.get()
    .then(result => res.status(200).send(result))
    .catch(err => res.status(500).send(err))
});

router.post('/', async (req, res) => {
  let body = req.body;
  await scheduler.update(body.schedules)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(500).send(err))
});

router.delete('/', async (req, res) => {
  await scheduler.delete()
    .then(result => res.status(200).send(result))
    .catch(err => res.status(500).send(err))
});

router.post('/merge', async (req, res) => {
  let body = req.body;
  await scheduler.merge(body.schedules)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(500).send(err))
})

app.listen(port, (error) => {
  if (error) {
    console.error(error)
  } else {
    console.log(`==>  Listening on port ${port}.`)
  }
})