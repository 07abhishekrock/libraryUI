const handleToastClose = ()=>{
  const toastWrapper = document.querySelector('.toast-wrapper');
  const toast = document.querySelector('.toast');

  if(toast.classList.contains('show')){

    toastWrapper.classList.add('hide');
    toastWrapper.classList.remove('show');

  }
  else {
    toastWrapper.classList.remove('show');
    toastWrapper.classList.add('show');
  }
}

document.querySelector('[data-bs-dismiss="toast"]')
.addEventListener('click' , ()=>{
  handleToastClose();
})



const ws = new WebSocket('ws://localhost:7000');

const confirmDevice = (id)=>{
  ws.send(JSON.stringify({
    type : 'granted-device',
    data : {
      deviceId : id
    }
  }))
  handleToastClose();
}

const blackListDevice = (id)=>{
  ws.send(JSON.stringify({
    type : 'refused-device',
    data : {
      deviceId : id
    }
  }))
  handleToastClose();
}

const handleConfirmation = (messageObject)=>{
  const messageData = messageObject.data;
  const toastHeaderElement = document.querySelector('.toast-wrapper .toast-header strong');
  const toastMessageElement = document.querySelector('.toast-wrapper .toast-body');
  document.querySelector('.toast').classList.remove('hide');
  document.querySelector('.toast').classList.add('show');

  document.querySelector('.toast-wrapper').classList.remove('hide');
  document.querySelector('.toast-wrapper').classList.add('show');

  toastHeaderElement.innerText = 'Confirm This';
  toastMessageElement.innerHTML = `
    <h3 class="mb-3">${messageData.question}</h3>
    <div class="d-flex justify-content-start gap-4 my-2">
      <button class="btn btn-primary" onClick='confirmDevice("${messageData.deviceId}")'>Yes</button>
      <button class="btn btn-danger" onClick='blackListDevice("${messageData.deviceId}")'>No</button>
    </div>
  `;
}

const handleDeviceListUpdate = (newUpdateList)=>{
  const statusWrapper = document.querySelector('#statusWrapper');
  if(!statusWrapper) return;

  const html = newUpdateList.reduce((constructedHTML,device)=>{
    const isOnlineChecked = device.isOnline ? 'checked' : undefined;
    const isBlacklistChecked = device.isBlacklisted ? 'checked' : undefined;
    const isActiveChecked = device.isActive ? 'checked' : undefined;

    const imageSrc = isOnlineChecked ? '/assets/onlineDevice.png' : '/assets/offlineDevice.png';

    constructedHTML += `
    <div class="card p-0" style="width:18rem">
      <form class="border border-1 border-bottom-0 border-end-0 border-start-0 card-text p-2" data-device-id=${device.deviceId}>
        <img class="deviceImage pb-4" src="${imageSrc}">
        <div class="d-flex justify-content-between p-2 pb-3">
        <span>isOnline</span>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="toggle-online" disabled="true" ${isOnlineChecked ? 'checked="checked"' : ''}">
            <label class="form-check-label" for="toggle-online"></label>
          </div>
        </div>
        <div class="d-flex justify-content-between p-2">
          <span>isActive</span>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="toggle-active" ${isActiveChecked ? 'checked="checked"' : ''} ${isBlacklistChecked ? 'disabled="true"' : ""}>
            <label class="form-check-label" for="toggle-active"></label>
          </div>
        </div>
          <div class="d-flex justify-content-between p-2">
            <span>isBlacklisted</span>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" id="toggle-blacklist" ${isBlacklistChecked ? 'checked="checked"' : ''}>
              <label class="form-check-label" for="toggle-blacklist"></label>
            </div>
          </div>
        </form>
        </div>
    `; 
    return constructedHTML;
  },'')


  statusWrapper.innerHTML = html;


}



ws.onmessage = (message)=>{
  try{
    const messageObject = JSON.parse(message.data);
    const messageType = messageObject && messageObject.type;
    
    if(messageType === 'asking-confirmation'){
      handleConfirmation(messageObject);
    }
    else if(messageType === 'update-devices'){
      handleDeviceListUpdate(messageObject.data);
    }

  }
  catch(e){
    console.error(e);
    return null;
  }
}