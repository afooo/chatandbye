/**
 * SETUP
 **/
var app = app || {};

/**
 * MODELS
 **/
app.Users = Backbone.Model.extend({
	url: function(){
		return 'http://localhost:3000/chat/users'
			+ (this.user = '' ? '' : '/' + this.user);
	},
	user: '',
	defaults: {
		users: []
	}
});

app.Message = Backbone.Model.extend({
	url: function(){
		return 'http://localhost:3000/chat/start';
	},
	defaults: {
		today: '',
		users: [],
		data: []
	}
});

app.SubmitMessage = Backbone.Model.extend({
	//data source
	url: function(){
		return 'http://localhost:3000/chat/send/' + this.get('message');
	},
	defaults: {
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
		this.model = new app.Users();
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
			this.model.user = username;
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
	initialize: function(){
		this.model = app.Message();
		//this.usersModel = new app.Users();
		this.model.today = new Date();
		this.model.on('change', this.render, this);  // ViewModel

		this.template = _.template($('#tmpl-message').html());
		this.usersTemplate = _.template($('#tmpl-message').html());

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
			var users = JSON.parse(message.users);
			var json = JSON.parse(message.data);
			console.log(message);

			if(message.type === 'message'){
				self.model.set('data', json.data);  // model state is changed
				self.model.fetch();
			}
		}

		// Let us open a web socket
		var ws = new WebSocket('ws://localhost:3000/chat/start', ['echo-protocol']);
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

		this.model.set('message', text);
		this.model.save();
	}
});

// 等候HTML文件完成載入
$(document).ready(function(){
	app.loginView = new app.LoginView();
	app.messageView = new app.MessageView();
	app.actionView = new app.ActionView();
});


