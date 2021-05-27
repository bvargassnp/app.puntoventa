sap.ui.define([
], function () {
	"use strict";
	return {
		endPoint: {
			BACKEND: "/sap/opu/odata/sap/ZOD_PEDIDO_SRV"
		},
		entity: {
			PEDIDOS: "/PEDIDOSet",
			ALMACENES: "/MCODE_ALMACENSet",
			CANALES:"/MCODE_CANALSet",
			CENTROS: "/MCODE_CENTROSet",
			MATERIALES: "/MCODE_MATERIALESSet"
		},
		language: {
			ES: "ES",
			EN: "EN"
		}
	};
});