var TransedAbout = {

    menu: {
        topMenu: {
            "icon-remove": function(el) {
                el.parent().click(function(){
                    chrome.runtime.getBackgroundPage(function(page){
                        page.TransedBackground.fireEvent("unblockEditor", {message:"nya"});
                    });
                    window.close();
                })
            }
        }
    },

    bindTopMenu: function() {
        var self = this;
        for(var item in self.menu.topMenu) {
            self.menu.topMenu[item]($("."+item));
        }
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