(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{393:function(e,c,t){"use strict";t.r(c);var n=["Shanghai","Beijing","Guangzhou","Shenzhen"],h={data:function(){return{checked:!0,checkAll:!1,checkedCities:["Shanghai","Beijing"],cities:n,isIndeterminate:!0,checkboxGroup:["Shanghai"]}},methods:{handleCheckAllChange:function(e){this.checkedCities=e?n:[],this.isIndeterminate=!1},handleCheckedCitiesChange:function(e){var c=e.length;this.checkAll=c===this.cities.length,this.isIndeterminate=c>0&&c<this.cities.length}}},l=t(1),component=Object(l.a)(h,(function(){var e=this,c=e.$createElement,t=e._self._c||c;return t("div",[t("h1",[e._v("CheckBox")]),e._v(" "),t("div",{staticStyle:{margin:"15px 0"}},[t("h3",[e._v("Basic usage")]),e._v(" "),t("vc-checkbox",{model:{value:e.checked,callback:function(c){e.checked=c},expression:"checked"}},[e._v("Checkbox")])],1),e._v(" "),t("div",{staticStyle:{margin:"50px 0"}},[t("h3",[e._v("Check All")]),e._v(" "),t("vc-checkbox",{attrs:{indeterminate:e.isIndeterminate},on:{change:e.handleCheckAllChange},model:{value:e.checkAll,callback:function(c){e.checkAll=c},expression:"checkAll"}},[e._v("Check all")]),e._v(" "),t("div",{staticStyle:{margin:"15px 0"}}),e._v(" "),t("vc-checkbox-group",{on:{change:e.handleCheckedCitiesChange},model:{value:e.checkedCities,callback:function(c){e.checkedCities=c},expression:"checkedCities"}},e._l(e.cities,(function(c){return t("vc-checkbox",{key:c,attrs:{label:c}},[e._v(e._s(c))])})),1)],1),e._v(" "),t("div",{staticStyle:{margin:"50px 0"}},[t("h3",[e._v("Button Style")]),e._v(" "),t("vc-checkbox-group",{model:{value:e.checkboxGroup,callback:function(c){e.checkboxGroup=c},expression:"checkboxGroup"}},e._l(e.cities,(function(c){return t("vc-checkbox-button",{key:c,attrs:{label:c}},[e._v(e._s(c))])})),1)],1)])}),[],!1,null,null,null);c.default=component.exports}}]);