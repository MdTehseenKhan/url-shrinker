import express from "express";
import { URL } from "url";
import ShortURL from "./models/ShortURL.js";
import "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = new URL('.', import.meta.url).pathname;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

app.get('/', async (req, res) => {
	try {
    const shortURLs = await ShortURL.find();
	  res.render('index', { shortURLs });
	} catch(err) {
		res.status(404).send(err.message)
	}
});

app.post('/shorturls', async (req, res) => {
  try {
    await ShortURL.create({ fullURL: req?.body?.fullURL.trim() });
    res.redirect('/');
	} catch(err) {
		res.status(404).send(err.message);
	}
});

app.get('/:shortURL', async (req, res) => {
  const { shortURL } = req?.params;
	const shortURLs = await ShortURL.findOne({ shortURL });
	if(!shortURLs) return res.status(404).send("404 Not Found");

	shortURLs.clicks++;
	await shortURLs.save();
  
  res.redirect('/');
	res.redirect(shortURLs?.fullURL);
});

app.listen(PORT, () => console.log(`Listening to the port ${PORT}...`));
