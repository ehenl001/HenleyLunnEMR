/*eslint-env node, express, nano*/
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

var express = require("express");
var app = express();
var http = require("http");

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
  cloudant = env["cloudantNoSQLDB"][0].credentials;
}

var nano = require("nano")(cloudant.url);
var db = nano.db.use("user_login");

//variables for the sso
var passport = require("passport");
var OpenIDConnectStrategy = require("passport-idaas-openidconnect").IDaaSOIDCStrategy;  


//for the sso
app.use(express.cookieParser());
app.use(express.session({ secret: "keyboard cat" }));
app.use(passport.initialize());
app.use(passport.session()); 

passport.serializeUser(function(user, done) {
   done(null, user);
}); 

passport.deserializeUser(function(obj, done) {
   done(null, obj);
});         

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.  
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
var ssoConfig = services.SingleSignOn[0]; 
var client_id = ssoConfig.credentials.clientId;
var client_secret = ssoConfig.credentials.secret;
var authorization_url = ssoConfig.credentials.authorizationEndpointUrl;
var token_url = ssoConfig.credentials.tokenEndpointUrl;
var issuer_id = ssoConfig.credentials.issuerIdentifier;
var callback_url = "https://HenleyLunnEMR.mybluemix.net/auth/sso/callback";        

var OpenIDConnectStrategy = require("passport-idaas-openidconnect").IDaaSOIDCStrategy;
var Strategy = new OpenIDConnectStrategy({
                 authorizationURL : authorization_url,
                 tokenURL : token_url,
                 clientID : client_id,
                 scope: "openid",
                 response_type: "code",
                 clientSecret : client_secret,
                 callbackURL : callback_url,
                 skipUserProfile: true,
                 issuer: issuer_id}, 
	function (iss, sub, profile, accessToken, refreshToken, params, done){
	         	process.nextTick(function (){
		profile.accessToken = accessToken;
		profile.refreshToken = refreshToken;
		done(null, profile);
         	})
}); 

passport.use(Strategy); 
app.get("/login", passport.authenticate("openidconnect", {})); 
          
function ensureAuthenticated(req, res, next) {
	if(!req.isAuthenticated()) {
	          	req.session.originalUrl = req.originalUrl;
		res.redirect("/login");
	} else {
		return next();
	}
}

app.get("/auth/sso/callback",function(req,res,next) {
	    var redirect_url = "/";
            passport.authenticate("openidconnect",{
                 successRedirect: redirect_url,
                 failureRedirect: "/failure",
          })(req,res,next);
        });

//Set path to Jade template directory
app.set("views", __dirname + "/views");

//Set path to Fonts directory
app.set("fonts", __dirname + "/fonts");

//Set path to JavaScript files
app.set("js", __dirname + "/js");

//Set path to CSS files
app.set("css", __dirname + "/css");

//Set path to images files
app.set("images", __dirname + "/images");

//Set path to static files
app.use(express.static(__dirname + "/public"));

//Bind the root '/' URL to the home page
app.get("/", function(req, res){
	res.render("index.jade", {title: "Home Page"});
});

//Bind the '/patientExamination' URL to the drview page
app.get("/patientExamination", function(req, res){
	res.render("drView.jade", {title: "Patient Examination"});
});

//Bind the '/patientVitals' URL to the nurseview page
app.get("/patientVitals", function (req, res){
	res.render("nurseView.jade", {title: "Patient Pre-Examination"});
});

//Bind the '/scheduleAndBilling' URL to the receptionistView page
app.get("/billing-and-scheduling", function (req, res){
	res.render("receptionistView.jade", {title: "Patient Billing and Scheduling"});
});

var server = app.listen(port, function(){
	console.log("Server running on port %d on host %s", server.address().port, host);
});

process.on("exit", function(){
	console.log("Server is shutting down!");
});