const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const pug = require('pug');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const WebSocket = require('ws');
const http = require('http');

const redirectIfNotLoggedIn = require('./src/middlewares/redirectIfNotLoggedIn');
const storeUserInContext = require('./src/middlewares/storeUserInContext');
const {getAdminFromEmailId} = require('./src/utils/database/admin');
const {registerDeviceOnServer , setDeviceOnline, getCurrentDevicesList, setDeviceOffline, toggleDeviceActive, toggleDeviceBlacklist} = require('./src/utils/database/device');
const {handleWebSocketMessage , sendAllClientsConfirmation, sendAllClientsUpdatedList} = require('./src/utils/websocket/index');
const {createErrorResponse} = require('./src/utils/response');

const libraryRouter = require('./routers/libraryRouter');

dotenv.config({
  path : '.env'
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server })

app.use(session({secret: 'mySecret', resave: false, saveUninitialized: false}));

app.set('view engine' , 'pug');

app.use(express.static('public'));

app.use(express.urlencoded()); 
app.use(express.json())

app.use(cookieParser());


wss.on('connection' , (ws) => {
  ws.on('pong' , ()=>{
    ws.isAlive = true;
  })
  ws.on('message' , async (message)=>{
    await handleWebSocketMessage(wss , message); 
  })

  ws.send(JSON.stringify({
    type : 'set-up',
    data : 'Setup complete'
  }));
})

app.get('/login',(req , res)=>{
  const loginHTML = pug.compileFile('./src/templates/pages/login.pug');
  res.send(loginHTML({
    isLoginPage : true
  }));
})

app.post('/api/login' ,async (req , res)=>{
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password){
    res.status(400).send({
      error : 'Invalid or Empty Credentials',
      code : 400
    })
    return;
  }
  else{
    const admin = await getAdminFromEmailId(email);
    if(admin){

      const jwtSignCookie = jwt.sign({
        adminId : admin.adminId,
        createdAt : Date.now()
      } , process.env.SECRET_LOGIN_KEY , {
        expiresIn : '100h'
      })

      req.user = admin;
      let alertBody = {
        alertText : `Welcome back, ${admin.adminEmail}`,
        alertType : 'info'
      }

      req.session.alertBody = alertBody;
      res.cookie('authCookie', jwtSignCookie)
      .redirect('/')
    }
  }

})

app.use('/api/library' , libraryRouter);

app.use(redirectIfNotLoggedIn);
app.use(storeUserInContext);

app.get('/status' , async (req , res)=>{

  const allDevices = await getCurrentDevicesList();
  app.locals.devices = allDevices;

  const statusPageHTML = pug.compileFile('./src/templates/pages/status.pug');
  res.send(statusPageHTML({
    isLoginPage : false,
    user : req.session.user,
    alertBody : req.session.alertBody,
    devices : allDevices,
    toastObject : req.session.toastObject
  }))

})

app.get('/' , (req , res)=>{
  res.redirect('/status');
})

app.post('/device/ping' , async (req , res)=>{
  try{

    const deviceID = req.body.deviceID;
    const modelType = req.body.model || 'ESP-Based'
    
    const deviceData = await registerDeviceOnServer(deviceID , modelType);

    if(deviceData){

      await setDeviceOnline(deviceData);
      const allDevices = await getCurrentDevicesList();

      if(app.locals.devicePollingIntervalIDs && app.locals.devicePollingIntervalIDs[deviceID]){
        clearInterval(app.locals.devicePollingIntervalIDs[deviceID]);
      }
  
      if(app.locals.devices && app.locals.devices.filter(device=>device.deviceId === deviceID).length === 0){

        sendAllClientsConfirmation(wss , {
          deviceId : deviceID,
          question : `Device ${modelType}-${deviceID} is asking for connection. Allow ?`
        });

      }

      else{
        sendAllClientsUpdatedList(wss , allDevices);
      }

      res.send({status : 1 , message : 'Polling Success'});
      
      const intervalId = setInterval(async ()=>{
        const isDeviceOnAppLocals = app.locals.devicePollingIntervalIDs && app.locals.devicePollingIntervalIDs[deviceID];
        if(isDeviceOnAppLocals){
          console.log('made the device offline');
          await setDeviceOffline(deviceID);
          clearInterval(intervalId);
          const newDeviceList = await getCurrentDevicesList();
          sendAllClientsUpdatedList(wss , newDeviceList);
        }
      },10000)

      app.locals.devices = allDevices;
      app.locals.devicePollingIntervalIDs = app.locals.devicePollingIntervalIDs || {};
      app.locals.devicePollingIntervalIDs = {
        ...app.locals.devicePollingIntervalIDs,
        [deviceData.deviceId] : intervalId
      }

    }
    else throw new Error('Device could not be registered');
  }
  catch(e){
    console.log(e);
    res.send(createErrorResponse('Polling failed' , 400));
    return;
  }

});

app.post('/api/device-toggle/active' , async (req , res)=>{
  const deviceId = req.body.deviceId;
  console.log(deviceId);
  if(!deviceId){
    res.status(400).send({
      error : 'No Device ID found',
      statusCode : 400
    })
    return;
  }
  const {data , error} = await toggleDeviceActive(deviceId);
  if(!error && data){
    return res.status(200).send({
      status : 'ok',
      message : 'Toggled Active for device'
    })
  }
  else{
    return res.status(400).send({
      error,
      statusCode : 400
    })
  }
})

app.post('/api/device-toggle/blacklist' , async (req , res)=>{
  const deviceId = req.body.deviceId;
  if(!deviceId){
    res.status(400).send({
      error : 'No Device ID found',
      statusCode : 400
    })
    return;
  }
  const {data , error} = await toggleDeviceBlacklist(deviceId);
  if(!error && data){
    return res.status(200).send({
      status : 'ok',
      message : 'Toggled Blacklist for device'
    })
  }
  else{
    return res.status(400).send({
      error,
      statusCode : 400
    })
  }
})



server.listen(7000 , ()=>{
  console.log('listening on 7000');
})
