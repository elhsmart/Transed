var TransedError = {

    menu: {
        topMenu: {
            "icon-remove": function(el) {
                TransedError.closeWindow(el.parent(), "no");
            },
            "btn-close": function(el) {
                TransedError.closeWindow(el, "no");
            },
        }
    },

    closeWindow: function(el, answer) {
        el.click(function(){
            chrome.runtime.getBackgroundPage(function(page){
                page.TransedBackground.fireEvent("unblockEditor", {message:"nya"});
            });
            window.close();
        })
    },

    bindTopMenu: function() {
        var self = this;
        for(var item in self.menu.topMenu) {
            self.menu.topMenu[item]($("."+item));
        }
    },

    setPopupText: function(text) {
        $(document).ready(function(){
            $(".confirmation").html(text);
        });
    },

    init: function() {
        var self = this;
        chrome.runtime.getBackgroundPage(function(page){
            page.TransedBackground.fireEvent("blockEditor", {message:"nya"});
        });
        $(document).ready(function(){
            self.bindTopMenu();
        });

        return self;
    }

}.init();