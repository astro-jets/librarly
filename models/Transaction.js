const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    book:{
        type:mongoose.Schema.Types.String,
        ref:'Book',
        required:true
    },
    user:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    returnDate:{
        type:Date,
        required:false
    },
    created_on:{
        type:Date,
        default:Date.now()
    }
})

const Transaction = mongoose.model('Transaction',transactionSchema);
module.exports = Transaction;