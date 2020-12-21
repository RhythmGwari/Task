var express = require("express"),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	expressSanitizer = require("express-sanitizer"),
	passport = require("passport"),
	methodOverride = require("method-override"),
	cookieSession = require('cookie-session'),
	fetch = require("node-fetch");
var GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzk5zMgM7fN256HREVTOp-Xr2lsl5blhoy1s4y9rRoEEhproJ6xPdv_Qw/exec";



require("./passport-setup");

//APP CONFIG
var app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose.set('useFindAndModify', false);
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
mongoose.connect("mongodb://localhost/blog_app", {
	useNewUrlParser : true,
	useUnifiedTopology : true
});

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieSession({
	name: 'AnimeFreaks',
	keys: ['key1', 'key2']
  }));

//MONGOOSE MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	
	body : String,
	created : {type: Date, default : Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);




//RESTfull ROUTES
app.get("/", function(req, res){
	res.redirect("/blogs");
});
// INDEX ROUTE
app.get("/blogs" , function(req, res){
	Blog.find({},function(err, blogs){
		if(err){
			console.log(err);
		}else{
			res.render("index", {blogs:blogs});
		}
	});
	
});

app.get("/blogs/new", function(req, res){
	res.render("new");
});

//CREATE- NEW FORM ROUTE
app.post("/blogs",function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}else{
			res.redirect("/blogs");
		}
	});
});
//SHOW ROUTE
app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id, function(err, foundblog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show",{blog:foundblog});
		}
	});
});
//EDIT- TO EDIT THE EXISTING BLOG
app.get("/blogs/:id/edit", function(req, res){
		Blog.findById(req.params.id, function(err, foundblog){
			if(err){
				res.redirect("/blogs");
			}else{
			res.render("edit",{blog: foundblog});
			}
		});
	});
//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
   req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog){
       if(err){
           console.log(err);
       } else {
         var showUrl = "/blogs/" + blog._id;
         res.redirect(showUrl);
       }
   });
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
});



app.get("/signUp", function(req, res){
	res.render("register");
});
app.post("/save", function(req, res){
	var userName = req.body.userName;
	var email    = req.body.email;
	var password = req.body.password;
	

	// Integrating to google spreadsheet
	var url = `${GOOGLE_SHEET_URL}?Name=${encodeURIComponent(userName)}&Email=${encodeURIComponent(email)}&Password=${encodeURIComponent(password)}`;
	fetch(url).then((res) => res.json()).then((res) => console.log("google spreadsheet response: ", {res})).catch((e) => console.error(e));
	res.send("successful submission")
});

app.get("/signIn", function(req, res){
	res.render("login");
});
app.post("/login", passport.authenticate('google',{failureRedirect:"/", successRedirect:"/blogs"}),
function(req, res){	
	res.send("login successful");
});

app.get("/failed", function(req, res){
	res.send("You failed to login");
});

app.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/ ' }),
  function(req, res) {
    // Successful authentication, redirect home.
	res.redirect('/blogs/new');
  });
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});
app.listen(3000, function(){
	console.log("server started");
});