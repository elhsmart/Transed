var TransedEditorScripts = [
    'lib/jquery',
    'lib/handlebars.runtime',
    'lib/addon'
];

var TransedEditorPlugins = [
    'lib/jquery.mousewheel',
    'lib/jquery.scrollbars',
    'lib/bootstrap.dropdown',
    'lib/bootstrap.tooltip',
    'lib/bootstrap.popover'
];

var TransedEditorTemplates = [
    'tmpl/editor.pane.html',
    'tmpl/editor.paragraph.html',
    'tmpl/editor.sentence.html'
];

requirejs.config({
    baseUrl: '/js',
    paths: {
        lib: '/js/lib',
        tmpl: '/js/tmpl'
    }
});

requirejs(TransedEditorScripts,
    function($) {
        requirejs(TransedEditorPlugins.concat(TransedEditorTemplates),
            function(){
                TransedEditor.init();
            })
    });

var TransedEditor = {

    manifest: null,
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
            "top-menu-save": function(el) {
                el.parent().click(function(){
                    if(el.parents("li").hasClass("disabled")) {
                        return;
                    }

                    var suggestName = TransedEditor.instance.name.split(".");
                    suggestName.pop();
                    suggestName = suggestName.join(".");
                    if(suggestName.length == 0) {
                        suggestName = "default";
                    }

                    chrome.fileSystem.chooseEntry({
                        accepts         :   [{
                            extensions      :["trs"],
                        }],
                        suggestedName   :   suggestName+".trs",
                        type            :   'saveFile'
                    }, TransedEditor.saveToTrs);
                });
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
                    chrome.fileSystem.chooseEntry({
                        accepts         :   [{
                            extensions      :["txt","trs"]
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

    displayExportBox: function() {
        $(".editor-buttons").show();

        $(".dropup ul li a").click(function(){
            var checkedEl = $(this).parent();
            $(this).parents(".dropup").find("button:first")
                .html($(this).text())
                .attr("lang", $(this).attr("lang"));
            $(".dropup").find("li").each(function(){
                $(this).show();
            });

            $(".dropup").find("button").each(function(){
                $(".dropup ul li a[lang="+$(this).attr("lang")+"]").parent().hide();
            });
        });
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

    measureText: function(width, text) {
        console.log(text);
        var el = $(".text-measure");

        el
            .css({width:(width-13)+"px"})
            .html(text);

        return el.height();
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

        var templateData = [];
        for(var paragraph in self.paragraphs) {
            for(var sentence in self.paragraphs[paragraph]) {
                self.paragraphs[paragraph][sentence] = {
                    translate_from: self.paragraphs[paragraph][sentence],
                    isLast: function(){ return this.number == this.length },
                    number: parseInt(sentence)+1,
                    height:  self.measureText(self.paragraphs[paragraph][sentence]),
                    length: self.paragraphs[paragraph].length
                };
            }
            templateData[paragraph] = {
                number: parseInt(paragraph)+1,
                sentences: self.paragraphs[paragraph]
            };
        }

        self.paragraphs = templateData;

        $(".editor-pane").css({
            display: "block"
        });

        $(".editor-pane").append(Handlebars.templates['editor.pane.html'](self));

        var basicTextareaWidth = $($(".trans_from textarea").get("0")).width();

        $(".trans_from textarea").each(function(){
            // element.scrollHeight does not include paddings. SHIT. Holy fuckin shit, why browsers still SO UGLY?
            // And developers still need to develop ugliest things possible...

            var height = self.measureText(basicTextareaWidth, $(this).val());

            $(this).css({"height":height+"px"})
            $(this).parent().next().find("textarea").css({"height":height+"px"})
        });

        $(".editor-pane").scrollbars({
            forceScrollbars:true,
            persistantSize:true,
            scrollbarAutohide:false
        });

        $(".trans_to_buttons button")
            .mouseover(function(e){
                $(this).animate({height:26}, { duration: 100, queue: false, complete: function(){
                    $(this).mouseout(function(e){
                        $(this).unbind("mouseuout");
                        $(this).animate({height:10}, { duration: 100, queue: false});
                    });
                }});
            })
            .click(function(){
                var el = $(this);
                if($("#source_language").attr("lang") == undefined ||
                    $("#translated_language").attr("lang") == undefined ) {

                        var popoverTimeout = setTimeout(function(){
                            $("#choose_lang_separator").popover('hide');
                        }, 5000);

                        $("#choose_lang_separator").popover('show');
                        $(".popover_close").click(function(){
                            clearTimeout(popoverTimeout);
                            $("#choose_lang_separator").popover('hide');
                        })
                        return;
                }
                var textToTranslate = el
                    .parents(".sentence-block")
                    .find(".trans_from textarea").val();

                var sendedData = {
                    q: textToTranslate,
                    langpair: $("#source_language").attr("lang")+"|"+$("#translated_language").attr("lang")
                };
                console.log(sendedData);

                $.ajax({
                    url: "http://mymemory.translated.net/api/get",
                    type: "get",
                    data: sendedData,
                    dataType: "json",
                    success: function(data){
                        el
                            .parents(".sentence-block")
                            .find(".trans_to textarea").val(data.responseData["translatedText"]);
                    },
                    error: function(){

                    }
                });
            });
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

                try {
                    fileReader.readAsText(file);
                } catch(e) {
                    console.log(e);
                }
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

        $(".top-menu-save")
            .parents("li")
            .removeClass("disabled");

        self.displayExportBox();
    },

    onResize: function(){
        TransedEditor.contentBlock.style.height = (window.innerHeight - TransedEditor.footerHeight - TransedEditor.headerHeight)+"px";
    },

    bindListeners: function() {
        var self = this;
        $(window).resize(self.onResize);
    },

    templating: function() {
        var i = 0;
        var partialName = "";
        var templateName = "";
        while(i < TransedEditorTemplates.length) {
            partialName     = TransedEditorTemplates[i].split(".")[1];
            templateName    = TransedEditorTemplates[i].split("/")[1];

            Handlebars.registerPartial(partialName, Handlebars.templates[templateName]);

            i++;
            partialName     = "";
            templateName    = "";
        }
    },

    saveToTrs: function(fileEntry) {
        var self = TransedEditor;

        // here we will prepare some basic save format on top of JSON

        console.log(chrome.app);

        var savedData = {
            type:       "trs",
            app:        "Transed Translation Editor",
            version:    self.manifest.version,
            source:     self.instance.name,
            date:       (new Date).toDateString(),
            time:       (new Date).toTimeString(),
            timestamp:  (new Date).getTime(),
            paragraphs: []
        }

        var sentenceNum = 0;
        var paragraph = {};
        var sentence = {};

        for(var p = 0; p < self.paragraphs.length; p++) {
            paragraph = {
                id: p,
                sentences: []
            };
            for(var s = 0; s < self.paragraphs[p].sentences.length; s++) {
                sentence = {
                    id: sentenceNum,
                    source: $($(".trans_from").get(sentenceNum)).find("textarea").val(),
                    translation: $($(".trans_to").get(sentenceNum)).find("textarea").val()
                };

                paragraph.sentences.push(sentence);
                sentenceNum++;
            }
            savedData.paragraphs.push(paragraph)
        }

        fileEntry.createWriter(function(fileWriter) {
            fileWriter.onerror = function(e) {
                console.log("Write failed: " + e.toString());
            };

            var blob = new Blob([JSON.stringify(savedData, null, 4)]);

            fileWriter.truncate(blob.size);

            fileWriter.onwriteend = function() {
                fileWriter.onwriteend = function(e) {
                    console.log("Write completed.");
                };

                fileWriter.write(blob);
            }
        }, TransedEditor.fileErrorHandler);
    },

    saveToTxt: function() {

    },

    saveToCsv: function() {

    },

    loadManifest: function(){
        var self = this;
        self.manifest = chrome.runtime.getManifest();
    },

    init: function(){
        var self = this;

        $(document).ready(function(){
            self.bindListeners();
            self.bindTopMenu();
            self.loadManifest();

            self.headerHeight = $(".navbar").height();
            self.footerHeight = 70;
            self.contentBlock = $(".editor-pane").get(0);

            self.templating();
            self.onResize();

            $("#choose_lang_separator").popover({
                'html'      :true,
                'trigger'   :'manual',
                'placement' :'top',
                'title'     :'Languages not selected<div class="popover_close pull-right"><span class="icon-remove"></span></div>',
                'content'   :'You need to specify Source and Translation languages'
            });

            $(".dropup").first().popover('show');

        });

        return self;
    }
};