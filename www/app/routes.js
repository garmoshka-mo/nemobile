angular.module("angApp").config(["$stateProvider", "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider) {
        //$urlRouterProvider.otherwise("signinup/in");
        // $animate.enabled(false);
        $stateProvider
            .state("start", {
                url: "",
                views: {
                    "title": {
                        template: "dub.ink"
                    },
                    "content": {
                        templateUrl: "partials/start/content.html?"+version,
                        controller: "startController"
                    }
                }
            })
            .state("signin", {
                url: "/signinup/:inOrUp",
                views: {
                    "title": {
                        template: ""
                    },
                    "content": {
                        controller: "signinupController",
                        templateUrl: "partials/signinup/content.html?"+version
                    }
                }
            })
            .state("signup", {
                url: "/signup",
                views: {
                    "title": {
                        template: "Регистрация"
                    },
                    "content": {
                        controller: "registrationController",
                        templateUrl: "partials/signup/content.html?"+version
                    }
                }
            })
            .state("chats", {
                url: "/chats",
                views: {
                    "title": {
                        template: "Чаты"
                    },
                    "content": {
                        controller: "chatsController",
                        templateUrl: "partials/chats/content.html?"+version
                    }
                }
            })
            .state("chat", {
                url: "/chat?channelName&messageText&senderId&fromState&chatType",
                views: {
                    "title": {
                        template: "Чат"
                    },
                    "content": {
                        controller: "chatController",
                        templateUrl: "app/chats/chat.html?"+version
                    }
                }
            })
            .state("random", {
                url: "/random",
                views: {
                    "title": {
                        template: "Чат наугад - DUB.iNK"
                    },
                    "content": {
                        controller: "randomController",
                        templateUrl: "app/chats/random.html?"+version
                    }
                }
            })
            .state("exit", {
                url: "/exit",
                views: {
                    "title": {
                        template: "Выход"
                    },
                    "content": {
                        controller: "exitController",
                        templateUrl: "partials/exit/content.html?"+version
                    }
                }
            })
            .state("friendSearch", {
                url: "/friendSearch?stringToSearch",
                views: {
                    "title": {
                        template: "Поиск контакта"
                    },
                    "content": {
                        controller: "friendSearchController",
                        templateUrl: "partials/friendSearch/content.html?"+version
                    }
                }
            })
            .state("localForage", {
                url: "/localForage",
                views: {
                    "title": {
                        template: "Local Forage Test"
                    },
                    "content": {
                        controller: "localForageController",
                        templateUrl: "app/utils/localForage.html?"+version
                    }
                }
            })
            .state("stickersGallery", {
                url: "/stickersGallery?fromChat",
                views: {
                    "title": {
                        template: "Галерея стикеров"
                    },
                    "content": {
                        controller: "stickersGalleryController",
                        templateUrl: "partials/stickersGallery/content.html?"+version
                    }
                }
            })
            .state("addImage", {
                url: "/addImage?imageURL&categoryId",
                views: {
                    "title": {
                        template: "Добавить изображение"
                    },
                    "content": {
                        controller: "addImageController",
                        templateUrl: "partials/addImage/content.html?"+version
                    }
                }
            })
            .state("friends", {
                url: "/friends",
                views: {
                    "title": {
                        template: "Контакты"
                    },
                    "content": {
                        controller: "friendsController",
                        templateUrl: "partials/friends/content.html?"+version
                    }
                }
            })
            .state("phoneRegistration", {
                url: "/phoneRegistration",
                views: {
                    "title": {
                        template: "Регистрация номера"
                    },
                    "content": {
                        controller: "phoneRegistrationController",
                        templateUrl: "partials/phoneRegistration/content.html?"+version
                    }
                }
            })
            .state("phoneRegistrationUser", {
                url: "/phoneRegistrationUser",
                views: {
                    "title": {
                        template: "Регистрация номера"
                    },
                    "content": {
                        controller: "phoneRegistrationUserController",
                        templateUrl: "partials/phoneRegistrationUser/content.html?"+version
                    }
                }
            })
            .state("settings", {
                url: "/settings",
                views: {
                    "title": {
                        template: "Настройки"
                    },
                    "content": {
                        controller: "settingsController",
                        templateUrl: "partials/settings/content.html?"+version
                    }
                }
            })
            .state("invitation", {
                url: "/invitation?friendIndex&senderId",
                views: {
                    "title": {
                        template: "Приглашение"
                    },
                    "content": {
                        controller: "invitationController",
                        templateUrl: "partials/invitation/content.html?"+version
                    }
                }
            })
            .state("loadAvatar", {
                url: "/loadAvatar",
                views: {
                    "title": {
                        template: "Загрузка аватарки"
                    },
                    "content": {
                        controller: "loadAvatarController",
                        templateUrl: "partials/loadAvatar/content.html?"+version
                    }
                }
            })
            .state("showImage", {
                url: "/showImage?link",
                views: {
                    "title": {
                        template: "Просмотр изображения"
                    },
                    "content": {
                        controller: "showImageController",
                        templateUrl: "partials/showImage/content.html?"+version
                    }
                }
            })
            .state("addVirtualChat", {
                url: "/addVirtualChat?friendIndex",
                views: {
                    "title": {
                        template: "Создание чата"
                    },
                    "content": {
                        controller: "addVirtualChatController",
                        templateUrl: "partials/addVirtualChat/content.html?"+version
                    }
                }
            })
            .state("chatInfo", {
                url: "/chatInfo?senderId",
                views: {
                    "title": {
                        template: "Информация о чате"
                    },
                    "content": {
                        controller: "chatInfoController",
                        templateUrl: "partials/chatInfo/content.html?"+version
                    }
                }
            })
            .state("about", {
                url: "/about/:page",
                views: {
                    "title": {
                        template: "О проекте"
                    },
                    "content": {
                        controller: "aboutController",
                        templateUrl: "partials/about/content.html?"+version
                    }
                }
            })
            .state("virtualChat", {
                url: "/virtualChat?at",
                views: {
                    "title": {
                        template: "Виртуальный чат"
                    },
                    "content": {
                        controller: "virtualChatController",
                        templateUrl: "partials/virtualChat/content.html?"+version
                    }
                }
            })
            .state("updateProfile", {
                url: "/updateProfile",
                views: {
                    "title": {
                        template: "Обновления профиля"
                    },
                    "content": {
                        controller: "updateProfileController",
                        templateUrl: "partials/updateProfile/content.html?"+version
                    }
                }
            })
            .state("vkLogin", {
                url: "/vkLogin?access_token$expires_in&user_id",
                views: {
                    "title": {
                        template: "Обновления профиля"
                    },
                    "content": {
                        controller: "vkLoginController",
                        templateUrl: "partials/vkLogin/content.html?"+version
                    }
                }
            })
            .state("preloader", {
                url: "/preloader/:stateToGo",
                views: {
                    "title": {
                        template: ""
                    },
                    "content": {
                        controller: "preloaderController",
                        templateUrl: "partials/preloader/content.html?"+version
                    }
                }
            })
            .state("homepage", {
                url: "/homepage",
                views: {
                    "title": {
                        template: "dubink"
                    },
                    "content": {
                        controller: "homepageController",
                        templateUrl: "partials/homepage/content.html?"+version
                    }
                }
            })
            .state("createFastChat", {
                //Fast Chat is a chat between two virtual users
                url: "/createFastChat?senderId",
                views: {
                    "title": {
                        template: "Создание быстрого чата"
                    },
                    "content": {
                        controller: "createFastChatController",
                        templateUrl: "partials/createFastChat/content.html?"+version
                    }
                }
            })
            .state("activation", {
                url: "/activation",
                views: {
                    "title": {
                        template: "Активация"
                    },
                    "content": {
                        controller: "activationController",
                        templateUrl: "app/user/activation.html"
                    }
                }
            })
            .state("signupRandom", {
                url: "/signupRandom",
                views: {
                    "title": {
                        template: "Регистрация"
                    },
                    "content": {
                        controller: "signupRandomController",
                        templateUrl: "app/user/signupRandom.html"
                    }
                }
            });

        // .state("updateProfile", {
        //   url: "/updateProfile",
        //   views: {
        //     "title": {
        //       template: "Обновления профиля"
        //     },
        //     "menu": {
        //       templateUrl: "partials/menu.html?"+version
        //     },
        //     "content": {
        //       controller: "updateProfileController",
        //       templateUrl: "partials/updateProfile/content.html?"+version
        //     }
        //   }
        // })
    }]);