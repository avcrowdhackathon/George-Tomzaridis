var express = require('express');
const session = require('express-session');
var router = express.Router();
var mysql = require('mysql');
const bcrypt = require('bcryptjs');

var registrtempdb = {};


var connection = mysql.createConnection({
	host     : '*****',
	user     : '****',
	password : '********',
  database : '************',
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
  if(req.session){
      console.log(req.session);
      if(req.session.loggeduid != null && req.session.isloggedin != null && req.session.accounttype != null && req.session.userdata != null){
        res.render('polites-dashboard/index', {userdata: req.session.userdata});
      }else{
        return res.redirect('/polites');
      }
  }else{
    return res.redirect('/polites');
  }
  

});

router.get('/logout', function(req, res, next){
    if (req.session) {
        
        // delete session object
        req.session.destroy(function(err) {
          if(err) {
            return next(err);
          } else {
            return res.redirect('/polites');
          }
        });
      }
});

router.get('/profile', function(req, res, next) {
  if(req.session){
      console.log(req.session);
      if(req.session.loggeduid != null && req.session.isloggedin != null && req.session.accounttype != null && req.session.userdata != null){
        connection.query("SELECT * FROM platform_users WHERE RegistrationID = ?", [req.session.userdata['RegistrationID']], function (err, result, fields) {
          if(result.length > 0){
            res.render('polites-dashboard/profile', {userdata: result[0], error: null, alert: null});
          }else{
            return res.redirect('/polites');
          }
        });      
      }else{
        return res.redirect('/polites');
      }
  }else{
    return res.redirect('/polites');
  }
  
});


/* STARTING TEMPLATES ONLY DESIGN */
router.get('/report/', function(req, res, next ){
  res.render('polites-dashboard/report-full');
});


/* ENDING TEMPLATES ONLY DESIGN */

router.post('/profile', function(req, res, next) {
  if(req.session){
      console.log(req.session);
      connection.query("SELECT * FROM platform_users WHERE RegistrationID = ?", [req.session.userdata['RegistrationID']], function (err, result, fields) {
        if(result.length > 0){
            if(result[0]['Firstname'] != req.body['polites-profile-firstname']){
              var firstname_update = req.body['polites-profile-firstname'];
            }else{
              var firstname_update = result[0]['Firstname'];
            }

            if(result[0]['Lastname'] != req.body['polites-profile-lastname']){
              var lastname_update = req.body['polites-profile-firstname'];
            }else{
              var lastname_update = result[0]['Lastname'];
            }
            
            if(result[0]['Amka'] != req.body['polites-profile-amka']){
              var amka_update = req.body['polites-profile-amka'];
            }else{
              var amka_update = result[0]['Amka'];
            }

            if(result[0]['IDNum'] != req.body['polites-profile-idnumber']){
              var idnumber_update = req.body['polites-profile-idnumber'];
            }else{
              var idnumber_update = result[0]['IDNum'];
            }

            if(result[0]['HomeAddress']  != req.body['polites-profile-homeaddress']){
              var street_update = req.body['polites-profile-homeaddress'];
            }else{
              var street_update = result[0]['HomeAddress'];
            }

            if(result[0]['City'] != req.body['polites-profile-city']){
              var city_update = req.body['polites-profile-city'];
            }else{
              var city_update = result[0]['City'];
            }

            if(result[0]['AreaCode'] != req.body['polites-profile-tk']){
              var areacode_update = req.body['polites-profile-tk'];
            }else{
              var areacode_update = result[0]['AreaCode'];
            }

            if(result[0]['FixedPhone'] != req.body['polites-profile-fixedphone']){
              var fixedphone_update = req.body['polites-profile-fixedphone'];
            }else{
              var fixedphone_update = result[0]['FixedPhone'];
            }

            if(result[0]['MobilePhone'] != req.body['polites-profile-mobilephone']){
              var mobilephone_update = req.body['polites-profile-mobilephone'];
              var phone_v_code = Math.floor(5000 + Math.random() * 8000)
            }else{
              var mobilephone_update = result[0]['MobilePhone'];
              var phone_v_code = "-";
            }

            if(result[0]['Email'] != req.body['polites-profile-email']){
              var email_update = req.body['polites-profile-email'];
              var email_v_code = Math.floor(1000 + Math.random() * 9000);
            }else{
              var email_update = result[0]['Email'];
              var email_v_code = "-";
            }
            var salt = bcrypt.genSaltSync(10);
            var hashpass_input = bcrypt.hashSync(req.body['polites-profile-password'], salt);
            if(req.body['polites-profile-password'] != "" && req.body['polites-profile-password'] != null){
              var password_update = hashpass_input;
            }else{
              var password_update = result[0]['Password'];
            }

          connection.query("UPDATE platform_users SET Firstname = ? , Lastname = ? , Amka = ?, IDNum = ?, HomeAddress = ?, City = ?, AreaCode = ?, FixedPhone = ?, MobilePhone = ?, Email = ?, Password = ?, PCode = ?, ECode = ? WHERE RegistrationID = ?", [firstname_update, lastname_update, amka_update, idnumber_update, street_update, city_update, areacode_update, fixedphone_update, mobilephone_update, email_update, password_update, phone_v_code, email_v_code, req.session.userdata['RegistrationID']], function (err, result) {
            console.log(result.affectedRows + " record(s) updated");
            if(err){
              console.log(err);
              res.render('polites-dashboard/profile', {userdata: req.session.userdata, error: "Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά.", alert: null});
            }else{
              connection.query("SELECT * FROM platform_users WHERE RegistrationID = ?", [req.session.userdata['RegistrationID']], function (err, result, fields) {
                if(result.length > 0){
                  res.render('polites-dashboard/profile', {userdata: result[0], error: null, alert: "Τα προσωπικά στοιχεία ενημερώθηκαν με επιτυχία."});
                }else{
                  if(err){
                    console.log(err);
                  }
                  res.render('polites-dashboard/profile', {userdata: req.session.userdata, error: "Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά.", alert: null});
                }
              }); 
            }
          });
        }else{
          return res.redirect('/polites');
        }
        
      });

  }else{
    return res.redirect('/polites');
  }
  
});


module.exports = router;