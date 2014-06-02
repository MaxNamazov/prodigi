'use strict';
var app = (function() {
    var applicationId = 4392658,
        nextCounter = 5,
        templatesWrapper = $('#templates'),
        nextButton = $('#next-button'),
        heightInfo = $('#height'),
        widthInfo = $('#width'),
        dpr = $('#dpr'),
        loginButton = $('#login-button');


    var loginHandler = function(res) {
        if (res.session) {
            loginButton.addClass('hidden');
            nextButton.removeClass('hidden');
        } else {
            console.log('Нужна аутентификация!');
        }

    };
    var renderUser = function(data) {
        var template = $('.profile-info-wrapper', templatesWrapper).clone(),
            sex,
            online;
        try {
            template.find('.name').text(data.first_name + ' ' + data.last_name);
            template.find('.age').text('Дата рождения: ' + data.bdate);
            switch (data.online) {
                case 1:
                    online = 'online';
                    break;
                case 2:
                    online = 'offline';
                    break;
            }
            template.find('.status').text(online);
            switch (data.sex) {
                case 1:
                    sex = 'женский';
                    break;
                case 2:
                    sex = 'мужской';
                    break;
                default:
                    sex = 'не указан';
                    break;
            }
            template.find('.sex').text('Пол: ' + sex);
            template.find('.profile-picture').append('<img>').attr('src', data.photo_200);
        }
        catch(ex){
        	console.error(ex);
        }


        return template;
    };

    var resizeHandler = function(){
    	heightInfo.text($(window).height());
  		widthInfo.text($(window).width());
  		dpr.text(window.devicePixelRatio ? window.devicePixelRatio : 'не поддерживается')
    };

    var nextHandler = function(e) {
    	e.preventDefault();
        nextCounter -= 1;
        $('.fa-spin', nextButton).removeClass('hidden');
        makeVkRequest('users.search', {
            count: 1,
            v: 5.8,
            fields: 'sex,photo_200,online,bdate'
        }).done(function(res) {
            $('.main-content').append(renderUser(res.items[0]));
            $('.fa-spin', nextButton).addClass('hidden');

        }).fail(function() {
            alert('Упс, что-то пошло не так');
        });


        if (nextCounter === 0) {
            nextButton.attr('disabled', 'disabled');
        }
    };
    var makeVkRequest = function(method, options, cb) {
        var dfd = $.Deferred();
        if (cb) {
            dfd.done(cb);
        }
        VK.Api.call(method, options, function(r) {
            if (r.response) {
                dfd.resolve(r.response);
            } else {
                dfd.reject();
            }
        });
        return dfd.promise();
    };
    var setEventHandlers = function() {
        loginButton.click(function() {
            VK.Auth.login(loginHandler);
        });
        nextButton.click(nextHandler);
        $(window).resize(resizeHandler)
    };

    return {
        init: function() {
            VK.init({
                apiId: applicationId
            });
            VK.Auth.getLoginStatus(loginHandler);
            resizeHandler();
            setEventHandlers();
        }
    };

})();
$(function() {
    app.init();
});
