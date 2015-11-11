var subjectsViewModel = function() {
	var self = this;
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	
	mui.plusReady(function(){
		var tmp = plus.storage.getItem(common.gVarLocalAllSubjects);
		var subjects = JSON.parse(tmp);
		var previousClass = 0;
		
		//增加“全部分类”
		self.tmplSubjectClasses.push({
			subjectClass: 0,
			subjectClassName: '全部分类'
		});
		
		//增加“全部”
		self.tmplSubjects.push({
			id: ko.observable(0),
			subjectName: ko.observable('全部'),
			subjectClass: ko.observable(0),
			subjectClassName: ko.observable('分类'),
			subjectType: ko.observable('类型'),
			selected: ko.observable(true)				//默认选中
		});
		
		if(subjects.length > 0){
			subjects.forEach(function(item){
				if(item.SubjectClass != previousClass){
					self.tmplSubjectClasses.push({
						subjectClass: item.SubjectClass,
						subjectClassName: item.SubjectClassName
					});
					
					//增加每一类“全部”
					self.tmplSubjects.push({
						id: ko.observable(0),
						subjectName: ko.observable('全部'),
						subjectClass: ko.observable(item.SubjectClass),
						subjectClassName: ko.observable(item.SubjectClassName),
						subjectType: ko.observable('类型'),
						selected: ko.observable(false)				//默认选中
					});
			
					previousClass = item.SubjectClass;
				}
				
				self.tmplSubjects.push({
					id: ko.observable(item.ID),
					subjectName: ko.observable(item.SubjectName),
					subjectClass: ko.observable(item.SubjectClass),
					subjectClassName: ko.observable(item.SubjectClassName),
					subjectType: ko.observable(item.subjectType),
					selected: ko.observable(false)
				});
			})
		}
	})
	
	self.getSubjectClasses = function(){
		return self.tmplSubjectClasses();
	}
	
	self.getSubjects = function(){
		return self.tmplSubjects();
	}
}
//ko.applyBindings(subjectsViewModel);
//ko.applyBindings(subjectsViewModel, document.getElementById('popSubjects'));
