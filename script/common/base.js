﻿var UserData = {
	userData: null,
	name: "linkeol.com",

	init: function() {
		if (!UserData.userData) {
			try {
				UserData.userData = document.createElement('INPUT');
				UserData.userData.type = "hidden";
				UserData.userData.style.display = "none";
				UserData.userData.addBehavior("#default#userData");
				document.body.appendChild(UserData.userData);
				var expires = new Date();
				expires.setDate(expires.getDate() + 365);
				UserData.userData.expires = expires.toUTCString();
			} catch (e) {
				return false;
			}
		}
		return true;
	},

	setItem: function(key, value) {
		if (UserData.init()) {
			UserData.userData.load(UserData.name);
			UserData.userData.setAttribute(key, value);
			UserData.userData.save(UserData.name);
		}
	},

	getItem: function(key) {
		if (UserData.init()) {
			UserData.userData.load(UserData.name);
			return UserData.userData.getAttribute(key)
		}
	},

	removeItem: function(key) {
		if (UserData.init()) {
			UserData.userData.load(UserData.name);
			UserData.userData.removeAttribute(key);
			UserData.userData.save(UserData.name);
		}
	}
};

//存储key/value至本地缓存
var setLocalItem = function(key, value) {
	if (window.localStorage)
		localStorage.setItem(key, value);
	else
		UserData.setItem(key, value);
};

//获取本地缓存中key名称的值
var getLocalItem = function(key) {
	if (window.localStorage)
		return common.StrIsNull(localStorage.getItem(key));
	else
		return UserData.getItem(key);
};
//删除缓存中的key名称的值
var removeLocalItem = function(key) {
	if (window.localStorage)
		return localStorage.removeItem(key);
	else
		return UserData.removeItem(key);
}

var getAuth = function() {
	var str = "Basic " + this.getLocalItem("UserName") + ':' + this.getLocalItem("Token") + ':' + this.getLocalItem("UUID");

	return str;
};

var handleResult = function(result) {
	var strReturn = '操作失败';
	if (result.indexOf('{') >= 0 && result.indexOf('}') >= 0) {
		var tmp = eval("(" + result + ")");
		if (tmp.Message) {
			strReturn = tmp.Message;
		} else {
			strReturn = tmp;
		}
	} else {
		strReturn = result;
	}

	return strReturn;
};

(function($) {
	//备份mui的ajax方法  
	var _ajax = $.ajax;

	//重写jquery的ajax方法  
	$.ajax = function(url, opt) {
		//备份opt中error和success方法  
		var fn = {
			error: function(XMLHttpRequest, textStatus, errorThrown) {},
			success: function(data, textStatus) {}
		}
		if (opt.error) {
			fn.error = opt.error;
		}
		if (opt.success) {
			fn.success = opt.success;
		}

		//扩展增强处理  
		var _opt = $.extend(opt, {
			beforeSend: function(req) {
				req.setRequestHeader('Authorization', self.getAuth());
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				switch (XMLHttpRequest.statusCode) {
					case 401:
						window.location = "Login.html";
						console.log('return 401, jump to login.');
						break;
					case 404:
						window.location = "404.html";
						break;
					default:
						mui.toast(handleResult(XMLHttpRequest.responseText));
						break;
				}

				//错误方法增强处理
				fn.error(XMLHttpRequest, textStatus, errorThrown);
			},
			success: function(data, textStatus) {
				//成功回调方法增强处理  

				fn.success(data, textStatus);
			}
		});
		_ajax(url, _opt);
	};
})(mui);