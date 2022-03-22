const URL = 'http://localhost:7000'

async function customFetchWrapper(endpoint , deviceId){
  const response = await fetch(endpoint , {
    method : 'POST',
    body : JSON.stringify({
      deviceId
    }),
    headers : {
      'Content-Type' : 'application/json'
    },
    credentials : 'include'
  });
  if(response.ok){
    return true;
  }
  return false;
}

async function toggleActiveForDevice(deviceId){
  try{

    const toggleActiveEndpoint = URL + '/api/device-toggle/active';
    const response = await customFetchWrapper(toggleActiveEndpoint , deviceId); 
    if(!response){
      return null;
    }
    return true;
  }
  catch(e){
    console.error(e);
    return null;
  }
}

async function toggleBlacklistForDevice(deviceId){
  try{

    const toggleBlacklistEndpoint = URL + '/api/device-toggle/blacklist';
    const response = await customFetchWrapper(toggleBlacklistEndpoint , deviceId);
    if(!response){
      return null;
    }
    return true;
  }
  catch(e){
    console.error(e);
    return null;
  }
}

function toggleRadioButton(radioDomElement){
  radioDomElement.checked = !radioDomElement.checked;
}



async function attachEventListenersToForms(){
  const forms = document.querySelectorAll('form[data-device-id]');
  (Array.from(forms)).forEach((form)=>{
    const deviceId = form.getAttribute('data-device-id');
    console.log(deviceId);
    form.addEventListener('change' , async (e)=>{
      if(e.target.id === 'toggle-active'){
        const isRequestOk = await toggleActiveForDevice(deviceId);
        if(!isRequestOk){
          toggleRadioButton(e.target);
        }
      }
      else if(e.target.id === 'toggle-blacklist'){
        const isRequestOk = await toggleBlacklistForDevice(deviceId);
        if(!isRequestOk){
          toggleRadioButton(e.target);
        }
      }
    })
  })
}

attachEventListenersToForms();
