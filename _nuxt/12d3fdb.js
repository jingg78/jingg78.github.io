(window.webpackJsonp=window.webpackJsonp||[]).push([[22],{411:function(e,t,c){"use strict";c.r(t);var n={name:"jswTest",components:{},data:function(){return{activeName:"second",activeNames1:["1_1"],activeNames2:["2_1"],activeNames3:[],activeNames4:[],loading:!0}},methods:{handleClick:function(e,t){console.log(e,t);var c=this.$loading({lock:!0,text:"Loading",spinner:"el-icon-loading",background:"rgba(0, 0, 0, 0.7)"});setTimeout((function(){c.close()}),2e3)}}},l=c(1),component=Object(l.a)(n,(function(){var e=this,t=e.$createElement,c=e._self._c||t;return c("div",[c("h2",[e._v("Collapse in Tabs")]),e._v(" "),c("div",{staticStyle:{position:"relative"}},[c("vc-tabs",{on:{"tab-click":e.handleClick},model:{value:e.activeName,callback:function(t){e.activeName=t},expression:"activeName"}},[c("vc-tab-pane",{attrs:{label:"User",name:"first"}},[c("h2",[e._v("탭1")]),e._v(" "),c("vc-collapse",{model:{value:e.activeNames1,callback:function(t){e.activeNames1=t},expression:"activeNames1"}},[c("vc-collapse-item",{attrs:{title:"Accordion#1",name:"1_1"}},[e._v("\n            동해물과 백두산이 마르고 닳도록"),c("br"),e._v("\n            하느님이 보우하사 우리나라 만세~~\n          ")]),e._v(" "),c("vc-collapse-item",{attrs:{title:"Accordion#2",name:"1_2"}},[e._v("\n            무궁화 삼천리 화려강산"),c("br"),e._v("\n            대한사람 대한으로 길이 보전하세\n          ")])],1)],1),e._v(" "),c("vc-tab-pane",{attrs:{label:"Config",name:"second"}},[c("h2",[e._v("탭2")]),e._v(" "),c("vc-collapse",{model:{value:e.activeNames2,callback:function(t){e.activeNames2=t},expression:"activeNames2"}},[c("vc-collapse-item",{attrs:{title:"Accordion#1",name:"2_1"}},[e._v("\n            남산 위에 저 소나무, 철갑을 두른 듯"),c("br"),e._v("\n            바람 서리 불변함은 우리 기상일세.\n          ")]),e._v(" "),c("vc-collapse-item",{attrs:{title:"Accordion#2",name:"2_2"}},[e._v("\n            무궁화 삼천리 화려강산"),c("br"),e._v("\n            대한사람 대한으로 길이 보전하세\n          ")])],1)],1),e._v(" "),c("vc-tab-pane",{attrs:{label:"Role",name:"third"}},[c("h2",[e._v("탭3")]),e._v(" "),c("vc-collapse",{model:{value:e.activeNames3,callback:function(t){e.activeNames3=t},expression:"activeNames3"}},[c("vc-collapse-item",{attrs:{title:"Accordion#1",name:"3_1"}},[e._v("\n            가을 하늘 공활한데 높고 구름 없이"),c("br"),e._v("\n            밝은 달은 우리 가슴 일편단심일세.\n          ")]),e._v(" "),c("vc-collapse-item",{attrs:{title:"Accordion#2",name:"3_2"}},[e._v("\n            무궁화 삼천리 화려강산"),c("br"),e._v("\n            대한사람 대한으로 길이 보전하세\n          ")])],1)],1),e._v(" "),c("vc-tab-pane",{attrs:{label:"Task",name:"fourth"}},[c("h2",[e._v("탭4")]),e._v(" "),c("vc-collapse",{model:{value:e.activeNames4,callback:function(t){e.activeNames4=t},expression:"activeNames4"}},[c("vc-collapse-item",{attrs:{title:"Accordion#1",name:"4_1"}},[e._v("\n            이 기상과 이 맘으로 충성을 다하여"),c("br"),e._v("\n            괴로우나 즐거우나 나라 사랑하세.\n          ")]),e._v(" "),c("vc-collapse-item",{attrs:{title:"Accordion#2",name:"4_2"}},[e._v("\n            무궁화 삼천리 화려강산"),c("br"),e._v("\n            대한사람 대한으로 길이 보전하세\n          ")])],1)],1)],1)],1)])}),[],!1,null,null,null);t.default=component.exports}}]);