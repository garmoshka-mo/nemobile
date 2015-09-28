angular.module("angControllers")
    .controller("publishPreviewController", [
        '$scope', 'posts', 'router', '$stateParams', 'chats', 'externalChat', 'timer', 'separator',
        function($scope, posts, router, $stateParams, chats, externalChat, timer, separator) {

            var chat_uuid;
            $scope.title = "";
            $scope.session = {};

            router.backHandler = function() {
                router.goto('pubsList');
            };

            separator.setBottomFooter($('#bottom-footer'));
            separator.resize('smallChat');

            initChat();

            function initChat() {
                var chat = chats.getCurrentChat();
                if (chat) init(chat);
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
            }

            $scope.reset = function() {
                initChat();
            };

            $scope.publishPost = function() {
                var data = {
                        chat_uuid: chat_uuid,
                        title: $scope.title || Date.now().toDateTime(),
                        chat: {
                            duration_s: Math.round(timer.lastDuration),
                            messages: $scope.session.messages
                        }
                    };
                posts.publishPost(data).then(function (data) {
                    router.goto('publishSuccess', {postId: data.safe_id, channel: $stateParams.channel});
                });
            };

            //Limit title to 140 characters.
            $scope.$watch('title', function(newVal, oldVal) {
                if(newVal.length > 140) {
                    $scope.title = oldVal;
                }
            });
        }
    ]);
