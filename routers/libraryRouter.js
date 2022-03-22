const express = require('express');
const app = express.Router();

const { isValidRfid } = require('../src/utils/database/rfid');
const { getBookByRfidId, issueBookWithId, returnBookWithId } = require('../src/utils/database/books');
const { findUserByRfid } = require('../src/utils/database/user');

app.post('/login-user' , async (req , res)=>{
  const userId = req.body.userId;
  const loggedInUser = await loginUserWithId(userId);
  if(loggedInUser){
    return res.status(200).send({
      status : 1
    })
  }
  return res.status(400).send({
    status : 0
  })
})

app.post('/logout-user' , async (req , res)=>{
  const userId = req.body.userId;
  const loggedOutUser = await logoutUserWithId(userId);
  if(loggedOutUser){
    return res.status(200).send({
      status : 1
    })
  }
  return res.status(400).send({
    status : 0
  })
})

app.get('/valid-book/:rfid' , async (req , res)=>{
  const bookRfidTag = await isValidRfid(req.params.rfid);
  if(bookRfidTag){
    if(bookRfidTag.type === 'book') return res.status(200).send({status : 1});
  }
  return res.status(400).send({status : 0});
})

app.get('/valid-user/:rfid' , async (req , res)=>{
  const userRfidTag = await isValidRfid(req.params.rfid);
  if(userRfidTag){
    if(userRfidTag.type === 'user') return res.status(200).send({status : 1});
  }
  return res.status(400).send({status : 0});
})

app.get('/get-options/:rfid/:userId' , async (req , res)=>{
  const book = await getBookByRfidId(req.params.rfid);
  if(book){
    if(book.issuedBy === req.params.userId){
      return res.status(200).send({
        status : 1,
        options : 0
      })
    }
    return res.status(200).send({
      status : 1,
      options : 1
    })
  }
  return res.status(400).send({
    status : 0
  })
})

app.get('/command/:rfid/:userId/:option' , async(req , res)=>{
  const book = await getBookByRfidId(rfid);
  //0 stands for issue
  //1 stands for return
  if(book){
    switch(req.params.option){
      case '0' : {
        const issuedBook = await issueBookWithId(book.bookId , req.params.userId);
        if(issuedBook) return res.send({
          status : 1
        })
        return res.send({status : 0})
      }
      case '1' : {
        const returnedBook = await returnBookWithId(book.bookId , req.params.userId);
        if(returnedBook) return res.send({
          status : 1
        })
        return res.send({status : 0})
      }
    
    }
  }
  return res.status(400).send({
    status : 0
  })
})

app.get('/getUser/:userRfid' , async(req , res)=>{
  const userWithId = await findUserByRfid(req.params.userRfid);
  if(userWithId){
    return res.status(200).send({
      status : 1,
      user : userWithId.userId
    })
  }
  res.status(400).send({
    status : 0
  })
})

module.exports = app;