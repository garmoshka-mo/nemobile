angular.module("angApp").config(["$stateProvider", "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        // $animate.enabled(false);

        var indexURL = html5Mode ? "/" : "",
            randomUrl = indexURL,
            pubListUrl = "/pub",
            pubListTop = {state: 'randomLaunch'};

        //if (expVariation)
        if (ALT_UI) {
            randomUrl = "/random";
            pubListUrl = indexURL;
            pubListTop = null;
        } else if (!watches.isWorkingTime) {
            randomUrl = "/random";
            pubListUrl = indexURL;
            pubListTop = {state: 'chatClosed'}
        }

        $stateProvider
            .state("start", {
                url: "/start",
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
            .state("quest", {
                url: "/quest",
                views: {
                    "content": {
                        templateUrl: "app/quest/quest.html?" + version,
                        controller: "questController"
                    }
                }
            })
            .state("sendSecret", {
                url: "/sendSecret",
                views: {
                    "content": {
                        templateUrl: "app/secret/sendSecret.html?" + version,
                        controller: "sendSecretController"
                    }
                }
            })
            .state("readSecret", {
                url: "/secret/:shortCode",
                branded: true, hasControlPanel: true,
                views: {
                    "content": {
                        templateUrl: "app/secret/readSecret.html?" + version,
                        controller: "readSecretController",
                        footerTemplateUrl: "app/secret/answerSecretPanel.html?"+version
                    }
                }
            })
            .state("pubItem", {
                url: "/pub/:postId/:slug?chat",
                branded: true,
                views: {
                    "title": {
                        template: "Паблик - DUB.iNK"
                    },
                    "content": {
                        templateUrl: "app/pub/pubItem.html?" + version,
                        controller: "pubController"
                    }
                }
            })
            .state("publishPreview", {
                url: "/publishPreview",
                branded: true, hasControlPanel: true,
                views: {
                    "top": {
                        resize: 'comfortChat!'
                    },
                    "title": {
                        template: "Публикация - DUB.iNK"
                    },
                    "content": {
                        templateUrl: "app/pub/publishPreview.html?" + version,
                        controller: "publishPreviewController",
                        footerTemplateUrl: "app/pub/publishPreviewPanel.html?"+version
                    }
                }
            })
            .state("publishSuccess", {
                url: "/publishSuccess?postId&channel",
                views: {
                    "title": {
                        template: "Успешно опубликовано"
                    },
                    "content": {
                        templateUrl: "app/pub/publishSuccess.html?" + version,
                        controller: "publishSuccessController"
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
                url: "/chat?chat&messageText&senderId&fromState",
                branded: true, hasControlPanel: true,
                views: {
                    "top": {
                        resize: 'comfortChat',
                        unforcedResize: true
                    },
                    "title": {
                        template: "Чат"
                    },
                    "content": {
                        controller: "chatController",
                        templateUrl: "app/chats-ui/chat.html?"+version,
                        footerTemplateUrl: "app/chats-ui/inputPanel.html?"+version
                    }
                }
            })
            .state("randomLaunch", {
                views: {
                    "top": {
                        resize: 'smallChat'
                    },
                    "content": {
                        controller: "standardNavigationController",
                        templateUrl: "app/chats-ui/randomLaunch.html?"+version
                    }
                }
            })
            .state("chatClosed", {
                views: {
                    "top": {
                        resize: 'smallChat'
                    },
                    "content": {
                        controller: "closedController",
                        templateUrl: "app/chats-ui/closed.html?"+version
                    }
                }
            })
            .state("randomFull", {
                views: {
                    "top": {
                        resize: 'full',
                        animated: true
                    },
                    "content": {
                        controller: "randomController",
                        templateUrl: "app/chats-ui/random.html?"+version
                    }
                }
            })
            .state("random", {
                url: randomUrl,
                views: {
                    "top": {state: 'randomFull'},
                    "title": {
                        template: "Чат наугад - DUB.iNK"
                    },
                    "content": {
                        templateUrl: "app/pub/pubsList.html?" + version,
                        controller: "pubsListController",
                        //footerTemplateUrl: "app/pub/postsControl.html?"+version
                    }
                }
            })
            .state("pubsList", {
                url: pubListUrl,
                views: {
                    "top": pubListTop,
                    "title": {
                        template: "Паблик - DUB.iNK"
                    },
                    "content": {
                        templateUrl: "app/pub/pubsList.html?" + version,
                        controller: "pubsListController"
                        //footerTemplateUrl: "app/pub/postsControl.html?"+version
                    }
                }
            })
            .state("randomRestart", {
                url: "/random",
                views: {
                    "content": {
                        controller: "randomController",
                        templateUrl: "app/chats-ui/random.html?"+version
                    }
                }
            })
            .state("lookAgain", {
                url: "/random",
                views: {
                    "content": {
                        controller: "randomController",
                        templateUrl: "app/chats-ui/random.html?"+version
                    }
                }
            })
            .state("complaintSuccess", {
                url: "/random",
                views: {
                    "content": {
                        controller: "randomController",
                        templateUrl: "app/chats-ui/random.html?"+version
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
                        templateUrl: "app/media/loadAvatar.html?"+version
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
                        templateUrl: "app/media/showImage.html?"+version
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
                        templateUrl: "app/etc/about.html?"+version
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
                        templateUrl: "app/purchase/activation.html?"+version
                    }
                }
            })
            .state("afterPurchase", {
                url: "/afterPurchase",
                views: {
                    "title": {
                        template: "Регистрация"
                    },
                    "content": {
                        controller: "afterPurchaseController",
                        templateUrl: "app/purchase/afterPurchase.html?"+version
                    }
                }
            })
            .state("mobileApp", {
                url: "/mobileApp",
                views: {
                    "title": {
                        template: "Приложение"
                    },
                    "content": {
                        controller: "mobileAppController",
                        templateUrl: "app/etc/mobileApp.html?"+version
                    }
                }
            })
            .state("gallery", {
                url: "/gallery",
                views: {
                    "top": {
                        resize: 'comfortChat!'
                    },
                    "content": {
                        controller: "galleryController",
                        templateUrl: "app/media/gallery/gallery.html?" + version,
                        footerTemplateUrl: "app/media/gallery/galleryControl.html?"+version
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