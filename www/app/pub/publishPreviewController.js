angular.module("angControllers")
    .controller("publishPreviewController", [
        '$scope', 'posts', 'router', '$stateParams', 'chats',
        function($scope, posts, router, $stateParams, chats) {

            var chat;
            $scope.session = {};
            if ($stateParams.channelName) {
                chat = chats.getChat($stateParams.channelName);
                chat.getLastUnexpiredChatSession()
                .then(
                    function(chatSession) {
                        //angular.copy is necessary in order not to change 
                        //messages in chat session
                        angular.copy(chatSession, $scope.session);
                        log($scope.session === chatSession);
                    }
                );
            }   
            else {
                console.warn('channel name is required');
            }

            $scope.reset = function() {
                //TODO:
            };

            $scope.publishPost = function() {
                var data = {
                        chat_uuid: chat.channelName,
                        title: Date.now().toDateTime(),
                        chat: {
                            // duration_s: 324, -- todo: get from timer
                            messages: chat.lastUnexpiredChatSession.messages
                        }
                    };
                posts.publishPost(data).then(function (data) {
                    router.goto('publishSuccess', {postId: data.safe_id});
                });
            };

        }
    ]);
