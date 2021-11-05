/**
 * @class
 * @name vcui.helper.ResponsiveImage
 * @extends vcui.ui.View
 * @description 반응형에 따라 해당이미지를 로드해주는 헬퍼2
 * @version 1.0
 * @example
 * //breakpointDispatcher 와 대체로 같이 사용함.
 * //window.breakpoint 를 조회함.
 * new ResponsiveImage('body', {}); 
 * vcui.require(['helper/responsiveImage'], function (ResponsiveImage) { 
 *      ResponsiveImage.run($('..')); 
 *      // 창 사이드에 따라 img 태그의 data-src-mobile, data-src-pc 속성에서 알맞는 이미지로 교체
 * });      
 */

vcui.define('helper/responsiveImage', ['jquery','vcui'], function($, core) {
    "use strict";
    var getBg = function(el) {
        var style = el.currentStyle || window.getComputedStyle(el, false);
        return style.backgroundImage.slice(4, -1).replace(/"|'/g, "");
    };
    
    var ResponsiveImage = core.helper('ResponsiveImage', core.ui.View.extend(/**@lends vcui.helper.ResponsiveImage# */{
        $singleton: true,
        name: 'ResponsiveImage',
        $statics: {
            run: function($el) {

                // window.breakpoint = { // 처음에만
                //     isMobile: isMobile,
                //     isPc: !isMobile,
                //     name: isMobile ? 'mobile' : 'pc'
                // }

                var currentMode = window.breakpoint.name;
                var $items = $el.find('[data-src-pc], [data-src-mobile]');

                $items.each(function() {
                    var src = this.getAttribute('data-src-' + currentMode);
                    var tagName = this.tagName.toLowerCase();

                    if (!src ||
                        (tagName === 'img' && this.src === src) ||
                        (tagName !== 'img' && getBg(this) === src)) {
                        return;
                    }
                    switch (tagName) {
                        case 'img':
                            this.src = src;
                            break;
                        default:
                            this.style.backgroundImage = 'url(' + src + ')';
                            break;
                    }
                });
            }
        },
        
        defaults: {},
        /**
         * 생성자
         * @param {string|element|jquery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {object} options 옵션값
         */
        initialize: function(el, options) {
            var self = this;
            if (self.supr(el, options) === false) {
                return;
            }

            self._bindEvents();
        },

        _bindEvents: function() {
            var self = this;            
            $(window).on('breakpointchange.responsiveimage orientationchange.responsiveimage load.responsiveimage',
                core.throttle(self._handleResize.bind(self), 50)
            );
            self._handleResize();
        },

        _handleResize: function() {
            var self = this;
            var currentMode = window.breakpoint.name;
            if (currentMode === self.prevMode) {
                return;
            }
            self.prevMode = currentMode;
            ResponsiveImage.run(self.$el);
        }
    }));
    ///////////////////////////////////////////////////////////////////////////////////////
    return ResponsiveImage;

});