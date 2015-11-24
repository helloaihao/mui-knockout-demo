var viewModel = function() {
	var self = this;
	self.works = ko.observable({});
	self.teacher = ko.observable({});
	self.Amount = ko.observable(50);	//点评费用
	
	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	self.checkPayType = function() {
		PayType(event.srcElement.value);
	}

	/**
	 * 为显示订单的点评信息而获取数据
	 * @param {Int} commentID 点评ID
	 */
	self.getDataForOrder = function(commentID){
		self.ViewOrder(true);	//标记由我的订单跳转而来
		
		var ajaxUrl = common.gServerUrl + 'API/Comment/GetCommentInfoByID?id='+commentID;
		mui.ajax(ajaxUrl,{
			type: 'GET',
			success: function(responseText) {
				var data = JSON.parse(responseText);

				if(data.works){
					self.works(data.works);
				}
				if(data.teacher){
					self.teacher(data.teacher);
				}
			}
		});
	}

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		
		//从订单跳转过来
		if (typeof(web.order) != "undefined") {
			self.Order(web.order);
			self.Amount(self.Order().Amount);
			getDataForOrder(self.Order().TargetID);
		} else {
			if (typeof(web.works) !== "undefined") {
				self.works(web.works);
			}
			if (typeof(web.teacher) !== "undefined") {
				self.teacher(web.teacher);
			}
			
			var ajaxUrl = common.gServerUrl + 'API/Comment/GetCommentPrice?userId='+self.teacher().UserID;
			mui.ajax(ajaxUrl,{
				type: 'GET',
				success: function(responseText) {
					self.Amount(responseText);
				}
			});
		}
	});
	
	self.Order = ko.observable({}); //由我的订单传递过来的订单参数
	self.ViewOrder = ko.observable(false); //标记是否由我的订单跳转而来，默认为否
	self.OrderNO = ko.observable(''); //请求后返回的订单号
	//支付的生成订单
	self.gotoPay = function() {
		var ajaxUrl;
		var comment;
		
		//支付方式的数值
		var paytype = 3;
		if (self.PayType() == 'wxpay') {
			paytype = 1;
		} else if (self.PayType() == 'alipay') {
			paytype = 2;
		} else {
			paytype = 3;
		}
	
		if (!self.ViewOrder()) { //不是由我的订单跳转而来
			if (!self.works().ID) {
				mui.toast("请选择作品");
				return;
			}
			if (!self.teacher().UserID) {
				mui.toast("请选择点评老师");
				return;
			}
			if (self.PayType() == '') {
				mui.toast("请选择支付方式");
				return;
			}
	
			//准备点评信息
			comment = {
				WorkID: self.works().ID,
				WorkTitle: self.works().Title,
				AuthorID: self.works().AuthorID,
				CommenterID: self.teacher().UserID,
				Amount: self.Amount()
			}
	
			ajaxUrl = common.gServerUrl + 'API/Comment/AddComment?payType='+paytype;
		}
		else{
			ajaxUrl = common.gServerUrl + 'API/Order/ResubmitOrder?id=' + self.Order().ID + '&payType=' + paytype;
		}

		plus.nativeUI.showWaiting();
		//新增则保存点评信息；修改则保存新的支付方式。均返回订单信息
		mui.ajax(ajaxUrl, {
			type: 'POST',
			data: self.ViewOrder() ? self.Order() : comment,
			success: function(responseText) {	//responseText为微信支付所需的json
				//console.log(responseText);
				var ret = JSON.parse(responseText);
				var orderID = ret.orderID;
				if(ret.requestJson == ''){		//无需网上支付，预约点评成功
					mui.toast("已成功提交");
					//跳转至点评（暂时未打开）
					/*common.transfer("../../modules/comment/commentListHeader.html", true, {
						comment: comment
					});*/
					var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');	//获取首页Webview对象
					plus.webview.close(index);	//关闭首页
					common.transfer('../../index.html', true, {page: 1}, true);
					plus.nativeUI.closeWaiting();
				}
				else{
					var requestJson = JSON.stringify(ret.requestJson);
	
					//根据支付方式、订单信息，调用支付操作
					Pay.pay(self.PayType(), requestJson, function(tradeno){	//成功后的回调函数
						var aurl = common.gServerUrl + 'API/Order/SetOrderSuccess?id='+orderID+'&otherOrderNO='+tradeno;
						mui.ajax(aurl,{
							type: 'PUT',
							success:function(respText){
								var comment = JSON.parse(respText);
								//跳转至点评（暂时未打开）
								/*common.transfer("../../modules/comment/commentListHeader.html", true, {
									comment: comment
								});*/
								var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');	//获取首页Webview对象
								plus.webview.close(index);	//关闭首页
								common.transfer('../../index.html', true, {page: 1}, true);
								plus.nativeUI.closeWaiting();
							}
						})
					}, function(){
						plus.nativeUI.closeWaiting();
					});
				}
			}
		})
	};

	//popover的关闭功能
	self.closePopover=function(){
		mui('#middlePopover').popover('hide');
	}
};

ko.applyBindings(viewModel);
