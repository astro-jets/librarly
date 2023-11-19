const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    bookId:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    tags:{
        type:Array,
        required:true
    },
    image:{
        type:Buffer
    },
    imageType:{
        type:String
    },
    created_on:{
        type:Date,
        default:Date.now()
    }
})


bookSchema.virtual('thumbnail').get(function(){
  if(this.image != null && this.imageType != null)
  {
    return `data:${this.imageType};charset=utf-8;base64,${this.image.toString('base64')}`
  }
})

const Book = mongoose.model('Book',bookSchema);
module.exports = Book;