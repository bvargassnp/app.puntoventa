sap.ui.define([
"ar/com/puntoventa/utils/Constants"
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
					urlParameters: {"$select": select},
					filters: aFilter,
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

		getLotes: function (filter) {
			return this.callGetService(Constants.entity.PEDIDOS,"CHARG", filter);
		},

		getMateriales: function (filter) {
			return this.callGetService(Constants.entity.PEDIDOS, "MATNR", filter);
		},
		
		getEspecies: function (filter) {
			return this.callGetService(Constants.entity.PEDIDOS, "ESPECIE", filter);
		},
		
		getSolicitudesSalida: function (aFilter) {
			return this.callGetService(Constants.entity.SOLICITUD, aFilter);
		},
		
		getSolicitudesEntrada: function (aFilter) {
			return this.callGetService(Constants.entity.SOLICITUD, aFilter);
		},
		
		getFilesInput: function (nRsnum) {
			const endPoint = `${Constants.entity.SOLICITUD}('${nRsnum}')/NavSolicitudArchivo`;
			return this.callGetService(endPoint);
		}

	};
});