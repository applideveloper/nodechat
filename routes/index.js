
/*
 * GET home page.
 */

// exports.index = function(req, res){
//   res.render('index', { title: 'Express' });
// };

/*モデル読み込み*/
var model = require('../models/user'),
    User  = model.User;

/*ログイン後ページ*/
exports.index = function(req, res){
    res.render('index', { title:'ログイン完了', user: req.session.user});
    console.log(req.session.user);
};

/*ユーザー登録機能*/
exports.add = function(req, res){
    var newUser = new User(req.body);
    newUser.save(function(err){
        if(err){
            console.log(err);
            res.redirect('back');
        }else{
            res.redirect('/');
        }
    });
};

/*ログイン機能*/
exports.login = function(req, res){
    var email    = req.query.email;
    var password = req.query.password;
    var query = { "email": email, "password": password };
    User.find(query, function(err, data){
        if(err){
            console.log(err);
        }
        if(data == ""){
            res.render('login', { title:'ログインページ' });
        }else{
            req.session.user = email;
            res.redirect('/');
        }
    });
};
