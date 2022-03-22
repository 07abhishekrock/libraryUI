const supabase = require("../supabase");

async function findUserById(userId){
  if(!userId) return null;
  const {data , error} = await supabase.from('users').select().eq('userId' , userId);
  if(!error && data && data[0]){
    return data[0];
  }
  else return null;
}

async function findUserByRfid(rfid){
  if(!rfid) return null;
  const {data , error} = await supabase.from('users').select().eq('rfid' , rfid);
  if(!error && data && data[0]){
    return data[0];
  }
  else return null;
}

async function loginUserWithId(userId){
  if(!userId) return null;
  const {data , error} = await supabase.from('users').update({
    isLoggedIn : true
  }).eq('userId' , userId);
  if(!error && data) return data[0];
  else return null;
}

async function logoutUserWithId(userId){

  if(!userId) return null;
  const {data , error} = await supabase.from('users').update({
    isLoggedIn : false
  }).eq('userId' , userId);
  if(!error && data) return data[0];
  else return null;
}


module.exports = {
  loginUserWithId,
  logoutUserWithId,
  findUserById,
  findUserByRfid
};