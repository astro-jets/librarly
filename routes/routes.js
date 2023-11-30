const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller')
const {requireAuth, requireAuthAdmin,currentUser,currentStudent} = require('../middleware/authMiddleware')


// ***************************************** USER ROUTES  *****************************************//
router.get('/adminpeek',currentUser,requireAuthAdmin,controller.landing);
router.get('/',requireAuth,currentStudent,controller.landing);
router.get('/messages',requireAuth,currentStudent,(req,res)=>{
    res.render('messages',{layout:'layouts/library'})
});
router.get('/transactions',requireAuth,currentStudent,controller.transactions)
router.get('/books/reserve/:id',requireAuth,currentStudent,controller.reserveBook);
router.get('/login',(req,res)=>{
    res.render('auth',{layout:'layouts/library'})
});
router.post('/auth',controller.logIn);
router.get('/logout',controller.logOut);

// ***************************************** ADMINSTRATOR ROUTES  *****************************************//

router.get('/admin/*',currentUser);

router.get('/admin/',requireAuthAdmin,controller.dashboard);

// All Books
router.get('/admin/books',requireAuthAdmin,controller.allBooks);
// New book
router.get('/admin/books/new',requireAuthAdmin,(req,res)=>{
    res.render('admin/books/new')
});
// issue Book
router.get('/admin/books/issue',requireAuthAdmin,(req,res)=>{
    res.render('admin/books/issue')
});
// Post a book
router.post('/admin/books/new',requireAuthAdmin,controller.newBook);
router.post('/admin/loan/',requireAuthAdmin,controller.loanBook);
router.post('/books/search',requireAuthAdmin,controller.searchBook);

// Students
router.get('/admin/students',requireAuthAdmin,controller.allStudents);
router.get('/admin/students/new/',requireAuthAdmin,(req,res)=>{res.render('admin/students/new')});
router.post('/admin/students/new/',requireAuthAdmin,controller.newStudent);

// Staff
router.get('/admin/staff',requireAuthAdmin,controller.allStaff);
router.get('/admin/staff/new/',requireAuthAdmin,(req,res)=>{res.render('admin/staff/new')});
router.post('/admin/staff/new/',requireAuthAdmin,controller.newStaff);

// Loans
router.get('/admin/loans',requireAuthAdmin,controller.loanedBooks);

// Reports
router.get('/admin/reports',requireAuthAdmin,controller.reports);

// Handle Book Actions
router.get('/reservation/approve/:id',requireAuthAdmin,controller.approveReservervation);
router.get('/reservation/decline/:id',requireAuthAdmin,controller.declineReservation);

// Authentication & Registration
router.get('/admin/login',(req,res)=>{res.render('admin/login',{layout:'layouts/noheader'})});
router.get('/admin/signup',(req,res)=>{res.render('admin/signup',{layout:'layouts/noheader'})});
router.get('/admin/logout',controller.adminLogOut);
router.post('/admin/login',controller.adminLogIn);
router.post('/admin/signup',controller.adminSignUp);


module.exports = router;