const Scheduler = require('./scheduler')

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const router = express.Router()
const app = express()

app.use(cors());
app.use('/schedule', router)
router.use(bodyParser.json());

const port = require('./config').port;

// let scheduler = new Scheduler();
// scheduler.init();

const loadPresets = () => {
  new Scheduler().reboot()
    .catch(err=>console.error(err));
}

loadPresets();

router.get('/all', async (req, res) => {
  await new Scheduler().get()
    .then(result => res.status(200).send(result))
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    })
});

router.post('/all', async (req, res) => {
  let body = req.body;
  await new Scheduler().update(body.schedules)
    .then(result => res.status(200).send('success'))
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    })
});

router.delete('/all', async (req, res) => {
  await new Scheduler().update([])
    .then(result => res.status(200).send(result))
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    })
});

// router.post('/merge', async (req, res) => {
//   let body = req.body;
//   await scheduler.merge(body.schedules)
//     .then(result => res.status(200).send(result))
//     .catch(err => res.status(500).send(err))
// })

app.listen(port, (error) => {
  if (error) {
    console.error(error)
  } else {
    console.log(`==>  Listening on port ${port}.`)
  }
})