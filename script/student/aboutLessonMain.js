var AboutLesson = {
	lessonBaseInfo: LessonBaseInfo,
	lessonChosenTimes: LessonChosenTimes
};

//支付方式，默认为微信支付
var PayType = ko.observable('wxpay');
var checkPayType = function(){
	PayType(event.srcElement.value);
}

var OrderNO = ko.observable('');	//请求后返回的订单号
//支付的生成订单
var gotoPay = function() {
	if(!self.selectedCourse()){
		mui.toast("请选择课程");
		return;
	}
	if(!self.selectedLocation()){
		mui.toast("请选择授课方式");
		return;
	}
	if(self.ChosenTimes().length <= 0){
		mui.toast("请选择课时");
		return;
	}
	if(self.PayType() == ''){
		mui.toast("请选择支付方式");
		return;
	}
	
	//准备约课信息
	var courseToUser = {
		CourseID: self.selectedCourse().ID,
		CourseName: self.selectedCourse().CourseName,
		TeacherID: self.teacherID(),
		StudentID: getLocalItem('UserID'),
		LessonCount: self.ChosenTimes().length
	}
	
	//准备课时信息
	var lessons = [];
	self.ChosenTimes().forEach(function(item){
		var dtEnd = newDate(item);
		dtEnd.setHours(dtEnd.getHours() + 1);
		var endtime = dtEnd.format("yyyy-MM-dd hh:mm:ss");
		var lesson = {
			LocationType: self.selectedLocation().LocationType,
			LocationName: self.selectedLocation().LocationName,
			BeginTime: item,
			EndTime: endtime,
			Amount: self.selectedLocation().Cost
		}
		
		lessons.push(lesson);
	})
	
	//保存约课及课时信息，并返回订单信息
	var ajaxUrl = common.gServerUrl + 'API/CourseToUser?lessonJson=' + JSON.stringify(lessons);
	mui.ajax(ajaxUrl, {
		type: 'POST',
		data: courseToUser,
		success: function(responseText) {
			self.OrderNO(responseText);
			//console.log(responseText);
			
			//根据支付方式、订单信息，调用支付操作
			Pay.pay(self.PayType(), self.OrderNO());
		}
	})
};

//关闭支付弹窗
var closePopPay = function() {
	mui('#popPay').popover('hide');
}

//关闭选择课时弹窗
var closePopChooseTime = function() {
	mui('#popChooseTime').popover('hide');
}

ko.applyBindings(AboutLesson);