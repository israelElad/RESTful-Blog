//Please make sure the dependencies packages are installed!
let express = require("express");
let app = express();
// From now on. no need to specify ".ejs" on every file. !!!don't forget to install ejs!!!
app.set("view engine", "ejs");
//A must for using the post request body(so that req.body will return an object, not "undefined").
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public")); //include "public" directory

//Allows using HTTP verbs such as PUT or DELETE in HTML Forms, using the getter specified("_method") in the query string as the real request method.
let methodOverride = require("method-override");
app.use(methodOverride("_method"));

//Allows Sanitizing of inputs so that we can evaluate HTML elements in them without it being a security risk
let expressSanitizer = require("express-sanitizer");
app.use(expressSanitizer());

//DB setup
let mongoose = require("mongoose");
mongoose.set('useUnifiedTopology', true); //get rid of deprecated warnings
mongoose.set('useFindAndModify', false);  //get rid of deprecated warnings regarding findByIdAndUpdate/findByIdAndDelete...
//connects to the DB and initialize it if it doesn't exist.
mongoose.connect("mongodb://localhost/restful_blog", {useNewUrlParser: true});
//Schema setup
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now()}
});
//Model setup. An appropriate collection will be created too in the name "blogs"('Blog' pluralized and lowercase).
let Blog = mongoose.model("Blog", blogSchema);
// Example of manually creating a blog in the DB:
// Blog.create({
//     title: "Test blog title",
//     image: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=1.00xw:0.669xh;0,0.190xh&resize=980:*",
//     body: "It's impossible to pick favorites when it comes to dogs. Every single one of them deserves the title of man's best friend, and every single one of them deserves a life full of love, cuddles, and lots and lots of toys. As dog lovers, it's difficult to rank the cutest dog breeds. After all, what do you prioritize first? The paws? The ears? Something else? Everyone has a different opinion on the matter.\n" +
//         "\n" + "Obviously, our list of the cutest dog breeds is totally subjective and far from exhaustive. However, we think these pups deserve some recognition for being seriously adorable. From corgis and beagles to huskies and setters, these are the cutest dog breeds we wish we could smother with love. Looking for a new pup? Check out our roundups of the best family dogs and the most popular dog breeds too.",
// })

//GET request that redirects to homepage
app.get("/", function (req, res) {
    res.redirect("/blogs");
})

//RESTful Routes:

//REST "index" route: GET request to show all blogs
app.get("/blogs", function (req, res) {
    // Get all blogs from the DB
    Blog.find({}, function (err, blogsFound) {
        if (err) {
            console.log(err);
        } else {
            //render index.ejs, pass "allBlogs" variable as "blogs"
            res.render("index", {blogs: blogsFound})
        }
    })
})

//REST "new" route: GET request that shows form(renders) to create new blog
app.get("/blogs/new", function (req, res) {
    res.render("new");
});


//REST "create" route: POST request that adds a new campground to the DB. Then redirect to campgrounds page
//Will be called from the form action in new.js, which is called by GET to "/campgrounds/new".
app.post("/blogs", function (req, res) {
    //sanitize the blog input so that we can evaluate HTML elements in it without it being a security risk
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //create blog function(data, callback function). The data is simply req.body.blog object thanks to the input names in "new.ejs".
    Blog.create(req.body.blog
        , function (err, createdBlog) {
            if (err) {
                console.log(err)
                res.redirect("/blogs/new");
            } else {
                console.log("Blog Added:");
                console.log(createdBlog);
                res.redirect("/blogs");
            }
        });
});

//REST "show" route: GET request that shows more information about one blog using it's ID.
//Note: must come after "/blogs/new" route, otherwise "/blogs/new" will never be called(because 'new' will be treated as an ID)
app.get("/blogs/:id", function (req, res) {
    //find the specific blog using the inserted id
    Blog.findById(req.params.id, function (err, blogFound) {
        if (err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: blogFound});
        }
    })
})


//REST "edit" route: GET request that shows an edit form of one blog using it's ID.
app.get("/blogs/:id/edit", function (req, res) {
//find the specific blog using the inserted id
    Blog.findById(req.params.id, function (err, blogFound) {
        if (err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: blogFound});
        }
    })
})

//REST "update" route: PUT request that update a particular blog, then redirect somewhere
app.put("/blogs/:id", function (req, res) {
    //sanitize the blog input so that we can evaluate HTML elements in it without it being a security risk
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //find the specific blog using the inserted id
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, blogFound) {
        if (err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    })
})

//REST "destroy" route: DELETE request that delete a particular blog, then redirect somewhere
app.delete("/blogs/:id", function (req, res) {
    //find the specific blog using the inserted id
    Blog.findByIdAndDelete(req.params.id, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            console.log(req.params.id + " DELETED!");
            res.redirect("/blogs");
        }
    })
})


//Starts the server. It listens for requests.
app.listen(3000, function () {
    console.log("Server Has Started!");
})
