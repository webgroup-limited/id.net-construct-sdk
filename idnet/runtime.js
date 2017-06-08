﻿assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.IDNet = function(runtime) {
	this.runtime = runtime;
};

//var ID = null;

(function () {
	var pluginProto = cr.plugins_.IDNet.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	var _document = null;
	var _unsafeWindow = null;
	var idNetRuntime = null;
	var idNetInst = null;
	var initialized = 0;
	var idnetUserName = "Guest";
	var userAuthorized = false;
	var idnetSessionKey = "";
	var onlineSavesData = "";
	var isBlacklisted = 0;
	var isSponsor = 0;
	var autoLoginTried = false;
	
	// called on startup for each object type
	typeProto.onCreate = function() {
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type) {
		this.type = type;
		this.runtime = type.runtime;
		
		idNetRuntime = this.runtime;
		idNetInst = this;
		this._document = window.document;
		this._unsafeWindow = this._document.defaultView;
		
		var fjs = document.head.getElementsByTagName('script')[0];
        if (document.getElementById('id-jssdk')) {
			var js = document.getElementById('id-jssdk');
		} else {
			var js = document.createElement('script');
			js.id = 'id-jssdk';
			js.src =  document.location.protocol == 'https:' ? "https://scdn.id.net/api/sdk.js" : "http://cdn.id.net/api/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}
	};
	
	function ShowLeaderBoardCallback(response) {
		
	}
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function() {
	};
	
	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function () {
	};
	
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx) {
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw) {
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.initialized = function() {
		return initialized;
	};
	
	Cnds.prototype.UserIsAuthorized = function () {
		return idNetInst.userAuthorized;
	};
	
	Cnds.prototype.UserIsNotAuthorized = function () {
		return !idNetInst.userAuthorized;
	};
	
	Cnds.prototype.blacklisted = function () {
		return idNetInst.isBlacklisted;
	};
	
	Cnds.prototype.sponsored = function () {
		return idNetInst.isSponsor;
	};
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	Acts.prototype.Init = function(appid_) {
		window.idAsyncInit = function() {
			ID.Event.subscribe("id.init",function() {
				ID.GameAPI.init(appid_, null, function(data, response) {
					console.log("initialized id.net");
					initialized = 1;
				});
				
				ID.Protection.isBlacklisted(function(blacklisted){
					console.log("ID.isBlacklisted "+blacklisted);
					idNetInst.isBlacklisted = blacklisted;
				});
				
				ID.Protection.isSponsor(function(sponsor){
					console.log("ID.isSponsor "+sponsor);
					idNetInst.isSponsor = sponsor;
				});
			});
			
			ID.init({
				appId : appid_
			});
		}
		
        var fjs = document.head.getElementsByTagName('script')[0];
        if (document.getElementById('id-jssdk')) {
			var js = document.getElementById('id-jssdk');
		} else {
			var js = document.createElement('script');
			js.id = 'id-jssdk';
			js.src =  document.location.protocol == 'https:' ? "https://scdn.id.net/api/sdk.js" : "http://cdn.id.net/api/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}
	};
	
	Acts.prototype.RegisterPopup = function() {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		ID.register(function (response) {
			if(response == null) {
				//this.d.dispatch("auth.fail")
			} else {
				console.log("RegisterPopup user.nickname:"+response.authResponse.details.nickname);
				idNetInst.idnetUserName = response.authResponse.details.nickname;
				idNetInst.userAuthorized = true;
				//this.d.dispatch("auth.complete");
			}
		});
	};
	
	Acts.prototype.LoginPopup = function() {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		ID.login(function (response) {
			//console.log(response);
			if(response == null) {
				//this.d.dispatch("auth.fail")
			} else {
				console.log("LoginPopup user.nickname:"+response.authResponse.details.nickname);
				idNetInst.idnetUserName = response.authResponse.details.nickname;
				idNetInst.userAuthorized = true;
				//this.d.dispatch("auth.complete");
			}
		});
	};

	Acts.prototype.autoLogin = function() {
		if (idNetInst.autoLoginTried) {
			return;
		}
		idNetInst.autoLoginTried = true;

		if (!idNetInst.initialized) {
			return console.log('Must initialize id.net first');
		}
		ID.getLoginStatus(function (response) {
			console.log(response)
			idNetInst.userAuthorized = true;
			idNetInst.idnetUserName = response.authResponse.details.nickname;
		}, false);
	};
	
	Acts.prototype.ShowLeaderBoard = function(table_, mode_, highest_, allowduplicates_) {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		ID.GameAPI.Leaderboards.list({table:table_, mode: mode_, highest: highest_, allowduplicates: allowduplicates_});
	};
	
	Acts.prototype.SubmitScore = function(score_, table_, allowduplicates_, highest_, playername_) {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		console.log("SubmitScore playername:"+playername_);
		 var score = {
			table: table_,
			points: score_,
			allowduplicates: allowduplicates_,
			highest: highest_,
			playername: playername_
		};
		ID.GameAPI.Leaderboards.save(score, function(response){
					console.log(response);
		});
	};
	
	Acts.prototype.SubmitProfileImage = function(image_) {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		ID.submit_image(image_, function(response){
			//console.log(response);
		});
	};
	
	Acts.prototype.AchievementSave = function (achievementTitle_, achievementKey_, overwrite_, allowduplicates_) {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		var achievementData = {
			achievement: achievementTitle_,
			achievementkey: achievementKey_,
			overwrite: overwrite_,
		 	allowduplicates: allowduplicates_
		};
		
		ID.GameAPI.Achievements.save(achievementData, function(response){
			//console.log(response);
		});
	};
	
	Acts.prototype.ShowAchievements = function() {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		ID.GameAPI.Achievements.list();
	};
	
	Acts.prototype.OnlineSavesSave = function(key_, value_) {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		ID.api('user_data/submit', 'POST', {key: key_, value: value_}, function(response){
			//console.log(response);
		});
	};
	
	Acts.prototype.OnlineSavesRemove = function(key_) {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		ID.api('user_data/remove', 'POST', {key: key_}, function(response){
			//console.log(response);
		});
	};
	
	Acts.prototype.OnlineSavesLoad = function (key_) {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		idNetInst.onlineSavesData = null;
		ID.api('user_data/retrieve', 'POST', {key: key_}, function(response){
			if(response != null) {
				idNetInst.onlineSavesData = response.jsondata;
			}
		});
	};
	
	Acts.prototype.CheckIsBlacklisted = function () {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		ID.Protection.isBlacklisted(function(blacklisted){
			console.log("CheckIsBlacklisted "+blacklisted);
			idNetInst.isBlacklisted = blacklisted;
		});
	};
	
	Acts.prototype.CheckIsSponsor = function () {
		if (!initialized) {
			return console.log('Must initialize id.net first');
		}
		ID.Protection.isSponsor(function(sponsor){
			console.log("CheckIsSponsor "+sponsor);
			idNetInst.isSponsor = sponsor;
		});
	};
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.UserName = function (ret) {
		ret.set_string(idNetInst.idnetUserName);
	};
	
	Exps.prototype.SessionKey = function (ret)
	{
		if(idnetSessionKey != undefined) {
			ret.set_string(idnetSessionKey);
		}
	};
	
	Exps.prototype.GateOnlineSavesData = function (ret)
	{
		ret.set_string(String(idNetInst.onlineSavesData));
	};
	
	Exps.prototype.GetIsBlacklisted = function (ret)
	{
		if(idNetInst.isBlacklisted) {
			ret.set_int(1);
		} else {
			ret.set_int(0);
		}
	};
	
	Exps.prototype.GetIsSponsor = function (ret)
	{
		if(idNetInst.isSponsor) {
			ret.set_int(1);
		} else {
			ret.set_int(0);
		}
	};
	
	pluginProto.exps = new Exps();

}());