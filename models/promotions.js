const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;

const promotionSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ""
  },
  price: {
    type: Currency,
    required: true,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true
  }
},{
    timestamps:true
});


const Promotions = mongoose.model('Promotion',promotionSchema)
module.exports = Promotions;
