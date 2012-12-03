var TransedBackground = {

    windowMargins: {
        x: 100,
        y: 100
    },

    startWindow: function() {
        var self    = this;
        self.window = chrome.app.runtime.onLaunched.addListener(function() {
            chrome.app.window.create('html/transed.html', self.screen);
        });
    },

    detectScreen: function() {
        var self    = this;
        var width   = screen.availWidth;
        var height  = screen.availHeight;

        self.screen = {
            frame: "none",
            width: width - self.windowMargins.x,
            height: height - self.windowMargins.y,
            minWidth: 860,
            minHeight: 600,
            left: self.windowMargins.x/2,
            top: self.windowMargins.y/2+30
        };
    },

    init: function() {
        var self    = this;
        var screen  = self.detectScreen();

        self.startWindow();
        return self;
    }

}.init();