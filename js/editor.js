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

    setEditedFile: function(fileEntry, callback) {
        var self = TransedEditor;
        if(self.instance == undefined) {
            self.instance = fileEntry;
            callback();
            return;
        }
    },

    onFileOpen: function(fileEntry) {
        var self = TransedEditor;
        self.setEditedFile(fileEntry, function(){
            self.createEditBox(fileEntry);
        });
    },

    buildEditBox: function() {
        var self = this;
        // replacing all repeated linebreaks
        self.editedText = self.editedText.replace(/\n{2,}|\r\n{2,}/g, "\n");
        self.paragraphs = self.editedText.split("\n");

        for(var paragraph in self.paragraphs) {
            self.paragraphs[paragraph] = $.trim(self.paragraphs[paragraph]).split(".");
            for(var sentence in self.paragraphs[paragraph]) {
                if($.trim(self.paragraphs[paragraph][sentence]).length == 0) {
                    self.paragraphs[paragraph].remove(sentence);
                    continue;
                }
                self.paragraphs[paragraph][sentence] = $.trim(self.paragraphs[paragraph][sentence])+".";
            }
        }
    },

    setEditedText: function(text) {
        var self = this;
        self.editedText = text;
    },

    createEditBox: function(fileEntry) {
        var self = this;
        if (fileEntry) {
            fileEntry.file(function(file){
                var fileReader = new FileReader();

                fileReader.onload = function(e) {
                    self.showToolbar();
                    self.setEditedText(e.target.result);
                    self.buildEditBox();
                };

                fileReader.onerror = function(e) {
                    console.log("Read failed: " + e.toString());
                };

                fileReader.readAsText(file);
            }, self.fileErrorHandler);
        }
    },

    bindTopMenu: function() {
        var self = this;
        for(var item in self.menu.topMenu) {
            self.menu.topMenu[item]($("."+item));
        }
    },

    fileErrorHandler: function(e) {
        var msg = "";

        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = "QUOTA_EXCEEDED_ERR";
                break;
            case FileError.NOT_FOUND_ERR:
                msg = "NOT_FOUND_ERR";
                break;
            case FileError.SECURITY_ERR:
                msg = "SECURITY_ERR";
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = "INVALID_MODIFICATION_ERR";
                break;
            case FileError.INVALID_STATE_ERR:
                msg = "INVALID_STATE_ERR";
                break;
            default:
                msg = "Unknown Error";
                break;
        };

        console.log("Error: " + msg);
    },

    showToolbar: function() {
        var self = this;
        $(".footer")
            .html("File: " + self.instance.name )
            .show();
    },

    init: function(){
        var self = this;

        $(document).ready(function(){
            self.bindTopMenu();
        });

        return self;
    }

}.init();