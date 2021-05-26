sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var DemoPersoService = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "demoApp-tablaProductos-buttonCol",
					order: 0,
					text: "Agregar",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-materialCol",
					order: 1,
					text: "Descripción de material",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-precioCol",
					order: 2,
					text: "Precio",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-centroCol",
					order: 3,
					text: "Centro",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-almacenCol",
					order: 4,
					text: "Almacén",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-stockCol",
					order: 5,
					text: "Stock disponible",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-loteCol",
					order: 6,
					text: "Lote",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-calibreCol",
					order: 7,
					text: "Calibre",
					visible: false
				},
				{
					id: "demoApp-tablaProductos-categoriaCol",
					order: 8,
					text: "Categoria",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-subvariedadCol",
					order: 9,
					text: "Subvariedad",
					visible: false
				},
				{
					id: "demoApp-tablaProductos-clasificacionCol",
					order: 10,
					text: "Clasificación",
					visible: false
				},
				{
					id: "demoApp-tablaProductos-origenCol",
					order: 11,
					text: "Origen",
					visible: false
				},
				{
					id: "demoApp-tablaProductos-marcaCol",
					order: 12,
					text: "Marca",
					visible: false
				}
			]
		},

		oResetData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "demoApp-tablaProductos-buttonCol",
					order: 0,
					text: "Agregar",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-materialCol",
					order: 1,
					text: "Descripción de material",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-precioCol",
					order: 2,
					text: "Precio",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-centroCol",
					order: 3,
					text: "Centro",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-almacenCol",
					order: 4,
					text: "Almacén",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-stockCol",
					order: 5,
					text: "Stock disponible",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-loteCol",
					order: 6,
					text: "Lote",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-calibreCol",
					order: 7,
					text: "Calibre",
					visible: false
				},
				{
					id: "demoApp-tablaProductos-categoriaCol",
					order: 8,
					text: "Categoria",
					visible: true
				},
				{
					id: "demoApp-tablaProductos-subvariedadCol",
					order: 9,
					text: "Subvariedad",
					visible: false
				},
				{
					id: "demoApp-tablaProductos-clasificacionCol",
					order: 10,
					text: "Clasificación",
					visible: false
				},
				{
					id: "demoApp-tablaProductos-origenCol",
					order: 11,
					text: "Origen",
					visible: false
				},
				{
					id: "demoApp-tablaProductos-marcaCol",
					order: 12,
					text: "Marca",
					visible: false
				}
			]
		},


		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			oDeferred.resolve(this._oBundle);
			// setTimeout(function() {
			// 	oDeferred.resolve(this._oBundle);
			// }.bind(this), 2000);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		getResetPersData : function () {
			var oDeferred = new jQuery.Deferred();

			// oDeferred.resolve(this.oResetData);

			setTimeout(function() {
				oDeferred.resolve(this.oResetData);
			}.bind(this), 2000);

			return oDeferred.promise();
		},

		resetPersData : function () {
			var oDeferred = new jQuery.Deferred();

			//set personalization
			this._oBundle = this.oResetData;

			//reset personalization, i.e. display table as defined
			//this._oBundle = null;

			oDeferred.resolve();

			// setTimeout(function() {
			// 	this._oBundle = this.oResetData;
			// 	oDeferred.resolve();
			// }.bind(this), 2000);

			return oDeferred.promise();
		},

		//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
		//to 'Weight (Important!)', but will leave all other column names as they are.
		getCaption : function (oColumn) {
			if (oColumn.getHeader() && oColumn.getHeader().getText) {
				if (oColumn.getHeader().getText() === "Weight") {
					return "Weight (Important!)";
				}
			}
			return null;
		},

		getGroup : function(oColumn) {
			if ( oColumn.getId().indexOf('productCol') != -1 ||
					oColumn.getId().indexOf('supplierCol') != -1) {
				return "Primary Group";
			}
			return "Secondary Group";
		}
	};

	return DemoPersoService;

});
