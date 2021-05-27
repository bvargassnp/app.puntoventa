sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ar/com/puntoventa/model/models",
	"ar/com/puntoventa/utils/FioriComponent"
], function (UIComponent, Device, models, FioriComponent) {
	"use strict";

	return UIComponent.extend("ar.com.puntoventa.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();
			FioriComponent.setComponent(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});