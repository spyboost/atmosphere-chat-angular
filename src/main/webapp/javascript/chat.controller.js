angular.module('angular.atmosphere.chat', ['angular.atmosphere']).controller('ChatController', ChatController);

function ChatController($scope, atmosphereService){
  var vm = this;
  var socket;

  vm.model = {
    transport: 'websocket',
    messages: [],
    subscribed: false,
    message: null,
  };

  vm.submit = handleSubmit;
  vm.subscribe = handleSubscription;

  vm.request = {
    url: 'http://rumpel:7777/atmosphere-chat-angular-1.0.0-SNAPSHOT/chat',
    contentType: 'application/json',
    logLevel: 'debug',
    transport: 'websocket',
    trackMessageLength: true,
    reconnectInterval: 5000,
    enableXDR: true,
    timeout: 60000,
    onOpen: onRequestOpen,
    onClientTimeout: onRequestClientTimeout,
    onReopen: onRequestReopen,
    onTransportFailure: onRequestTransportFailure,
    onMessage: onRequestMessage,
    onClose: onRequestClose,
    onError: onRequestError,
    onReconnect: onRequestReconnect
  };

  //////////////////////////////////////////////////////////////////

  function onRequestOpen(response) {
    vm.model.transport = response.transport;
    vm.model.connected = true;
    vm.model.content = 'Atmosphere connected using ' + response.transport;
  };

  function onRequestClientTimeout(response){
    vm.model.content = 'Client closed the connection after a timeout. Reconnecting in ' + vm.request.reconnectInterval;
    vm.model.connected = false;
    socket.push(atmosphere.util.stringifyJSON({ author: vm.model.name || '', message: 'is inactive and closed the'
        + 'connection. Will reconnect in ' + vm.request.reconnectInterval }));
    setTimeout(function(){
      socket = atmosphereService.subscribe(vm.request);
    }, vm.request.reconnectInterval);
  };

  function onRequestReopen(response){
    vm.model.connected = true;
    vm.model.content = 'Atmosphere re-connected using ' + response.transport;
  };

  function onRequestTransportFailure(errorMsg, request){
    atmosphere.util.info(errorMsg);
    vm.request.fallbackTransport = 'long-polling';
    vm.model.header = 'Atmosphere Chat. Default transport is WebSocket, fallback is ' + vm.request.fallbackTransport;
  };

  function onRequestMessage(response){
    var responseText = response.responseBody;
    try{
      var message = atmosphere.util.parseJSON(responseText);
      if(!vm.model.logged && vm.model.name)
        vm.model.logged = true;
      else{
        var date = typeof(message.time) === 'string' ? parseInt(message.time) : message.time;
        vm.model.messages.push({author: message.author, date: new Date(date), text: message.message});
      }
    }catch(e){
      console.error("Error parsing JSON: ", responseText);
      throw e;
    }
  };

  function onRequestClose(response){
    vm.model.connected = false;
    vm.model.content = 'Server closed the connection after a timeout';
    socket.push(atmosphere.util.stringifyJSON({ author: vm.model.name, message: 'disconnecting' }));
  };

  function onRequestError(response){
    vm.model.content = "Sorry, but there's some problem with your socket or the server is down";
    vm.model.logged = false;
  };

  function onRequestReconnect(request, response){
    vm.model.content = 'Connection lost. Trying to reconnect ' + vm.request.reconnectInterval;
    vm.model.connected = false;
  };

  function handleSubscription () {
    socket = atmosphereService.subscribe(vm.request);
    vm.model.subscribed = true;
  }

  function handleSubmit () {
      if (vm.model.message) {
        if (!vm.model.name) {
            vm.model.name = vm.model.message;
        }

        socket.push(atmosphere.util.stringifyJSON( {author: vm.model.name, message: vm.model.message} ));
        vm.model.message='';
      }
  }
}
