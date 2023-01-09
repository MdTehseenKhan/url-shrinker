import express from "express"
import { URL } from "url"
import ShortURL from "./models/ShortURL.js"
import "./db.js"

const app = express()
const PORT = process.env.PORT || 3000
const __dirname = new URL('.', import.meta.url).pathname;

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS


app.get('/', async (req, res) => {
  const shortURLs = await ShortURL.find()
	res.render('index', { shortURLs })
})

app.post('/shorturls', async (req, res) => {
	const { fullURL } = req?.body
  await ShortURL.create({ fullURL: fullURL.trim() })
	res.redirect('/')
})

app.get('/:shortURL', async (req, res) => {
  const { shortURL } = req?.params
	const shortURLs = await ShortURL.findOne({ shortURL })
	if(!shortURLs) return res.sendStatus(404)

	shortURLs.clicks++
	await shortURLs.save()
  
  res.redirect('/')
	res.redirect(shortURLs?.fullURL)
})

app.listen(PORT, () => console.log(`Listening to the port ${PORT}...`))
