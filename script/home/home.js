var home = function() {
	var self = this;
	self.Teachers = ko.observableArray([]);
	self.count = 3;
	self.UnreadCount = ko.observable("0");
	self.getTeachers = function() {
		self.getUnreadCount;
		mui.ajax(common.gServerUrl + "API/Teacher/GetIndexTeachers?count=" + self.count, {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.Teachers(responseText);
			}
		});
	}();
	
	self.gotoTeacher = function() {
		mui.openWindow({
			url: "../../modules/teacher/teacherInfo.html",
			extras: {
				teacherID: this.UserID
			},
			waiting: {
				autoShow: false
			}
		});
	}
	//跳转至消息页面
	self.goMessageList = function(){
		common.gotoMessage();
	}
	//获取未读消息数量
	self.getUnreadCount = function(){
		common.getUnreadCount(self.UnreadCount());
	}

//var shares=null,bhref=false;
//var Intent=null,File=null,Uri=null,main=null;
//// H5 plus事件处理
//function plusReady(){
//	updateSerivces();
//	if(plus.os.name=="Android"){
//		Intent = plus.android.importClass("android.content.Intent");
//		File = plus.android.importClass("java.io.File");
//		Uri = plus.android.importClass("android.net.Uri");
//		main = plus.android.runtimeMainActivity();
//	}
//}
//if(window.plus){
//	plusReady();
//}else{
//	document.addEventListener("plusready",plusReady,false);
//}
//
//function updateSerivces(){
//	plus.share.getServices( function(s){
//		shares={};
//		for(var i in s){
//			var t=s[i];
//			shares[t.id]=t;
//		}
//	}, function(e){
//		outSet( "获取分享服务列表失败："+e.message );
//	} );
//}
//
//function shareAction(id,ex) {
//	var s=null;
//	//outSet( "分享操作：" );
//	if(!id||!(s=shares[id])){
//		mui.toast( "无效的分享服务！" );
//		return;
//	}
//	if ( s.authenticated ) {
//		mui.toast( "---已授权---" );
//		shareMessage(s,ex);
//	} else {
//		mui.toast( "---未授权---" );
//		s.authorize( function(){
//				shareMessage(s,ex);
//			},function(e){
//			mui.toast( "认证授权失败："+e.code+" - "+e.message );
//		});
//	}
//}
//
//function shareMessage(s,ex){
//	var msg={content:"sharecontent.value",extra:{scene:ex}};
////	if(bhref){
////		msg.href=sharehref.value;
////		if(sharehrefTitle&&sharehrefTitle.value!=""){
////			msg.title=sharehrefTitle.value;
////		}
////		if(sharehrefDes&&sharehrefDes.value!=""){
////			msg.content=sharehrefDes.value;
////		}
////		msg.thumbs=["_www/logo.png"];
////		msg.pictures=["_www/logo.png"];
////	}else{
////		if(pic&&pic.realUrl){
////			msg.pictures=[pic.realUrl];
////		}
////	}
//	mui.toast(JSON.stringify(msg));
//	s.send( msg, function(){
//		mui.toast( "分享到\""+s.description+"\"成功！ " );
//	}, function(e){
//		mui.toast( "分享到\""+s.description+"\"失败: "+e.code+" - "+e.message );
//	} );
//}
//
//	self.share = function() {
//		bhref = false;
//		var ids = [{
//				id: "weixin",
//				ex: "WXSceneSession"
//			}, {
//				id: "weixin",
//				ex: "WXSceneTimeline"
//			}, {
//				id: "sinaweibo"
//			}, {
//				id: "tencentweibo"
//			}],
//			bts = [{
//				title: "发送给微信好友"
//			}, {
//				title: "分享到微信朋友圈"
//			}, {
//				title: "分享到新浪微博"
//			}, {
//				title: "分享到腾讯微博"
//			}];
//		if (plus.os.name == "iOS") {
//			ids.push({
//				id: "qq"
//			});
//			bts.push({
//				title: "分享到QQ"
//			});
//		}
//		plus.nativeUI.actionSheet({
//				cancel: "取消",
//				buttons: bts
//			},
//			function(e) {
//				var i = e.index;
//				if (i > 0) {
//					shareAction(ids[i - 1].id, ids[i - 1].ex);
//				}
//			}
//		);
//	};
};
ko.applyBindings(home);