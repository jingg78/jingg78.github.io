/**
 * @class
 * @name vcui.ui.Scrollview
 * @extends vcui.ui.View
 * @description 커스텀스크롤 컴포넌트
 * @version 1.0
 */
vcui.define('ui/scrollview', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    $.easing.smooth = function (x, t, b, c, d) {
        var ts = (t /= d) * t,
            tc = ts * t;
        return b + c * (-1 * ts * ts + 4 * tc + -6 * ts + 4 * t);
    };

    var cssTransform = core.css3.prefix('transform');
    var isTouch = core.detect.isTouch;

    var Scrollview = core.ui('Scrollview', /**@lends vcui.ui.Scrollview#*/{
        bindjQuery: 'scrollview',
        selectors: {
            wrapper: '>.ui_scrollarea',
            vscrollbar: '>.ui_scrollbar'
        },
        defaults: {
            duration: 600,
            speedLimit: 1.2,
            moveThreshold: 100,
            offsetThreshold: 30,
            startThreshold: 5,
            acceleration: 0.1,
            accelerationT: 250,
            watch: true,
            watchInterval: 400,
            preventScroll: true
        },

        /**
         * 생성자
         * @param {string|element|jquery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {object} options 옵션값
         * @param {number} [options.duration = 600]
         * @param {number} [options.speedLimit = 1.2]
         * @param {number} [options.moveThreshold = 100]
         * @param {number} [options.offsetThreshold = 30]
         * @param {number} [options.startThreshold = 5]
         * @param {number} [options.acceleration = 0.1]
         * @param {number} [options.accelerationT = 250]
         * @param {boolean} [options.watch = true]
         * @param {number} [options.watchInterval = 400]
         * @param {boolean} [options.preventScroll = true]
         */  

        initialize: function initialize(el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self.$el.addClass('scrollviewed');

            self.maxScrollY = 0;
            self.scrollHeight = 0;
            self.wrapperHeight = 0;
            self.visibleScroll = false;

            if (self.$vscrollbar.length === 0) {
                // 스크롤바가 없으면 자동 생성해 준다.
                self.$vscrollbar = $('<div class="scroll ui_scrollbar">' + '<span class="bg_top"></span><span class="bg_mid"></span>' + '<span class="bg_btm"></span></div>');
                self.$el.append(self.$vscrollbar);
            }

            self.$el.css('overflow-y', 'hidden');
            self.$wrapper.css({
                'overflow-y': 'hidden',
                'height': '100%'
            });

            self.scrollbarStyle = self.$vscrollbar[0].style;
            self.scrollbarStyle.display = 'none';
            self.$vscrollbar.css('transition', 'transform 0.1s');

            //me.$el.addClass('strack');
            self.$el.attr('tabindex', -1);
            self.$vscrollbar.attr('role', 'scrollbar');

            self._bindEvents();
        },

        _bindEvents: function _bindEvents() {
            var self = this;

            if (self.$vscrollbar.length) {
                self.$wrapper.on('scroll', function () {
                    var rate = (self.wrapperHeight - self.scrollbarHeight) / (self.scrollHeight - self.wrapperHeight);
                    self._moveScrollbar(self.$wrapper[0].scrollTop * rate);
                });

                if (self.options.watch === true) {
                    // 사이즈 변화 감시
                    var totalTime = 0,
                        dur = self.options.watchInterval;
                    self.updateTimer = setInterval(function () {
                        if (!self.$el) {
                            clearInterval(self.updateTimer);
                            return;
                        }

                        if (!self.$el.is(':visible')) {
                            return;
                        }

                        // 40초에 한번씩 dom에서 제거 됐건지 체크해서 타이머를 멈춘다.
                        if (totalTime > 40000) {
                            totalTime = 0;
                            if (!core.dom.contains(document, self.$el[0])) {
                                clearInterval(self.updateTimer);
                                self.updateTimer = null;
                                return;
                            }
                        } else {
                            totalTime += dur;
                        }
                        self.update();
                    }, dur);
                }
            }
        },

        _watchStart: function _watchStart() {
            var self = this;
        },
        /**
         * 터치기반 디바이스에서 터치로 컨텐츠를 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindContentScroll: function _bindContentScroll() {
            var self = this,
                times = {},
                multiplier = 1,
                dom = core.dom,
                distance,
                startY,
                startX,
                acc,
                scrollableY,
                wrapHeight,
                maxScrollY,
                startScrollTop,
                pos,
                isScrolling;

            self.on('touchstart touchmove touchend touchcancel', function (e) {
                var isMove, touchTime, maxOffset, offset, scrollTop, duration, pointY;
                times[e.type] = e.timeStamp;

                pos = dom.getEventPoint(e);
                pointY = pos.y;
                switch (e.type) {
                    case 'touchstart':
                        wrapHeight = self.wrapperHeight;
                        maxScrollY = self.$wrapper[0].scrollHeight - wrapHeight;
                        scrollableY = maxScrollY > 0;

                        if (!scrollableY) {
                            return;
                        }

                        startScrollTop = self.$wrapper[0].scrollTop;
                        startX = pos.x;
                        startY = pos.y;
                        multiplier = 1;
                        isScrolling = false;

                        if (self.$wrapper.is(":animated") && times['touchstart'] - times['touchend'] < self.options.accelerationT) {
                            multiplier += self.options.acceleration;
                        } else {
                            multiplier = 1;
                        }

                        self.$wrapper.stop(true, false).data('scrollTop', self.$wrapper.scrollTop());

                        break;
                    case 'touchmove':
                        if (!isScrolling && Math.abs(startX - pos.x) > Math.abs(startY - pos.y)) {
                            scrollableY = false;
                        }
                        if (!scrollableY) {
                            return;
                        }

                        if (self.options.preventScroll) {
                            e.preventDefault();
                        } else {
                            if (startY < pointY && startScrollTop === 0) {
                                return;
                            }
                            if (startY > pointY && startScrollTop === maxScrollY) {
                                return;
                            }
                            e.preventDefault();
                        }

                        distance = startY - pointY;
                        acc = Math.abs(distance / (times['touchmove'] - times['touchstart']));
                        scrollTop = self.$wrapper.data('scrollTop') + distance;
                        duration = 0;
                        multiplier = 1;
                        isScrolling = true;

                        if (scrollTop < 0) {
                            scrollTop = 0;
                        } else if (scrollTop > maxScrollY) {
                            scrollTop = maxScrollY;
                        }
                        self.$wrapper.stop(true, false).scrollTop(scrollTop);

                        e.stopPropagation();
                        break;
                    case 'touchend':
                    case 'touchcancel':
                        if (!scrollableY || !isScrolling) {
                            return;
                        }
                        isMove = Math.abs(startY - pointY) > self.options.startThreshold;
                        if (isMove) {
                            touchTime = times['touchend'] - times['touchmove'];
                            maxOffset = wrapHeight * self.options.speedLimit;
                            offset = Math.pow(acc, 2) * wrapHeight;
                            offset = offset > maxOffset ? maxOffset : multiplier * offset;
                            offset = multiplier * offset * (distance < 0 ? -1 : 1);

                            if (touchTime < self.options.moveThreshold && offset !== 0 && Math.abs(offset) > self.options.offsetThreshold) {
                                scrollTop = self.$wrapper.data('scrollTop') + distance + offset;
                                duration = self.options.duration;

                                if (scrollTop < 0) {
                                    scrollTop = 0;
                                } else if (scrollTop > maxScrollY) {
                                    scrollTop = maxScrollY;
                                }

                                self.$wrapper.stop(true, false).animate({
                                    scrollTop: scrollTop
                                }, {
                                    duration: duration,
                                    easing: 'smooth',
                                    complete: function complete() {
                                        multiplier = 1;
                                    }
                                });
                            }
                        }
                        break;
                }
            });
        },

        /**
         * pc에서 상하키로 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindKeys: function _bindKeys() {
            var self = this;

            self.on('keydown', function (e) {
                var keyCode = e.keyCode || e.which,
                    wrapperHeight = self.$wrapper.innerHeight(),
                    scrollTop = self.$wrapper.prop('scrollTop'),
                    maxScrollY = self.$wrapper.prop('scrollHeight') - wrapperHeight,
                    newY;

                switch (keyCode) {
                    case 38:
                        // up
                        e.preventDefault();
                        if (scrollTop <= 0) {
                            return;
                        }
                        newY = scrollTop - wrapperHeight;
                        break;
                    case 40:
                        // down
                        e.preventDefault();
                        if (scrollTop >= maxScrollY) {
                            return;
                        }
                        newY = scrollTop + wrapperHeight;
                        break;
                    default:
                        return;
                }
                if (newY) {
                    self.$wrapper.stop(true, false).animate({
                        scrollTop: newY
                    }, {
                        duration: self.options.duration,
                        easing: 'smooth'
                    });
                }
            });
        },

        /**
         * pc에서 스크롤바로 컨텐츠를 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindScrollbar: function _bindScrollbar() {
            var self = this,
                currY,
                downY,
                moveY;

            function getY(e) {
                if (isTouch && e.originalEvent.touches) {
                    e = e.originalEvent.touches[0];
                }
                return e.pageY;
            }

            self.$vscrollbar.on('mousedown touchstart', function (e) {
                e.preventDefault();
                if (isTouch) {
                    e.stopPropagation();
                }

                self.isMouseDown = true;
                currY = core.css3.position(self.$vscrollbar).y;
                downY = getY(e);

                self.docOn('mouseup mousecancel touchend mousemove.' + self.cuid + ' touchmove touchcancel', function (e) {
                    if (!self.isMouseDown) {
                        self.docOff();
                        return;
                    }

                    switch (e.type) {
                        case 'mouseup':
                        case 'touchend':
                        case 'mousecancel':
                        case 'touchcancel':
                            self.isMouseDown = false;
                            if (!self.isScrollbarActive) {
                                self.$vscrollbar.removeClass('active');
                            }
                            moveY = 0;
                            self.docOff();
                            break;
                        case 'mousemove':
                        case 'touchmove':
                            moveY = getY(e);

                            var top = currY - (downY - moveY),
                                scrollHeight = self.wrapperHeight - self.scrollbarHeight,
                                y;

                            self.scrollbarStyle.top = top = Math.max(0, Math.min(top, scrollHeight));
                            y = (self.scrollHeight - self.wrapperHeight) * (top / scrollHeight);
                            self.$wrapper.scrollTop(y);
                            e.preventDefault();
                            break;
                    }
                });
                return false;
            }).on('mouseenter mouseleave', function (e) {
                self.isScrollbarActive = e.type === 'mouseenter';
                self.$vscrollbar.toggleClass('active', self.isScrollbarActive || self.isMouseDown);
            });
        },

        /**
         * pc에서 마우스로 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindWheel: function _bindWheel() {
            var self = this;
            self.$wrapper.on('mousewheel DOMMouseScroll wheel', function (ev) {
                var e = ev.originalEvent;
                var delta = core.dom.getDeltaY(e) * 100,
                    scrollTop = self.$wrapper[0].scrollTop;

                self.$wrapper.scrollTop(scrollTop - delta); // -: down +: up
                if (self.options.preventScroll) {
                    ev.preventDefault();
                    ev.stopPropagation();
                } else {
                    if (self.$wrapper[0].scrollTop !== scrollTop) {
                        ev.preventDefault();
                        ev.stopPropagation();
                    }
                }
            });
        },

        /**
         * 스크롤바를 움직여주는 함수
         * @param top
         * @param height
         * @private
         */
        _moveScrollbar: function _moveScrollbar(top, height) {
            var self = this;

            if (!self.visibleScroll) {
                return;
            }
            if (isNaN(top)) {
                top = 0;
            }
            if (height !== undefined && self.scrollbarHeight !== height) {
                height = Math.max(height, 18);
                self.scrollbarStyle.height = height + 'px';
                self.scrollbarHeight = height;
            } else {
                height = self.scrollbarHeight;
            }
            if (self.wrapperHeight < height + top) {
                top = self.wrapperHeight - height;
            }
            if (core.css3.support) {
                self.scrollbarStyle[cssTransform] = 'translate(0px, ' + top + 'px)';
            } else {
                self.scrollbarStyle.top = top + 'px';
            }
        },

        /**
         * 사이즈 변화에 따른 UI 갱신
         */
        update: function update(isForce) {
            var self = this,
                wrapperHeight,
                scrollHeight,
                visibleScroll,
                rate;

            if (!self.el || !self.$el.is(':visible') || !self.$wrapper || !self.$wrapper[0]) {
                return;
            }

            wrapperHeight = self.$wrapper[0].offsetHeight;
            if (wrapperHeight === 0) {
                self.wrapperHeight = 0;
                return;
            }

            scrollHeight = self.$wrapper[0].scrollHeight;
            visibleScroll = wrapperHeight < scrollHeight - 1;
            if (visibleScroll && !self._bindedEventOver) {
                self._bindedEventOver = true;
                // 실질적으로 컨텐츠가 래퍼를 오버했을 때만 스크롤을 붙인다.
                if (isTouch) {
                    self._bindContentScroll();
                } else {
                    self._bindScrollbar();
                    self._bindKeys();
                    self._bindWheel();
                }
            }
            // 160217 - 영역보다 내용이 작을 경우 스크롤바 감추기
            self.scrollbarStyle.display = visibleScroll ? '' : 'none';
            if (visibleScroll !== self.visibleScroll) {
                self.visibleScroll = visibleScroll;
                self.$el.toggleClass('track_visible', visibleScroll);
            }
            if (isForce === true || visibleScroll && (scrollHeight !== self.scrollHeight || wrapperHeight !== self.wrapperHeight)) {
                self.wrapperHeight = wrapperHeight;
                self.scrollHeight = scrollHeight;
                self.scrollRate = wrapperHeight / scrollHeight;
                rate = (self.wrapperHeight - self.scrollbarHeight) / (self.scrollHeight - self.wrapperHeight);
                self._moveScrollbar(self.$wrapper[0].scrollTop * rate, wrapperHeight * self.scrollRate);
            }
        },

        /**
         * scrollTop 설정
         * @param top
         * @returns {*}
         */
        scrollTop: function scrollTop(top) {
            var self = this;
            if (arguments.length > 0) {
                self.$wrapper.scrollTop(top);
                self.update();
            } else {
                return self.$wrapper.scrollTop();
            }
        },

        destroy: function destroy() {
            var self = this;

            self.updateTimer && (clearInterval(self.updateTimer), self.updateTimer = null);
            self.$wrapper.off();
            self.$vscrollbar.off();
            self.$el.removeClass('scrollviewed');
            self.supr();
        }
    });

    return Scrollview;
});