
/**
 * @class
 * @name vcui.ui.Spinner
 * @extends vcui.ui.View
 * @description 로딩 컴포넌트
 * @version 1.0
 * @see {@link https://spin.js.org}
 */


vcui.define('ui/spinner', ['jquery', 'vcui'], function ($, core) {
    "use strict";    

    function importCss() {
        var keyFramePrefixes = ["-webkit-","-o-","-moz-", ""];
        var keyFrames, textNode;
        var cssElement = document.createElement('style');
        cssElement.type = 'text/css';
        
        for(var i in keyFramePrefixes){
            keyFrames = '@'+keyFramePrefixes[i]+'keyframes ui-spinner-line-fade-more{' +
            '0%,100% {opacity:0;} ' +
            '1% {opacity:1;}' +
            '}';
            textNode = document.createTextNode(keyFrames);
            cssElement.appendChild(textNode);
        
            keyFrames = '@'+keyFramePrefixes[i]+'keyframes ui-spinner-line-fade-quick{' +
            '0%,39%,100% {opacity:0.25;} ' +
            '40% {opacity:1;}' +
            '}';
            textNode = document.createTextNode(keyFrames);
            cssElement.appendChild(textNode);
        
            keyFrames = '@'+keyFramePrefixes[i]+'keyframes ui-spinner-line-fade-default{' +
            '0%,100% {opacity:0.22;} ' +
            '1% {opacity:1;}' +
            '}';
            textNode = document.createTextNode(keyFrames);
            cssElement.appendChild(textNode);
        }

        cssElement.appendChild( document.createTextNode('.ui-spinner-msg{ text-align:center; font-weight:bold; margin-top:16px;}') );        
        document.getElementsByTagName('head')[0].appendChild(cssElement);
    }

    
    function getColor(color, idx) {
        return typeof color == 'string' ? color : color[idx % color.length];
    }
    
    function parseBoxShadow(boxShadow) {
        var regex = /^\s*([a-zA-Z]+\s+)?(-?\d+(\.\d+)?)([a-zA-Z]*)\s+(-?\d+(\.\d+)?)([a-zA-Z]*)(.*)$/;
        var shadows = [];
        for (var _i = 0, _a = boxShadow.split(','); _i < _a.length; _i++) {
            var shadow = _a[_i];
            var matches = shadow.match(regex);
            if (matches === null) {
                continue; // invalid syntax
            }
            var x = +matches[2];
            var y = +matches[5];
            var xUnits = matches[4];
            var yUnits = matches[7];
            if (x === 0 && !xUnits) {
                xUnits = yUnits;
            }
            if (y === 0 && !yUnits) {
                yUnits = xUnits;
            }
            if (xUnits !== yUnits) {
                continue; // units must match to use as coordinates
            }
            shadows.push({
                prefix: matches[1] || '',
                x: x,
                y: y,
                xUnits: xUnits,
                yUnits: yUnits,
                end: matches[8],
            });
        }
        return shadows;
    }
    /**
     * Modify box-shadow x/y offsets to counteract rotation
     */
    function normalizeShadow(shadows, degrees) {
        var self = this;
        var normalized = [];
        for (var _i = 0, shadows_1 = shadows; _i < shadows_1.length; _i++) {
            var shadow = shadows_1[_i];
            var xy = convertOffset(shadow.x, shadow.y, degrees);
            normalized.push(shadow.prefix + xy[0] + shadow.xUnits + ' ' + xy[1] + shadow.yUnits + shadow.end);
        }
        return normalized.join(', ');
    }

    function convertOffset(x, y, degrees) {
        var radians = degrees * Math.PI / 180;
        var sin = Math.sin(radians);
        var cos = Math.cos(radians);
        return [
            Math.round((x * cos + y * sin) * 1000) / 1000,
            Math.round((-x * sin + y * cos) * 1000) / 1000,
        ];
    }


    var Spinner = core.ui('Spinner', /** @lends vcui.ui.Spinner# */{
        bindjQuery: 'spinner',
        defaults: {
            lines: 8,   // The number of lines to draw
            length: 8, // The length of each line
            width: 8,  // The line thickness
            radius: 16, // The radius of the inner circle
            scale: 1.0, // Scales overall size of the spinner
            corners: 0.8,       // Corner roundness (0..1)
            color: '#ffffff',   // CSS color or array of colors
            fadeColor: 'transparent', // CSS color or array of colors
            animation: 'ui-spinner-line-fade-default', //ui-spinner-line-fade-more, ui-spinner-line-fade-quick
            rotate: 0,      // The rotation offset
            direction: 1,   // 1: clockwise, -1: counterclockwise
            speed: 1.3,     // Rounds per second
            zIndex: 2e9,    // The z-index (defaults to 2000000000)
            className: 'ui-spinner', // The CSS class to assign to the spinner
            msgClassName: 'ui-spinner-msg', // The CSS class to assign to the spinner message
            top: '50%',     // Top position relative to parent
            left: '50%',    // Left position relative to parent
            shadow: '0 0 2px 2px #00000030', // Box-shadow for the lines
            position: 'absolute',           // Element positioning
            msg:'' // message
        },

        /**
         * 생성자
         * @param {string|element|jquery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {object} options 옵션값
         * @param {number} [options.lines = 8] The number of lines to draw
         * @param {number} [options.length = 8] The length of each line
         * @param {number} [options.width = 8]  The line thickness
         * @param {number} [options.radius = 16] The radius of the inner circle
         * @param {number} [options.scale = 1.0] Scales overall size of the spinner
         * @param {number} [options.corners = 0.8] Corner roundness (0..1)
         * @param {string} [options.color = '#ffffff'] CSS color or array of colors
         * @param {string} [options.fadeColor = 'transparent'] CSS color or array of colors
         * @param {string} [options.animation = 'ui-spinner-line-fade-default'] ui-spinner-line-fade-more, ui-spinner-line-fade-quick
         * @param {number} [options.rotate = 0] The rotation offset
         * @param {number} [options.direction = 1] 1 = clockwise], -1 = counterclockwise
         * @param {number} [options.speed = 1.3] Rounds per second
         * @param {number} [options.zIndex = 2e9] The z-index (defaults to 2000000000)
         * @param {string} [options.className = 'ui-spinner'] The CSS class to assign to the spinner
         * @param {string} [options.msgClassName = 'ui-spinner-msg'] The CSS class to assign to the spinner message
         * @param {string} [options.top = '50%'] Top position relative to parent
         * @param {string} [options.left = '50%'] Left position relative to parent
         * @param {string} [options.shadow = '0 0 2px 2px #00000030'] Box-shadow for the lines
         * @param {string} [options.position = 'absolute'] Element positioning
         * @param {string} [options.msg =''] message
         */        
        initialize: function initialize(el, options) {
            var self = this;
            if (self.supr(el, options) === false) {
                return;
            }
            importCss();
            self.spin();
        },
        /**
         * spin start
         */

        spin: function spin() {
            var self = this;
            var opts = self.options;

            self.stop();
            self.$contents = $('<div></div>');            
            self.$contents.attr('role', 'progressbar');

            //var yp = (opts.msg && opts.msg != '')? 'calc('+opts.top+' - 20px)' : opts.top;
            
            self.$contents.css({
                position: opts.position,
                width: 0,
                zIndex: opts.zIndex,
                left: opts.left,
                top: opts.top,
                transform: "scale(" + opts.scale + ")",
            });

            if(opts.className) self.$contents.addClass(opts.className);
            self.$el.append(self.$contents);            
            self._build();
        },
        /**
         * stop
         */
        stop: function stop() {
            var self = this;
            if(self.$contents) {
                self.$contents.remove();
            }
            
        },

        _build: function _build() {
            var self = this;
            var opts = self.options;

            var borderRadius = (Math.round(opts.corners * opts.width * 500) / 1000) + 'px';
            var shadow = 'none';
            if (opts.shadow === true) {
                shadow = '0 2px 4px #000'; // default shadow
            }else if (typeof opts.shadow === 'string') {
                shadow = opts.shadow;
            }
            var shadows = parseBoxShadow(shadow);
            for (var i = 0; i < opts.lines; i++) {
                var degrees = ~~(360 / opts.lines * i + opts.rotate); // Math.floor()

                var $backgroundLine = $('<div></div>').css({
                    position: 'absolute',
                    top: -opts.width / 2,
                    width: (opts.length + opts.width),
                    height: opts.width,
                    background: getColor(opts.fadeColor,i),
                    borderRadius: borderRadius,
                    transformOrigin: 'left',
                    transform: "rotate(" + degrees + "deg) translateX(" + opts.radius + "px)"
                });


                var delay = i * opts.direction / opts.lines / opts.speed;
                delay -= 1 / opts.speed; // so initial animation state will include trail
                var $line = $('<div></div>').css({
                    width: '100%',
                    height: '100%',
                    background: getColor(opts.color, i),
                    borderRadius: borderRadius,
                    boxShadow: normalizeShadow(shadows, degrees),
                    animation: 1 / opts.speed + "s linear " + delay + "s infinite " + opts.animation,
                });
                $backgroundLine.append($line);
                self.$contents.append($backgroundLine);
            }

            if(opts.msg && opts.msg != ''){

                var $msg = $('<div>' + opts.msg + '</div>').css({
                    position: 'absolute',
                    top: (opts.radius + opts.length + opts.width),
                    left: -200,//-(opts.radius + opts.length + opts.width),
                    width: 400,//(opts.radius + opts.length + opts.width)*2,                    
                    color:getColor(opts.color, 0)
                });
                
                if(opts.msgClassName) $msg.addClass(opts.msgClassName);    
                self.$contents.append($msg);

            }           

        }


    });
    ///////////////////////////////////////////////////////////////////////////////////////

    return Spinner;
});