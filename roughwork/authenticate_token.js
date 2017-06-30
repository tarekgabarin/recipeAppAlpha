/// const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
/// npm install crypto-js --save


let salt = bcrypt.genSaltSync(10);

let securityData = {
  passHash: undefined
}

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, function(err, hash){
      if (err) throw err;
      securityData.passHash = hash;
  })
})

function data(username, password){
  this.username = username,
  this.password = passowrd
};

let authenticateToken = (req, res, next) => {

  let token = req.header('x-auth');

  User.findByToken()

}


//passport.use(new )


passport.use(new LocalStrategy(function(email, password, done){

  User.findOne({email: email}, (err, user) => {

    if (err) console.log(err);

    if (!user){
      return done(null, false, {message: "User is not registered"});
    }
    else {

      realPassword = String(user.password);

      let doesMatch = bcrypt.compare(password, realPassword, (err, result) => {
        if (err) throw err;
        return result
      });

      if (doesMatch){
        done(null, user)
      }
      else {
        return done(null, false, {message: 'Invalid Password'});
      }

    }



    userData._id = user._id.toHexString();

    });

    let passNum = String(this.username).charCodeAt(0);

  /// here is how bcrypt will do it


  /*

  if the passwords match, this function returns true, if they don't, it reutrns
  false;




  */





}))

/*

passport.use(new Strategy(

    function (username, password, done) {

      let userData = {

        creationDate: undefined,

        password: undefined,

        _id: = undefined

      }


      User.findOne({username: username}, (err, user) => {

        if (err) console.log(err);

        userData.creationDate = Number(user.creationDate);

        userData.password = String(user.password);

        userData._id = user._id.toHexString();

    });

    let luckyNum = String((Number(userData.creationDate) * 769) + 'TLL');

    let salty = bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(luckyNum, salt, function(err, hash){
          if (err) throw err;
          return hash
      })
    })();









    }







))
*/
