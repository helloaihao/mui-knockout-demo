var LessonBaseInfo = function() {
	var self = this;
	//self.times = ko.observableArray(['请选择课时']);
	//self.showTimes = ko.observableArray(['请选择课时']);
	self.teacherName = ko.observable('袁怡航');
	self.tUserID = ko.observable(0);
	self.teacherPhoto = ko.observable('../../images/default.jpg');
	self.courses = ko.observableArray([]); //老师课程列表
	self.selectedCourse = ko.observable();	//当前选中的课程
	self.ageRange = ko.computed(function(){ //当前选择课程的年龄范围
		var ret = '';
		if(self.selectedCourse()){
			var ageMin = self.selectedCourse().AgeMin;
			var ageMax = self.selectedCourse().AgeMax;
			if(ageMin > 0 && ageMax > 0){
				ret = ageMin + '~' + ageMax + '岁';
			}
			else if(ageMax > 0){
				ret = '不大于' + ageMax + '岁';
			}
			else if(ageMin > 0){
				ret = '不小于' + ageMin + '岁';
			}
			else{
				ret = '不限';
			}
			
			ret = '建议年龄范围：' + ret;
		}
		
		return ret;
	})
	self.selectedLocation = ko.observable(); //当前选择的授课方式
	self.locations = ko.computed(function(){ //当前选择课程的所有授课方式
		var ret = ko.observableArray([]);
		if(self.selectedCourse()){
			if(self.selectedCourse().LocationJson){
				var arr = JSON.parse(self.selectedCourse().LocationJson);
				if(arr){
					var selected = true;
					arr.forEach(function(item){
						var obj = {
							LocationType: item.LocationType,
							LocationName: item.LocationName,
							Cost: item.Cost,
							Selected: ko.observable(selected)				//初始化时勾选第一个
						}
						if(selected){
							self.selectedLocation(obj);
							selected = false;
						}
						
						ret().push(obj);
					})
				}
			}
		}
		
		return ret();
	})
	
	/*//选择课时
	self.gotoChooseTime = function() {
		self.times([]);
		common.transfer('chooseTime.html', true, {
			chosenTimes: self.times()
		});
	};*/
	
	//选择课程
	self.chooseCourse = function() {
		mui.ready(function() {
			self.ppCourses.show(function(items) {
				self.courses().forEach(function(item){
					if(item.ID == items[0].value){
						self.selectedCourse(item);
						return;
					}
				})
			});
		});
	}
	
	//选择授课方式
	self.selectLocation = function(data) {
		if(data.Selected() == false){
			data.Selected(true);
			self.locations().forEach(function(item){
				if(item.Selected() == true){
					item.Selected(false);
					return;
				}
			})
			data.Selected(true);
		}
		//设置当前控件为选中状态
		/*event.srcElement.parentElement.querySelector('.money').style.display = 'none';
		event.srcElement.parentElement.querySelector('.cur').className = '';
		event.srcElement.className = 'cur';
		var nextNode = event.srcElement.nextSibling;
		while(nextNode){
			if(nextNode.className && nextNode.className == 'money'){
				console.log('kkk');
				nextNode.style.display = '';
				break;
			}
			nextNode = nextNode.nextSibling;
		}*/
		
		//设置选择的授课时间
		self.selectedLocation(data);
	}
	
	var ppCourses;
	//获取参数
	mui.plusReady(function() {
	//mui.ready(function() {
		var web = plus.webview.currentWebview(); //页面间传值
		
		/*if(typeof(web.chosenTimes) !== "undefined") {
			self.times(web.chosenTimes.sort());
		}*/
		if(typeof(web.userID) !== "undefined") {
			self.tUserID(web.userID);
		}
		if(typeof(web.teacherPhoto) !== "undefined") {
			self.teacherPhoto(web.teacherPhoto);
		}
		if(typeof(web.teacherName) !== "undefined") {
			self.teacherName(web.teacherName);
		}
		if(typeof(web.courses) !== "undefined") {
			self.courses(web.courses);
			
			self.ppCourses = new mui.PopPicker();
			self.ppCourses.setData(common.JsonConvert(self.courses(), 'ID', 'CourseName'));
		}
	});
};

//ko.applyBindings(LessonBaseInfo, document.getElementById('divLessonInfo'));
