var myOrders = function() {
	var self = this;
	self.DisplayName=ko.observable("");         //用户名
	self.Balance = ko.observable(0); //我的余额
	self.OrdersNotPay = ko.observableArray([]); //未支付订单
	self.OrdersPayed = ko.observableArray([]); //已支付订单
	self.OrdersRefunded = ko.observableArray([]); //已退款订单
	self.Sum = ko.observable('0'); //小计

	mui.ready(function() {
		var self = this;
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + getLocalItem("UserID") + "&usertype=" + getLocalItem('UserType'),{
			type: 'GET',
			success: function(responseText) {
			var result = eval("(" + responseText + ")");
			self.DisplayName(result.DisplayName);
		},
		error: function(responseText) {
			mui.toast("获取信息失败");
		}
		});
		var ajaxUrl = common.gServerUrl + 'API/Account/GetBalance?userid=' + getLocalItem('UserID') + '&usertype=' + getLocalItem('UserType');
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var balance = JSON.parse(responseText);
				self.Balance(balance);
			}
		})
		self.GetNotPay();
	})
	//未支付
	self.GetNotPay=function(){
		var ajaxUrl = common.gServerUrl + 'API/Order/GetOrdersByType?userId=' + getLocalItem('UserID') + '&orderStatus=';
		//common.gDictAccountDetailType.NotFinish;
		mui.ajax(ajaxUrl + common.gDictOrderStatus.NotPay, {
			type: 'GET',
			success: function(responseText) {
				self.OrdersNotPay(JSON.parse(responseText));
				self.Sum(common.getArraySum(self.OrdersNotPay(), 'Amount'));
			}
		})
	}
	
	//已支付
	self.GetPayed = function() {
		var ajaxUrl = common.gServerUrl + 'API/Order/GetOrdersByType?userId=' + getLocalItem('UserID') + '&orderStatus=';
		mui.ajax(ajaxUrl + common.gDictOrderStatus.Payed, {
			type: 'GET',
			success: function(responseText) {
				self.OrdersPayed(JSON.parse(responseText));
				self.Sum(common.getArraySum(self.OrdersPayed(), 'Amount'));
			}
		})
	}

	//已退款
	self.GetRefunded = function() {
		var ajaxUrl = common.gServerUrl + 'API/Order/GetOrdersByType?userId=' + getLocalItem('UserID') + '&orderStatus=';
		mui.ajax(ajaxUrl + common.gDictOrderStatus.Refunded, {
			type: 'GET',
			success: function(responseText) {
				self.OrdersRefunded(JSON.parse(responseText));
				self.Sum(common.getArraySum(self.OrdersRefunded(), 'Amount'));
			}
		})
	}
	
	self.goDetail = function(order){
		var url = '';
		switch (order.TargetType){
			case common.gDictOrderTargetType.Comment:
				url = '../../modules/student/submitComment.html';
				break;
			case common.gDictOrderTargetType.CourseToUser:
				url = '../../modules/student/aboutLesson.html';
				break;
			case common.gDictOrderTargetType.Download:
				url = '../../modules/works/worksDownload.html';
				break;
			default:
				return;
		}
		common.transfer(url, true, {
			order: order
		});
	}
	
	//提现
	self.Withdraw =function(){
		mui.toast("你点击了提现按钮");
	}
}
ko.applyBindings(myOrders);