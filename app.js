var express = require('express');
var path = require('path');
var logger = require('morgan');
var ejs = require('ejs');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
var redis   = require("redis");
var session = require('express-session');
var redisStore = require('connect-redis')(session);
const redisClient = redis.createClient({
    host : '******',
    port: 6379,  
    no_ready_check: true,
    auth_pass: '*******'                                                                                                                                                          
});                               

redisClient.on('connect', () => {   
    global.console.log("Redis connected");
});                               

redisClient.on('error', err => {       
    global.console.log(err.message)
});





var indexRouter = require('./routes/index');
var politesRouter = require('./routes/polites-system/polites');

var app = express();

redisClient.on('error', (err) => {
    console.log('Redis error: ', err);
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
express.static('public');

app.set('views', path.join(__dirname, 'views'));

// Set view engine as EJS
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(session({
    secret: '******',
    // create new redis store.
    name: 'appsessionid',
    store: new redisStore({client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use('/', indexRouter);
app.use('/polites/dashboard', politesRouter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cors());



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const port = 3000;
const server = app.listen(port, () => {
    console.log('Connected to port ' + port)
})

module.exports = app;
