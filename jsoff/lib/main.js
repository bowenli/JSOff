var buttons = require('sdk/ui/button/action');
var {Cc, Ci} = require("chrome");

var jsoff = jsoff || {};

jsoff.onIconUrls = {
    "16": "./on-16.png",
    "32": "./on-32.png",
    "64": "./on-64.png"
  };

jsoff.offIconUrls = {
    "16": "./off-16.png",
    "32": "./off-32.png",
    "64": "./off-64.png"
  };


jsoff.jsStatus = function () {
    var prefManager = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    var button = null;

	return {
		init : function(b){
			button = b;
            this.setButtonState();
		},

		// run this onClick from the button
		run : function () {
			var jsEnabled = prefManager.getBoolPref("javascript.enabled");
			prefManager.setBoolPref("javascript.enabled", !jsEnabled);
			// change propogation handled in observer, don't need to call setButtonState here
		},

		// something changed, update UI
		setButtonState : function(){
			var jsEnabled = prefManager.getBoolPref("javascript.enabled");
			button.icon = jsEnabled ? jsoff.onIconUrls : jsoff.offIconUrls;
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
        jsoff.jsStatus.setButtonState();
        break;
    }
  }
};
jsoff.myPrefObserver.register();


// When in the 'customize' view (FF 29), button always defaults to "on"
var button = buttons.ActionButton({
  id: "jsoff-button",
  label: "JSOff",
  icon: jsoff.onIconUrls,
  onClick: function() {
     jsoff.jsStatus.run();
   }
});

jsoff.jsStatus.init(button);