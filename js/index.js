function Rater()
{
	this.inputDiv = null;
	this.activitiesDiv = null;
	this.commentsDiv = null;
	
	this.userid = null;
	this.activities = null;
	this.activity = null;
	this.comments = null;
	
	this.score = null;
	
	this.activitySelectHandlerProxy = null;
	this.inputChangeHandlerProxy = null;
	this.hashChangeHandler = null;
};

Rater.prototype =
{
	
	key: 'AIzaSyA-a-rYGciGtB5QMdunSZxeBqM2EXIiLkw',
	
	baseReqURL: "https://www.googleapis.com/plus/v1/",
	
	init: function ()
	{
		this.divInit();
		this.proxyInit();
		this.inputInit();
		
		this.hashChanged();
		
		window.onhashchange = this.hashChangeHandler;
	},
	
	proxyInit: function ()
	{
		this.activitySelectHandlerProxy = $.proxy(this.selectActivity, this);
		this.inputChangeHandlerProxy = $.proxy(this.inputChanged, this);
		this.hashChangeHandler = $.proxy(this.hashChanged, this);
	},
	
	hashChanged: function (evt)
	{
		this.listActivities(window.location.hash.split('#')[1]);
	},
	
	inputChanged: function (evt)
	{
		
	},
	
	selectActivity: function (evt)
	{
		var act = this.activities[$(evt.currentTarget).index()];
		this.listComments(act);
	},
	
	divInit: function ()
	{
		this.inputDiv = $('div#input');
		this.activitiesDiv = $('div#activities');
		this.commentsDiv = $('div#comments');
	},
	
	inputInit: function ()
	{
		var target = this.inputDiv;
		
		target.append($('<div>')
			.attr('id', 'uid')
			.prop('contenteditable', true)
			.on('change', this.inputChangeHandlerProxy)
		);
	},
	
	listActivities: function (userid)
	{
		var url = this.baseReqURL;
		url += "people/" + userid + "/activities/public";
		
		this.userid = userid;
		
		this.getData(url);
	},
	
	listComments: function (activity)
	{
		var url = this.baseReqURL + "activities/" + activity.id + "/comments";
		
		this.activity = activity;
		
		this.getData(url);
	},
	
	getData: function (location)
	{
		return jQuery.ajax({
			type: "GET",
			success: this.success,
			error: this.error,
			context: this,
			cache: false,
			url: location,
			data: {key: this.key},
		});
	},
	
	repopActivities: function ()
	{
		var d = this.activities;
		var len = d.length;
		
		// empty target
		var target = this.activitiesDiv.empty().disableSelection();
		
		// make a list of activities
		var obj = null, alternate = false;
		for (var i = 0; i < len; i++)
		{
			obj = $('<div>').addClass('activity')
				.append($('<div>').attr('id', 'title').html(d[i].title))
				.append($('<div>').attr('id', 'aid').html(d[i].id))
				.on('click', this.activitySelectHandlerProxy)
				.disableSelection();
			
			if (alternate) obj.addClass('alternate');
			
			alternate = !alternate;
			
			target.append(obj);
		}
	},
	
	repopComments: function ()
	{
		var d = this.comments;
		var len = d.length;
		
			// empty target
		var target = this.commentsDiv.empty().disableSelection();
		
		// make a list of comments
		var obj = null, sub = null, alternate = false;
		for (var i = 0; i < len; i++)
		{
			sub = d[i];
			
			obj = $('<div>').addClass('comment')
				.append($('<div>').attr('id', 'poster').html(sub.actor.displayName))
				.append($('<div>').attr('id', 'comment').html(sub.object.content))
				.disableSelection();
			
			if (alternate) obj.addClass('alternate');
			
			alternate = !alternate;
			
			target.append(obj);
			
			console.log(d[i]);
		}
	},
	
	setActivities: function (data)
	{
		var len = data.length;
		
		if (!len)
		{
			this.activities = null;
			return;
		}
		
		// native array
		var ret = new Array(len);
		
		// Parse out the only info we care about
		for (var i = 0; i < len; i++)
			ret[i] = {title: this.stripLinebreaks(data[i].title), id: data[i].id};
		
		// Set member
		this.activities = ret;
		
		// Repop
		this.repopActivities();
	},
	
	setComments: function (data)
	{
		var len = data.length;
		
		if (!len)
		{
			this.comments = null;
			return;
		}
		
		// native array
		var ret = new Array(len);
		var score = {}, d = null;
		
		// Parse out the only info we care about
		for (var i = 0; i < len; i++)
		{
			d = data[i];
			ret[i] = d;
			
			score[d.actor.id] = {actor: d.actor, }
		}
		
		console.log(score);
		
		// Set member
		this.comments = ret;
		
		// Repop
		this.repopComments();
	},
	
	success: function (data, textStatus, jqXHR)
	{
		// g+ api response multiplexer
		
		switch (data.kind)
		{
			case "plus#activityFeed":
				this.setActivities(data.items);
				break;
			
			case "plus#commentFeed":
				this.setComments(data.items);
				break;
			
			default:
				console.log('Unknown reponse type: "' + data.kind + '"');
				console.log(data);
				break;
		}
	},
	
	error: function (jqXHR, textStatus, errorThrown)
	{
		// Nothing to do here.  Maybe make a jqui dialog?
		console.log(textStatus);
	},
	
	stripLinebreaks: function (string)
	{
		return string.replace(/\s+/g, " ");
	},
	
};

var r = new Rater();
$(window).ready(function () {r.init();});