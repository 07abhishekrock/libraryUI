const supabase = require('../supabase');

const getAdminFromEmailId = async (id)=>{
  if(!id) return null;
  const {data , error} = await supabase.from('admin').select().eq('adminEmail' , id);
  if(data && !error){
    return data[0];
  }
  else{
    return null;
  }
}

module.exports = {
  getAdminFromEmailId
}