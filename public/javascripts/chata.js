// setup
var app = app || {};

// models
app.Message = Backbone.Model.extend({
	url: function(){
		return 'http://localhost:3000/chat/start';
	},
	defaults: {
		data:[]
	}
});



// views
app.MessageView = Backbone.View.extend({
	el: '#chat',
	template: _.template.( $('#tmpl-message').html() ),
	events:{},
	initialize: function(){
		this.model = new app.Message();
		console.log(this.model);
		this.listenTo(this.model, 'sync', this.render);
		this.listenTo(this.model, 'change', this.render);
		this.model.fetch();
	},
	render: function(){
		this.$el.find('#message').html(this.template(this.model.attributes));
		console.log('message!');
	}
});


/*
app.ActionView = Backbone.View.extend({
	el: '#action',
	events: {
		'click #btn-message-save': 'save'
	},
	initialize: function(){
	}
});
*/

$(document).ready(function(){
	app.messageView = new app.MessageView();
});
