/** 
*Created:...................11/07/2016
*Author:....................Emmanuel Henley
*Author Contact:............ehenl001@fiu.edu
*Last Edited:...............11/11/2016
*Last Edited by:............same as author
*Last Edited by contact:....same as author
*
*
*Server for the HenleyLunn EMR app
**/

var express = require('express');
var app = express();
var http = require('http');

var host = "localhost";
var port = 3030;
var cloudant = {
	url: "https://a39147b3-f95b-4e5d-8d0d-a9b7384280fb-bluemix.cloudant.com/_all_dbs"	
};

if (process.env.hasOwnProperty("VCAP_SERVICES")) {
  // Running on Bluemix. Parse out the port and host that we've been assigned.
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var host = process.env.VCAP_APP_HOST;
  var port = process.env.VCAP_APP_PORT;	
  
  //Parse out Cloudant settings
  cloudant = env['cloudantNoSQLDB'][0].credentials;
}

var nano = require('nano')(cloudant.url);
var db = nano.db.use('user_login');

//Set path to Jade template directory
app.set('views', __dirname + '/views');

//Set path to Fonts directory
app.set('fonts', __dirname + '/fonts');

//Set path to JavaScript files
app.set('js', __dirname + '/js');

//Set path to CSS files
app.set('css', __dirname + '/css');

//Set path to images files
app.set('images', __dirname + '/images');

//Set path to static files
app.use(express.static(__dirname + '/public'));

//Bind the root '/' URL to the login page
app.get('/', function(req, res){
	res.render('login.jade', {title: 'Login'});
});

//Bind the '/patientExamination' URL to the drview page
app.get('/patientExamination', function(req, res){
	res.render('drView.jade', {title: 'Patient Examination'});
});

//Bind the '/patientVitals' URL to the nurseview page
app.get('/patientVitals', function (req, res){
	res.render('nurseView.jade', {title: 'Patient Pre-Examination'});
});

//Bind the '/scheduleAndBilling' URL to the receptionistView page
app.get('/billing-and-scheduling', function (req, res){
	res.render('receptionistView.jade', {title: 'Patient Billing and Scheduling'});
});

var server = app.listen(port, function(){
	console.log('Server running on port %d on host %s', server.address().port, host);
});

process.on('exit', function(){
	console.log('Server is shutting down!');
});