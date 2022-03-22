const supabase = require("../supabase");

async function findDeviceWithId(deviceId){
  const {data , error} = await supabase.from('devices').select().eq('deviceId' , deviceId);
  if(data && !error && data.length > 0){
    return data[0];
  }
}

async function getCurrentDevicesList(){
  const {data , error} = await supabase.from('devices').select();
  if(data && !error) return data;
  else return [];
}

async function blackListDevice(deviceId){

  try{
    await supabase.from('devices').update({
      isBlacklisted : true
    }).eq("deviceId" , deviceId);
  }
  catch(e){
    return;
  }

}

async function toggleDeviceActive(deviceId){
  const deviceFound = await findDeviceWithId(deviceId);
  if(!deviceFound) return {data : null , error : 'Device not found'}
  return await supabase.from('devices').update({
    isActive : !deviceFound.isActive
  }).eq('deviceId' , deviceId);
}

async function toggleDeviceBlacklist(deviceId){
  const deviceFound = await findDeviceWithId(deviceId);
  if(!deviceFound) return {data : null , error : 'Device not found'}
  return await supabase.from('devices').update({
    isBlacklisted : !deviceFound.isBlacklisted
  }).eq('deviceId' , deviceId);
}

async function registerDeviceOnServer(deviceId , model){
  if(!deviceId) return null;

  const deviceWithGivenId = await findDeviceWithId(deviceId)

  const isDeviceAlreadyRegistered = typeof deviceWithGivenId !== 'undefined';

  if(!isDeviceAlreadyRegistered){
    
    const {data , error} = await supabase.from('devices').insert({
      deviceId,
      model,
      isBlacklisted : false
    });
    if(data && !error) return data[0];
    return null;

  }
  else{
    return deviceWithGivenId;
  }

}

async function setDeviceOnline(deviceData){
  await supabase.from('devices').update({
    isOnline : true
  }).eq('deviceId' , deviceData.deviceId);
}

async function setDeviceOffline(deviceId){
  await supabase.from('devices').update({
    isOnline : false
  }).eq('deviceId' , deviceId);
}

module.exports = {
  registerDeviceOnServer ,
  setDeviceOnline,
  getCurrentDevicesList,
  blackListDevice,
  setDeviceOffline,
  toggleDeviceActive,
  toggleDeviceBlacklist
}