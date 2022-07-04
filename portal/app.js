import express from 'express'
import bcrypt from 'bcrypt'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { user, sensorData } from './data.js'

const app = express()
const port = 8080
const directoryFullName = dirname(fileURLToPath(import.meta.url))

// Parse requests.
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(express.static(join(directoryFullName, 'public')))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.post('/login', async (req, res) => {
  try {
    const foundUser = req.body.email === user.email
    if (foundUser) {
      const submittedPass = req.body.password

      // Comparing the hashes.
      const passwordMatch = await bcrypt.compare(submittedPass, user.password)
      if (passwordMatch) {
        // If request contains sensordata
        if (req.body.data) {
          // Shutdown/poweron response.
          const powerState = sensorData[0]
          if (powerState.shutdown) {
            res.json({ powerstate: 'shutdown' })
          } else if (powerState.powerOn) {
            res.json({ powerstate: 'poweron' })
          }

          req.body.data.isOn = true

          // New data first.
          sensorData.unshift(req.body.data)
          res.json(req.body.data)
        }

        let formatData = 'No Data'
        if (sensorData.length > 0) {
          formatData = formatSensorData()
        }

        const powerButtons = `<form action="/poweron" method="post"><button name="secret2" value="poweron">PowerOn</button></form></div><div align='center'><form action="/shutdown" method="post"><button name="secret1" value="shutdown">Shutdown</button></form>`

        res.send(`<link rel="stylesheet" href="style.css"><div align ='center'><h2>login successful</h2></div><br><br><br><div align ='center'>${powerButtons}</div><br><br><div align='center'><a href='/'>logout</a></div><div align='center'><p>${formatData}</p></div>`)
      } else {
        res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='/'>login again</a></div>")
      }
    }
  } catch (err) {
    console.log(err)
    res.send('server error')
  }
})

// Adds shutdown message to the loop which will be sent as a response to the micocontroller.
app.post('/shutdown', (req, res) => {
  if (req.body.secret1 === 'shutdown') {
    const isOn = false
    const shutdown = true

    sensorData.unshift({ isOn, shutdown })
    res.json(sensorData[0])
  } else {
    res.status(404).send('Not found')
  }
})

// Adds power on message to the loop which will be sent as a response to the micocontroller.
app.post('/poweron', (req, res) => {
  if (req.body.secret2 === 'poweron') {
    const powerOn = true

    sensorData.unshift({ powerOn })
    res.json(sensorData[0])
  } else {
    res.status(404).send('Not found')
  }
})

// Formatting for the sensor data output.
function formatSensorData () {
  let str = ''
  const sensorDataEntries = sensorData.length
  for (let i = 0; i < sensorDataEntries; i++) {
    if (sensorDataEntries === 10) {
      break
    }
    str += '<p>temp:' + sensorData[i] + '</p>'
  }

  return str
}

app.listen(port, function () {
  console.log('server is listening on port:' + port)
})
