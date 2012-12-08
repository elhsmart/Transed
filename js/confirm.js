var TransedConfirm = {

    menu: {
        topMenu: {
            "icon-remove": function(el) {
                TransedConfirm.closeWindow(el.parent(), "no");
            },
            "btn-close": function(el) {
                TransedConfirm.closeWindow(el, "no");
            },
            "btn-ok": function(el) {
                TransedConfirm.closeWindow(el, "yes");
            }
        }
    },

    closeWindow: function(el, answer) {
        el.click(function(){
            chrome.runtime.getBackgroundPage(function(page){
                page.TransedBackground.fireEvent("unblockEditor", {message:"nya"});
                page.TransedBackground.fireEvent("dialogConfirmFinish", {result:answer});
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