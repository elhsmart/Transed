var TransedEditor = {

    // window state. normal / max / min
    state: "normal",

    popup: {
        about: {
            frame: "none",
            width: 600,
            height: 300,
            minWidth: 600,
            minHeight: 300,
            left: 0,
            top: 0
        }
    },

    menu: {
        topMenu: {
            "top-menu-open": function(el) {

            },
            "top-menu-save": function(el) {

            },
            "top-menu-undo": function(el) {

            },
            "top-menu-redo": function(el) {

            },
            "top-menu-about": function(el) {

                el.parent().click(function(){
                    try {
                        if(TransedEditor.popup.about.instance != undefined) {
                            TransedEditor.popup.about.instance.focus();
                            return;
                        }
                    } catch (e) {
                        delete TransedEditor.popup.about.instance;
                        console.log("Seems like popup has been closed. Freeing memory for it.");
                    }

                    var currentWin  = chrome.app.window.current();
                    var popupScreen = TransedEditor.popup.about;
                    popupScreen.top = currentWin.getBounds().top+((currentWin.getBounds().height - popupScreen.height)/2);
                    popupScreen.left = currentWin.getBounds().left+((currentWin.getBounds().width - popupScreen.width)/2);

                    chrome.app.window.create('html/about.html', popupScreen, function(popupWindow){
                        TransedEditor.popup.about.instance = popupWindow;
                    });
                    console.log(TransedEditor);
                });
            },
            "icon-folder-open": function(el) {
                el.parent().click(function(){
                    var a = chrome.fileSystem;
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