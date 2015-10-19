
var AboutLesson = {
	lessonBaseInfo: LessonBaseInfo,
	lessonChosenTimes: LessonChosenTimes
};

//支付
var gotoPay = function() {
	console.log(self.ChosenTimes());
};

ko.applyBindings(AboutLesson);
