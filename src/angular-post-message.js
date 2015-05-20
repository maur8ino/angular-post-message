(function() {
  'use strict';
  var app;

  app = angular.module('ngPostMessage', ['ng']);

  app.provider('$postMessage', function() {
    var $postMessageProvider = {
      options: {
        showConsole: false
      },
      $get: function() {
        return angular.extend({}, $postMessageProvider.options);
      }
    };

    return $postMessageProvider;
  });

  app.run([
    '$window', '$rootScope', '$postMessage', 'postMessageService',
    function($window, $rootScope, $postMessage, postMessageService) {

      $rootScope.$on('$messageOutgoing', function(event, message, domain) {
        var sender;
        if (domain == null) {
          domain = "*";
        }
        sender = $rootScope.sender || $window.parent;
        return sender.postMessage(message, domain);
      });

      angular.element($window).bind('message', function(event) {
        var response;
        event = event.originalEvent || event;
        if (event && event.data) {
          response = null;
          $rootScope.sender = event.source;
          try {
            response = angular.fromJson(event.data);
          } catch (error) {
            if ($postMessage.showConsole) {
              console.error('ahem', error);
            }
            response = event.data;
          }
          $rootScope.$root.$broadcast('$messageIncoming', response);
          return postMessageService.messages(response);
        }
      });
    }
  ]);

  app.factory('postMessageService', [
    '$rootScope',
    function($rootScope) {
      var $messages, api;
      $messages = [];
      api = {
        messages: function(_message_) {
          if (_message_) {
            $messages.push(_message_);
            $rootScope.$digest();
          }
          return $messages;
        },
        lastMessage: function() {
          return $messages[$messages.length - 1];
        },
        post: function(message, domain) {
          if (!domain) {
            domain = "*";
          }
          return $rootScope.$broadcast('$messageOutgoing', message, domain);
        }
      };
      return api;
    }
  ]);

}).call(this);
