
import mongoose from "mongoose"
import shortId from "shortid"
const { Schema, model } = mongoose

const ShortURLSchema = new Schema({
	fullURL: { type: String, required: true },
	shortURL: { type: String, required: true, default: shortId.generate },
  clicks: { type: Number, required: true, default: 0 }
})

const ShortURL = mongoose.models.ShortURL || model('ShortURL', ShortURLSchema)
export default ShortURL