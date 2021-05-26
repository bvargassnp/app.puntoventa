sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"Ventas/Vitrinav2/utils/FioriComponent"
], function (JSONModel, FioriComponent) {
	"use strict";

	return {
		getModel: function () {
			//gets component
			var component = FioriComponent.getComponent();
			//gets model
			var jsonModel = component.byId("app").getModel("filterModel");
			//checks if the model exists
			if (!jsonModel) {
				jsonModel = new JSONModel();
				jsonModel.setSizeLimit(9999);
				component.byId("app").setModel(jsonModel, "filterModel");
			}
			return jsonModel;
		},

		initializeModel: function () {
			var jsonModel = this.getModel();
			jsonModel.setData({
				lote:"",
				material: "",
				especie: "",
				centro: "",
				almacen: ""
			});
			return jsonModel;
		},

		setProperty: function (sPropery, value) {
			this.getModel().setProperty(sPropery, value);
			this.updateModel();
		},

		getProperty: function (sPropery) {
			return this.getModel().getProperty(sPropery);
		},

		updateModel: function () {
			this.getModel().updateBindings(true);
		}

	};
});