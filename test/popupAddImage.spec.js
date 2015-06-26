var PopupAddImage = require('../src/js/popupAddImage'),
    EventManager = require('../src/js/eventManager');

describe('PopupAddImage', function() {
    'use strict';

    var popup,
        em;

    beforeEach(function() {
        $('body').empty();

        em = new EventManager();

        popup = new PopupAddImage({
            eventManager: em
        });
    });

    describe('생성', function() {
        it('PopupAddImage클래스가 추가되었다', function() {
            expect(popup.$el.hasClass('popupAddImage')).toBe(true);
        });
        it('버튼들이 생성되었다', function() {
            expect(popup.$el.find('.closeButton').length).toEqual(1);
            expect(popup.$el.find('.okButton').length).toEqual(1);
        });
    });

    describe('이벤트의 발생', function() {
        var handler;

        beforeEach(function() {
            handler = jasmine.createSpy('buttonClickedHandler');
        });

        it('ok버튼을 누르면 okButtonClicked이벤트가 발생한다', function() {
            popup.on('okButtonClicked', handler);

            $('.okButton').trigger('click');

            expect(handler).toHaveBeenCalled();
        });

        it('close버튼을 누르면 closeButtonClicked이벤트가 발생한다', function() {
            popup.on('closeButtonClicked', handler);

            $('.closeButton').trigger('click');

            expect(handler).toHaveBeenCalled();
        });
    });

    describe('eventManager와 연결', function() {
        var handler;

        beforeEach(function() {
            handler = jasmine.createSpy('buttonClickedHandler');
        });

        it('okButtonClicked이벤트가 발생하면 eventManager의 command 이벤트가 발생한다', function() {
            var value = {
                    imageUrl: 'imageUrlText',
                    altText: 'altText'
                };

            em.listen('command', handler);

            $('.imageUrlInput').val(value.imageUrl);
            $('.altTextInput').val(value.altText);

            $('.okButton').trigger('click');

            expect(handler).toHaveBeenCalledWith('AddImage', value);
        });

        it('eventManager에서 openPopupAddImage 이벤트가 발생하면 팝업이 보여진다', function() {
            em.emit('openPopupAddImage');

            expect(popup.isShow()).toBe(true);
        });

        it('eventManager에서 closeAllPopup 이벤트가 발생하면 팝업이 닫힌다', function() {
            em.emit('openPopupAddImage');
            em.emit('closeAllPopup');

            expect(popup.isShow()).toBe(false);
        });
    });

    describe('url입력 방식', function() {
        it('getValue()로 입력된 값들을 객체형식으로 받는다', function() {
            var value = {
                    imageUrl: 'imageUrlText',
                    altText: 'altText'
                };

            $('.imageUrlInput').val('imageUrlText');
            $('.altTextInput').val('altText');

            expect($('.imageUrlInput').val()).toEqual(value.imageUrl);
            expect($('.altTextInput').val()).toEqual(value.altText);

        });

        it('팝업이 닫히면 입력된값들이 초기화 인풋의 값들이 ""로 변경된다', function() {
            $('.imageUrlInput').val('imageUrlText');
            $('.altTextInput').val('altText');

            popup.hide();

            expect($('.imageUrlInput').val()).toEqual('');
            expect($('.altTextInput').val()).toEqual('');
        });
    });

    describe('file입력 방식', function() {
        it('addImageFileHook이 없으면 UI에서 file 입력을 할수 없다.', function() {

        });

        describe('ok버튼이 클릭', function() {
            it('addImageFileHook을 실행한다.', function() {
                var hook = jasmine.createSpy('addImageFileHook');
                em.listen('addImageFileHook', hook);

                $('.okButton').trigger('click');

                expect(hook).toHaveBeenCalled();
            });
            it('addImageFileHook을 실행되면 폼과 콜백이 전달된다.', function() {
                var form,
                    callback;

                em.listen('addImageFileHook', function(oForm, oCallback) {
                    form = oForm;
                    callback = oCallback;
                });

                $('.okButton').trigger('click');

                expect(form.selector).toEqual('form');
                expect(callback).toBeDefined();
            });

            it('addImageFileHook에 전달되는 콜백으로 완성된 url을 비동기로 전달하면 AddImage 커맨드 이벤트가 발생하고 팝업이hide된다', function(done) {
                var addImage = jasmine.createSpy('addImage'),
                    value = {
                        imageUrl: 'imageUrlText',
                        altText: 'altText'
                    };

                em.listen('command', function(type, imageValue) {
                    addImage(imageValue);
                });

                em.listen('addImageFileHook', function(oForm, callback) {
                    setTimeout(function() {
                        callback(value.imageUrl);
                        expect(addImage).toHaveBeenCalledWith({imageUrl: value.imageUrl, altText: value.altText});
                        expect(popup.isShow()).toBe(false);
                        done();
                    }, 0);
                });

                $('.altTextInput').val(value.altText);

                $('.okButton').trigger('click');
            });
        });
    });
});