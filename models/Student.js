const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypty = require('bcrypt')


const studentSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    level:{
        type:String,
        required:true
    },
    studentId:{
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
    password:{
        type:String,
        required:[true,'Please enter a password'],
        minlegnth:[8,'Password must not be less than 8 characters']
    },
    created_on:{
        type:Date,
        default:Date.now()
    },
    type:{
        type:String,
        default:"student",
        required:true
    }

});


studentSchema.pre('save',async function(next){
    const salt = await bcrypty.genSalt();
    this.password = await bcrypty.hash(this.password,salt)
    next();
})

studentSchema.statics.login = async function(email,password){
    const student = await this.findOne({email})
    if(student)
    {
        const auth = await bcrypty.compare(password,student.password)
        if(auth){
            return(student)
        }
        throw Error('Incorrect Password')
    }
    throw Error('Incorrect Email')
}

studentSchema.virtual('avatarPath').get(function(){
  if(this.avatar != null && this.avatarType != null)
  {
    return `data:${this.avatarType};charset=utf-8;base64,${this.avatar.toString('base64')}`
  }
})

const Student = mongoose.model('Student',studentSchema);
module.exports = Student;