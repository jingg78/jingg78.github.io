/**
 * @class
 * @name vcui.ui.Dropdown
 * @extends vcui.ui.View
 * @description 드롭다운 컴포넌트
 * @version 1.0
 */
vcui.define('ui/dropdown', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var $doc = $(document);
    var prefixClass = '.ui_dropdown_';

    var Dropdown = core.ui('Dropdown', /**@lends vcui.ui.Dropdown# */{
        bindjQuery: 'dropdown',
        defaults: {
            appendToBody: false,
            disabled: false,
            autoHideClicked: true,
            autoHideFocusout: true,
            toggleSelector: '>li>.ui_dropdown_toggle',
            listSelector: '>li>.ui_dropdown_list'
        },
         /**
         * 생성자
         * @param {string|element|jquery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {object} options 옵션값
         * @param {boolean} [options.appendToBody = false]
         * @param {boolean} [options.disabled = false]
         * @param {boolean} [options.autoHideClicked = true]
         * @param {boolean} [options.autoHideFocusout = true]
         * @param {string} [options.toggleSelector = '>li>.ui_dropdown_toggle']
         * @param {string} [options.listSelector = '>li>.ui_dropdown_list']
         */  
        initialize: function initialize(el, options) {
            var self = this;
            if (self.supr(el, options) === false) {
                return;
            }
            self.$list = self.$(self.options.listSelector);
            if (self.options.appendToBody) {
                self.$list.after(self.$holder = $('<span style="display:none"></span>'));
            }

            self._bindEvents();
        },
        _bindEvents: function _bindEvents() {
            var self = this;
            var opt = self.options;

            self.on('click', prefixClass + 'toggle', function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (opt.disabled) {
                    return self.close();
                }

                self[self.$el.hasClass('open') ? 'close' : 'open']();
            });
        },
        _bindEventsByOpen: function _bindEventsByOpen() {
            var self = this;
            var opt = self.options;

            self.on('keydown', self._unhandleKeydown = function (e) {
                if (27 == e.keyCode) {
                    e.stopPropagation();
                    self.close();
                    self.$(':focusable:first').focus();
                }
            });

            self.on('click', prefixClass + 'list', self._unhandleClick = function (e) {
                if (!opt.autoHideFocusout) {
                    return;
                }
                if (opt.autoHideClicked) {
                    self.close();
                }
            });

            self.winOne('resize', self._unhandleResize = function () {
                self.close();
            });

            setTimeout(function () {
                // click 이벤트와 겹치지 않도록 한타임 늦게 바인딩한다.
                self.docOn("mousedown keydown", self._unhandleDocEvents = function (e) {
                    if (e.type === 'mousedown') {
                        var $list = self.$(prefixClass + 'list');
                        if (core.dom.contains(self.el, e.target, true) || core.dom.contains($list[0], e.target)) {
                            e.stopPropagation();
                        } else {
                            self.close();
                        }
                    } else {
                        var $toggle = self.$(prefixClass + 'toggle');
                        if (27 === e.keyCode) {
                            self.close(), $toggle.focus();
                        }
                    }
                });
            }, 10);

            self.docOn("focusin focusout", '.ui_dropdown_list', self._unhandleFocus = function (e) {
                clearTimeout(self.focusTimer), self.focusTimer = null;

                if ("focusout" === e.type && self.$el.hasClass("open")) {
                    self.focusTimer = setTimeout(function () {
                        self.close();
                    }, 10);
                }
            });
        },
        _unbindEventsByClose: function _unbindEventsByClose() {
            var self = this;
            var opt = self.options;

            self.off('keydown', self._unhandleKeydown);
            self.off('click', self._unhandleClick);
            self.winOff('resize', self._unhandleResize);
            self.docOff("focusin focusout", self._unhandleFocus);
            self.docOff('mousedown keydown', self._unhandleDocEvents);
        },
        /**
         * open
         */
        open: function open() {
            var self = this;
            var opt = self.options;

            if (opt.appendToBody) {
                var $toggle = self.$(prefixClass + 'toggle');
                var offset = $toggle.offset();

                $('body').append(self.$list.css({
                    position: 'absolute',
                    left: offset.left,
                    top: offset.top + $toggle.outerHeight()
                }).show());
            }

            self._bindEventsByOpen();
            self.$el.addClass('open');
        },
        /**
         * close
         */
        close: function close() {
            var self = this;
            var opt = self.options;

            if (opt.appendToBody) {
                self.$holder.before(self.$list.css({ position: '', left: '', top: '' }).hide());
            }

            self.$el.removeClass('open');
            clearTimeout(self.focusTimer);
            self._unbindEventsByClose();
        }
    });

    return Dropdown;
});