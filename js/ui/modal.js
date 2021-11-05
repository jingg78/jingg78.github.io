/**
 * @class
 * @name vcui.ui.Modal
 * @description 모달 컴포넌트
 * @extends vcui.ui.View
 * @version 1.0
 */

vcui.define('ui/modal', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var $doc = $(document),
        $win = $(window),
        detect = core.detect,
        ui = core.ui,
        isTouch = detect.isTouch,
        _zIndex = 9000;

    var ModalManager = {
        templates: {
            wrap: '<div class="ui_modal_wrap" style="position:fixed;top:0;left:0;right:0;bottom:0;overflow:auto;"></div>',
            dim: '<div class="ui_modal_dim" style="position:fixed;top:0;left:0;bottom:0;right:0;background:#000;"></div>',
            modal: '<div class="ui_modal ui_modal_ajax" style="display:none"></div>'
        },
        options: {
            opacity: 0.2
        },
        init: function init(options) {
            var self = this;

            self.options = core.extend(self.options, options);
            self.stack = [];
            self.active = null;

            self._bind();
        },

        _bind: function _bind() {
            var self = this;

            $win.on('resizeend.modalmanager', function () {
                for (var i = -1, modal; modal = self.stack[++i];) {
                    modal.isShown && modal.center();
                }
            });

            $doc.on('modalshow.modalmanager', '.ui_modal_container', self._handleModalShow.bind(self)).on('modalhidden.modalmanager', '.ui_modal_container', self._handleModalHidden.bind(self)).on('modalhide.modalmanager', '.ui_modal_container', self._handleModalHide.bind(self)).on('focusin.modalmanager', self._handleFocusin.bind(self)).on('click.modalmanager', '[data-control=modal]', self._handleClick.bind(self)).on('click.modalmanager', '.ui_modal_dim', self._handleDimClick.bind(self));
        },
        /**
         * 동시에 여러 모달을 띄우는 기능도 지원하므로, 모달을 여러개 띄운 후
         * 마지막 모달까지 모두 닫혔을 때 modallastbeforeclose 이벤트를 날려준다.
         * @param e
         * @private
         */
        _handleModalHide: function _handleModalHide(e) {
            var self = this,
                $modal = $(e.currentTarget);

            // 모달이 전부 닫힐 때 document에 알린다.
            if (self.stack.length === 1) {
                $(document).triggerHandler('modallastbeforeclose');
            }
        },
        /**
         * 모달이 여러개 띄워지는 경우에 z-index를 1씩 올려서 설정해주고,
         * stack에 추가해주고, 첫 모달이 열렸을 때는 modalfirstopen 이벤트를 날려준다.
         * @param e
         * @private
         */
        _handleModalShow: function _handleModalShow(e) {
            var self = this,
                $modal = $(e.currentTarget),
                modal = $modal.vcModal('instance'),
                zIndex = self.nextZIndex();

            if (!modal.$el.parent().hasClass('ui_modal_wrap')) {
                modal.$el.wrap(self.templates.wrap).parent().data('modal', modal);
                modal.$el.before($(self.templates.dim).css('opacity', self.options.opacity).data('modal', modal));
            }
            modal.$el && modal.$el.parent().css('zIndex', zIndex++);

            self.active = modal;
            self.add(modal);
            if (self.stack.length === 1) {
                $(document).triggerHandler('modalfirstopen');
            }
        },
        /**
         * 띄울 때 했던 작업들을 모두 초기화
         * @param e
         * @private
         */
        _handleModalHidden: function _handleModalHidden(e) {
            var self = this,
                $modal = $(e.currentTarget),
                modal = $modal.vcModal('instance');

            modal.$el.siblings('.ui_modal_dim').remove(); // dim 제거
            modal.$el.unwrap(); // container 제거
            self.revertZIndex(); // z-index--
            self.remove(modal);

            if (self.stack.length) {
                self.active = self.stack[self.stack.length - 1];
            } else {
                self.active = null;
                $(document).triggerHandler('modallastclose');
            }
        },
        /**
         * 탭키로 포커싱 이동시, 모달 바깥으로 벗어났으면 다시 모달을 포커싱해준다.
         * @param e
         * @private
         */
        _handleFocusin: function _handleFocusin(e) {
            var self = this;

            if (!self.active) {
                return;
            }
            if (self.active.$el[0] !== e.target && !$.contains(self.active.$el[0], e.target)) {
                self.active.$el.find(':focusable').first().focus();
                e.stopPropagation();
            }
        },
        /**
         * data-control="modal" 이 설정된 요소를 클릭했을 때 모달을 자동으로 띄워주는 기능을 바인딩
         * @param e
         * @private
         */
        _handleClick: function _handleClick(e) {
            e.preventDefault();

            var self = this,
                $el = $(e.currentTarget),
                target = $el.attr('href') || $el.attr('data-href'),
                $modal;

            if (target) {
                // ajax형 모달인 경우
                if (!/^#/.test(target)) {
                    if ($el.data('fetching')) {
                        return;
                    }

                    $el.data('fetching', true);
                    if (self.ajaxModalXHR) {
                        self.ajaxModalXHR.abort();
                        self.ajaxModalXHR = null;
                    }

                    self.ajaxModalXHR = $.ajax({
                        url: target
                    }).done(function (html) {
                        $modal = ModalManager.getRealModal(html);

                        $modal.addClass('ui_modal_ajax').hide().appendTo('body').vcModal(core.extend({
                            removeOnClose: true,
                            opener: $el[0]
                        }, $el.data())).on('modalhidden.modalmanager', function (e) {
                            $modal.off('modalhidden.modalmanager');
                        });
                    }).always(function () {
                        self.ajaxModalXHR = null;
                        $el.removeData('fetching');
                    });
                } else {
                    // 인페이지 모달인 경우
                    $(target).vcModal(core.extend({
                        opener: $el[0]
                    }, $el.data())).vcModal('open').on('modalhidden.modalmanager', function (e) {
                        $(this).off('modalhidden.modalmanager');
                    });
                }
            }
        },
        /**
         * dim 클릭시 모달이 닫히도록(closeByOverlay이 true일 때만)
         * @param e
         * @private
         */
        _handleDimClick: function _handleDimClick(e) {
            var $dim = $(e.currentTarget);
            if ($dim.hasClass('ui_modal_dim') && $dim.data('modal').getOption('closeByOverlay')) {
                $dim.data('modal').close();
            }
        },
        /**
         * 다중으로 떴을 경우 모달들을 관리하기 위해 stack에 add
         * @param modal
         */
        add: function add(modal) {
            this.stack.push(modal);
        },
        /**
         *
         * @param modal
         */
        remove: function remove(modal) {
            this.stack = core.array.remove(this.stack, modal);
        },
        /**
         * 다중으로 모달을 띄울 경우 z-index를 증가시키면서 설정(근데 왜 2씩 증기시키게 했는지 기억이 안남....니들도 나이먹어봐..)
         * @return {number}
         */
        nextZIndex: function nextZIndex() {
            var zi = _zIndex;
            _zIndex += 2;
            return zi;
        },
        /**
         * z-index증가분을 회수
         */
        revertZIndex: function revertZIndex() {
            _zIndex -= 2;
        },
        /**
         * ajax로 모달컨텐츠를 불러올 경우 앞뒤에 코멘트가 있으면 모달이 제대로 안 뜨기 때문에
         * 코멘트는 무시하고 정상적인 엘리먼트를 추출하기 위한 함수
         * @param html
         * @return {*}
         */
        getRealModal: function getRealModal(html) {
            var $tmp = $(html);

            if ($tmp.length > 1) {
                for (var i = 0, len = $tmp.length; i < len; i++) {
                    if ($tmp[i].nodeType === Node.ELEMENT_NODE) {
                        return $tmp.eq(i);
                    }
                }
            }
            return $tmp;
        }
    };
    ModalManager.init();

    // Modal ////////////////////////////////////////////////////////////////////////////
 
    var Modal = ui('Modal', /** @lends vcui.ui.Modal# */{
        bindjQuery: 'modal',
        defaults: {
            overlay: true,
            clone: true,
            closeByOverlay: true,
            closeByEscape: true,
            removeOnClose: false,
            draggable: true,
            dragHandle: 'header h1',
            show: true,
            fullMode: false,
            effect: 'fade', // slide | fade
            cssTitle: '.ui_modal_title',
            useTransformAlign: true,
            variableWidth: true,
            variableHeight: true
        },

        events: {
            /**
             *
             * @param e
             */
            'click button[data-role], a[data-role]': function clickButtonDataRole(e) {
                var self = this,
                    $btn = $(e.currentTarget),
                    role = $btn.attr('data-role') || '',
                    ev;

                e.preventDefault();

                if (role) {
                    self.trigger(ev = $.Event('modal' + role), [self]);
                    if (ev.isDefaultPrevented()) {
                        return;
                    }
                }

                this.close();
            },
            'click .ui_modal_close': function clickUi_modal_closeui_modal_close(e) {
                e.preventDefault();
                e.stopPropagation();

                this.close();
            }
        },
        /**
         * 생성자
         * @param {string|element|jquery} el
         * @param {object} options
         * @param {boolean}  [options.overlay=true] 오버레이를 깔것인가
         * @param {boolean}  [options.clone=true] 복제해서 띄울 것인가
         * @param {boolean}  [options.closeByEscape=true] esc키를 눌렀을 때 닫히게 할 것인가
         * @param {boolean}  [options.closeByOverlay=true] dim 클릭시 닫히게 할 것인가
         * @param {boolean}  [options.removeOnClose=false] 닫을 때 dom를 삭제할것인가
         * @param {boolean}  [options.draggable=true] 드래그를 적용할 것인가
         * @param {string}  [options.dragHandle=''] 드래그대상 요소
         * @param {boolean}  [options.show=true] 호출할 때 바로 표시할 것인가...
         */
        initialize: function initialize(el, options) {
            var self = this;
            if (self.supr(el, options) === false) {
                return;
            }

            if (self.options.overlay !== false) {
                self._overlay(); // 오버레이 생성
            }
            self.$el.addClass('ui_modal_container');

            self.isShown = false;
            self._originalDisplay = self.$el.css('display');

            if (/[0-9]+px/.test(self.$el[0].style.left)) {
                self.options.variableWidth = false;
            }

            if (/[0-9]+px/.test(self.$el[0].style.top)) {
                self.options.variableHeight = false;
            }

            if (self.options.show) {
                setTimeout(function () {
                    core.util.waitImageLoad(self.$('img')).done(function () {
                        self.show();
                    });
                });
            }

            if (!self.options.opener) {
                self.options.opener = document.activeElement;
            }

            self._bindAria(); // aria 셋팅
        },

        _bindAria: function _bindAria() {
            var self = this;
            // TODO
            self.$el.attr({
                'role': 'dialog',
                'aria-hidden': 'false',
                'aria-describedby': self.$('section').attr('id') || self.$('section').attr('id', self.cid + '_content').attr('id'),
                'aria-labelledby': self.$('h1').attr('id') || self.$('h1').attr('id', self.cid + '_title').attr('id')
            });
        },
        /**
         * zindex때문에 모달을 body바로 위로 옮긴 후에 띄우는데, 닫을 때 원래 위치로 복구시켜야 하므로,
         * 원래 위치에 임시 홀더를 만들어 놓는다.
         * @private
         */
        _createHolder: function _createHolder() {
            var self = this;

            if (self.$el.parent().is('body')) {
                return;
            }

            self.$holder = $('<span class="ui_modal_holder" style="display:none;"></span>').insertAfter(self.$el);
            self.$el.appendTo('body');
        },
        /**
         * 원래 위치로 복구시키고 홀더는 제거
         * @private
         */
        _replaceHolder: function _replaceHolder() {
            var self = this;

            if (self.$holder) {
                self.$el.insertBefore(self.$holder);
                self.$holder.remove();
            }
        },

        getOpener: function getOpener() {
            return $(this.options.opener);
        },

        /**
         * 토글
         */
        toggle: function toggle() {
            var self = this;

            self[self.isShown ? 'hide' : 'show']();
        },

        /**
         * 표시
         */
        show: function show() {
            if (this.isShown) {
                return;
            }

            var self = this,
                opts = self.options,
                showEvent = $.Event('modalshow');

            // 열릴때 body로 옮겼다가, 닫힐 때 다시 원복하기 위해 임시요소를 넣어놓는다.
            self._createHolder();

            /**
             * 탭이 바뀌기 직전에 발생. e.preventDefault()를 호출함으로써 탭변환을 취소할 수 있다.
             * @event vcui.ui.Modal#modalshow
             * @type {object}
             */

            self.trigger(showEvent);
            if (showEvent.isDefaultPrevented()) {
                self._replaceHolder();
                return;
            }

            self.isShown = true;

            if (opts.title) {
                self.$(opts.cssTitle).html(opts.title || '알림');
            }

            self.layout();
            var defer = $.Deferred();
            if (opts.effect === 'fade') {
                self.$el.hide().fadeIn('fast', function () {
                    defer.resolve();
                });
            } else if (opts.effect === 'slide') {
                self.$el.css('top', -self.$el.height()).animate({ top: '50%' }, function () {
                    defer.resolve();
                });
            } else {
                self.$el.show();
                defer.resolve();
            }

            defer.done(function () {
                self.trigger('modalshown', {
                    module: self
                });

                //////$('body').attr('aria-hidden', 'true');    // body를 비활성화(aria)
                self._draggabled(); // 드래그 기능 빌드
                self._escape(); // esc키이벤트 바인딩
                if (!self.options.fullMode) {
                    self.$el.css('min-height', self.$el.css('min-height', '').prop('scrollHeight'));
                }
                ///////////me._enforceFocus();   // 탭키로 포커스를 이동시킬 때 포커스가 레이어팝업 안에서만 돌도록 빌드

                self.on('mousewheel', function (e) {
                    e.stopPropagation();
                });

                var $focusEl = self.$el.find('[data-autofocus=true]');

                // 레이어내에 data-autofocus를 가진 엘리먼트에 포커스를 준다.
                if ($focusEl.length > 0) {
                    $focusEl.eq(0).focus();
                } else {
                    // 레이어에 포커싱
                    self.$el.attr('tabindex', 0).focus();
                }

                var $focusEl = self.$('[data-autofocus=true]');
                if ($focusEl.length > 0) {
                    $focusEl.eq(0).focus();
                } else {
                    self.$el.attr('tabindex', 0).focus();
                }

                // 버튼
                /**************if (me.options.opener) {
                    var modalid;
                    if (!(modalid = me.$el.attr('id'))) {
                        modalid = 'modal_' + core.getUniqId(16);
                        me.$el.attr('id', modalid);
                    }
                    $(me.options.opener).attr('aria-controls', modalid);
                }**********/
            });
        },

        /**
         * 숨김
         */
        hide: function hide(e) {
            if (e) {
                e.preventDefault();
            }

            var self = this;
            var isAjaxModal = self.$el.hasClass('ui_ajax_modal');


            /**
             * @event vcui.ui.Modal#modalhide
             * @type {object}
             */

            e = $.Event('modalhide');
            self.trigger(e);
            if (!self.isShown || e.isDefaultPrevented()) {
                return;
            }

            var defer = $.Deferred();
            self.isShown = false;
            if (self.options.effect === 'fade') {
                self.$el.fadeOut('fast', function () {
                    defer.resolve();
                });
            } else if (self.options.effect === 'slide') {
                self.$el.animate({
                    top: -self.$el.outerHeight()
                }, function () {
                    defer.resolve();
                });
            } else {
                self.$el.hide();
                defer.resolve();
            }

            defer.done(function () {
                self.trigger('modalhidden');
                self.docOff();
                self.winOff();
                self.$el.off().removeData('ui_modal').attr('style', self.originalStyle).removeAttr('ui-modules aria-hidden role tabindex').removeClass('ui_modal_container');

                self._escape(); // esc 키이벤트 제거
                self._replaceHolder(); // body밑으로 뺀 el를 다시 원래 위치로 되돌린다.

                if (self.options.removeOnClose) {
                    self.$el.remove(); // 닫힐 때 dom에서 삭제하도록 옵션이 지정돼있으면, dom에서 삭제한다.
                }
                if (self.options.opener) {
                    $(self.options.opener).removeAttr('aria-controls').focus(); // 레이어팝업을 띄운 버튼에 포커스를 준다.
                }
                //:if (self.$overlay) {
                //:    self.$overlay.remove(), self.$overlay = null;    // 오버레이를 제거
                //:}
                ////// $('body').removeAttr('aria-hidden');    // 비활성화를 푼다.
                if (isAjaxModal) {
                    self.destroy();
                }
            });
        },

        /**
         * 도큐먼트의 가운데에 위치하도록 지정
         */
        layout: function layout() {
            var self = this,
                width,
                height,
                css,
                isOverHeight,
                isOverWidth,
                top,
                left,
                winHeight = core.dom.getWinHeight(),
                winWidth = core.dom.getWinWidth(),
                scrollHeight = self.$el.css('min-height', '').prop('scrollHeight');

            if (!self.isShown) {
                self.$el.css({
                    'display': 'inline'
                });
            }
            width = self.$el.outerWidth();
            height = self.$el.outerHeight();
            isOverHeight = height > winHeight;
            isOverWidth = width > winWidth;
            css = {
                display: 'block',
                position: 'absolute',
                //backgroundColor: '#ffffff',
                outline: 'none',
                minHeight: scrollHeight,
                backgroundClip: 'padding-box' //,
                //top: top = isOverHeight ? '0%' : '50%'//,
                //left: left = isOverWidth ? '0%' : '50%'
            };



            css.transform = '';
            if (self.options.variableWidth !== false) {
                css.left = isOverWidth ? '0%' : '50%';
                if (self.options.useTransformAlign) {
                    css.transform += 'translateX(-' + css.left + ') ';
                } else {
                    css.marginLeft = isOverWidth ? '' : Math.ceil(width / 2) * -1;
                }
            }

            if (self.options.variableHeight !== false) {
                css.top = isOverHeight ? '0%' : '50%';
                if (self.options.useTransformAlign) {
                    css.transform += 'translateY(-' + css.top + ') ';
                } else {
                    css.marginTop = isOverHeight ? '' : Math.ceil(height / 2) * -1;
                }
            }


            self.$el.stop().css(css);
        },

        /**
         * 타이틀 영역을 드래그기능 빌드
         * @private
         */
        _draggabled: function _draggabled() {
            var self = this,
                options = self.options;

            if (!options.draggable || self.bindedDraggable) {
                return;
            }
            self.bindedDraggable = true;

            if (options.dragHandle) {
                self.$el.css('position', 'absolute');
                core.css3.prefix('user-select') && self.$(options.dragHandle).css(core.css3.prefix('user-select'), 'none');
                self.on('mousedown touchstart', options.dragHandle, function (e) {
                    e.preventDefault();

                    var isMouseDown = true,
                        pos = self.$el.position(),
                        oriPos = {
                        left: e.pageX - pos.left,
                        top: e.pageY - pos.top
                    },
                        _handler;

                    $doc.on(self.makeEventNS('mousemove mouseup touchmove touchend touchcancel'), _handler = function handler(e) {
                        switch (e.type) {
                            case 'mousemove':
                            case 'touchmove':
                                if (!isMouseDown) {
                                    return;
                                }
                                self.$el.css({
                                    left: e.pageX - oriPos.left,
                                    top: e.pageY - oriPos.top
                                });
                                break;
                            case 'mouseup':
                            case 'touchend':
                            case 'touccancel':
                                isMouseDown = false;
                                $doc.off(self.getEventNS(), _handler);
                                break;
                        }
                    });
                });

                self.$(options.dragHandle).css('cursor', 'move');
            }
        },

        /**
         * 모달이 띄워진 상태에서 탭키를 누를 때, 모달안에서만 포커스가 움직이게
         * @private
         */
        _enforceFocus: function _enforceFocus() {
            if (!isTouch) {
                return;
            }
            var self = this;
            var $focusEl = self.$el.find('[data-autofocus=true]');

            // 레이어내에 data-autofocus를 가진 엘리먼트에 포커스를 준다.
            if ($focusEl.length > 0) {
                $focusEl.eq(0).focus();
            } else {
                // 레이어에 포커싱
                self.$el.attr('tabindex', 0).focus();
            }

            $doc.off('focusin' + self.getEventNS()).on('focusin' + self.getEventNS(), self.proxy(function (e) {
                if (self.$el[0] !== e.target && !$.contains(self.$el[0], e.target)) {
                    self.$el.find(':focusable').first().focus();
                    e.stopPropagation();
                }
            }));
        },

        /**
         * esc키를 누를 때 닫히도록
         * @private
         */
        _escape: function _escape() {
            if (isTouch) {
                return;
            }
            var self = this;

            if (self.isShown && self.options.closeByEscape) {
                self.docOff('keyup');
                self.docOn('keyup', function (e) {
                    e.which === 27 && self.hide();
                });
            } else {
                self.docOff('keyup');
            }
        },

        /**
         * 오버레이 생성
         * @private
         */
        _overlay: function _overlay() {
            return;

            var self = this;
            if (!self.options.overlay || self.$overlay) {
                return false;
            } //140123_추가

            self.$overlay = $('<div class="ui_modal_overlay" />');
            self.$overlay.css({
                'backgroundColor': '#ffffff',
                'opacity': 0.6,
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'right': 0,
                'bottom': 0
            }).appendTo('body');

            self.$overlay.off('click.modal').on('click.modal', function (e) {
                if (e.target != e.currentTarget) {
                    return;
                }
                self.$overlay.off('click.modal');
                self.hide();
            });
        },

        /**
         * 모달의 사이즈가 변경되었을 때 가운데위치를 재조절
         * @example
         * $('...').modal(); // 모달을 띄운다.
         * $('...').find('.content').html( '...');  // 모달내부의 컨텐츠를 변경
         * $('...').modal('center');    // 컨텐츠의 변경으로 인해 사이즈가 변경되었으로, 사이즈에 따라 화면가운데로 강제 이동
         */
        center: function center() {
            this.layout();
        },

        /**
         * 열기
         */
        open: function open() {
            this.show();
        },

        /**
         * 닫기
         */
        close: function close() {
            this.hide();
        },

        /**
         *
         */
        destroy: function destroy() {
            var self = this;

            self.supr();
        }
    });

    /**
     * 열려 있는 레이어팝업을 가운데에 위치시키는 글로벌이벤트
     * @example
     * vcui.PubSub.trigger('resize:modal')
     */
    /*core.PubSub.on('resize:modal', function() {
     if(Modal.active){
     Modal.active.center();
     }
     });*/

    //윈도우가 리사이징 될때 가운데에 자동으로 위치시킴
    /*$(window).on('resize.modal', function() {
     if(Modal.active){
     Modal.active.center();
     }
     });*/

    core.modal = function (el, options) {
        $(el).vcModal(options);
    };

    /**
     * @class
     * @name vcui.ui.AjaxModal
     * @description ajax로 불러들인 컨텐츠를 모달로 띄워주는 모듈
     * @extends vcui.ui.View
     */
    core.ui.ajaxModal = function (ajaxOptions, options) {
        if (typeof ajaxOptions === 'string') {
            ajaxOptions = {
                url: ajaxOptions
            };
        }

        if (!options) {
            options = {};
        }

        if (!options.opener) {
            if ($(document.activeElement).is('a, button')) {
                options.opener = document.activeElement;
            } else {
                options.opener = document.body;
            }
        }

        return $.ajax(ajaxOptions).then(function (html) {
            var $modal = ModalManager.getRealModal(html).appendTo('body').data('removeOnClose', true);
            return $modal.vcModal(core.extend({}, options, {
                removeOnClose: true,
                events: {
                    modalhidden: function modalhidden() {
                        $(options.opener).focus();
                    }
                }
            }));
        });
    };
    

    return Modal;
});