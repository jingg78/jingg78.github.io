;(function(global, $){

    if(global['common']) return;  

    /*
    // require 초기 설정    
    vcui.require.config({
        paths: {
            'jquery.transit': 'libs/jquery.transit'
        },
        waitSeconds: 15,
        onNodeCreated: function (node) {
            node.charset = 'utf-8';
        }
    });
    
    // local ajax 을 사용할시 한글깨짐문제해결
    
    var pathname = location.pathname;
    if (pathname.indexOf('/html/') > -1) {
        $.ajaxSetup({
            contentType: 'application/x-www-form-urlencoded;charset=euc-kr',
            beforeSend: function (xhr) {
                xhr.overrideMimeType('application/x-www-form-urlencoded;charset=euc-kr');
            }
        });
    }
    */

    // ready 실행을 잠시 멈춘다.
    $.holdReady(true);
        
    /**
     * element load 시 설정된 컴포넌트들을 실행한다.        
     * @function
     * @name buildCommonUI
     * @example
     * $('...').buildCommonUI();
     */

    $.fn.buildCommonUI = function () {

        vcui.require(['ui/calendar','ui/accordion','ui/selectbox', 'ui/carousel','ui/tab'], function () {
            this.find('.ui_calendar').vcCalendar();
            this.find('.ui_accordion').vcAccordion();        
            this.find('.ui_selectbox').vcSelectbox();
            this.find('.ui_tab').vcTab();
            this.find('.ui_carousel').vcCarousel();
    
        }.bind(this));
        return this;
    };
    

    global['common'] = {

        isLocal: window.location.hostname === 'localhost',
        isDev: window.location.hostname.indexOf('jsdebug=true') > -1,
        isPreventedScroll: false,
       
        // 사이트 기본작업들 처리
        init: function () {    
            this._preloadComponents();                 
        },

        // 주요 컴포넌트를 미리 로드
        _preloadComponents: function () {
            vcui.require([
                'helper/responsiveImage',
                'helper/breakpointDispatcher',
                'ui/spinner',
                'ui/selectbox',
                'ui/calendar',
                'ui/accordion',
                'ui/carousel',
                'ui/modal',
                'ui/tab',            
            ], function (ResponsiveImage, BreakpointDispatcher) {

                var $doc = $(document);
    
                var breakpoint = {
                    mobile: 768,
                    pc: 10000000
                }
    
                new BreakpointDispatcher({
                    matches: {
                        '(min-width: 768px)' : function(mq) {
                            var data;
                            if (mq.matches) {
                                // pc
                                data = {
                                    name: 'pc',
                                    min: 768,
                                    max: 999999,
                                    isMobile: false,
                                    isPc: true,
                                    prev: window.breakpoint || {}
                                };
                                
                            } else {
                                // mobile
                                data = {
                                    name: 'mobile',
                                    min: 0,
                                    max: 767,
                                    isMobile: true,
                                    isPc: false,
                                    prev: window.breakpoint || {}
                                };
                            }
    
                            window.breakpoint = data;
                            $(window).data('breakpoint', data).trigger('breakpointchange', data);
                        },
    
                        /* 
                        '(min-width : 769px) and (max-width : 1599px)' : function(mq){
                        },
                        '(min-width : 1600px)' : function(mq){
                        } 
                        */
                    }
                }).start();            
    
                new ResponsiveImage('body', breakpoint);
                
    
                // 모달 기초작업 //////////////////////////////////////////////////////
                // 모달 기본옵션 설정: 모달이 들때 아무런 모션도 없도록 한다.(기본은 fade)
                vcui.ui.setDefaults('Modal', {
                    effect: 'fade',         // 모달이 뜰 때 사용할 효과
                    draggable: false,       // 모달을 드래그 할 수 있게 허용할 것인가..no
                    closeByEscape: false,   // esc키 누를 때 닫히게 할 것인가
                    closeByDimmed: false,   // dim 클릭시 닫히게 할 것인가
                    events: {
                        modalshown: function (e) {
                            // 모달이 뜨면 내부 컨텐츠 영역이 포커싱되도록 tabindex를 설정
                            //this.$('.pop_contents').attr('tabindex', 0);
                            //console.log(this);
    
                            if(this.$('.ui_carousel')){
                                this.$('.ui_carousel').vcCarousel('update');
                            }
                        }
                    }
                });
    
                // 아코디언의 기본설정을 멀티오픈으로 설정해놓는다,
                vcui.ui.setDefaults('Accordion', {
                    singleOpen: false,
                    events: {
                        accordionexpand: function (e, data) {
                            data.content.attr('tabindex', '0');                                               
                            if(data.content.find('.ui_carousel')) {
                                data.content.find('.ui_carousel').vcCarousel('update');
                            }
                            
                        }
                    }
                });
    
    
                // 탭의 기본설정을 설정해놓는다,
                vcui.ui.setDefaults('Tab', {
                    events: {
                        tabchange: function (e, data) {
                            if(data && data.content.find('.ui_carousel')) {
                                data.content.find('.ui_carousel').vcCarousel('update');
                            }
                        }
                    }
                });
    
    
                // 공통 UI 빌드
                $('body').buildCommonUI();    
                $.holdReady(false); // ready함수 실행을 허용(이전에 등록된건 실행해준다.)
    
                // 모달이 열렸을 때 페이지 스크롤을 막기 위함 ////////////////////////////
                $doc.on('modalfirstopen modallastclose', function (e) {
    
                }).on('modalshown', function (e) {
                    // 모달이 뜰때 모달내부에 있는 공통 컴포넌트 빌드
                    $(e.target).buildCommonUI();
                });
                //////////////////////////////////////////////////////////////////////
    
                // 아코디온이 펼쳐지거나 닫힐 때 레이아웃 사이즈가 변하기 때문에 resize이벤트를 강제로 발생시킨다.
                $doc.on('accordionexpand accordioncollapse', vcui.delayRun(function (e) {
                    $(window).triggerHandler('resize');
                }, 200));
                ///////////////////////////////////////////////////////////////////////
    
            });
        },
      
        /**
         * 로딩을 보임         
         * @function
         * @name showLoading
         * @param {string} msg 로딩 메세지
         * @example
         * //common : 프로젝트 약어
         * common.showLoading('로딩중...');
         */
        showLoading:function(msg){
            var str = msg? msg : '로딩중';
            $('html').addClass('dim');            

            vcui.require([
                'ui/spinner'        
            ], function () {
                $('body').vcSpinner({msg:str});
            })

        },

        /**
         * 로딩을 숨김
         * @function
         * @name hideLoading
         * @example
         * //common : 프로젝트 약어
         * common.hideLoading();
         */
        hideLoading:function(){
            $('html').removeClass('dim');
            vcui.require([
                'ui/spinner'        
            ], function () {
                $('body').vcSpinner('stop');
            })
        },

        /**
         * 컨펌 창         
         * @function
         * @name confirm
         * @param {string} msg 컨펌 메세지
         * @param {Object} options 모달 옵션
         * @example
         * //common : 프로젝트 약어
         * common.confirm('안녕하세요', { 
         *  title:'confirm',
         *  ok:function(){},
         *  cancel:function(){}
         * });
         */
    
        confirm:function () {
    
            var confirmTmpl = '<div class="lay_wrap" role="alert">\n'+
            '   <div class="lay_header"><h1 class="h1_tit">{{title}}</h1></div>\n' +
            '   <div class="lay_content"><p class="ui-alert-msg"></p></div>\n' +
            '   <div class="btn_wrap half">\n' +
            '       <button type="button" class="bttn_pop ui_modal_close" data-role="ok"><span>확인</span></button>\n' + 
            '       <button type="button" class="bttn_pop ui_modal_close" data-role="cancel"><span>취소</span></button>\n' +
            '   </div></div>';

            return function (msg, options) {
            
                if (typeof msg !== 'string' && arguments.length === 0) {
                    options = msg;
                    msg = '';
                }
    
                var callbackOk, callbackCancel;
    
                if(options && options.ok && typeof options.ok =='function'){
                    callbackOk = options.ok;
                    delete options['ok'];
                } 
                if(options && options.cancel && typeof options.cancel =='function'){ 
                    callbackCancel = options.cancel;
                    delete options['cancel'];
                }
    
                $('html').addClass('dim');
                var el = $(vcui.template(confirmTmpl, {title:options && options.title? options.title:'알림창'})).appendTo('body');
                $(el).find('.ui-alert-msg').html(msg);

                vcui.require([
                    'ui/modal'        
                ], function () {

                    var modal = $(el).vcModal(vcui.extend({ removeOnClose: true }, options)).vcModal('instance');
                    modal.getElement().buildCommonUI();
                    modal.on('modalhidden modalok modalcancel', function (e) {
        
                        if(e.type =='modalok'){
                            if(callbackOk) callbackOk.call(this, e);
                        }else if(e.type == 'modalcancel'){
                            if(callbackCancel) callbackCancel.call(this, e);
                        }
        
                        $('html').removeClass('dim');
                        el = null;
                        modal = null;
                    });
                    return modal;

                })

    
                
            };
        }(),

        /**
         * 얼럿 창
         * @function  
         * @name alert   
         * @param {string} msg 얼럿 메세지
         * @param {Object} options 모달 옵션
         * @example
         * 
         * //common : 프로젝트 약어
         * common.alert('안녕하세요', {
         *  ok:function(){}
         * });
         *  
         */
        alert:function () {

            var alertTmpl = '<div class="lay_wrap" role="alert">\n'+
            '   <div class="lay_header"><h1 class="h1_tit">{{title}}</h1></div>\n' +
            '   <div class="lay_content"><p class="ui-alert-msg"></p></div>\n' +
            '   <div class="btn_wrap">\n'+
            '       <button type="button" class="bttn_pop ui_modal_close" data-role="ok"><span>확인</span></button>\n'+
            '   </div></div>';
    
    
            return function (msg, options) {
                if (typeof msg !== 'string' && arguments.length === 0) {
                    options = msg;
                    msg = '';
                }
    
                var callbackOk;
    
                if(options && options.ok && typeof options.ok =='function'){
                    callbackOk = options.ok;
                    delete options['ok'];
                } 
    
                $('html').addClass('dim');
    
                var el = $(vcui.template(alertTmpl, {title:options && options.title? options.title:'알림창'})).appendTo('body');
                $(el).find('.ui-alert-msg').html(msg);

                vcui.require([
                    'ui/modal'        
                ], function () {

                    var modal = $(el).vcModal(vcui.extend({ removeOnClose: true }, options)).vcModal('instance');
                    modal.getElement().buildCommonUI();
                    modal.on('modalhidden modalok', function (e) {
        
                        if(e.type =='modalok'){
                            if(callbackOk) callbackOk.call(this, e);
                        }
                        $('html').removeClass('dim');
                        el = null;
                        modal = null;
                    });
                    return modal;

                })


    
                
            };  
        }  

    };

    // 초기작업 실행
    document.addEventListener('DOMContentLoaded', function () {
        common.init();
    });

})(window, window.jQuery);