/**
 * @class
 * @name vcui.ui.Tooltip
 * @extends vcui.ui.View
 * @description 툴팁 컴포넌트
 * @version 1.0
 */
vcui.define('ui/tooltip', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var Tooltip = core.ui('Tooltip', /** @lends vcui.ui.Tooltip# */{
        $singleton: true,
        bindjQuery: 'tooltip',
        defaults: {
            interval: 200,
            attrName: "title"
        },
        templates: {
            tooltip: '<span class="ui-tooltip" role="tooltip" id="uiTooltip" style="z-index:100000;display:none;max-width:200px;height:auto;position:absolute;border:1px solid red;background:blue;" aria-hidden="true"></span>'
        },
        /**
         * 생성자
         * @param {string|element|jquery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {object} options 옵션값
         * @param {number} [options.interval = 200]
         * @param {string} [options.attrName = 'title']
         */
        initialize: function initialize(el, options) {
            var self = this;
            if (self.supr(el, options) === false) {
                return;
            }
            self._bindEvents();
        },


        /**
         * 이벤트 바인딩
         * @private
         */
        _bindEvents: function _bindEvents() {
            var self = this;
            var $tooltip = self.$tooltip = $(self.tmpl('tooltip')).appendTo('body');
            var attr = self.options.attrName;

            self.docOn('mouseenter mouseleave focusin focusout click', '[data-title]:not([disabled]), [' + attr + ']:not([disabled])', function (e) {

                switch (e.type) {
                    case 'mouseenter':
                    case 'focusin':
                        var el = self.activeEl = this,
                            title = '';

                        title = core.string.escapeHTML(el.getAttribute(attr) || el.getAttribute('data-title'));
                        if (!title) {
                            self._close(false);
                            return;
                        }

                        if (attr === 'title' && el.getAttribute(attr)) {
                            el.setAttribute('data-title', el.getAttribute(attr));
                            el.setAttribute('aria-describedby', 'uiTooltip');
                            el.removeAttribute(attr);
                        }
                        self.showTimer = setTimeout(function () {
                            if (!el || !title) {
                                return;
                            }

                            var measure = core.dom.getDimensions(el);
                            if (measure.left === 0 && measure.top === 0) {
                                self._close();
                                return;
                            }

                            $tooltip.get(0).innerText = title;
                            var isUpOut = measure.top - measure.height < 0,
                                tooltipWidth = $tooltip.outerWidth(),
                                tooltipHeight = $tooltip.outerHeight(),
                                diff = measure.width - tooltipWidth,
                                pos = {};

                            if (isUpOut) {
                                $tooltip.removeClass('top bottom').addClass('top');
                                pos.top = measure.top + measure.height + 4;
                            } else {
                                $tooltip.removeClass('top bottom').addClass('bottom');
                                pos.top = measure.top - tooltipHeight - 6;
                            }
                            pos.left = measure.left + diff / 2 + core.dom.getScrollLeft();
                            pos.top += core.dom.getScrollTop();

                            $tooltip.css(pos).fadeIn('fast');
                            $tooltip.attr('aria-hidden', 'false');
                            self.isShow = true;
                        }, 500);
                        break;
                    case 'mouseleave':
                    case 'focusout':
                        self._close();
                        break;
                }
            }).on('mousedown', function () {
                self._close();
            });
        },
        _close: function _close(effect) {
            var self = this;
            clearTimeout(self.showTimer);
            clearTimeout(self.hideTimer);
            self.hideTimer = self.showTimer = null;

            if (self.activeEl) {
                self.activeEl = null;
            }

            if (!self.isShow) {
                return;
            }
            self.isShow = false;

            if (effect) {
                self.$tooltip.fadeOut('fast');
            } else {
                self.$tooltip.hide();
            }
            self.$tooltip.attr('aria-hidden', 'true');
        }
    });

    return Tooltip;
});