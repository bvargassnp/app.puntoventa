sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"ar/com/puntoventa/utils/FioriComponent"
], function (JSONModel, FioriComponent) {
	"use strict";

	return {
		getModel: function () {
			//gets component
			var component = FioriComponent.getComponent();
			//gets model
			var jsonModel = component.byId("app").getModel("columns");
			//checks if the model exists
			if (!jsonModel) {
				jsonModel = new JSONModel();
				jsonModel.setSizeLimit(9999);
				component.byId("app").setModel(jsonModel, "columns");
			}
			return jsonModel;
		},

		initializeModel: function () {
			var jsonModel = this.getModel();
			jsonModel.setData({
				"cols": [{
					"label": "Lote",
					"template": "CHARG",
					"width": "5rem"
				}, {
					"label": "Descripción",
					"template": "CHARG"
				}, {
					"label": "Categoria",
					"template": "Category"
				}]
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