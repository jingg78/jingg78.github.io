/**
 * @class
 * @name vcui.ui.lazyload
 * @extends vcui.ui.View
 * @description lazyload
 * @version 1.0
 * @see {@link https://github.com/tuupola/lazyload}
 * @example 
 * vcui.require(['ui/lazyload'], function () {
 *  // $('#wrap').vcLazyload({selectors:{images:'.box > img'}});	  
 *  $('body').vcLazyload();	// default 'lazyload' => $('body').find('.lazeload')		  
 *  });
 */
vcui.define('ui/lazyload', ['jquery', 'vcui'], function($, core) {
    "use strict";

    var Lazyload = core.ui('Lazyload', /**@lends vcui.ui.lazyload# */ {
        bindjQuery: 'lazyload',
        defaults: {
            src: "data-src",
            srcset: "data-srcset",
            root: null,
            rootMargin: "0px",
            threshold: 0
        },
        selectors:{
            images : ".lazyload"
        },

        /**
         * 생성자
         * @param el
         * @param options
         * @returns {boolean}
         */
        initialize: function (el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return false;
            }
            if (!window.IntersectionObserver) {
                self.loadImages();
                return;
            }
            self.root = self.options.root;
            if(self.root instanceof $){
                self.root = self.root[0];
            }

            var observerConfig = {
                root: self.root, //만일 root 가 null이라면 현재 document가 root로 사용되며, 그것의 viewport의 경계(즉 document의 노출 영역)가 root 의 경계로 사용됩니다.
                rootMargin: self.options.rootMargin,
                threshold: [self.options.threshold]
            };

            // IntersectionObserver 를 등록한다.
            self.observer = new IntersectionObserver(function(entries){
                entries.forEach(function(entry){
                    if (entry.isIntersecting) {        
                        self.observer.unobserve(entry.target);
                        var src = entry.target.getAttribute(self.options.src);
                        var srcset = entry.target.getAttribute(self.options.srcset);
                        if ("img" === entry.target.tagName.toLowerCase()) {
                            if (src) {
                                entry.target.src = src;
                            }
                            if (srcset) {
                                entry.target.srcset = srcset;
                            }
                        } else {
                            entry.target.style.backgroundImage = "url(" + src + ")";
                        }
                        
                    }
                })
            }, observerConfig)
            
            // 관찰할 대상을 선언하고, 해당 속성을 관찰시킨다.
            self.$images.each(function(i, el){
                self.observer.observe(el);
            })

            
        },

        loadAndDestroy: function () {
            this.loadImages();
            this.destroy();
        },

        loadImages: function () {
            var self = this;

            self.$images.each(function(idx, item){
                var $img = $(item);
                var src = $img.attr(self.options.src);
                var srcset = $img.attr(self.options.srcset);
                if ($img.is('img')) {
                    if (src) $img.attr("src", src);
                    if (srcset) $img.attr("srcset", srcset);
                }else{
                    if(src) $img.css({'backgroundImage': "url('" + src + "')"});
                }  
            });
        },

        destroy: function () {
            this.observer.disconnect();
            this.supr();
        }
    });

    return Lazyload;

});