/**
 * @class
 * @name vcui.helper.MapApi
 * @description MAP API
 * @extends vcui.BaseClass
 * @version 1.0
 * @example
 * 
new vcui.helper.MapApi({ //map api 를 동적으로 import 한다.
   mapService : 'kakao',
   appKey : ''
}).load(function(){
   console.log('map api loaded');
});
 var mapApi = new vcui.helper.MapApi({appKey:''});
mapApi.coord2Address(127.0395764, 37.5235644).then(function(result){
   console.log(result);
}, function(error){
  console.log(error);
})
mapApi.coord2RegionCode(127.0395764, 37.5235644).then(function(result){
   console.log(result);
}, function(error){
  console.log(error);
});
 mapApi.addressSearch('강동구 프라이어팰리스').then(function(result){
   console.log(result);
}, function(error){
   console.log(error);
}) 
*/

vcui.define('helper/mapApi', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var MapApi = core.helper('MapApi', core.BaseClass.extend(/**@lends vcui.helper.MapApi# */{
        /**
         * 생성자
         * @param {string|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {object} options 옵션값
         * @param {string} [options.mapService='kakao'] 'kakao' 맵서비스 종류
         * @param {string} [options.appKey=''] 맵서비스 앱 키
         */
        initialize: function(options) {
            var self = this;      

            self.options = core.extend({}, {
                mapService: 'kakao', 
                appKey:'5dddbd78e7c3f80dd289ec188acf536c', // 테스트 키값
            }, options);

        },
        _importApiJs: function _importApiJs(){
            var defer = $.Deferred();
            var script = document.createElement('script');

            if(this.options.mapService == 'kakao'){
                script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=' + this.options.appKey + '&libraries=services&autoload=false';

                script.onload = function () {
                    kakao.maps.load(function(){
                        defer.resolve();
                    });
                };
                script.onerror = function(e){ 
                    defer.reject('map api를 로드할수 없습니다.');          
                }

            }else if(this.options.mapService == 'naver'){
                script.src = '//openapi.map.naver.com/openapi/v3/maps.js?ncpClientId='+this.options.appKey+'&submodules=geocoder&callback=fnNaverMapInit';
                window.fnNaverMapInit = function(){  
                    setTimeout(function(){
                        defer.resolve();
                    }, 100);
                }                
            }
                    
            document.head.appendChild(script);  
            return defer.promise();
        },

        /**
         * 맵서비스를 로드함
         * @param {function} callback 탭버튼 인덱스
         * @example
         * var mapApi = new vcui.helper.MapApi({mapService:'kakao', appKey:''}); 
         * mapApi.load(function(){
         *  console.log('api loaded');
         * });
         */

        load : function load(callback){
            var self = this;
            var jsLoaded = false;
            
            if(self.options.mapService == 'naver'){
                jsLoaded = window.naver && window.naver.maps;
            }else if(self.options.mapService == 'kakao'){
                jsLoaded = window.kakao && window.kakao.maps;
            }

            if(jsLoaded){
                if(callback) callback();
            }else{
                self._importApiJs().done(function(){
                    if(callback) callback();
                }).fail(function(e){
                    alert(e);
                }) 
            } 
        },
        /**
         * 좌표 값에 해당하는 구 주소와 도로명 주소 정보를 요청한다. 도로명 주소는 좌표에 따라서 표출되지 않을 수 있다. x:위도 , y: 경도
         * @param {number} x 
         * @param {number} y 
         */
        coord2Address : function coord2Address(x,y){
            var self = this;
            var defer = $.Deferred();
            self.load(function(){

                if(self.options.mapService == 'naver'){

                    naver.maps.Service.reverseGeocode({
                        coords: new naver.maps.LatLng(y, x),
                        orders: [
                            naver.maps.Service.OrderType.ADDR,
                            naver.maps.Service.OrderType.ROAD_ADDR
                        ].join(',')
                    }, function(status, response) {
                        if (status === naver.maps.Service.Status.ERROR) {
                            defer.reject('server error'); 
                        }else{
                            var address = response.v2.address;
                            defer.resolve(address);
                        }
                    });

                }else if(self.options.mapService == 'kakao'){
                    var geocoder = new kakao.maps.services.Geocoder();
                    var coord = new kakao.maps.LatLng(y, x); //new kakao.maps.LatLng(37.5235644, 127.0395764);
                    geocoder.coord2Address(coord.getLng(), coord.getLat(), function(result, status){
                        if(status === kakao.maps.services.Status.ERROR){
                            defer.reject('server error');  
                        }else{
                            defer.resolve(result);
                        }
                    });	
                }
                
            });
            return defer.promise();
        },

        /**
         * 주소 정보에 해당하는 좌표값을 요청한다.
         * @param {string} address 
         */
        addressSearch : function addressSearch(address){
            var self = this;
            var defer = $.Deferred();
            self.load(function(){
                if(self.options.mapService == 'naver'){

                    naver.maps.Service.geocode({
                        query: address
                    }, function(status, response) {
                        if (status !== naver.maps.Service.Status.OK) {
                            defer.reject('server error');  
                        }else{
                            defer.resolve(response.v2.addresses[0]);
                        }
                    });

                }else if(self.options.mapService == 'kakao'){

                    var geocoder = new kakao.maps.services.Geocoder();
                    geocoder.addressSearch(address, function(result, status) {
                        if(status === kakao.maps.services.Status.ERROR){
                            defer.reject('server error');  
                        }else{
                            defer.resolve(result);
                        }
                    });

                }                
                
            });
            return defer.promise();
        },

        /**
         * 좌표 값에 해당하는 행정동, 법정동 정보를 얻는다.
         * @param {number} x 
         * @param {number} y 
         */
        coord2RegionCode : function coord2RegionCode(x,y){
            var self = this;
            var defer = $.Deferred();
            self.load(function(){       
                
                if(self.options.mapService == 'naver'){

                }else if(self.options.mapService == 'kakao'){

                    var geocoder = new kakao.maps.services.Geocoder();
                    geocoder.coord2RegionCode(x,y, function(result, status) {
                        if(status === kakao.maps.services.Status.ERROR){
                            defer.reject('server error');  
                        }else{
                            defer.resolve(result);
                        }
                    });
                }                

            });
            return defer.promise();
        },

        /**
         * 입력한 키워드로 검색한다.
         * @param {string} keyword 
         */
        keywordSearch : function keywordSearch(keyword){
            var self = this;
            var defer = $.Deferred();
            self.load(function(){     

                if(self.options.mapService == 'naver'){

                }else if(self.options.mapService == 'kakao'){
                    var places = new kakao.maps.services.Places();
                    places.keywordSearch(keyword, function(result, status) {
                        if(status === kakao.maps.services.Status.ERROR){
                            defer.reject('server error');  
                        }else{
                            defer.resolve(result);
                        }
                    });
                }

            });
            return defer.promise();
        },

        /**
         * 두 좌표의 거리를 구한다.
         * @param {number} lat1 
         * @param {number} lng1 
         * @param {number} lat2 
         * @param {number} lng2 
         */
        getDistance : function getDistance(lat1,lng1,lat2,lng2) {                    
            var R = 6371;
            var dLat = (lat2-lat1) * (Math.PI/180);
            var dLon = (lng2-lng1) * (Math.PI/180);
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos((lat1) * (Math.PI/180)) * Math.cos((lat2) * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; // Distance in km
            return d;
        },

    }));
    ///////////////////////////////////////////////////////////////////////////////////////

    return MapApi;

});