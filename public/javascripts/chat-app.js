/**
 * SETUP
 **/
var app = app || {};

/**
 * MODELS
 **/
app.User = Backbone.Model.extend({
	url: function(){
		return '/chat/users/'+ this.get('user');
	},
	defaults: {
		user: ''
	}
});

app.Users = Backbone.Model.extend({
	url: function(){
		return '/chat/users';
	},
	defaults: {
		users: []
	}
});

app.Message = Backbone.Model.extend({
	url: function(){
		return '/chat/start';
	},
	defaults: {
		today: '',
		data: []
	}
});

app.SubmitMessage = Backbone.Model.extend({
	url: function(){
		return '/chat/send/'+ this.get('user')
			+ '/' + this.get('message');
	},
	defaults: {
		user: '',
		message: ''
	}
});

/**
 * VIEWS
 **/
app.LoginView = Backbone.View.extend({
	el: '#entername',
	events: {
		'click #start': 'start'
	},
	initialize: function(){
		this.model = new app.User();
		this.render();
	},
	render: function(){
		this.$el.html();
	},
	start: function(){
		var username = this.$el.find('#username').val();
		//this.$el.find('#noname').addClass('hide');

		if(username) {
			//save user to server
			this.model.attributes.user = username;
			this.model.save();
			//change view
			this.$el.addClass('hide');
			$('#chatroom').removeClass('hide');
		}  else {
			this.$el.find('#noname').removeClass('hide');
		}
	}
});

app.MessageView = Backbone.View.extend({
	el: '#chat',
	webHost: '',
	initialize: function(){
		this.model = new app.Message();
		this.usersModel = new app.Users();
		this.model.today = new Date();
		this.webHost = this.$el.data('host');

		this.model.on('change', this.render, this);
		this.usersModel.on('change', this.render, this);

		this.template = _.template($('#tmpl-message').html());
		this.usersTemplate = _.template($('#tmpl-users').html());

		this.createWebSocket();
		this.usersModel.fetch();
		this.model.fetch();
		this.render();
	},
	render: function(){
		this.$el.find('#message').html(this.template(this.model.attributes));
		this.$el.find('#users').html(this.usersTemplate(this.usersModel.attributes));
	},
	createWebSocket: function(){
		var div = this.$el.find('#message');
		var self = this;

		function onWsMessage(message){
			var json = JSON.parse(message.data);

			if(message.type === 'message'){
				self.model.set('data', json.data);  // model state is changed
				self.model.fetch();
				self.usersModel.fetch();
				console.log(self.model.attributes);
				console.log(self.usersModel.attributes);
			}
		}

		// Let us open a web socket
		var ws = new WebSocket('ws://'+ this.webHost +'/chat/start', ['echo-protocol']);

		ws.onopen = function(){
			div.append('<h5>Chat now</h5>');
		};

		ws.onmessage = onWsMessage;

		ws.onclose = function(){
			div.append('<h5>Bye</h5>');
		};
		ws.onerror = function(){
			div.html('<h2>Error</h2>');
		};
	}
});

app.ActionView = Backbone.View.extend({
	el: '#action',
	events: {
		'click #btn-message-save': 'save'
	},
	initialize: function(){
		this.model = new app.SubmitMessage();
	},
	save: function(evt){
		var text = this.$el.find('#text').val();
		var user = app.loginView.model.attributes.user;

		this.model.set('message', text);
		this.model.set('user', user);
		this.model.save();
	}
});

// 等候HTML文件完成載入
$(document).ready(function(){
	app.loginView = new app.LoginView();
	app.messageView = new app.MessageView();
	app.actionView = new app.ActionView();
});


