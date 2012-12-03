var TransedAbout = {

    menu: {
        topMenu: {
            "icon-remove": function(el) {
                el.parent().click(function(){
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

        $(document).ready(function(){
            self.bindTopMenu();
        });

        return self;
    }

}.init();