const supabase = require("../supabase");
const { findUserById } = require("./user");

async function getBookById(id){
  if(!id) return null;
  const {data , error} = await supabase.from('books').select().eq('bookId' , id);

  if(!error && data){
    return data[0];
  } 

  return null;
}

async function getBookByRfidId(){
  if(!id) return null;
  const {data , error} = await supabase.from('books').select().eq('rfidId' , id);

  if(!error && data && data.length > 0){
    return data[0];
  } 

  return null;
}

async function issueBookWithId(bookId , userId){
  if(!bookId || !userId) return null;
  const userWithCurrentId = await findUserById(userId);
  if(userWithCurrentId){
    const {data , error} = await supabase.from('books').update({
      issuedBy : userId,
      issuedTill : Date.now() + 7 * 24 * 3600 * 100
    })
    if(!error && data){
      return data[0];
    }
  }
  return null;
}

async function returnBookWithId(bookId , userId){
  if(!bookId || !userId) return null;
  const book = await getBookById(bookId);
  if(book && book.issuedBy === userId){

    const {data , error} = await supabase.from('books').update({
      issuedBy : null,
      issuedTill : null
    })
    if(!error && data){
      return data[0]
    }

  }
  return null;

}


module.exports = {
  issueBookWithId,
  returnBookWithId,
  getBookById,
  getBookByRfidId
}