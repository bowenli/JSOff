var widgets = require("widget");
var tabs = require("tabs");
var self = require("self");
var {Cc, Ci} = require("chrome");

var jsoff = jsoff || {};

jsoff.jsStatus = function () {
    var prefManager = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    var widget = null;

	return {
		init : function(w){
			widget = w;
            this.setStatusBar();
		},

		// run this onClick from the status bar
		run : function () {
			var jsEnabled = prefManager.getBoolPref("javascript.enabled");
			prefManager.setBoolPref("javascript.enabled", !jsEnabled);
			// change propogation handled in observer, don't need to call setStatusBar here
		},

		// something changed, update UI
		setStatusBar : function(){
			var jsEnabled = prefManager.getBoolPref("javascript.enabled");
			widget.contentURL = jsEnabled ? self.data.url("on.png") : self.data.url("off.png");
		}
	};
}();

// This handles watching preferences for changes to javascript options
jsoff.myPrefObserver =
{
  register: function()
  {
    // First we'll need the preference services to look for preferences.
    var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);

    // For this._branch we ask that the preferences for extensions.myextension. and children
    this._branch = prefService.getBranch("javascript.");

    // Now we queue the interface called nsIPrefBranch2. This interface is described as:  
    // "nsIPrefBranch2 allows clients to observe changes to pref values."
    this._branch.QueryInterface(Ci.nsIPrefBranch2);

    // Finally add the observer.
    this._branch.addObserver("", this, false);
  },

  unregister: function()
  {
    if(!this._branch) return;
    this._branch.removeObserver("", this);
  },

  observe: function(aSubject, aTopic, aData)
  {
    if(aTopic != "nsPref:changed") return;
    // aSubject is the nsIPrefBranch we're observing (after appropriate QI)
    // aData is the name of the pref that's been changed (relative to aSubject)
    switch (aData) {
      case "enabled":
        jsoff.jsStatus.setStatusBar();
        break;
    }
  }
}

jsoff.myPrefObserver.register();

var widget = widgets.Widget({
  id: "jsoff-button",
  label: "JSOff",
  contentURL: self.data.url("off.png"),
  width: 16,
  onClick: function() {
    jsoff.jsStatus.run();
  }
});

jsoff.jsStatus.init(widget);
