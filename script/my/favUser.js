var favUser = function() {
	var self = this;
	var qrcodeID, qrcodeType;
	var qrcodeWeb = null;
	self.Gendervalue = ko.observable('男')
	self.userInfo = ko.observableArray([]);
	var infoUrl = "API/Account/GetInfo?userid=";
	var infoType = "&usertype=";
	self.valid = ko.observable(false);

	mui.plusReady(function() {
		qrcodeWeb = plus.webview.currentWebview();
		if (typeof qrcodeWeb.result !== "undefined") {
			var result = qrcodeWeb.result;
			var httpDomain=result.indexOf("www.linkeol.com");//是否为官网数据
			if (result.indexOf("teacher") >= 0) {//用户类型
				qrcodeType = common.gDictUserType.teacher;
			} else if (result.indexOf("student") >= 0){
				qrcodeType = common.gDictUserType.student;
			}
			qrcodeID = common.getQueryStringByName("id", result);//用户id
			if(common.StrIsNull(qrcodeID) == '' || common.StrIsNull(qrcodeType) == '' || httpDomain<0)
			{
				self.valid(false);
				common.showCurrentWebview();
			}
			else{
				mui.ajax(common.gServerUrl + infoUrl + qrcodeID + infoType + qrcodeType, {
					type: "GET",
					success: function(responseText) {
						if (responseText != "") {
							var result = eval("(" + responseText + ")");
							self.Gendervalue(common.gJsonGenderType[parseInt(result.Gender)].text);
							self.userInfo(result);
							self.valid(true);
							
							common.showCurrentWebview();
						}
					}
				})
			}
		}
	});
	self.addMyAttention = function() {
		var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, qrcodeID);
		if (ret) {
			mui.toast('收藏成功');
		}
		plus.webview.close(qrcodeWeb.opener());
		mui.back();
	}
	var old_back=mui.back;
	mui.back=function(){
		plus.webview.close(qrcodeWeb.opener());
		old_back();
	}
}
ko.applyBindings(favUser);