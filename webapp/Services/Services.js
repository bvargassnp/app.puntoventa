sap.ui.define([
	"Ventas/Vitrinav2/utils/Constants"
], function (Constants) {
	"use strict";
	return {

		_oModel: null,
		getOdataModel: function (sPath) {
			/*
				let browserLanguage = sap.ui.getCore().getConfiguration().getSAPLogonLanguage();
			*/
			if (this._oModel) {
				return this._oModel;
			}
			//builds model
			this._oModel = new sap.ui.model.odata.ODataModel(sPath, {
				json: true,
				headers: {
					"DataServiceVersion": "2.0",
					"Cache-Control": "no-cache, no-store",
					"Pragma": "no-cache"
				}
			});
			return this._oModel;
		},

		callGetService: function (sEntity, select, aFilter) {
			const oDataModel = this.getOdataModel(Constants.endPoint.BACKEND);
			return new Promise((res, rej) => {
				oDataModel.read(sEntity, {
					urlParameters: {
						"$select": select
					},
					filters: aFilter,
					success: res,
					error: rej
				});
			});
		},
		
		callGetServiceToEntity: function (sEntity) {
			const oDataModel = this.getOdataModel(Constants.endPoint.BACKEND);
			return new Promise((res, rej) => {
				oDataModel.read(sEntity, {
					success: res,
					error: rej
				});
			});
		},

		callPostService: function (sEntity, oPayload) {
			//busy
			const oDataModel = this.getOdataModel(Constants.endPoint.BACKEND);
			return new Promise((res, rej) => {
				oDataModel.create(sEntity, oPayload, {
					success: res,
					error: rej
				});
			});
		},

		postSolicitud: function (oPayload) {
			return this.callPostService(Constants.entity.SOLICITUD, oPayload);
		},

		getEquipos: function () {
			return this.callGetService(Constants.entity.EQUIPO);
		},
		//LOTE
		getLotes: function (filter) {
			return this.callGetService(Constants.entity.PEDIDOS, "CHARG", filter);
		},
		//MATERIAL
		getMateriales: function (filter) {
			return this.callGetServiceToEntity(Constants.entity.MATERIALES);
		},

		getEspecies: function (filter) {
			return this.callGetService(Constants.entity.PEDIDOS, "ESPECIE", filter);
		},
		//CENTRO
		getCentros: function (filter) {
			return this.callGetServiceToEntity(Constants.entity.CENTROS);
		},
		//ALMACEN
		getAlmacenes: function (filter) {
			return this.callGetServiceToEntity(Constants.entity.ALMACENES);
		},
		//LOTE
		getCanales: function (filter) {
			return this.callGetServiceToEntity(Constants.entity.CANALES);
		},

	};
});