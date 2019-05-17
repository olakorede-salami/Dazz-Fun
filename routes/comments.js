var express = require("express"),
     router = express.Router({mergeParams: true}), //adding this option to tie up the compground id with a comment
     Dazzfun = require("../models/dazzfun"),
     Comment = require("../models/comment"),
     middleware = require("../middleware"); // index.js is required by default

// Comments New
router.get("/new" , middleware.isLoggedIn, function(req, res) {
    // lookup dazzfuns using ID
    Dazzfun.findById(req.params.id, function(err, dazzfun){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {dazzfun: dazzfun});
        }
    });
});

// Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup dazzfuns using ID
    Dazzfun.findById(req.params.id, function(err, dazzfun){
        if(err){
            console.log(err);
            res.redirect("/dazzfuns");
        } else {
            // create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    console.log(comment);
                    // connect new comment to dazzfun
                    dazzfun.comments.push(comment);
                    dazzfun.save();
                    // redirect dazzfun show page
                    req.flash("success", "Successfully added comment");
                    res.redirect('/dazzfuns/' + dazzfun.id);
                }
            });
        }
    });
});

// Comment Edit Route        
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err){
            res.redirect("back");
        } else {
    res.render("comments/edit", {dazzfun_id: req.params.id, comment: foundComment});
   }
 });
});
    

// Comment Update Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    if(err){
        res.redirect("back");
    }  else {  
        res.redirect("/dazzfuns/" + req.params.id); // sending back to show page
    }
  });
});


// Comment Destroy Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
        res.redirect("back");
    }  else {  
        req.flash("success", "Comment deleted");
        res.redirect("/dazzfuns/" + req.params.id);
    }
  });
});

module.exports = router;
