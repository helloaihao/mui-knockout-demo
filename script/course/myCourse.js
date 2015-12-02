var myCourse = function() {
	var self = this;
	var beginHour = 8; //开始时间
	var endHour = 21; //结束时间
	self.UserID = getLocalItem('UserID');
	self.IsTeacher = getLocalItem('UserType') == common.gDictUserType.teacher.toString();
	self.Adjusting = ko.observable(false); //是否正在调整时间
	self.FilteredCourseID = ko.observable(0);	//选择过滤的课程ID

	self.WeekIndex = ko.observable(0); //0：当前周；-1：上一周；1：下一周……
	self.Hours = ko.observableArray([]); //小时数组
	for (var i = beginHour; i < endHour; i++) {
		self.Hours.push(i);
	}
	self.CurrentDay = ko.observable(newDate().getDate()); //当前天
	self.CurrentMonth = ko.observable(newDate().getMonth()); //当前月
	self.DayOfWeek = ko.observableArray(['日', '一', '二', '三', '四', '五', '六']); //星期数组
	self.TheMonth = ko.computed(function() { //显示的月份
		var self = this;
		var date = newDate();
		date.setDate(date.getDate() - date.getDay() + self.WeekIndex() * 7 + 6);
		return date.getMonth() + 1 + '月';
	}, self)
	self.BeginDate = ko.computed(function() { //开始日期
		var self = this;
		var beginDate = newDate();
		beginDate.setDate(beginDate.getDate() - beginDate.getDay() + self.WeekIndex() * 7);
		return beginDate;
	})
	self.DateOfWeek = ko.computed(function() { //星期对应的日期
		var self = this;
		var beginDate = newDate();
		var arr = new Array();
		beginDate.setDate(beginDate.getDate() - beginDate.getDay() + self.WeekIndex() * 7);
		for (var i = 0; i < 7; i++) {
			var tmpDate = newDate(beginDate);
			tmpDate.setDate(tmpDate.getDate() + i);
			arr.push(tmpDate);
		}

		return arr;
	})

	self.ViewLesson = ko.observable({}); //浏览的当前课程
	self.Lessons = ko.observableArray([]); //我的课程数组
	self.Courses = ko.observableArray([]); //所有开设的课程

	self.BeginTimeNew = ko.observable(''); //调整后的时间

	//调整信息区域是否可见
	self.InfoVisible = ko.computed(function() {
		var self = this;
		var ret = false;

		if (self.ViewLesson()) {
			if (self.ViewLesson().FeedbackStatus != common.gDictLessonFeedbackStatus.Normal) {
				ret = true;
			}
		}

		return ret;
	})

	//处理按钮是否可见
	self.HandleButtonsVisible = ko.computed(function() {
		var self = this;
		var ret = false;

		if (self.ViewLesson()) {
			if (self.UserID == self.ViewLesson().HandlerID) {
				if (self.ViewLesson().FeedbackStatus == common.gDictLessonFeedbackStatus.Handling) {
					ret = true;
				}
			}
		}

		return ret;
	})

	//调整按钮是否可见
	self.RequestButtonVisible = ko.computed(function() {
		var self = this;
		var ret = false;

		if (self.ViewLesson()) {
			if (self.ViewLesson().FeedbackStatus != common.gDictLessonFeedbackStatus.Handling) {
				ret = true;
			}
		}

		return ret;
	})
	
	//获取老师所有开设的课程
	self.GetCourses = function(){
		if (!common.hasLogined()) return;
		if(!IsTeacher) return;
		
		var ajaxUrl = common.gServerUrl + 'API/Course/GetAllCourseByUserID?userid=' + getLocalItem('UserID');
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var courses = JSON.parse(responseText);
				self.Courses(courses);
				self.Courses.unshift({
					ID: 0,
					CourseName: '全部'
				})
			}
		})
	}

	//获取一周的课程
	self.GetData = function(){
		if (!common.hasLogined()) return;
		
		var self = this;
		var paraCourseid = 0;
		if(self.FilteredCourseID() > 0)
			paraCourseid = self.FilteredCourseID();
		var ajaxUrl = common.gServerUrl + 'API/Lesson/GetLessons?userid=' + getLocalItem('UserID')
			+ '&weekindex=' + self.WeekIndex() + '&courseid='+paraCourseid;
		plus.nativeUI.showWaiting();
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var lessons = JSON.parse(responseText);
				self.Lessons(lessons);
				plus.nativeUI.closeWaiting();
			},
			error: function(responseText){
				plus.nativeUI.closeWaiting();
			}
		})
	}

	mui.plusReady(function() {
	//mui.ready(function() {
		var self = this;
		
		var web = plus.webview.currentWebview();
		if (typeof(web.lessonID) !== "undefined") {
			var lessonID = web.lessonID;
		
			var ajaxUrl = common.gServerUrl + 'API/Lesson/GetLessonsByLessonID?userid=' + getLocalItem('UserID')
				+ '&lessonid=' + lessonID;
			mui.ajax(ajaxUrl, {
				type: 'GET',
				success: function(responseText) {
					var lessons = JSON.parse(responseText);
					self.Lessons(lessons);
					if (lessonID > 0) { //有参数传递，跳转至该课时所在周，并打开其详细信息弹窗
						self.Lessons().forEach(function(lesson) {
							if (lesson.ID == lessonID) {
								self.ViewLesson(lesson);
								var tmp = newDate(lesson.BeginTime);
								var iDays = parseInt((tmp - self.BeginDate()) / 1000 / 60 / 60 / 24);
								self.WeekIndex(Math.floor(iDays / 7));
								mui('#middlePopover').popover('toggle');
							}
						})
					}
				}
			})
		}
		else{
			self.GetData();
			self.GetCourses();
		}
	})

	mui.back = function() {
		common.confirmQuit();
	}
	
	self.gotoTeacherInfo = function() {
		var self = this;
		var tmpID = self.ViewLesson().TeacherID;
		mui.openWindow({
			url: "../../modules/teacher/teacherInfo.html",
			extras: {
				teacherID: tmpID
			},
			waiting: {
				autoShow: false
			}
		});
	}

	//点击调整时间
	self.AdjustTimeStart = function() {
		self.BeginTimeNew('请选择新的时间');
		self.Adjusting(true);
	}

	//选择新时间
	self.SelectNewTime = function() {
		var now = newDate();
		var year = 2000 + now.getYear() % 100;

		dtPicker.PopupDtPicker({
				'type': 'hour',
				'beginYear': year - 1,
				'endYear': year + 1,
				'beginHour': 8,
				'endHour': 21
			},
			self.BeginTimeNew(), function(value) {
				self.BeginTimeNew(value);
			});
	}

	//完成调整时间
	self.AdjustTimeFinish = function() {
		var self = this;

		var ajaxUrl = common.gServerUrl + "API/Lesson/RequestAdjustTime?lessonID=" +
			self.ViewLesson().ID + '&beginTimeNew=' + self.BeginTimeNew() + '&question=' + encodeURI('');
		mui.ajax(ajaxUrl, {
			type: "POST",
			success: function() {
				mui.toast("调整申请已发出");
				//应该跳转
				self.Adjusting(false);
			}
		})
	}

	//处理时间调整申请
	self.Handle = function(feedbackID, agree, answer) {
		var ajaxUrl = common.gServerUrl + "API/Lesson/HandleAdjustTime?lessonFeedbackID=" +
			feedbackID + '&agree=' + agree + '&answer=' + encodeURI(answer);
		mui.ajax(ajaxUrl, {
			type: "POST",
			success: function() {
				mui.toast("处理成功");
				//应该跳转
			}
		})
	}

	//点击同意
	self.Agree = function(e) {
		var self = this;
		self.Handle(self.ViewLesson().LessonFeedbackID, true, '');
	}

	//点击拒绝
	self.Reject = function(e) {
		var self = this;
		//document.getElementById("promptBtn").addEventListener('tap', function(e) {
		//e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var btnArray = ['确定', '取消'];
		mui.prompt('', '', '请输入拒绝理由', btnArray, function(e) {
				if (e.index == 0) {
					if (common.StrIsNull(e.value) == '') {
						mui.toast('拒绝理由不能为空');
					} else {
						self.Handle(self.ViewLesson().LessonFeedbackID, false, e.value);
					}
				}
			})
			//});
	}
	
	//点击课程列表
	self.gotoCoursesList = function() {
		common.transfer('openedCoursesList.html', true);
	};
	
	//点击课程列表
	self.gotoAddCourses = function() {
		common.transfer('addCourse.html', true);
	};
	
	//点击课程过滤
	self.filterCourses = function(data) {
		if(self.FilteredCourseID() != data.ID){
			self.FilteredCourseID(data.ID);

			self.GetData();
		}
		
		mui('#bottomPopover').popover('toggle');
	};
	
	//初始化课时单元格
	self.initCell = function(date, hour) {
		var self = this;
		var ret = null;
		self.Lessons().forEach(function(lesson) {
			//console.log(lesson);
			var btime = newDate(lesson.BeginTime);
			if (date.getYear() == btime.getYear() && date.getMonth() == btime.getMonth() &&
				date.getDate() == btime.getDate() && hour == btime.getHours()) {
				ret = lesson;
				return;
			}
		})

		return ret;
	}

	ko.bindingHandlers.cellValue = {
		init: function(element, valueAccessor) {

		},
		update: function(element, valueAccessor, allBindings) {
			var self = this;
			var value = ko.unwrap(valueAccessor());
			if (value) {
				//console.log(typeof value.FeedbackStatus);
				element.className = 'freetime';
				if(value.IsFinish){
					element.className = 'finishedtime';
				}
				else{
					var endtime = newDate(value.EndTime);
					if(endtime < new Date()){
						//element.className = 'overtime';
						element.className = 'finishedtime';
					}
				}
				if(value.FeedbackStatus == common.gDictLessonFeedbackStatus.Handling){
					element.className += ' fontadjusting';
				}
				element.innerText = value.SubjectName;
				element.onclick = function() {
					self.ViewLesson(value);
					mui('#middlePopover').popover('toggle');
				}
			} else {
				element.className = '';
				element.innerHTML = '&nbsp;';
			}
		}
	};
	
}
ko.applyBindings(myCourse);