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

app.get('/', paginatedData(ShortURL), async (req, res) => {
	res.render('index', { shortURLs: res.data });
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

app.listen(PORT, () => console.log(`Listening to the port http://localhost:${PORT}...`));


function paginatedData(model) {
	return async (req, res, next) => {
		if (!(req?.query?.page && req?.query?.limit)) {
		  try {
        res.data = await model.find();
				return next()
			} catch(err) {
				res.status(404).send(err.message)
			}
		}
		let data = {}
		const page = parseInt(req.query.page)
		const limit = parseInt(req.query.limit)

		const startIndex = (page - 1) * limit
    const endIndex = page * limit

		if (startIndex > 0) {
			data.previous = {
				page: page - 1,
				limit
			}
		}
    try {
			data.data = await model.find().limit(limit).skip(startIndex).exec()
		} catch(err) {
      res.status(404).send(err.message)
    }
		
		if (endIndex < model.countDocuments().exec()) {
			data.next = {
				page: page + 1,
				limit
			}
		}
    res.data = data
		return next()
	}
}