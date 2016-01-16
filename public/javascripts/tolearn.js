var app = app || {};

app.Lessons = Backbone.Model.extend({
	url: function(){
		return '/learn/lessons' + 
			(this.id === undefined ?  '' : '/' + this.id);
	},
	id: '',
	defaults: {
		errors: [],
		errfor: {},
		lessons: [],
		lesson: {}
	}
});

app.ListView = Backbone.View.extend({
	el: '#tolearnlist',
	template: _.template( $('#tmpl-tolearnlist').html() ),
	events: {
		'click #lesson': 'viewLesson',
		'click .btn-add': 'add',
		'click .btn-delete': 'delete',
		'click [name=delete]': 'remove'
	},
	initialize: function(){
		this.model = new app.Lessons();
		console.log(this.model);
		
		this.listenTo(this.model, 'sync', this.render);
		this.listenTo(this.model, 'change', this.render);
		this.model.fetch();
	},
	render: function(){
		this.$el.html(this.template(this.model.attributes));
	},
	viewLesson: function(evt){
		var id = $(evt.target).data('id');

		app.lessonView.model.set('id', id);
		app.lessonView.model.fetch();
	},
	add: function(evt){
		var that = app.lessonView;
		that.model = new app.Lessons();

		that.listenTo(that.model, 'sync', that.render);
		that.listenTo(that.model, 'change', that.render);
		that.model.fetch();			
	},
	delete: function(evt){
		var cross = this.$el.find('[name=delete]');

		if(cross.hasClass('hide'))
			cross.removeClass('hide');
		else cross.addClass('hide');
	},
	remove: function(evt){
		var self = this;
		var that = app.lessonView;
		var id = $(evt.target).data('id');

		that.model = new app.Lessons();
		that.model.set('id', id);
		that.model.destroy({
			success: function(lesson, res){
				self.model.fetch();
				that.$el.empty();
				return that;
			}
		});
	}
});

app.LessonView = Backbone.View.extend({
	el: '#lessoninfo',
	template: _.template( $('#tmpl-lessonlearn').html() ),
	events: {
		'click .btn-edit': 'edit',
		'click .btn-save': 'save',
		'click .btn-cancel': 'cancel'
	},
	initialize: function(){
		this.model = new app.Lessons();
		this.listenTo(this.model, 'sync', this.render);
		this.listenTo(this.model, 'change', this.render);
	},
	render: function(){
		this.$el.html( this.template( this.model.attributes ));
		console.log('id: ' + this.model.id);
		if(this.model.id === undefined) this.edit();
	},
	edit: function(evt){
		this.$el.find('.non-editable').addClass('hide');
		this.$el.find('.editable').removeClass('hide');
	},
	save: function(evt){
        evt.preventDefault();
        var self = this;

        var obj = {
        	lessonName: this.$el.find('[name=lessonname]').val(),
        	lessonUrl: this.$el.find('[name=lessonurl]').val(),
        	lessonLearn: this.$el.find('[name=lessonlearn]').val()
        };

        console.log(obj);

		this.model.save(obj, { success: function(model, res, opt){
			app.listView.model.fetch();
			self.model.set('id', model.attributes._id);
			self.model.fetch();
		}});
	},
	cancel: function(evt){
		if(this.model.isNew()) {
			this.$el.empty();
			return this;
		}

		this.$el.find('.editable').addClass('hide');
		this.$el.find('.non-editable').removeClass('hide');
	}
});

$(document).ready(function(){
	app.listView = new app.ListView();
	app.lessonView = new app.LessonView();
});

