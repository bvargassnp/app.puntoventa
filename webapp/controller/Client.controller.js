sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"sap/m/MessageBox",
		"Ventas/Vitrinav2/model/cliente"
	],
	function (Controller, JSONModel, History, MessageBox) {
		"use strict";
		return Controller.extend("Ventas.Vitrinav2.controller.Client", {
				onInit: function () {
					/*var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter
					.getRoute("client")
					.attachMatched(this._enableRutInput, this);

					oRouter
					.getRoute("client")
					.attachMatched(this._copyOrIgnoreClientModel, this);

					oRouter
					.getRoute("client")
					.attachMatched(this.clearValueState, this);*/
				},

				onNavBack: function () {
					var oHistory = History.getInstance();
					var sPreviousHash = oHistory.getPreviousHash();

					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					if (sPreviousHash !== undefined) {
						window.history.go(-1);
					} else {
						oRouter.navTo("main", true);
					}
				},

				replaceClienteModel: function () {
					if (this._validarCliente()) {
						const cliente = this.getOwnerComponent().getModel("transientCliente").getData();

						var newClient = vitrinaShopClient().Cliente({
							ID: cliente.rut,
							KUNNR: "",
							NAME1: cliente.name1,
							NAME2: "",
							ZTERM: "NT00",
							STRAS: cliente.street,
							ORT01: "",
							REGIO: "",
							phone: cliente.phone,
							secondId: cliente.secondId
						});

						var model = new JSONModel(newClient);
						model.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
						this.getOwnerComponent().setModel(model, "cliente");
						this.getOwnerComponent().getModel("cliente").refresh(true);
						this.onNavBack();
					}
				},

				_enableRutInput: function () {
					var cliente = this.getOwnerComponent().getModel("cliente")
					if (cliente) {
						cliente = cliente.getData();
					}

					if (cliente && cliente.id !== "N/A") {
						this.byId("rutCliente").setEnabled(false);
					} else {
						this.byId("rutCliente").setEnabled(true);
					}
				},

				_validarCliente: function () {
					const error = sap.ui.core.ValueState.Error;
					const none = sap.ui.core.ValueState.None;
					const telefono = this.byId("telefono");
					var isValid = true;
					if (telefono.getValue() === "" ||
						telefono.getValue().length === 0) {
						telefono.setValueState(error);
						telefono.setValueStateText(`Ingrese un telefono`);
						isValid = false;
					} else {
						telefono.setValueState(none);
						telefono.setValueStateText(``);
					}

					const direccion = this.byId("direccion");
					if (direccion.getValue() === "" ||
						direccion.getValue().length === 0) {
						direccion.setValueState(error);
						direccion.setValueStateText(`Ingrese una direccion`);
						isValid = false;
					} else {
						direccion.setValueState(none);
						direccion.setValueStateText(``);
					}

					const nombre = this.byId("nombre");
					if (nombre.getValue() === "" ||
						nombre.getValue().length === 0) {
						nombre.setValueState(error);
						nombre.setValueStateText(`Ingrese un nombre`);
						isValid = false;
					} else {
						nombre.setValueState(none);
						nombre.setValueStateText(``);
					}

					const rut = this.byId("rutCliente");
					if (rut.getValue() === "" ||
						rut.getValue().length === 0) {
						rut.setValueState(error);
						rut.setValueStateText(`Ingrese un indentificador fiscal`);
						isValid = false;
					} else {
						rut.setValueState(none);
						rut.setValueStateText(``);
					}

					return isValid;
				},

				_copyOrIgnoreClientModel: function () {
					var cliente = this.getOwnerComponent().getModel("cliente");
					if (cliente && cliente.getData().id !== "N/A") {
						cliente = cliente.getData();
						var model = new JSONModel(cliente);
						model.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
						this.getOwnerComponent().setModel(model, "transientCliente");
						this.getOwnerComponent().getModel("transientCliente").refresh(true);
					} else {
						var model = new JSONModel({});
						model.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
						this.getOwnerComponent().setModel(model, "transientCliente");
						this.getOwnerComponent().getModel("transientCliente").refresh(true);
					}
				},

				clearValueState: function () {
					const none = sap.ui.core.ValueState.None;

					const telefono = this.byId("telefono");
					telefono.setValueState(none);
					telefono.setValueStateText(``);

					const direccion = this.byId("direccion");
					direccion.setValueState(none);
					direccion.setValueStateText(``);

					const nombre = this.byId("nombre");
					nombre.setValueState(none);
					nombre.setValueStateText(``);

					const rut = this.byId("rutCliente");
					rut.setValueState(none);
					rut.setValueStateText(``);
				},

				onAfterRendering: function () {

				}
			}
		);
	}
);