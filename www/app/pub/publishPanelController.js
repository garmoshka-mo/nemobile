angular.module("angControllers")
    .controller("PublishPanelController", [
        '$scope', 'posts', 'router', '$stateParams', 'chats', 'timer', 'separator',
        function($scope, posts, router, $stateParams, chats, timer, separator) {

            var chat_uuid;

            $scope.preview = posts.preview;
            $scope.preview.session = {};

            separator.setMainFooter($('#main-footer'));

            initChat();

            function initChat() {
                var chat = chats.current;
                if (chat) init(chat);
                else router.goto('pubsList');

                function init(chat) {
                    chat_uuid = chat.channel;
                    chat.getLastUnexpiredChatSession()
                        .then(
                        function(chatSession) {
                            //angular.copy is necessary in order not to change
                            //messages in chat session
                            angular.copy(chatSession, $scope.preview.session);
                        }
                    );
                }
            }

            $scope.reset = function() {
                initChat();
            };

            $scope.back = function() {
                router.goto('pubsList');
            };

            $scope.publishPost = function() {
                var data = {
                    chat_uuid: chat_uuid,
                    title: $scope.preview.title || Date.now().toDateTime(),
                    chat: {
                        duration_s: Math.round(timer.lastDuration),
                        messages: $scope.preview.session.messages
                    }
                };
                posts.publishPost(data).then(function (data) {
                    router.goto('publishSuccess', {postId: data.safe_id, channel: $stateParams.channel});
                });
            };
        }
    ]);
