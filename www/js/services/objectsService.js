services
.factory('objects', ['$rootScope', 'storage', function($rootScope, storage) {
    return { 
        chat: {
            getLastUnexpiredChatSession: function() {
                var found = false;
                var self = this;

                if (this.lastChatSessionIndex !== undefined) {
                    this.lastChatSession = this.chatSessions[this.lastChatSessionIndex];
                    found = this.lastChatSession ? true : false;
                }

                if (!found) {
                    storage.getChatSession(this.senderId, this.lastChatSessionIndex)
                    .then(function(chatSession) {
                        self.lastChatSession = chatSession;
                        self.chatSessions[self.lastChatSessionIndex] = chatSession;
                        console.log($rootScope.user);
                    })
                }
            },

            getChatTitle: function() {
                if ($rootScope.user.friends[this.senderId]) {
                    return $rootScope.user.friends[this.senderId].name;
                }
                else {
                    return this.senderId;
                }
            }
        },

        chatSession: {
            isReplied: false,
            isExpired: false,
            whenExpires: null,

            getLastMessage: function() {
                if (this.messages.length) {
                    var messagesAmount = this.messages.length;
                    return this.messages[messagesAmount - 1].text;
                }
            }
        }

    }
}])