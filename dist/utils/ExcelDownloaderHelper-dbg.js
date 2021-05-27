sap.ui.define([
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast"
], function (Spreadsheet, MessageToast) {
	"use strict";

	return {
		createColumnConfig: function ( aLabel, aProperty ) {
			var aExcel = [];
			for (var i = 0; aLabel.length > i; i++) {
				var oExcel = {};
				oExcel.label = aLabel[i];
				oExcel.property = aProperty[i];
				aExcel.push(oExcel);
			}
			return aExcel;
		},

		onExport: function (aEvt, aLabel, aProperty) {
			
			var arrLabels = aLabel;
			var arrPropertys = aProperty;
			
			if (aEvt.length === 0) {
				MessageToast.show("No data to export");
			} else {
				var aCols, aData, oSettings, oSheet, nameDateFile;
				aCols = this.createColumnConfig(arrLabels, arrPropertys);
				nameDateFile = new Date().getMilliseconds();
				var nameFile = aCols[0].label + nameDateFile;
				aData = aEvt.items;
				
				oSettings = {
					workbook: {
						columns: aCols
					},
					dataSource: aData,
					fileName: nameFile
				};
				oSheet = new Spreadsheet(oSettings);
				oSheet.build()
					.then(function () {
						MessageToast.show("El archivo ha sido descargado correctamente");
					});
			}
		}
	};

});