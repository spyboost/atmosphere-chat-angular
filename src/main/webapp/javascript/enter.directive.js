angular.module('angular.atmosphere').directive('atmEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.atmEnter, {'event': event});
                    });
                    event.preventDefault();
                }
            });
        };
    });
