const mongoose = require('mongoose')

const staffSchema = new mongoose.Schema({
    employmentId:{
        type:String,
        unique:true,
        required:true
    },
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    department:{
        type:String,
        required:true
    },
    created_on:{
        type:Date,
        default:Date.now()
    }
})

const Staff = mongoose.model('Staff',staffSchema);
module.exports = Staff;