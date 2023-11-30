// Libralies
const imageMimeTypes = ['image/jpeg','image/png','image/ico']
const moment = require('moment');
const fs = require('fs')
const jwt = require('jsonwebtoken') 

// Models
const User = require('../models/User') ;
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

const maxAge = 3 * 24 * 60 * 60

// Create Token
const createToken = (id)=>{
    return jwt.sign({id},process.env.TOKEN_SECRET,{
        expiresIn: maxAge
    });
}

// Handle Errors
const handleErrors = (err)=>{
    let errors = {
        username:'',
        email:'',
        password:''
    }
    // Email error
    if(err.message === 'Incorrect Email')
    {
        errors.email = "That email is not registred."
    }
    
    // Password error
    if(err.message==='Incorrect Password'){
        errors.password = "The password incorrect."
    }
    
    // Validating errors
    if(err.code === 11000){
        errors.email = "That email is already registred."
        return(errors)
    }
    if(err.message.includes('user validation failed'))
    {
        Object.values(err.errors).forEach(properties=>{
            errors[properties.path] = properties.message
        })
    }

    return(errors)
    
}

// Dashoboard
module.exports.landing= async (req,res)=>{ 
    try{
        const books = await Book.find();
        res.render('index',{
            layout:'layouts/library',
            books:books,
            user:res.locals.user
        })
    }
    catch(err){res.send(err.message)}
}

// Dashoboard
module.exports.reports= async (req,res)=>{
    await allReports();
    res.render("admin/reports/index")
}


// Dashoboard
module.exports.dashboard= async (req,res)=>{ 
    try{
        const trans = await Transaction.find();
        const books = await Book.find();
        const reservations = [];
        const loans = [];
        const stats = {
            reservations: await allReservations(),
            loans: await allLoans(),
            books: books.length
        };
        for (let i = 0; i < trans.length; i++) {
            const t = trans[i];
            if(t.status === "pending")
            {
                let book = await Book.findOne({bookId:t.book});
                let user = await Student.findById(t.user);
                reservations.push({
                    id:t._id,
                    student:user.firstname+" "+user.lastname,
                    type:t.type,
                    book:book.name,
                    status:t.status,
                    date:moment(t.created_on).calendar()
                });
            }

            if(t.status === "loaned")
            {
                let book = await Book.findOne({bookId:t.book});
                let user = await Student.findById(t.user);
                loans.push({
                    id:t._id,
                    student:user.firstname+" "+user.lastname,
                    type:t.type,
                    book:book.name,
                    status:t.status,
                    date:moment(t.created_on).calendar()
                });
            }
        };
        await dashboardReport();

        res.render('admin/index',{
            stats:stats, 
            loans:loans, 
            reservations:reservations
        });
        
    }
    catch(err){res.send(err.message)}
}

// Profile
module.exports.profile= async (req,res)=>{ 
    try{
        const user = res.locals.user
        const message = await Message.findOne({user:user._id})
            
        const data ={
            id:message._id,
            thread:[]
        } 
        for (let i = 0; i < message.thread.length; i++) {
            const t = message.thread[i];
            data.thread.push({
                response:t.message,
                from:t.from,
                date:moment(t.time).calendar(),
            })            
        }
        
        res.render('admin/profile/index',{
            user: user,
            data:data,
            layout:'layouts/noheader'
        })
    }
    catch(err){res.send(err.message)}
}


//All Students
module.exports.allStudents = async (req,res)=>{
    try{
        const students = await Student.find();
        res.render('admin/students/index',{students:students})    

    }catch(err){
        res.send(err.message)
    }
}
//All Students

//New Student
module.exports.newStudent = async (req,res)=>{
    try{
        const {firstname,lastname,phone,email,level,studentId,password} = req.body;
        const student = await Student.create({firstname,lastname,phone,email,level,studentId,password,type:"student"})
        res.redirect('/admin/students')

    }catch(err){
        res.send(err.message)
    }
}
//New Student

//All Staff
module.exports.allStaff = async (req,res)=>{
    try{
        const staff = await Staff.find();
        res.render('admin/staff/index',{staff:staff})    

    }catch(err){
        res.send(err.message)
    }
}
//All Staff

//New Staff
module.exports.newStaff = async (req,res)=>{
    try{
        const {firstname,lastname,phone,email,department,employmentId} = req.body;
        const staff = await Staff.create({firstname,lastname,phone,email,department,employmentId})
        res.redirect('/admin/staff/')
    }catch(err){
        res.send(err.message)
    }
}
//New Staff

//All Books
module.exports.allBooks = async (req,res)=>{
    try{
        const abooks = await Book.find();
        const books = abooks.map(function(book){
            return {
                id:book._id,
                bookId:book.bookId,
                name:book.name,
                description:book.description,
                tags:book.tags,
                created_on:moment(book.created_on).calendar()
            }
        })
        res.render('admin/books/books',{books:books})    

    }catch(err){
        res.send(err.message)
    }
}
//All Books


// New book
module.exports.newBook= async (req,res)=>{

    const tags = ['analysis','networks','programming','business'];
    const bookDetails = {
        bookId:req.body.bookId,
        name:req.body.name,
        description:req.body.description,
        tags : []
    };
    tags.forEach(t=>{
        if(req.body[t])
        {
           bookDetails.tags.push(t)
        }
    });
    saveimage(bookDetails, req.body.thumbnail)

    try{

        const query = await Book.create(bookDetails);

        if(query){res.redirect('/admin/books/')}

    }
    catch(e)
    {
        res.send(e.message)
    }
}
// New book

// Search book
module.exports.searchBook= async (req,res)=>{

    try{
        const books = await Book.findOne({name:req.body.input});
        const book = {
            _id:books.bookId,
            name:books.name,
            thumbnail:books.thumbnail,
            tags:books.tags
        }
        res.status(200).json({book: book});
    }
    catch(err){console.log(err.message)}
}
// Search book

// Reserve book
module.exports.reserveBook= async (req,res)=>{
    const user = res.locals.user;
    const transaction = {
        book: req.params.id,
        user: user._id,
        type:"reservation",
        status:"pending"
    }
    try{
        const books = await Transaction.create(transaction)
        res.redirect('/transactions/')
    }
    catch(err){console.log(err.message)}
}
// Reserve book

// Loan Book
module.exports.loanedBooks = async (req,res)=>{
    try{
        const loan = await Transaction.find({type:"loan"});
        const loans = [];

        for (let i = 0; i < loan.length; i++) {
            let fine = 0;
            const l = loan[i];
            const s = await Student.findById(l.user);
            const b = await Book.findOne({bookId:l.book});
            let a = moment(Date.now());
            let h = moment(l.returnDate);
            
            if(parseInt(a.diff(h,'days')) > 0 )
            {
                fine = parseInt(a.diff(h,'days')) * 800;
            }

            if(l.status = "loaned"){
                loans.push({
                    student:s.firstname+" "+s.lastname,
                    book:b.name,
                    loanedOn:moment(l.created_on).format("ll"),
                    returnOn:moment(l.returnDate).format("ll"),
                    fine:fine
                })
            }
        }
        res.render("admin/loans/index",{loans:loans})
    }
    catch(err){console.log(err.message)}
}
// Loan Book

// Loan Book
module.exports.loanBook = async (req,res)=>{
    const student = await Student.findOne({studentId: req.body.student});
    const loanDetails = {
        user: student._id,
        book: req.body.book,
        status:"loaned",
        type:"loan",
        returnDate:moment(Date.now()).add(7,'days')
    };
    try{
        const loan = await Transaction.create(loanDetails);
        res.redirect('/admin/')
    }
    catch(err){console.log(err.message)}
}
// Loan Book

// Approve reservervation
module.exports.approveReservervation= async (req,res)=>{
    const reservation = await Transaction.findById(req.params.id);
    reservation.status = "approved";
    try{
        const update = await Transaction.updateOne(
            {_id:req.params.id},
            {$set:{thread:JSON.parse(JSON.stringify(reservation.status))}}
        );
        await reservation.save();
        res.redirect('/admin/')
    }
    catch(err){
        res.send(err.message)
    }
}
// Approve reservervation


// Decline reservervation
module.exports.declineReservation= async (req,res)=>{
    const reservation = await Transaction.findById(req.params.id);
    reservation.status = "declined";
    try{
        const update = await Transaction.updateOne(
            {_id:req.params.id},
            {$set:{thread:JSON.parse(JSON.stringify(reservation.status))}}
        );
        await reservation.save();
        res.redirect('/admin/')
    }
    catch(err){console.log(err.message)}
}
// Decline reservervation

// Transactions
module.exports.transactions = async (req,res)=>{
    try{
        const user = res.locals.user;
        if(user.type === "admin"){
            const transactions = [];
            res.render('transactions',{user:user,transactions:transactions,layout:'layouts/library'})
        }
        else{
            const trans = await Transaction.find({user:user._id});
            const transactions = [];

            for (let i = 0; i < trans.length; i++) {
                const t = trans[i];
                let book = await Book.findOne({bookId:t.book});
                transactions.push({
                    type:t.type,
                    book: book.name,
                    status: t.status,
                    date:moment(t.created_on).calendar()
                });
            }
            res.render('transactions',{user:user,transactions:transactions,layout:'layouts/library'});
        }
    }
    catch(err){res.send(err.message)}
}
// Transactions


//Student Signup Route
module.exports.signUp = async (req,res)=>{
    
    const userDetails = {
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        userType:'customer'
    }
    saveimage(userDetails,req.body.avatar)

    try{
        const user = await User.create(userDetails)
        const token = createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.redirect('/admin')
    }
    catch(err)
    {
        const errors = handleErrors(err)
        res.status(201).json({errors})
    }
}

// Students LogIN
module.exports.logIn = async (req,res)=>{
    const{email,password} = req.body;
    try{
        const user = await Student.login(email,password)
        const token = createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.redirect('/');
    }
    catch(err)
    {
        const errors = handleErrors(err)
        res.json({errors})
    }
}

// Admin Sign Up
module.exports.adminSignUp = async (req,res)=>{
    const userDetails = {
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        password:req.body.password,
        type:"admin"
    }

    try{
        const user = await User.create(userDetails)
        const token = createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.redirect('/admin/')
    }
    catch(err)
    {
        const errors = handleErrors(err)
        res.status(201).json(err.message)
    }
}

// Admin LogIn
module.exports.adminLogIn = async (req,res)=>{
    const{email,password} = req.body;
    try{
        const user = await User.login(email,password)
        const token = createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.redirect('/admin/');
    }
    catch(err)
    {
        const errors = handleErrors(err)
        res.json({errors})
    }
}

// LogOut Route
module.exports.adminLogOut = async (req,res)=>{
    try{
        res.cookie('jwt','',{httpOnly:true,maxAge:1})
        res.redirect('/login')
    }
    catch(err)
    {
        const errors = handleErrors(err)
        res.json({errors})
    }
}

// LogOut Route
module.exports.logOut = async (req,res)=>{
    try{
        res.cookie('jwt','',{httpOnly:true,maxAge:1})
        res.redirect('/')
    }
    catch(err)
    {
        const errors = handleErrors(err)
        res.json({errors})
    }
}


function saveimage(arr, encodedimage)
{
    if(encodedimage == null){return}
    const image = JSON.parse(encodedimage)
    if(image != null && imageMimeTypes.includes(image.type))
    {
        arr.image = new Buffer.from(image.data, 'base64')
        arr.imageType = image.type
    }
}

async function allReservations(){
    const reservations = await Transaction.find({type:"reservation"});
    return reservations.length;
}

async function allLoans(){
    const loans = await Transaction.find({type:"loan"});
    return loans.length;
}

async function dashboardReport()
{
    const books = await Book.find();
    const trans = await Transaction.find();
    const report = {
        today: {
            books: books.filter(b => moment(b.created_on).day() === moment(Date.now()).day()).length,
            loans: trans.filter(t => t.type == "loan" && moment(t.created_on).day() === moment(Date.now()).day()).length,
            reservations: trans.filter(r => r.type == "reservation" && moment(r.created_on).day() === moment(Date.now()).day()).length
        },

        week: {
            books: books.filter(b => moment(b.created_on).week() === moment(Date.now()).week() ).length,
            loans: trans.filter(t => t.type == "loan" && moment(t.created_on).week() === moment(Date.now()).week()).length,
            reservations: trans.filter(r => r.type == "reservation" && moment(r.created_on).week() === moment(Date.now()).week()).length
        },
        month: {
            books: books.filter(b => moment(b.created_on).month() === moment(Date.now()).month()).length,
            loans: trans.filter(t => t.type == "loan" && moment(t.created_on).month() === moment(Date.now()).month()).length,
            reservations: trans.filter(r => r.type == "reservation" && moment(r.created_on).month() === moment(Date.now()).month()).length
        }
    }

    const data = JSON.stringify(report)
    fs.writeFile('public/reports/dashboard.json',data, err=>{
        if(err)
        {
            console.log(err)
        }
        else{
            console.log('success saved report')
        }
    })
}

async function allReports()
{
    const reservations = await Transaction.find({type:"reservation"});
    const loans = await Transaction.find({type:"loan"});
    const books = await Book.find();
    
    let report = {
        reservations : {
            analysis: 0,
            networks: 0,
            programming: 0,
            business: 0
        },
        loans : {
            analysis: 0,
            networks: 0,
            programming: 0,
            business: 0
        },
        books : {
            analysis: 0,
            networks: 0,
            programming: 0,
            business: 0
        },
    };

    for (let i = 0; i < reservations.length; i++) {
        const r = reservations[i];
        let book = await Book.findOne({bookId:r.book});
        if(book.tags.includes("analysis")){report.reservations.analysis += 1}
        if(book.tags.includes("networks")){report.reservations.networks+= 1}
        if(book.tags.includes("programming")){report.reservations.programming += 1}
        if(book.tags.includes("business")){report.reservations.business += 1}
    }

    for (let i = 0; i < books.length; i++) {
        const book = books[i];

        if(book.tags.includes("analysis")){report.books.analysis += 1}
        if(book.tags.includes("networks")){report.books.networks+= 1}
        if(book.tags.includes("programming")){report.books.programming += 1}
        if(book.tags.includes("business")){report.books.business += 1}
    }

    for (let i = 0; i < loans.length; i++) {
        const l = loans[i];
        let book = await Book.findOne({bookId:l.book});
        console.log(book.tags)
        if(book.tags.includes("analysis")){report.loans.analysis += 1}
        if(book.tags.includes("networks")){report.loans.networks+= 1}
        if(book.tags.includes("programming")){report.loans.programming += 1}
        if(book.tags.includes("business")){report.loans.business += 1}
    }

    const data = JSON.stringify(report)
    fs.writeFile('public/reports/reports.json',data, err=>{
        if(err)
        {
            console.log(err)
        }
        else{
            console.log('success saved report')
        }
    })
}