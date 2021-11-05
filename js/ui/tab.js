/**
 * @class
 * @name vcui.ui.Tab
 * @extends vcui.ui.View
 * @description 탭 컴포넌트
 * @version 1.0
 * @example
 *  $(...).on('tabchange', function(e,data){
 *      console.log(data);
 *  }).vcTab({selectedIndex:1,..});
 */

 vcui.define('ui/tab', ['jquery', 'vcui', 'ui/smoothScroll'], function ($, core) {
    "use strict";

    var name = 'tab',
        eventBeforeChange = name + 'beforechange',
        eventChanged = name + 'change',
        selectedClass = 'on';

    var prefixClass = '.ui_tab_';

    var Tab = core.ui('Tab', /** @lends vcui.ui.Tab# */{
        bindjQuery: 'tab',
        $statics:{
            ON_CHANGE: eventBeforeChange,
            ON_CHANGED: eventChanged
        },
        defaults: {
            selectedIndex: 0,
            selectedClass: selectedClass,
            selectedText: '선택됨',
            tabsSelector: '>ul>li',
            tabForceHeight: false
        },

        selectors: {},
        /**
         * 생성자
         * @param {string|element|jquery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {object} options 옵션값
         * @param {number} [options.selectedIndex = 0]   초기선택값
         * @param {string} [options.selectedClass = 'on']  활성 css클래스명
         * @param {string} [options.selectedText = '선택됨'] 선택시 label 네임
         * @param {string} [options.tabsSelector ='>ul>li'] 탭선택자
         * @param {boolean} [options.tabForceHeight =false] 탭에 강제로 높이값을 셋팅
         */
        initialize: function initialize(el, options) {
            var self = this;
            if (self.supr(el, options) === false) {
                return;
            }

            var $hide = self.$('.hide:first');
            self.$srText = $hide.length ? $hide : $('<em class="hide">' + self.options.selectedText + '</em>');

            var $child = self.$el.children().eq(0);
            if (!$child.is('ul')) {
                self.options.tabsSelector = '>' + $child[0].tagName.toLowerCase() + self.options.tabsSelector;
                if ($child.css('overflow') === 'hidden') {
                    $child.vcSmoothScroll();
                }
            }

            self.update();
            self._bindEvents();

            var index = self.$tabs.filter('.' + selectedClass).index();
            if (index >= 0) {
                self.options.selectedIndex = index;
            }
            self.select(self.options.selectedIndex);
        },
        /**
         * 파괴자
         */
        destroy:function destroy(){
            var self = this;
            self.off('click keydown', self.options.tabsSelector + '>a, ' + self.options.tabsSelector + '>button');
            self.supr();
        },
        /**
         * 업데이트
         */
        update: function update() {
            var self = this;
            self._findControls();
            self._buildARIA();
        },

        /**
         * 선택된 인덱스를 구한다.
         * @returns {Number}
         */
        getSelectIdx:function getSelectIdx(){
            return this.selectedIndex;
        },
        /**
         * @private
         */
        _findControls: function _findControls() {
            var self = this;
            var selectors = [];
            self.$tabs = self.$(self.options.tabsSelector);
            self.$contents = $();
            // 탭버튼의 href에 있는 #아이디 를 가져와서 컨텐츠를 조회
            self.$tabs.each(function () {
                var $tab = $(this),
                    $panel,
                    href = $tab.find('a').attr('href');
                if (href && /^(#|\.)\w+/.test(href)) {
                    if (($panel = $tab.find('>div')).length) {
                        self.$contents = self.$contents.add($panel);
                    } else {
                        self.$contents = self.$contents.add($(href));
                    }
                }
            });
            if (!self.$contents.length) {
                self.$contents = self.$('>' + prefixClass + 'panel');
            }
        },
        /**
         * @private
         */
        _bindEvents: function _bindEvents() {
            var self = this;
            self.on('click keydown', self.options.tabsSelector + '>a, ' + self.options.tabsSelector + '>button', function (e) {
                switch (e.type) {
                    case 'click':
                        e.preventDefault();
                        self.select($(e.currentTarget).parent().index());
                        break;
                    case 'keydown':
                        var index = $(e.currentTarget).parent().index(),
                            newIndex;
                        switch (e.which) {
                            case core.keyCode.RIGHT:
                                e.preventDefault();
                                newIndex = Math.min(self.$tabs.length - 1, index + 1);
                                break;
                            case core.keyCode.LEFT:
                                e.preventDefault();
                                newIndex = Math.max(0, index - 1);
                                break;
                            default:
                                return;
                        }
                        self.select(newIndex);
                        self.$tabs.eq(self.selectedIndex).find('>a, >button').focus();
                        break;
                }
            });
        },
        /**
         * aria 속성 빌드
         * @private
         */
        _buildARIA: function _buildARIA() {
            var self = this,
                tablistid = self.cid,
                tabid;
            self.$el.attr('role', 'tablist');
            self.$tabs.each(function (i) {
                tabid = $(this).children().attr('href').substr(1) || (tablistid + '_' + i);
                $(this)
                    .attr({
                        'role': 'presentation'
                    })
                    .children()
                    .attr({
                        //'id': tabid,
                        'role': 'tab',
                        'aria-selected': 'false',
                        'aria-controls': tabid
                    });
                if (!self.$contents.eq(i).attr('id')) {
                    self.$contents.eq(i).attr('id', tabid);
                }
                self.$contents.eq(i).attr({
                    'aria-labelledby': tabid,
                    'role': 'tabpanel',
                    'aria-hidden': self.selectedIndex === i ? 'false' : 'true'
                });
            });
        },
        /**
         * @private
         */
        _updateTabHeight: function () {
            var self = this;
            var maxHeight = 0;
            if (self.options.tabForceHeight) {
                self.$tabs.find('a').css('height', '').each(function (i) {
                    var h = $(this).height();
                    if (h > maxHeight) {
                        maxHeight = h;
                    }
                });
                self.$tabs.find('a').css('height', maxHeight);
            }
        },
        /**
         * index에 해당하는 탭을 활성화
         * @param {number} index 탭버튼 인덱스
         * @fires vcui.ui.Tab#tabbeforechange
         * @fires vcui.ui.Tab#tabchange
         * @example
         * $('#tab').vcTab('select', 1);
         * // or
         * $('#tab').vcTab('instance').select(1);
         */
        select: function select(index, noTrigger) {
            var self = this,
                e;

            if(!noTrigger){
                //if (index < 0 || self.$tabs.length && index >= self.$tabs.length) {
                if (self.$tabs.length && index >= self.$tabs.length) {
                    return;
                    //throw new Error('index 가 범위를 벗어났습니다.');
                }
            }
            
            if(!noTrigger){

                /**
                 * 탭이 바뀌기 직전에 발생. e.preventDefault()를 호출함으로써 탭변환을 취소할 수 있다.
                 * @event vcui.ui.Tab#tabbeforechange
                 * @type {object}
                 * @property {number} selectedIndex 선택된 탭버튼의 인덱스
                 * @property {jquery} relatedTarget 관련된 엘리먼트
                 * @property {jquery} button 버튼 엘리먼트
                 * @property {jquery} content 컨텐츠 엘리먼트
                 */

                self.triggerHandler(e = $.Event(eventBeforeChange), {
                    selectedIndex: index,
                    relatedTarget: self.$tabs.get(index),
                    button: self.$tabs.eq(index).find('>a'),
                    content: self.$contents.eq(index)
                });
                if (e.isDefaultPrevented()) {
                    return;
                }
            }

            self.selectedIndex = index;
            var $a, $hide;

            if(index<0){
                $a = self.$tabs.removeClass(selectedClass).children('a, button').attr('aria-selected', false);
            }else{
                $a = self.$tabs.removeClass(selectedClass).children('a, button').attr('aria-selected', false).end().eq(index).addClass(selectedClass).children('a, button').attr('aria-selected', true);
            }        

            if (($hide = $a.find('.hide')).length) {
                self.$tabs.not(self.$tabs.eq(index)).find('>a .hide').text("");
                $hide.text(self.options.selectedText);
            } else {
                $a.append(self.$srText);
            }

            // 컨텐츠가 li바깥에 위치한 탭인 경우
            if(index<0){
                self.$contents.hide().attr('aria-hidden', 'true');
            }else{
                self.$contents.hide().attr('aria-hidden', 'true').eq(index).attr('aria-hidden', 'false').show();
            }

            self._updateTabHeight();

            if(!noTrigger){
                /**
                 * 탭이 바뀌기 직전에 발생. e.preventDefault()를 호출함으로써 탭변환을 취소할 수 있다.
                 * @event vcui.ui.Tab#tabchange
                 * @type {object}
                 * @property {number} selectedIndex 선택된 탭버튼의 인덱스
                 * @property {jquery} relatedTarget 관련된 엘리먼트
                 * @property {jquery} button 버튼 엘리먼트
                 * @property {jquery} content 컨텐츠 엘리먼트
                 */

                //evt = $.Event(eventChanged)

                self.triggerHandler(eventChanged, {
                    selectedIndex: index,
                    relatedTarget: self.$tabs.get(index),
                    button: self.$tabs.eq(index).find('>a'),
                    content: self.$contents.eq(index)
                });
            }
        }

    });
    ///////////////////////////////////////////////////////////////////////////////////////

    return Tab;
});