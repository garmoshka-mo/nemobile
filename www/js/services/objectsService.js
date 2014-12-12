services
.factory('objects', ['$rootScope', function($rootScope) {
    return { 
        chat: {
            senderId: null,
            
            getLastUnexpiredChatSession: function() {
                
                if (this.lastChatSessionIndex !== undefined) {
                    var lastChatSession = this.chatSessions[this.lastChatSessionIndex.toString()]
                }

                if (lastChatSession) {
                    return lastChatSession;
                }
                else {
                    // storage.getChatSession(this.senderId, this.lastChatSessionIndex)
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