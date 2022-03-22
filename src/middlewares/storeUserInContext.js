const supabase = require("../utils/supabase");

module.exports = async function (req , res, next){
  const userId = req.session?.userId;
  if(userId){
    const {data , error} = await supabase.from('admin').select().eq('adminId' , userId);
    if(data && !error) req.session.user = data[0]
  }
  next();
}