define([
  "require",
  "js/config/widgetConfig",
  "js/loader",
  "app/header/header",
  "app/aside/aside",
  "app/widgets/widgetContainer"
], function(require, widgetConfig, loader, header, aside, widgetContainer) {
  return {
    startup: function(mapView) {
      //create an instance of header widget and add it's domNode (html code) to the documents in the #header element
      this.createHeaderWidget(mapView);

      //create an instance of aside widget and add it's domNode (html code) to the documents in the #main element
      this.createAsideWidget(mapView);

      widgetConfig.menus.forEach(menu => {
        if (menu.type == "simple") {
          //case of widget with a simple menu
          this.simpleMenuWidget(menu, widgetContainer, mapView);
        } else if (menu.type == "dorpdown") {
          //case of widget with a dropdown menu
          this.dropdownMenuWidget(menu, widgetContainer, mapView);
        }
      });
    },
    createHeaderWidget: function(mapView) {
      let headerWidget = new header();
      headerWidget.mapView = mapView; //this is added so the mapView can be accessed in the widget
      $("#header").append($(headerWidget.domNode));

      headerWidget.startup();
    },
    createAsideWidget: function(mapView) {
      let asideWidget = new aside();
      asideWidget.mapView = mapView; //this is added so the mapView can be accessed in the widget
      $("#main").append($(asideWidget.domNode));

      asideWidget.startup();
    },
    simpleMenuWidget: function(menuConfig, widgetContainer, mapView) {
      // In case of simple menu we only create a link without dropdown
      var menu = $("<li/>", {
        class: "nav-item",
        html:
          '<a class="nav-link" href="#">' +
          menuConfig.icon +
          menuConfig.title +
          "</a>"
      }).appendTo("ul#menuList");

      this.setMenuClick(menu, menuConfig.widget, mapView);
    },
    dropdownMenuWidget: function(menuConfig, widgetContainer, mapView) {
      // In case of dropdown menu we need to create a list and add links to widgets
      var dropdown = $("<li/>", {
        class: "nav-item dropdown",
        html:
          '<a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
          menuConfig.icon +
          menuConfig.title +
          "</a>"
      }).appendTo("ul#menuList");

      var dropdownMenu = $("<div/>", {
        class: "dropdown-menu",
        "aria-labelledby": "navbarDropdown"
      }).appendTo(dropdown);

      //loop throw submenus and create widgets
      menuConfig.submenus.forEach(submenu => {
        var menu = $("<a/>", {
          class: "dropdown-item",
          href: "#",
          html: submenu.icon + submenu.title
        }).appendTo(dropdownMenu);

        this.setMenuClick(menu, submenu.widget, mapView);
      });
    },
    createWidget(mapView, config, widgetContainerCons) {
      if (!config.isCreated)
        require([config.path], Widget => {
          $(widgetContainerCons.domNode).find(
            ".widgetTitle .widgetIcon"
          )[0].innerHTML = config.icon;
          $(widgetContainerCons.domNode).find(
            ".widgetTitle .widgetText"
          )[0].innerHTML = config.title;

          let widgetCons = new Widget();
          let widgetNode = $(widgetCons.domNode);

          $(widgetContainerCons.domNode)
            .find(".widgetBody")
            .append(widgetNode);

          $("#main").append($(widgetContainerCons.domNode));

          widgetCons.mapView = mapView; //this is added so the mapView can be accessed in the widget
          widgetCons.startup();
          widgetContainerCons.startup();

          config.isCreated = true;
        });
    },
    setMenuClick(menu, config, mapView) {
      //create an instance of widgetcontainer for each widget and append the widget in it
      let widgetContainerCons = new widgetContainer();

      if (!config.lazyLoad)
        this.createWidget(mapView, config, widgetContainerCons);

      menu.click(e => {
        e.preventDefault();
        if (config.lazyLoad)
          this.createWidget(mapView, config, widgetContainerCons);

        $(widgetContainerCons.domNode).css("display", "block");
        if (widgetContainerCons.minimizedWidget) {
          widgetContainerCons.restoreWidget();
        }
        //bring the widget to front clicked on its menu
        $(".widgetContainer").css("z-index", 40);
        $(widgetContainerCons.domNode).css("z-index", 50);
      });
    }
  };
});
