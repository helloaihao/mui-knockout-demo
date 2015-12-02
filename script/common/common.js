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

	transfer: function(targetUrl, checkLogin, extras, createNew, autoShowWhileShow) {
		var tmpUrl = targetUrl;
		var localUserID = getLocalItem('UserID');

		if (checkLogin && (common.StrIsNull(localUserID) == '' || localUserID <= 0)) {
			tmpUrl = '../account/login.html';
			autoShowWhileShow = true; //跳转至登录页面，强行设置自动打开页面
		}

		if (typeof autoShowWhileShow == "undefined")
			autoShowWhileShow = true;

		//console.log(autoShowWhileShow);
		mui.openWindow({
			url: tmpUrl,
			id: tmpUrl,
			extras: extras,
			createNew: createNew,
			show: {
				autoShow: autoShowWhileShow,
				aniShow: "slide-in-right",
				duration: "100ms"
			},
			waiting: {
				autoShow: true
			}
		});
	},

	showCurrentWebview: function() {
		mui.plusReady(function() {
			plus.nativeUI.closeWaiting();
			var ws = plus.webview.currentWebview();
			if(ws.parent())
				ws.parent().show();
			else
				ws.show();
		});
	},

	confirmQuit: function() {
		var btnArray = ['确认', '取消'];
		mui.confirm('确认退出乐评家？', '退出提示', btnArray, function(e) {
			if (e.index == 0) {
				removeLocalItem("workTypeID");
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
	getQueryStringByName: function(name, url) {
		if(url == 'undefined'){
			url = location.search;
		}
		var result = url.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));

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
	//对象克隆
	clone: function(obj) {
		var o;
		if (typeof obj == "object") {
			if (obj === null) {
				o = null;
			} else {
				if (obj instanceof Array) {
					o = [];
					for (var i = 0, len = obj.length; i < len; i++) {
						o.push(common.clone(obj[i]));
					}
				} else {
					o = {};
					for (var k in obj) {
						o[k] = common.clone(obj[k]);
					}
				}
			}
		} else {
			o = obj;
		}
		return o;
	},

	//初始化科目及类别的下拉数据源
	initSubjectsTemplate: function() {
		var allSubjectStr = getLocalItem(common.gVarLocalAllSubjectsStr);
		if (common.StrIsNull(allSubjectStr) == '') return; //若未取值，则无需初始化

		var subjects = JSON.parse(allSubjectStr);
		var previousClass = 0;

		var allSubjectClasses = [],
			allSubjects = [],
			allSubjectsBoth = [],
			allSubjectsIndex = [];
		//增加“全部分类”
		allSubjectClasses.push({
			subjectClass: 0,
			subjectClassName: '全部分类'
		});

		//增加“全部”
		allSubjects.push({
			id: 0,
			subjectName: '全部',
			subjectClass: 0,
			subjectClassName: '分类',
			subjectType: '类型',
			selected: true //默认选中
		});

		if (subjects.length > 0) {
			subjects.forEach(function(item) {
				if (item.SubjectClass != previousClass) {
					allSubjectClasses.push({
						subjectClass: item.SubjectClass,
						subjectClassName: item.SubjectClassName
					});

					allSubjectsBoth.push({
						value: item.SubjectClass,
						text: item.SubjectClassName,
						children: []
					})

					//增加每一类“全部”
					allSubjects.push({
						id: 0,
						subjectName: '全部',
						subjectClass: item.SubjectClass,
						subjectClassName: item.SubjectClassName,
						subjectType: '类型',
						selected: false
					});

					previousClass = item.SubjectClass;
				}

				allSubjects.push({
					id: item.ID,
					subjectName: item.SubjectName,
					subjectClass: item.SubjectClass,
					subjectClassName: item.SubjectClassName,
					subjectType: item.subjectType,
					selected: false
				});

				allSubjectsBoth[allSubjectsBoth.length - 1].children.push({
					value: item.ID,
					text: item.SubjectName
				});

				if (item.IsHome) {
					allSubjectsIndex.push({
						id: item.ID,
						subjectName: item.SubjectName,
						subjectClass: item.SubjectClass,
						dispOrderIndex: item.DispOrderIndex
					})
				}
			})
		}

		//首页显示的科目排序
		if (allSubjectsIndex.length > 0) {
			allSubjectsIndex.sort(function(left, right) {
				return left.dispOrderIndex == right.dispOrderIndex ? 0 : (left.dispOrderIndex < right.dispOrderIndex ? -1 : 1);
			})
		}

		setLocalItem(common.gVarLocalAllSubjectClassesJson, JSON.stringify(allSubjectClasses));
		setLocalItem(common.gVarLocalAllSubjectsJson, JSON.stringify(allSubjects));
		setLocalItem(common.gVarLocalAllSubjectsBothJson, JSON.stringify(allSubjectsBoth));
		setLocalItem(common.gVarLocalAllSubjectsIndexJson, JSON.stringify(allSubjectsIndex));
	},

	//从服务器获取所有科目
	getAllSubjectsStr: function() {
		var ajaxUrl = common.gServerUrl + 'Common/Subject/GetList';
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				//plus.storage.setItem(common.gVarLocalAllSubjects, responseText);
				setLocalItem(common.gVarLocalAllSubjectsStr, responseText);
				common.initSubjectsTemplate();
			}
		})
	},

	//获取科目类别数组
	getAllSubjectClasses: function() {
		var allSubjectClasses = getLocalItem(common.gVarLocalAllSubjectClassesJson);

		return JSON.parse(allSubjectClasses);
	},

	//获取科目数组
	getAllSubjects: function() {
		var allSubjects = getLocalItem(common.gVarLocalAllSubjectsJson);

		return JSON.parse(allSubjects);
	},

	//获取科目及类别的二级数组
	getAllSubjectsBoth: function() {
		var allSubjectsBoth = getLocalItem(common.gVarLocalAllSubjectsBothJson);

		return JSON.parse(allSubjectsBoth);
	},

	//获取首页显示科目的数组
	getAllSubjectsIndex: function() {
		var allSubjectsIndex = getLocalItem(common.gVarLocalAllSubjectsIndexJson);

		return JSON.parse(allSubjectsIndex);
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
	//传递作品参数的方法
	extrasUp: function(item) {
		var upExtras;
		if (common.gDictUserType.teacher == getLocalItem("UserType")) {
			upExtras = {
				workTypeID: 0,	//老师，无需作品类型传递
				workTitle: item == 0 ? '我的作品' : '学生作业'
			}
		} else {
			var userTypeDes = common.gJsonWorkTypeStudent; //默认设置为学生作品类型
			if (item < userTypeDes.length) {
				upExtras = {
					workTypeID: userTypeDes[item].value,
					workTitle: item == 0 ? '我的作品' : '我的作业'
				}
			}
		}
		return upExtras;
	},

	/**
	 * 根据图片名获取其图片
	 * @param {String} photo 图片名
	 */
	getPhotoUrl: function(photo) {
		return common.gServerUrl + 'Images/' + photo;
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
	gServerUrl: "http://172.16.30.90:8090/", //"http://cloud.linkeol.com/", ////"http://172.16.30.90:8090/",
	//Video地址
	gVideoServerUrl: "http://172.16.30.90:8099/", //"http://video.linkeol.com/", ////"http://172.16.30.90:8099/",

	gVarWaitingSeconds: 60, //默认等待验证秒数
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
		One2One: 1, //可约课程
		One2More: 2 //已有课程
	},
	//作品来源类型
	gDictWorkSourceType: {
		Teacher: 1,	//老师
		Activity: 2	//活动
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
		value: 104,
		text: "学生作品"
	}, {
		value: 105,
		text: "学生作业"
	}],

	//老师评级
	gJsonTeacherLever: [{
		value: 0,
		text: "全部",
		ctext: "全部"
	}, {
		value: 1,
		text: "☆",
		ctext: "无星级"
	}, {
		value: 2,
		text: "★",
		ctext: "一星级"
	}, {
		value: 3,
		text: "★★",
		ctext: "二星级"
	}, {
		value: 4,
		text: "★★★",
		ctext: "三星级"
	}, {
		value: 5,
		text: "★★★★",
		ctext: "四星级"
	}, {
		value: 6,
		text: "★★★★★",
		ctext: "五星级"
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
		text: "教龄降序"
	}],
	//作品排序
	gJsonWorkSort: [{
		value: 5,
		text: "日期降序"
	}, {
		value: 6,
		text: "浏览降序"
	}, {
		value: 7,
		text: "点赞降序"
	}],
	//点评排序
	gJsonCommentSort: [{
		value: 8,
		text: "状态"
	}, {
		value: 9,
		text: "日期"
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
		text: '可约课程'
	}, {
		value: 2,
		text: '已有课程'
	}],
	gAuthImgage: [{
		value: 0,
		text: '图片预览'
	}, {
		value: 1,
		text: '选择图片'
	}],

	gArrayDayOfWeek: ['日', '一', '二', '三', '四', '五', '六'],

	gVarLocalUploadTask: 'global.UploadTasks',
	gVarLocalAllSubjectsStr: 'global.AllSubjectsStr',
	gVarLocalAllSubjectsBothJson: 'global.AllSubjectsBothJson', //科目及科目类型的二级Json
	gVarLocalAllSubjectClassesJson: 'global.AllSubjectClassesJson', //所有科目类型的Json
	gVarLocalAllSubjectsJson: 'global.AllSubjectsJson', //所有科目的Json
	gVarLocalAllSubjectsIndexJson: 'global.AllSubjectsIndexJson', //所有首页显示科目的Json

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