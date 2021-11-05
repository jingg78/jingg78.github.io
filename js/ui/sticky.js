/**
 * @class
 * @name vcui.ui.Sticky
 * @description 엘리먼트를 고정
 * @extends vcui.ui.View
 * @version 1.0
 * @example
 * $('...').vcSticky({stickyContainer:'.contents', marginTop:90});
 */

vcui.define('ui/sticky', ['jquery', 'vcui'], function ($, core) {
    "use strict";
    var $win = $(window);

    var Sticky = core.ui('Sticky', /**@lends vcui.ui.Sticky# */{
        bindjQuery: 'sticky',
        defaults: {
            wrap: true,
            wrapWith: '<div>',
            marginTop: 0,
            marginBottom: 0,
            stickyFor: 0,
            stickyClass: 'fixed',
            stickyContainer: 'body',
        },
        selectors:{
            anchor : 'a'
        },

        /**
         * 생성자
         * @param {string|element|jquery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {object} options 옵션값
         * @param {boolean} [options.wrap = true] 고정시 엘리먼트를 랩함
         * @param {string} [options.wrapWith = '<div>'] 랩시 사용되는 태그
         * @param {number} [options.marginTop = 0] 탑 마진값
         * @param {number} [options.marginBottom = 0] 바텀 마진값
         * @param {string} [options.stickyClass = "fixed"] 고정시 css클래스명
         * @param {string} [options.stickyContainer = "body"] 기본 컨테이너 'body'
         */
        initialize: function initialize(el, options) {
            var self = this;
            if (self.supr(el, options) === false) {
                return;
            }   
            self.$container = self.$el.closest(self.options.stickyContainer);
            
            core.util.loadImages(self.$container.find('img[data-src]')).done(function(){
                self.update();
                self._bindEvents();
                // console.log('loadImages complete');
            });            
        },

        /**
         * 업데이트
         */
        update : function update(){
            var self = this;
            var opt = self.options;

            self.active = false;
            
            self.stickyRect = self._getRectangle(self.$el);
            self.containerRect = self._getRectangle(self.$container);
            self.marginTop = opt.marginTop;
            self.marginBottom = opt.marginBottom;
            self.anchorArr = [];
            self.$anchor.each(function(index, item){
                self.anchorArr.push($(item).attr('href'));
            });

            if(opt.wrap){
                self.$el.wrap(opt.wrapWith).parent().css({ 
                    height: self.$el.outerHeight()
                });
            }

            if (self.stickyRect.bottom < self.containerRect.bottom && opt.stickyFor < self.vpWidth && !self.active) {
                self.active = true;
            }
            self._calcPos();
            self._setPosition();

            var idx = self.$anchor.parent('.on').index();
            if(idx>0) self.scollToIndex(idx, 0);

        },

        /**
         * set margin-top
         * @param {number} top 마진값
         */
        setMarginTop : function setMarginTop(top){
            var self = this;
            self.marginTop = top;
            self._setPosition();
        },

        /**
         * set margin-bottom
         * @param {number} bottom 마진값
         */
        setMarginBottom : function setMarginBottom(bottom){
            var self = this;
            self.marginBottom = bottom;
            self._setPosition();
        },

        /**
         * 스크롤를 해당 인텍스로 이동시킴.
         * @param {number} idx 해당 인덱스
         * @param {number} speed 속도
         */
        scollToIndex : function scollToIndex(idx, speed){
            var self = this;
            var y = self.posArr[idx];
            if(speed){
                $('html, body').stop().animate({scrollTop:y+1}, speed);
            }else{ 
                setTimeout(function(){   
                    $('html, body').stop().scrollTop(y+1);
                }, 100);
            }
        },

        _bindEvents: function _bindEvents() {
            var self = this;
            var idx;

            self.$anchor.on('click', function(e){
                e.preventDefault();
                var idx = vcui.array.indexOf(self.anchorArr, $(this).attr('href'));                
                self.scollToIndex(idx, 300);
            });
            $win.on('scroll resize load', function(e) {
                self.scrollTop = $win.scrollTop();
                idx = self._getSelectIdx(self.scrollTop);
                if(idx != self.selectedIndex){
                    self.selectedIndex = idx;
                    self._activeBtn(self.selectedIndex);
                }
                self.stickyRect = self._getRectangle(self.$el);
                self.containerRect = self._getRectangle(self.$container);

                switch (e.type) {
                    case 'resize':
                        self.vpHeight = $win.height();
                        self.vpWidth = $win.width();
                        self._handleResize(e);
                        break;
                    default:
                        if (self.active) {
                            self._setPosition();
                        }
                }
            });

            $win.trigger('resize');
        },

        _activeBtn : function _activeBtn(idx){
            var self = this;            
            var $target = self.$anchor.parent();
            if(idx<0) {
                $target.removeClass('on');
            }else{
                $target.eq(idx).addClass('on').siblings().removeClass('on');
            }
            
        },
        
        _handleResize: function _handleResize(e) {
            var self = this;
            var opt = self.options;

            self.vpHeight = $win.height();
            self.vpWidth = $win.width();
            self._calcPos();

            if (self.stickyRect.bottom < self.containerRect.bottom && opt.stickyFor < self.vpWidth && !self.active) {
                self.active = true;
            } else if (self.stickyRect.bottom >= self.containerRect.bottom || opt.stickyFor >= self.vpWidth && self.active) {
                self.active = false;
            }
            
            self._setPosition();
        },

        _setPosition: function _setPosition() {
            var self = this;
            var opt = self.options;
            var $el = self.$el;
            self._clearCss();

            if (self.vpHeight < self.stickyRect.height || !self.active ) {
                return; 
            }
            if (!self.stickyRect.width) {
                self.stickyRect = self._getRectangle($el);                
            }

            if (self.stickyRect.top === 0 && self.$container[0] === document.body) {                
                $el.css({
                    position: 'fixed',
                    top: self.stickyRect.top,
                    left: self.stickyRect.left,
                    width: $el.width()
                });
                
                $el.addClass(opt.stickyClass);

            } else if (self.scrollTop > self.stickyRect.top - self.marginTop) {
                $el.css({
                    position: 'fixed',
                    width: $el.width(),
                    left: self.stickyRect.left
                });

                if (self.scrollTop + self.stickyRect.height + self.marginTop > self.containerRect.bottom - self.marginBottom) {
                    $el.removeClass(opt.stickyClass);
                    $el.css({
                        top: self.containerRect.bottom - (self.scrollTop + self.stickyRect.height + self.marginBottom)
                    });
                } else {
                    $el.addClass(opt.stickyClass);
                    $el.css({
                        top: self.marginTop
                    });
                }
            } else {

                $el.removeClass(opt.stickyClass);
                self._clearCss();
            }
        },

        _clearCss: function _clearCss() {
            var self = this;
            self.$el.css({
                position: '',
                width: '',
                top: '',
                left: ''
            });
        },

        _getRectangle: function _getRectangle($el) {
            var self = this;
            self._clearCss();
            var top = $el.offset().top;        
            var left = $el.offset().left;
            var width = $el.outerWidth();            
            var height = $el.outerHeight();
            return { top: top, bottom: top + height , left: left, right: left + width, width: width, height: height };
        },

        _calcPos: function () {
            var self = this;

            self.posArr = [];
            self.stickyRect = self._getRectangle(self.$el);
            self.containerRect = self._getRectangle(self.$container);   
            var lasty = $(document).outerHeight() - $(window).height();
            var $target,top,anchorName;
            
            self.$anchor.each(function(index, item){

                anchorName = $(item).attr('href');
                $target = self.$container.find(anchorName);

                if(index==0){
                    self.posArr.push(self.containerRect.top - self.marginTop);
                }else{
                    top = $target.offset().top - (self.stickyRect.height + self.marginTop);                  
                    self.posArr.push(top>lasty? lasty-10 : top);
                    if(index == self.$anchor.length-1){
                        top = $target.outerHeight() + $target.offset().top;
                        self.posArr.push(top);
                    }
                }                
            });

        },
        _getSelectIdx:function _getSelectIdx(y){
            var self = this;
            var idx = -1;            
            for(var i=0; i<self.posArr.length-1; i++){
                if(self.posArr[i] <= y && self.posArr[i+1] > y){
                    idx = i;
                    break;
                }
            }
            return idx;
        },

        
       

    });
    ///////////////////////////////////////////////////////////////////////////////////////

    return Sticky;
});