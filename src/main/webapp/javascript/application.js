angular.module('angular.atmosphere.chat', ['angular.atmosphere']);

function ChatController($scope, atmosphereService){
  $scope.model = {
    transport: 'websocket',
    messages: []
  };

  var request = {
    url: '/chat',
    contentType : 'application/json',
    logLevel : 'debug',
    transport : 'websocket',
    trackMessageLength : true,
    reconnectInterval : 5000,
    enableXDR: true,
    timeout : 60000
  };

  var subSocket;

  request.onOpen = function(response) {
    $scope.model.transport = response.transport;
    $scope.model.connected = true;
    $scope.model.content = 'Atmosphere connected using ' + response.transport;
  };

  request.onClientTimeout = function(response) {
    $scope.model.content = 'Client closed the connection after a timeout. Reconnecting in ' + request.reconnectInterval;
    $scope.model.connected = false;
    subSocket.push(atmosphere.util.stringifyJSON({ author: author, message: 'is inactive and closed the connection. Will reconnect in ' + request.reconnectInterval }));
    setTimeout(function(){
      subSocket = atmosphereService.subscribe(request);
    }, request.reconnectInterval);
  };

  request.onReopen = function(response) {
    $scope.model.connected = true;
    $scope.model.content = 'Atmosphere re-connected using ' + response.transport;
  };

  <!-- For demonstration of how you can customize the fallbackTransport using the onTransportFailure function -->
  request.onTransportFailure = function(errorMsg, request) {
    atmosphere.util.info(errorMsg);
    request.fallbackTransport = 'long-polling';
    $scope.model.header = 'Atmosphere Chat. Default transport is WebSocket, fallback is ' + request.fallbackTransport;
  };

  request.onMessage = function (response) {
    var message = response.responseBody;
    try {
      var json = atmosphere.util.parseJSON(message);
    } catch (e) {
      console.error("Error parsing JSON: ", message);
      throw e;
    }

    if (!$scope.model.logged && $scope.model.name) {
      $scope.model.logged = true;
    } else {
      var date = typeof(json.time) === 'string' ? parseInt(json.time) : json.time;
      addMessage(json.author, json.message, new Date(date));
    }
    $scope.model.inputEnabled = true;
  };

  function addMessage(author, message, datetime) {
    $scope.model.messages.push({author: author, date: datetime, text: message});
  }

  request.onClose = function(response) {
    $scope.model.connected = false;
    $scope.model.content = 'Server closed the connection after a timeout';
    subSocket.push(atmosphere.util.stringifyJSON({ author: $scope.model.name, message: 'disconnecting' }));
  };

  request.onError = function(response) {
    $scope.model.content = "Sorry, but there's some problem with your socket or the server is down";
    $scope.model.logged = false;
  };

  request.onReconnect = function(request, response) {
    $scope.model.content = 'Connection lost. Trying to reconnect ' + request.reconnectInterval;
    $scope.model.connected = false;
  };

  subSocket = atmosphereService.subscribe(request);

  var input = $('#input');
  input.keydown(function(event) {
    var me = this;
    var msg = $(me).val();
    if(msg && msg.length > 0 && event.keyCode === 13) {
      $scope.$apply(function(){
        // First message is always the author's name
        if (!$scope.model.name)
          $scope.model.name = msg;

        subSocket.push(atmosphere.util.stringifyJSON({author: $scope.model.name, message: msg}));
        $(me).val('');

        $scope.model.inputEnabled = false;
      });
    }
  });
}
