const jwt = require('jsonwebtoken');

const redirectIfNotLoggedIn = (req , res , next)=>{
  try{
    if(!req.cookies) throw new Error('Not Logged In');

    const decodedUser = jwt.verify(req.cookies.authCookie , process.env.SECRET_LOGIN_KEY);
    if(!decodedUser){
      res.redirect('/login'); 
      return;
    }
    req.session.userId = decodedUser.adminId;
    next();

  }
  catch(e){
    res.redirect('/login'); 
  }
}

module.exports = redirectIfNotLoggedIn;