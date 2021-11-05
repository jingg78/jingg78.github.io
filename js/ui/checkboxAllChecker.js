/**
 * @class
 * @name vcui.ui.CheckboxAllChecker
 * @extends vcui.ui.View
 * @description CheckboxAllChecker 컴포넌트
 * @version 1.0
 */
vcui.define('ui/checkboxAllChecker', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var CheckboxAllChecker = core.ui('CheckboxAllChecker', /**@lends vcui.ui.CheckboxAllChecker# */{
        bindjQuery: 'checkboxAllChecker',
        defaults: {
            mode: ''
        },
        initialize: function initialize(el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self.allCheck = true;
            self.$wrapper = $(self.$el.attr('data-check-all'));
            self.checkOnce = self.$el.data('checkOnce');
            self.limit = self.$el.data('checkLimit');
            if (self.$wrapper.size() === 0) {
                return;
            }

            self._bindEvents();
        },
        _bindEvents: function _bindEvents() {
            var self = this,
                selector = ':checkbox:enabled:not(.ui_checkall_ignore)';

            // 전체선택 체크박스 선택시
            self.on('change', function (e, data) {
                if (data) {
                    return;
                }

                if (self.limit > 0) {
                    self.allCheck = false;
                    self.$wrapper.find('[type=checkbox]:enabled:not(.ui_checkall_ignore):lt(' + self.limit + ')').not(this).prop('checked', this.checked);
                } else {
                    self.$wrapper.find('[type=checkbox]:enabled:not(.ui_checkall_ignore)').not(this).prop('checked', this.checked);
                }
            });

            var oldCount;

            // 소속 체크박스를 선택시
            self.$wrapper.on('change', ':checkbox', function (e) {
                if (this === self.$el[0]) {
                    return;
                }
                var count = self.$wrapper.find(selector + ':not(:checked)').not(self.$el[0]).length,
                    checkedCount = self.$wrapper.find(selector + ':checked').not(self.$el[0]).length,
                    allCount = self.$wrapper.find(selector).not(self.$el[0]).length;

                if (self.checkOnce) {
                    self._checked(checkedCount > 0);
                } else if (oldCount !== count && self.allCheck) {
                    oldCount = count;
                    self._checked(count === 0); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
                } else if (checkedCount > self.limit) {
                    $(this).prop('checked', false);
                    oldCount = count;
                    self._checked(checkedCount === self.limit); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
                } else {
                    self._checked(checkedCount === self.limit || checkedCount === allCount); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
                }
            });
        },
        _checked: function _checked(flag) {
            var self = this;

            if (self.$el.prop('checked') === flag) {
                return;
            }
            self.$el.prop('checked', flag).trigger('change', { isTrigger: true });
        },
        update: function update() {
            var self = this,
                selector = ':checkbox:enabled:not(.ui_checkall_ignore)',
                oldCount;

            var count = self.$wrapper.find(selector + ':not(:checked)').not(self.$el[0]).length,
                checkedCount = self.$wrapper.find(selector + ':checked').not(self.$el[0]).length,
                allCount = self.$wrapper.find(selector).not(self.$el[0]).length;

            if (self.checkOnce) {
                self.$el.prop('checked', checkedCount > 0);
            } else if (oldCount !== count && self.allCheck) {
                oldCount = count;
                self.$el.prop('checked', count === 0); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
            } else if (checkedCount > self.limit) {
                $(this).prop('checked', false);
                oldCount = count;
                self.$el.prop('checked', checkedCount === self.limit); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
            } else {
                self.$el.prop('checked', checkedCount === self.limit || checkedCount === allCount); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
            }
        }
    });

    return CheckboxAllChecker;
});