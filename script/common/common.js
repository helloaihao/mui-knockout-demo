var common = {
	//判断字符串是否为空，空则返回""
	StrIsNull: function(str) {
		if (str != null)
			return str;
		else
			return "";
	},

	JsonConvert: function(jsonSrc, ValueField, TextField) {
		var jsonDest = [];
		if (typeof(jsonSrc) == "string") {
			jsonSrc = JSON.parse(jsonSrc);
		}
		if (jsonSrc) {
			for (var i = 0; i < jsonSrc.length; i++) {
				jsonDest.push({
					'value': jsonSrc[i][ValueField],
					'text': jsonSrc[i][TextField]
				});
				/*jsonDest[i].value = jsonSrc[i][ValueField];
				jsonDest[i].text = jsonSrc[i][TextField];*/
			}
		}

		return jsonDest;
	},

	/**
	 * 根据值获取对应的显示文本
	 * @param {Object} jsonSrc json字符串或数组（必须为value和text键值对的）
	 * @param {String} value 数值
	 * @return {String} 对应的文本
	 */
	getTextByValue: function(jsonSrc, value) {
		if (typeof(jsonSrc) == "string") {
			jsonSrc = JSON.parse(jsonSrc);
		}
		if (jsonSrc) {
			for (var i = 0; i < jsonSrc.length; i++) {
				if (jsonSrc[i].value == value) {
					return jsonSrc[i].text;
				}
			}
		}

		return '';
	},

	transfer: function(targetUrl, checkLogin, extras, createNew) {
		var tmpUrl = targetUrl;
		if (checkLogin && getLocalItem('UserID') <= 0) {
			tmpUrl = '../account/login.html';
		}

		//console.log(targetUrl);
		mui.openWindow({
			url: tmpUrl,
			extras: extras,
			createNew: createNew,
			show: {
				autoShow: true,
				aniShow: "slide-in-right",
				duration: "100ms"
			},
			waiting: {
				autoShow: true
			}
		});
	},
	confirmQuit: function() {
		var btnArray = ['确认', '取消'];
		mui.confirm('确认退出乐评+？', '退出提示', btnArray, function(e) {
			if (e.index == 0) {
				plus.runtime.quit();
			}
		});
	},
	//根据认证状态及图片路径获取其中文描述
	getAuthStatusStr: function(authStatus, picPath) {
		switch (authStatus) {
			case 1:
				if (common.StrIsNull(picPath) == '')
					return '未认证';
				else
					return '待认证';
			case 2:
				return '未通过';
			case 3:
				return '已认证';
			default:
				return '';
		}
	},

	//根据QueryString参数名称获取值
	getQueryStringByName: function(name) {
		var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));

		if (result == null || result.length < 1) {
			return "";
		}

		return result[1];
	},

	//计算数组中某一列的总和
	getArraySum: function(array, field) {
		var ret = 0;
		array.forEach(function(item) {
			ret += item[field];
		})

		return ret;
	},

	//提交动作（收藏、赞）
	postAction: function(actionType, targetType, targetID) {
		var ret = false;
		var ajaxUrl = common.gServerUrl + 'API/Action';
		mui.ajax(ajaxUrl, {
			type: 'POST',
			async: false,
			data: {
				UserID: getLocalItem('UserID'),
				ActionType: actionType,
				TargetType: targetType,
				TargetID: targetID
			},
			success: function(responseText) {
				ret = true;
			}
		})

		return ret;
	},

	//获取所有科目
	getAllSubjects: function() {
		var ajaxUrl = common.gServerUrl + 'Common/Subject/Get';
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				plus.storage.setItem(common.gVarLocalAllSubjects, responseText);
			}
		})
	},

	//根据起始时间和结束时间返回类似“9月20日 15:00~16:00”
	formatTime: function(btime, etime) {
		if (!btime) return;

		var bdate;
		if (btime instanceof Date)
			bdate = btime;
		else {
			bdate = new Date(btime.replace(/-/gi, '/'));
		}
		if (isNaN(bdate)) { //非日期格式，原文返回
			return btime;
		}
		var ehour = 0;
		if (etime) {
			if (etime instanceof Date)
				ehour = etime.getHours();
			else
				ehour = (new Date(etime.replace(/-/gi, '/'))).getHours();
		} else
			ehour = bdate.getHours() + 1;
		var ret = (bdate.getMonth() + 1) + '月' + bdate.getDate() + '日' + ' ' + bdate.getHours() + ':00~' + ehour + ':00';

		return ret;
	},
	//消息页面的跳转
	gotoMessage: function() {
		mui.openWindow({
			url: '../my/messageList.html',
			show: {
				autoShow: true,
				aniShow: "slide-in-right",
				duration: "100ms"
			},
			waiting: {
				autoShow: false
			}
		});
	},

	//判断是否已有登录信息缓存
	hasLogined: function() {
		return (common.StrIsNull(getLocalItem('UUID')) != '' && common.StrIsNull(getLocalItem('UserID')) != '');
	},

	//获取未读消息
	getUnreadCount: function(UnreadCount) {
		if (!common.hasLogined()) return;

		mui.ajax(common.gServerUrl + "API/Message/GetUnreadCount", {
			dataType: 'json',
			type: "GET",
			data: {
				receiver: getLocalItem('UserID'),
				lastTime: getLocalItem('msgLastTime')
			},
			success: function(responseText) {
				UnreadCount = responseText;
			}
		});
	},

	/**
	 * 根据图片名获取其图片
	 * @param {String} photo 图片名
	 */
	getPhotoUrl: function(photo) {
		return common.gServerUrl + 'Common/GetImage?url=' + photo;
	},

	/**
	 * 获取视频缩略图
	 * @param {String} photo 图片名
	 */
	getThumbnail: function(photo) {
		return common.gVideoServerUrl + 'Thumbnails/' + photo;
	},
	/*
	 * 获取当前页面名称（不带后缀名）
	 */
	getPageName: function() {
		var a = location.href;
		var b = a.split("/");
		var c = b.slice(b.length - 1, b.length).toString(String).split(".");
		return c.slice(0, 1);
	},

	//Web API地址
	gServerUrl: "http://172.16.30.90:8090/", //"http://172.16.30.90:8090/", //"http://172.16.6.190:8090/", //"http://120.31.128.26/", //"http://192.168.1.88:8090/",
	//Video地址
	gVideoServerUrl: "http://172.16.30.90:8099/", //"http://172.16.30.90:8099/", //"http://172.16.6.190:8099/", //"http://120.31.128.26/", //"http://192.168.1.88:8090/",


	//用户类型枚举
	gDictUserType: {
		teacher: 32,
		student: 64
	},

	//性别类型枚举
	gDictGenderType: {
		male: 0,
		female: 1
	},
	gDictWorkType: {
		notComment: 1, //未点评
		Commenting: 2, //点评中
		Commented: 3 //已点评
	},
	gDictTeacherAuthType: {
		IDAuth: 1, //身份认证
		EduAuth: 2, //学历认证
		ProTitleAuth: 3 //职称认证
	},
	gDictAuthStatusType: {
		NotAuth: 1, //未认证
		Rejected: 2, //已拒绝
		Authed: 3 //已认证
	},
	//账户明细类型
	gDictAccountDetailType: {
		NotFinish: 1, //未完成
		Finished: 2, //已完成
		Transfered: 3 //已转账
	},
	//动作类型
	gDictActionType: {
		Favorite: 1, //收藏
		Like: 2 //赞
	},
	//动作对象类型
	gDictActionTargetType: {
		Works: 1, //作品
		News: 2, //新闻
		User: 3 //用户
	},
	//课时调整状态
	gDictLessonFeedbackStatus: {
		Normal: 1, //正常
		Handling: 2, //处理中
		Rejected: 3 //已拒绝
	},
	//订单状态
	gDictOrderStatus: {
		NotPay: 1, //未支付
		Payed: 2, //已支付
		Refunded: 3 //已退款
	},
	//订单货品类型
	gDictOrderTargetType: {
		Comment: 1, //点评
		CourseToUser: 2, //约课
		Download: 3 //下载
	},
	//课程类型
	gDictCourseType: {
		One2One: 1, //一对一
		One2More: 2 //大班（一对多）
	},
	//是否类型JSON
	gJsonYesorNoType: [{
		value: 1,
		text: '是'
	}, {
		value: 0,
		text: '否'
	}],
	//性别类型JSON
	gJsonGenderType: [{
		value: 0,
		text: '男'
	}, {
		value: 1,
		text: '女'
	}],
	gJsonWorkTypeTeacher: [{
		value: 0,
		text: "全部"
	}, {
		value: 1,
		text: "分解教程"
	}, {
		value: 2,
		text: "完整教程"
	}, {
		value: 3,
		text: "演出作品"
	}],
	gJsonWorkTypeStudent: [{
		value: 0,
		text: "全部"
	}, {
		value: 104,
		text: "学生作品"
	}, {
		value: 105,
		text: "学生作业"
	}],

	//老师评级
	gJsonTeacherLever: [{
		value: 0,
		text: "不限",
		ctext: "不限"
	}, {
		value: 1,
		text: "★",
		ctext: "一星"
	}, {
		value: 2,
		text: "★★",
		ctext: "二星"
	}, {
		value: 3,
		text: "★★★",
		ctext: "三星"
	}, {
		value: 4,
		text: "★★★★",
		ctext: "四星"
	}],

	//老师排序
	gJsonTeacherSort: [{
		value: 1,
		text: "评分降序"
	}, {
		value: 2,
		text: "价位升序"
	}, {
		value: 3,
		text: "价位降序"
	}, {
		value: 4,
		text: "教龄排序"
	}],
	//作品排序
	gJsonWorkSort: [{
		value: 1,
		text: "日期降序"
	}, {
		value: 2,
		text: "浏览降序"
	}, {
		value: 3,
		text: "点赞降序"
	}],
	//作品权限类型JSON
	gJsonWorkPublicType: [{
		value: 0,
		text: '不公开'
	}, {
		value: 1,
		text: '公开'
	}],
	gProfessionalType: [{
		value: 1,
		text: '教授/国家一级演员'
	}, {
		value: 2,
		text: '副教授/国家二级演员'
	}, {
		value: 3,
		text: '讲师/演奏家'
	}],
	//课程类型
	gJsonCourseType: [{
		value: 1,
		text: '一对一课程'
	}, {
		value: 2,
		text: '大班课程'
	}],

	gVarLocalUploadTask: 'global.UploadTasks',
	gVarLocalAllSubjects: 'global.AllSubjects',
	gAuthImgage: [{
			value: 0,
			text: '图片预览'
		}, {
			value: 1,
			text: '选择图片'
		}]
		/*获取网络状态值
		 * CONNECTION_UNKNOW: 网络连接状态未知  固定值0
		 * CONNECTION_NONE: 未连接网络  固定值1
		 * CONNECTION_ETHERNET: 有线网络  固定值2
		 * CONNECTION_WIFI: 无线WIFI网络  固定值3
		 * CONNECTION_CELL2G: 蜂窝移动2G网络  固定值4
		 * CONNECTION_CELL3G: 蜂窝移动3G网络  固定值5
		 * CONNECTION_CELL4G: 蜂窝移动4G网络  固定值6
		 * @description 获取网络状态的函数
		 */
		//gNetworkState: plus.networkinfo.getCurrentType(),


}