var express = require('express');
const session = require('express-session');
var router = express.Router();
var mysql = require('mysql');
const bcrypt = require('bcryptjs');

var registrtempdb = {};


var connection = mysql.createConnection({
	host     : '*****',
	user     : '******',
	password : '*********',
  database : '******',
  charset: 'utf8mb4'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('DB connected as id ' + connection.threadId);
});

const { check, validationResult } = require('express-validator');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Πρόγραμμα καταγραφής κρουσμάτων COVID-19'});

});

router.get('/polites/', function(req, res, next) {
  res.render('submit-polites', {title: 'Είσοδος πολιτών', errors:null});
});

router.get('/polites/forgotpass', function(req, res, next) {
  res.render('forgotpass-polites', {title: 'Επαναφορά κωδικού', error:null, alert: null});
});

router.get('/polites/register', function(req, res, next) {
  res.render('polites-register', {title: 'Εγγραφή πολίτη', errors: null});
});


var politer_register_filter_rules = [
  check('polites-register-amka', 'Ο ΑΜΚΑ πρέπει να αποτελείται απο 11 χαρακτήρες.').isLength({ min: 11, max: 11}),
  check('polites-register-amka', 'Το πεδίο ΑΜΚΑ είναι κενό.').notEmpty(),
  check('polites-register-amka', 'Το πεδίο ΤΚ πρέπει να αποτελείται μόνο απο αριθμούς [0-9].').isInt(),
  check('polites-register-idnumber', 'Ο Αριθμός Ταυτότητας πρέπει να αποτελείται απο 8 χαρακτήρες.').isLength({min: 8, max: 8}),
  check('polites-register-amka', 'Το πεδίο του Αριθμού Ταυτότητας είναι κενό.').notEmpty(),
  check('polites-register-tk', 'Το πεδίο ΤΚ είναι κενό.').notEmpty(),
  check('polites-register-tk', 'Το πεδίο ΤΚ πρέπει να αποτελείται μόνο απο αριθμούς [0-9].').isInt(),
  check('polites-register-tk', 'Ο ΤΚ πρέπει να αποτελείται απο 5 χαρακτήρες.').isLength({min: 5, max: 5}),

  check('polites-register-fixedphone', 'Το πεδίο Σταθερό Τηλέφωνο είναι κενό.').notEmpty(),
  check('polites-register-fixedphone', 'Το πεδίο Σταθερό Τηλέφωνο πρέπει να αποτελείται απο 10 ψηφία.').isLength({min: 10, max: 10}),
  check('polites-register-fixedphone', 'Το πεδίο Σταθερό Τηλέφωνο πρέπει να είναι της μορφής 2ΧΧΧΧΧΧΧΧΧ').matches(/^2/),

  check('polites-register-mobilephone', 'Το πεδίο Κινητό Τηλέφωνο είναι κενό.').notEmpty(),
  check('polites-register-mobilephone', 'Το πεδίο Κινητό Τηλέφωνο πρέπει να αποτελείται απο 10 ψηφία.').isLength({min: 10, max: 10}),
  check('polites-register-mobilephone', 'Το πεδίο Κινητό Τηλέφωνο πρέπει να είναι της μορφής 69ΧΧΧΧΧΧΧΧ').matches(/^69/),
  check('polites-register-email', 'Η διεύθυνση Email δεν είναι έγκυρη.').isEmail()

];
router.post('/polites/register', politer_register_filter_rules, (req, res) =>{
  
  var errors = validationResult(req).array();
  console.log(errors);
  console.log(errors.length);
  if(errors.length > 0){
    //Something is wrong with fields
    res.render('polites-register', {title: 'Εγγραφή πολίτη', errors: errors});
  }else{
    //All clear
    console.log(req.body);
    var salt = bcrypt.genSaltSync(10);
    var registrationID = bcrypt.hashSync(req.body['polites-register-amka'], salt);
    registrtempdb[registrationID] = req.body;
    console.log('Registration ID: '+ registrationID);
  
    req.session.regID = registrationID;
    res.render('check-data-agreement', {title: 'Εγγραφή πολίτη', errors: null});
  }
});



router.get('/polites/register/process/:sc', (req, res) => {
  var regID_gather = req.session.regID;
  if (typeof regID_gather === "undefined"){
    res.redirect('/polites/register');
  }
  var status_code = req.params.sc;
  console.log(req.body);

  if(status_code != null && regID_gather != null){
    if(regID_gather in registrtempdb){
        if(status_code == 1){
          //Continue registration
          console.log(registrtempdb[regID_gather]);
        
          var salt = bcrypt.genSaltSync(10);
          var hashpass = bcrypt.hashSync(registrtempdb[regID_gather]['polites-register-password'], salt);
          var email_v_code = Math.floor(1000 + Math.random() * 9000);
          var phone_v_code = Math.floor(5000 + Math.random() * 8000)
          var newuser = [
            [registrtempdb[regID_gather]['polites-register-firstname'],
             registrtempdb[regID_gather]['polites-register-lastname'],
             registrtempdb[regID_gather]['polites-register-amka'],
             registrtempdb[regID_gather]['polites-register-idnumber'],
             registrtempdb[regID_gather]['polites-register-homeaddress'],
             registrtempdb[regID_gather]['polites-register-city'],
             registrtempdb[regID_gather]['polites-register-tk'],
             registrtempdb[regID_gather]['polites-register-fixedphone'],
             registrtempdb[regID_gather]['polites-register-mobilephone'],
             registrtempdb[regID_gather]['polites-register-email'],
             hashpass,
             phone_v_code,
             email_v_code,
             regID_gather]
          ];
          console.log("Registration Phone Code: "+ phone_v_code);
          console.log("Registration Email Code: "+email_v_code);
          var query = connection.query('INSERT INTO platform_users (Firstname, Lastname, Amka, IDNum, HomeAddress, City, AreaCode, FixedPhone, MobilePhone, Email, Password, PCode, ECode, RegistrationID) VALUES (?)', newuser, function (error, results, fields) {
            console.log(error);
            if (error){
              if(error.errno == 1062){
                console.log("Duplicate user account found!");
                res.render('polites-register-failed', {title: "Ανεπιτυχής εγγραφή", errorcode: 'Ο χρήστης που προσπαθείτε να καταχωρήσετε υπάρχει στο σύστημα μας'});
              }
            }else{
              console.log("Session ID: "+ req.sessionID);
              console.log("Session DATA: "+ req.session);
              req.session.verifyprocess = {
                'regid': regID_gather,
                'verifyphone': registrtempdb[regID_gather]['polites-register-mobilephone'],
                'verifyemail': registrtempdb[regID_gather]['polites-register-email'],
                'isokemail': true,
                'isokphone': true
              };
              res.redirect('/polites/verify');
            }
          });

        }else{  
          res.redirect('/polites/register');
        }
    }else{
      res.redirect('/polites/register');
    }
  }else{
    res.redirect('/polites/register');
  }
  
});


router.get('/polites/verify', (req, res) => {
  console.log("(VERIFY PAGE) Session ID: "+ req.sessionID);
  console.log("(VERIFY PAGE) Session DATA: "+ req.session.verifyprocess);
  var verfiinfo_session = req.session.verifyprocess;
  if (typeof verfiinfo_session === "undefined"){
    res.redirect('/polites/register');
  }

  if(verfiinfo_session['regid'] == null || verfiinfo_session['verifyphone'] == null || verfiinfo_session['verifyemail'] == null){
    res.redirect('/polites/register');
  }else{
    connection.query("SELECT * FROM platform_users WHERE Email = ? AND MobilePhone = ?", [req.session.verifyprocess['verifyemail'], req.session.verifyprocess['verifyphone']], function (err, result, fields) {
      console.log(result);
      if(result[0]['PCode'].length <= 1){
        req.session.verifyprocess['isokphone'] = false;
      }else{
        req.session.verifyprocess['isokphone'] = true;
      }

      if(result[0]['ECode'].length <= 1){
        req.session.verifyprocess['isokemail'] = false;
      }else{
        req.session.verifyprocess['isokemail'] = true;
      }

      console.log(req.session.verifyprocess);

      if (result.length == 0 || err){
        res.redirect('/polites/register');
      }else{
        if(req.session.verifyprocess['isokemail'] == false){
          res.render('polites-verify', {title: "Επιβεβαίωση στοιχείων", error: null, verifyphone: verfiinfo_session['verifyphone'], verifyemail: null, regID: verfiinfo_session['regid']})
        }else if(req.session.verifyprocess['isokphone'] == false){
          res.render('polites-verify', {title: "Επιβεβαίωση στοιχείων", error: null, verifyphone: null, verifyemail: verfiinfo_session['verifyemail'], regID: verfiinfo_session['regid']})
        }else{
          res.render('polites-verify', {title: "Επιβεβαίωση στοιχείων", error: null, verifyphone: verfiinfo_session['verifyphone'], verifyemail: verfiinfo_session['verifyemail'], regID: verfiinfo_session['regid']})
        }
        
      }
    });
  }
});


router.post('/polites/verify', (req, res) => {
  var user_form_validate = req.body;
  var verfiinfo_session = req.session.verifyprocess;
  console.log(user_form_validate);
  console.log(verfiinfo_session);
  if (typeof verfiinfo_session === "undefined"){
    res.redirect('/polites/register');
  }
  
  connection.query("SELECT * FROM platform_users WHERE PCode = ? OR ECode = ?", [user_form_validate['phone-code-input-verify'], user_form_validate['email-code-input-verify']], function (err, result, fields) {
    if (err){
      console.log(err)
      res.render('polites-verify', {title: "Επιβεβαίωση στοιχείων", error: "Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά.", verifyphone: verfiinfo_session['verifyphone'], verifyemail: verfiinfo_session['verifyemail'], regID: verfiinfo_session['regid']});
    }
    if(result.length > 0){
      //All good, user verifyed
      req.session.destroy(req.sessionID);
      if(verfiinfo_session['isokemail'] == false){
        connection.query("UPDATE platform_users SET PCode = '-' WHERE RegistrationID = ?", verfiinfo_session['regid'], function (err, result) {
          console.log(result.affectedRows + " record(s) updated");
          if(err){
            console.log(err);
            res.render('polites-verify', {title: "Επιβεβαίωση στοιχείων", error: "Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά.", verifyphone: verfiinfo_session['verifyphone'], verifyemail: verfiinfo_session['verifyemail'], regID: verfiinfo_session['regid']});
          }else{
            res.redirect('/polites/');
          }
        });
      }else if(verfiinfo_session['isokphone'] == false){
        connection.query("UPDATE platform_users SET ECode = '-' WHERE RegistrationID = ?", verfiinfo_session['regid'], function (err, result) {
          console.log(result.affectedRows + " record(s) updated");
          if(err){
            console.log(err);
            res.render('polites-verify', {title: "Επιβεβαίωση στοιχείων", error: "Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά.", verifyphone: verfiinfo_session['verifyphone'], verifyemail: verfiinfo_session['verifyemail'], regID: verfiinfo_session['regid']});
          }else{
            res.redirect('/polites/');
          }
        });
      }else{
        connection.query("UPDATE platform_users SET ECode = '-', PCode = '-' WHERE RegistrationID = ?", verfiinfo_session['regid'], function (err, result) {
          console.log(result.affectedRows + " record(s) updated");
          if(err){
            console.log(err);
            res.render('polites-verify', {title: "Επιβεβαίωση στοιχείων", error: "Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά.", verifyphone: verfiinfo_session['verifyphone'], verifyemail: verfiinfo_session['verifyemail'], regID: verfiinfo_session['regid']});
          }else{
            res.redirect('/polites/');
          }
        });
      }
      
      
    }else{

      if(req.session.verifyprocess['isokemail'] == false){
        res.render('polites-verify', {title: "Επιβεβαίωση στοιχείων", error: "Οι κωδικοί επαλήθευσης είναι εσφαλμένοι, παρακαλώ δοκιμάστε ξανά.", verifyphone: verfiinfo_session['verifyphone'], verifyemail: null, regID: verfiinfo_session['regid']});
      }else if(req.session.verifyprocess['isokphone'] == false){
        res.render('polites-verify', {title: "Επιβεβαίωση στοιχείων", error: "Οι κωδικοί επαλήθευσης είναι εσφαλμένοι, παρακαλώ δοκιμάστε ξανά.", verifyphone: null, verifyemail: verfiinfo_session['verifyemail'], regID: verfiinfo_session['regid']});
      }else{
        res.render('polites-verify', {title: "Επιβεβαίωση στοιχείων", error: "Οι κωδικοί επαλήθευσης είναι εσφαλμένοι, παρακαλώ δοκιμάστε ξανά.", verifyphone: verfiinfo_session['verifyphone'], verifyemail: verfiinfo_session['verifyemail'], regID: verfiinfo_session['regid']});
      }

      
    }
  });
});


router.post('/polites/login', (req, res) => {
  var username = req.body['polites-login-phone'];
  var password = req.body['polites-login-password'];
  connection.query("SELECT * FROM platform_users WHERE MobilePhone = ? OR Email OR RegistrationID = ?", [username, username, username], function (err, result, fields) {
    if(result.length > 0){
      console.log(result[0]);
      if (bcrypt.compareSync(password, result[0]['Password'])){
        if(result[0]['ECode'] != "-" || result[0]['PCode'] != "-"){
          req.session.verifyprocess = {};
          /*if(result[0]['ECode'] == "-"){
            req.session.verifyprocess = {
              'regid': result[0]['RegistrationID'],
              'verifyphone': result[0]['MobilePhone'],
              'verifyemail': result[0]['Email'],
              'isokemail': true,
              'isokphone': false
            };
          }else if(result[0]['PCode'] == "-"){
            req.session.verifyprocess = {
              'regid': result[0]['RegistrationID'],
              'verifyphone': result[0]['MobilePhon'],
              'verifyemail': result[0]['Email'],
              'isokemail': false,
              'isokphone': true
            };
          }else{
            req.session.verifyprocess = {
              'regid': result[0]['RegistrationID'],
              'verifyphone': result[0]['MobilePhon'],
              'verifyemail': result[0]['Email'],
              'isokemail': false,
              'isokphone': false
            };
          }*/
          //req.session.destroy(req.sessionID);
          req.session.verifyprocess = {
            'regid': result[0]['RegistrationID'],
            'verifyphone': result[0]['MobilePhone'],
            'verifyemail': result[0]['Email'],
            'isokemail': true,
            'isokphone': false
          };

          console.log(req.session.verifyprocess)
          res.redirect('/polites/verify');
        }else{
          req.session.loggeduid = result[0]['RegistrationID'];
          req.session.isloggedin = true;
          req.session.accounttype = 0;
          req.session.userdata = result[0];
          res.redirect('/polites/dashboard');
        }   
        
      }else{
        res.render('submit-polites', {title: 'Είσοδος πολιτών', errors: 'Εσφαλμένα στοιχεία σύνδεσης, παρακαλώ δοκιμάστε ξανά.'});
      }
    }else{
      res.render('submit-polites', {title: 'Είσοδος πολιτών', errors: 'Εσφαλμένα στοιχεία σύνδεσης, παρακαλώ δοκιμάστε ξανά.'});
    }
    
  });
});

router.post('/polites/forgotpass', function(req, res, next) {
  var user_mobile_restore = req.body['polites-forgot-pass-mobile'];
  var user_idcard_restore = req.body['polites-forgot-pass-idcard'];
  var new_password = '';
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < 5; i++ ) {
      new_password+= characters.charAt(Math.floor(Math.random() * charactersLength));
   }

   var salt = bcrypt.genSaltSync(10);
   var hashpass = bcrypt.hashSync(new_password, salt);

   connection.query("SELECT * FROM platform_users WHERE MobilePhone = ? AND IDNum = ?", [user_mobile_restore, user_idcard_restore], function (err, result, fields) {
    if(result.length > 0){
      connection.query("UPDATE platform_users SET Password = ? WHERE MobilePhone = ? AND IDNum = ?", [hashpass, user_mobile_restore, user_idcard_restore], function (err, result) {
        console.log(result.affectedRows + " record(s) updated");
        if(err){
          console.log(err);
          res.render('forgotpass-polites', {title: "Επαναφορά κωδικού πρόσβασης", error: "Κάτι πήγε στραβά παρακαλώ δοκιμάστε ξανά.", alert: null});
        }else{
          console.log("New Password for user with MobilePhone "+ user_mobile_restore + " and IDNumber "+ user_idcard_restore + " --> "+ new_password);
          res.render('forgotpass-polites', {title: "Επαναφορά κωδικού πρόσβασης", error: null, alert: "Σας έχουμε αποστείλει με SMS τον νέο σας προσωρινό κωδικό."});
        }
      });
    }else{
      res.render('forgotpass-polites', {title: "Επαναφορά κωδικού πρόσβασης", error: "Εσφαλμένα στοιχεία χρήστη, παρακαλώ δοκιμάστε ξανά.", alert: null});
    }
    
  });

   

});


module.exports = router;
