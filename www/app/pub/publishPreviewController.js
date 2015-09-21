angular.module("angControllers")
    .controller("publishPreviewController", [
        '$scope', 'posts', 'router', '$stateParams', 'chats', 'externalChat',
        function($scope, posts, router, $stateParams, chats, externalChat) {

            var chat_uuid;
            $scope.session = {};
            
            if ($stateParams.type == 'internal') 
              init(chats.getChat($stateParams.channel));
            else if ($stateParams.type == 'external') 
              init(externalChat.current_instance);
            else router.goto('pubsList');
              
            function init(chat) {
                  chat_uuid = chat.channel;
                  chat.getLastUnexpiredChatSession()
                  .then(
                    function(chatSession) {
                        //angular.copy is necessary in order not to change 
                        //messages in chat session
                        angular.copy(chatSession, $scope.session);
                    }
                );
            }

            $scope.reset = function() {
                //TODO:
            };

            $scope.publishPost = function() {
                var data = {
                        chat_uuid: chat_uuid,
                        title: Date.now().toDateTime(),
                        chat: {
                            // duration_s: 324, -- todo: get from timer
                            messages: $scope.session.messages
                        }
                    };
                posts.publishPost(data).then(function (data) {
                    router.goto('publishSuccess', {postId: data.safe_id});
                });
            };

        }
    ]);
