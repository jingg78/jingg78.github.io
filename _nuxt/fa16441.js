(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{357:function(t,e,n){var content=n(369);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(7).default)("45c7ad45",content,!0,{sourceMap:!1})},358:function(t,e,n){var content=n(371);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(7).default)("4ca5a706",content,!0,{sourceMap:!1})},368:function(t,e,n){"use strict";n(357)},369:function(t,e,n){var o=n(6)(!1);o.push([t.i,'.btn[data-v-4952f460]{display:inline-block;padding:0 15px;border:1px solid #ccc;border-radius:3px;background-color:#fff;color:#333;line-height:30px;text-align:center;vertical-align:middle;cursor:pointer}.btn.disabled[data-v-4952f460]{border:1px solid #d9d9d9;background-color:#f2f2f2;cursor:default;pointer-events:none}.btn_ico[data-v-4952f460]{display:inline-block;width:21px;height:21px;margin:0;border:0}.btn .ico[data-v-4952f460],.btn_ico.facebook[data-v-4952f460]{background:tomato}.btn .ico[data-v-4952f460]{display:inline-block;width:16px;height:16px;margin-top:-3px;vertical-align:middle}.btn.ico span[data-v-4952f460]{display:inline-block;position:relative;padding-left:23px}.btn.ico span[data-v-4952f460]:before{content:"";display:block;position:absolute;top:6px;left:0;width:16px;height:16px;background:tomato}',""]),t.exports=o},370:function(t,e,n){"use strict";n(358)},371:function(t,e,n){var o=n(6)(!1);o.push([t.i,".btn_wrap[data-v-65458c8c]{position:relative;margin-top:20px;padding-top:10px;border-top:1px solid #ccc;text-align:center}.btn_wrap .left[data-v-65458c8c]{position:absolute;left:0;top:10px}.btn_wrap .right[data-v-65458c8c]{position:absolute;right:0;top:10px}",""]),t.exports=o},390:function(t,e,n){"use strict";n.r(e);var o={name:"VcButton",props:{nativeType:{type:String,default:"button"},iconType:Boolean,disabled:Boolean},computed:{btnType:function(){return this.iconType?"btn_ico":"btn"}},methods:{handleClick:function(t){this.$emit("click",t)}}},v=(n(368),n(1)),c=Object(v.a)(o,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("button",{class:[t.btnType,{disabled:t.disabled}],attrs:{type:t.nativeType,disabled:t.disabled}},[t.iconType?[n("span",{staticClass:"hide"},[t._t("default")],2)]:[t._t("default")]],2)}),[],!1,null,"4952f460",null).exports,l={name:"VcButtonGroup"},_=(n(370),Object(v.a)(l,(function(){var t=this,e=t.$createElement;return(t._self._c||e)("div",{staticClass:"btn_wrap"},[t._t("default")],2)}),[],!1,null,"65458c8c",null).exports),d={name:"ExampleButton",data:function(){return{html01:'<vc-button>버튼</vc-button>\n\n<vc-button nativeType="submit">버튼</vc-button>\n\n<vc-button nativeType="reset">버튼</vc-button>\n\n<vc-button disabled>비활성</vc-button>',html02:'<vc-button iconType class="facebook">페이스북</vc-button>',html03:'<vc-button>\n  \x3c!-- slot --\x3e\n  <span class="ico"></span> 버튼\n  \x3c!-- //slot --\x3e\n</vc-button>\n\n<vc-button class="ico">\n  \x3c!-- slot --\x3e\n  <span>버튼</span>\n  \x3c!-- //slot --\x3e\n</vc-button>',html04:'<vc-button-group>\n  \x3c!-- slot --\x3e\n  <div class="left">\n    <vc-button>좌측 정렬</vc-button>\n  </div>\n  <vc-button>중앙 정렬</vc-button>\n  <div class="right">\n    <vc-button>우측 정렬</vc-button>\n  </div>\n  \x3c!-- //slot --\x3e\n</vc-button-group>'}},components:{VcButton:c,VcButtonGroup:_}},r=Object(v.a)(d,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"App"},[n("h1",[t._v("Button")]),t._v(" "),t._m(0),t._v(" "),n("h2",[t._v("# 텍스트 버튼")]),t._v(" "),n("div",[n("vc-button",[t._v("버튼 (type=button)")]),t._v(" "),n("vc-button",{attrs:{nativeType:"submit"}},[t._v("버튼 (type=submit)")]),t._v(" "),n("vc-button",{attrs:{nativeType:"reset"}},[t._v("버튼 (type=reset)")]),t._v(" "),n("vc-button",{attrs:{disabled:""}},[t._v("비활성")])],1),t._v(" "),n("div",{staticClass:"page-decription"},[n("h3",[t._v("Usage")]),t._v(" "),n("highlight-code",{attrs:{lang:"xml"}},[t._v(t._s(t.html01))]),t._v(" "),n("h3",[t._v("Attributes")]),t._v(" "),t._m(1)],1),t._v(" "),n("h2",[t._v("# 아이콘 버튼")]),t._v(" "),n("div",[n("vc-button",{staticClass:"facebook",attrs:{iconType:""}},[t._v("페이스북")])],1),t._v(" "),n("div",{staticClass:"page-decription"},[n("h3",[t._v("Usage")]),t._v(" "),n("highlight-code",{attrs:{lang:"xml"}},[t._v(t._s(t.html02))]),t._v(" "),n("h3",[t._v("Attributes")]),t._v(" "),t._m(2)],1),t._v(" "),n("h2",[t._v("# 아이콘+텍스트 버튼")]),t._v(" "),n("div",[n("vc-button",[n("span",{staticClass:"ico"}),t._v(" 버튼")]),t._v(" "),n("vc-button",{staticClass:"ico"},[n("span",[t._v("버튼")])])],1),t._v(" "),n("div",{staticClass:"page-decription"},[n("h3",[t._v("Usage")]),t._v(" "),n("highlight-code",{attrs:{lang:"xml"}},[t._v(t._s(t.html03))])],1),t._v(" "),n("h2",[t._v("# 버튼 영역 정렬")]),t._v(" "),n("div",[n("vc-button-group",[n("div",{staticClass:"left"},[n("vc-button",[t._v("좌측 정렬")])],1),t._v(" "),n("vc-button",[t._v("중앙 정렬")]),t._v(" "),n("div",{staticClass:"right"},[n("vc-button",[t._v("우측 정렬")])],1)],1)],1),t._v(" "),n("div",{staticClass:"page-decription"},[n("h3",[t._v("Usage")]),t._v(" "),n("highlight-code",{attrs:{lang:"xml"}},[t._v(t._s(t.html04))])],1)])}),[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ul",[n("li",[t._v("- 라운드 스타일 표현은 CSS를 기본으로 한다.")])])},function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("table",[n("thead",[n("tr",[n("th",[t._v("Attribute")]),t._v(" "),n("th",[t._v("Description")]),t._v(" "),n("th",[t._v("Type")]),t._v(" "),n("th",[t._v("Accepted Values")]),t._v(" "),n("th",[t._v("Default")])])]),t._v(" "),n("tbody",[n("tr",[n("td",[t._v("nativeType")]),t._v(" "),n("td",[t._v("type 속성을 지정합니다.")]),t._v(" "),n("td",[t._v("string")]),t._v(" "),n("td",[t._v("button / submit / reset")]),t._v(" "),n("td",[t._v("button")])]),t._v(" "),n("tr",[n("td",[t._v("disabled")]),t._v(" "),n("td",[t._v("비활성 상태를 지정합니다.")]),t._v(" "),n("td",[t._v("boolean")]),t._v(" "),n("td",[t._v("false / true")]),t._v(" "),n("td",[t._v("false")])])])])},function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("table",[n("thead",[n("tr",[n("th",[t._v("Attribute")]),t._v(" "),n("th",[t._v("Description")]),t._v(" "),n("th",[t._v("Type")]),t._v(" "),n("th",[t._v("Accepted Values")]),t._v(" "),n("th",[t._v("Default")])])]),t._v(" "),n("tbody",[n("tr",[n("td",[t._v("iconType")]),t._v(" "),n("td",[t._v("아이콘 버튼 타입을 설정합니다.")]),t._v(" "),n("td",[t._v("boolean")]),t._v(" "),n("td",[t._v("false / true")]),t._v(" "),n("td",[t._v("false")])])])])}],!1,null,null,null);e.default=r.exports}}]);