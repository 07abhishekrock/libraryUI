const supabase = require("../supabase");

async function isValidRfid(id){
  if(!id) return false;
  const {data , error} = await supabase.from('rfids').select().eq('tagId' , id);
  if(!error && data && data.length > 0) return data[0];
  return false;
}

async function getTypeOfRfid(id){
  const rfidValue = await isValidRfid(id);
  if(rfidValue){
    return rfidValue.type;
  }
  return null;
}


module.exports = {
  isValidRfid,
  getTypeOfRfid
};