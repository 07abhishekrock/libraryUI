//the format of message sent from server and received by server is as follows
//type : any of the following : 

const {getCurrentDevicesList , blackListDevice} = require('../database/device');

const MESSAGE_TYPES = {
  DEVICE_ASKING_FOR_CONNECTION : 'asking-for-connection', 
  DEVICE_CONNECTION_GRANTED : 'granted-device',
  DEVICE_CONNECTION_REFUSED : 'refused-device',
  ASKING_CONFIRMATION : 'asking-confirmation'
}

async function sendAllClientMessages(wss , messageType , messageBody){
  Array.from(wss.clients).forEach((client)=>{
    client.send(JSON.stringify({
      type : messageType,
      data : messageBody
    }))
    return true;
  })
}

async function sendAllClientsConfirmation(wss , confirmationBody){
  const {question , deviceId} = confirmationBody;
  sendAllClientMessages(wss , MESSAGE_TYPES.ASKING_CONFIRMATION , {
    question,
    deviceId
  })
}

async function sendAllClientsUpdatedList(wss , newList){
  sendAllClientMessages(wss , 'update-devices' , newList);
}

async function handleWebSocketMessage(wss , message){
  try{

    if(message){
      
      const messageBody = JSON.parse(message);
      const deviceId = messageBody.data.deviceId;

      switch(messageBody.type){
        case MESSAGE_TYPES.DEVICE_CONNECTION_GRANTED : {
          const newDeviceList = await getCurrentDevicesList();
          sendAllClientsUpdatedList(wss , newDeviceList);
          break;
        }
        case MESSAGE_TYPES.DEVICE_CONNECTION_REFUSED : {
          await blackListDevice(deviceId);
          const newDeviceList = await getCurrentDevicesList();
          sendAllClientsUpdatedList(wss , newDeviceList);
          break;
        }
      }
      
    }
  }
  catch(e){
    console.error(e);
  }
}


module.exports = {
  handleWebSocketMessage,
  sendAllClientsConfirmation,
  sendAllClientsUpdatedList,
  MESSAGE_TYPES
}