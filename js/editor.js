var TransedEditor = {

    // window state. normal / max / min
    state: "normal",

    menu: {
        topMenu: {
            "icon-folder-open": function(el) {
                el.parent().click(function(){
                    var a = chrome.fileSystem;
                    console.log(a);
                    chrome.fileSystem.chooseEntry({
                        accepts         :   [{
                            extensions      :["txt"]
                        }],
                        type            :   'openFile'
                    }, TransedEditor.onFileOpen);
                });
            },
            "icon-resize-full": function(el) {
                el.attr("class", "icon-resize-full");
                el.parent().click(function(){
                    var currentWin = chrome.app.window.current();
                    if(!currentWin.isMaximized()) {
                        el.attr("class", "icon-resize-small");
                        currentWin.maximize();
                    } else {
                        el.attr("class", "icon-resize-full");
                        currentWin.restore();
                    }
                })
            },
            "icon-minus": function(el) {
                el.parent().click(function(){
                    var currentWin = chrome.app.window.current();
                    if(!currentWin.isMinimized()) {
                        currentWin.minimize();
                    } else {
                        currentWin.restore();
                    }
                })
            },
            "icon-remove": function(el) {
                el.parent().click(function(){
                    window.close();
                })
            }
        }
    },

    onFileOpen: function() {
        console.log(arguments);
    },

    bindTopMenu: function() {
        var self = this;
        for(var item in self.menu.topMenu) {
            self.menu.topMenu[item]($("."+item));
        }
    },

    init: function(){
        var self = this;

        $(document).ready(function(){
            self.bindTopMenu();
        });

        return self;
    }

}.init();