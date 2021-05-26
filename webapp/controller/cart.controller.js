sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"sap/m/MessageBox",
		"./../model/cart",
		"./../model/cliente"
	],
	function (
		Controller,
		JSONModel,
		History,
		MessageBox
	) {
		"use strict";
		return Controller.extend(
			"Ventas.Vitrinav2.controller.cart", {
				onInit: function () {
					this._instantiateClient();
					var rut = this.byId("rutCliente");
					rut.onsapenter = (event) => {
						this.fetchClient();
					}

					/*var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter
						.getRoute("cart")
						.attachMatched(this._refreshClientModel, this);

					oRouter
						.getRoute("cart")
						.attachMatched(this._refreshCartModel, this);*/
				},
				
				onNavBack: function() {
					var oHistory = History.getInstance();
					var sPreviousHash = oHistory.getPreviousHash();

					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					if (sPreviousHash !== undefined) {
						window.history.go(-1);
					} else {

						oRouter.navTo("main", true);
					}
				},
				
				quantityChange: function(event) {
					this._clearControlValueState(event.getSource());
					var item = event.getSource().getBindingContext("cart").getObject();

					try {
						var quantity = event.getSource().getValue();
						item.changeQuantity(quantity);
						item.calculateTotal();
					} catch (e) {
						event.getSource().setValueState(sap.ui.core.ValueState.Error);
						event.getSource().setValueStateText(e.message);
						item.calculateTotal(0);
					}
					const cart = this.getOwnerComponent().getModel("cart");

					this._refreshCartModel();
				},
				
				onDiscountTextChange: function(event) {
					this._clearControlValueState(event.getSource());

					try {
						var cartItem = event.getSource().getBindingContext("cart").getObject();
						var number = event.getSource().getValue();
						const hbox = event.getSource().getParent();
						const button = hbox.getItems()[0];
						const operator = this._getOperator(button.getIcon());

						this._discountChange(cartItem, number, operator);
					} catch (e) {
						event.getSource().setValueState(sap.ui.core.ValueState.Error);
						const errorMessage = this.getOwnerComponent().getModel("i18n").getProperty("cartInvalidDiscount");
						event.getSource().setValueStateText(errorMessage);
					}

					this._refreshCartModel();
				},
				
				onDiscountOperatorChange: function(event) {
					const button = event.getSource();
					this._changeButtonIcon(button);

					try {
						var cartItem = event.getSource().getBindingContext("cart").getObject();
						const hbox = event.getSource().getParent();
						const input = hbox.getItems()[1];
						const number = input.getValue();
						const operator = this._getOperator(button.getIcon())

						this._discountChange(cartItem, number, operator);
					} catch (e) {
						//bugger all
					}

					this._refreshCartModel();
				},
				
				_getOperator: function(icon) {
					const possibleValues = [{
						icon: `sap-icon://add`,
						operator: "+"
					}, {
						icon: `sap-icon://less`,
						operator: "-"
					}];

					return possibleValues.filter((item) => item.icon === icon).map((item) => item.operator)[0];
				},
				
				_changeButtonIcon: function(button) {
					const add = `sap-icon://add`;
					const subtract = `sap-icon://less`;
					var newIcon;
					if (button.getIcon() === add) {
						newIcon = subtract;
					} else {
						newIcon = add;
					}
					button.setIcon(newIcon);
				},
				
				_discountChange: function(item, number, operator) {
					const discount = Number(number);

					item.changeDiscount(discount);
					item.changeDiscountOperator(operator);
					item.calculateTotal();
					item.changeDisplayPrice();
				},
				
				_refreshCartModel: function() {
					const cart = this.getOwnerComponent().getModel("cart");
					if (!cart)
						return;

					this._calculateEverything(cart);

					cart.refresh(true);
				},
				
				removeFromCart: function(event) {
					var cart = this.getOwnerComponent().getModel("cart");
					var modelUsedByItem = "cart";
					var item = event.getSource().getBindingContext(modelUsedByItem).getObject();
					cart.getData().removeItem(item);
					this._calculateEverything(cart);

					this.getOwnerComponent().getModel("cart").refresh(true);
				},
				
				_calculateEverything: function(cart) {
					cart.getData().calculateTax();
					cart.getData().calculateNetTotal();
					cart.getData().calculateBoxCount();
					cart.getData().calculatePerceptionTax();
					cart.getData().calculateTotal();
					cart.refresh(true);
				},
				
				async fetchClient(fiscalIdentifier) {
					var rut = this.byId("rutCliente");
					rut.setEnabled(false);
					this._clearControlValueState(rut);

					var rutButton = this.byId("searchClient");
					rutButton.setEnabled(false);
					try {
						const desiredId = typeof fiscalIdentifier === "string" ? fiscalIdentifier : rut.getValue();
						rut.setValue(desiredId);

						var url = `/sap/opu/odata/sap/zod_pedido_srv/CLIENTESet?$filter=ID eq '${desiredId.trim()}'`;
						var response = await fetch(
							url, {
								method: 'GET',
								headers: {
									"x-csrf-token": "fetch",
									"Accept": "application/json",
									"Content-Type": "application/json; charset=utf-8"
								}
							}
						);
						var cliente = await response.json();
						var mutateClientButton = this.byId("mutateClient");
						var model;
						if (cliente.d.results.length > 0) {
							cliente.d.results[0].ID = rut.getValue();
							this._instantiateClient(cliente.d.results[0]);
							mutateClientButton.setEnabled(false);
						} else {
							rut.setValueState(sap.ui.core.ValueState.Error);
							const errorMessage = this.getOwnerComponent().getModel("i18n").getProperty("cartClientNotFound");
							rut.setValueStateText(errorMessage);
							this._instantiateClient();
							mutateClientButton.setEnabled(true);
						}
					} catch (e) {
						this._noConnection();
					}

					rut.setEnabled(true);
					rutButton.setEnabled(true);
				},
				
				_instantiateClient: function(cliente = "empty") {
					var newClient;
					if (cliente === "empty") {
						var newClient = vitrinaShopClient().Cliente({
							ID: "",
							KUNNR: "N/A",
							NAME1: "N/A",
							NAME2: "N/A",
							ZTERM: "N/A",
							STRAS: "N/A",
							ORT01: "N/A",
							REGIO: "N/A"
						});
					} else {
						newClient = vitrinaShopClient().Cliente(cliente);
					}

					var model = new JSONModel(newClient);
					model.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
					this.getOwnerComponent().setModel(model, "cliente");
					this.getOwnerComponent().getModel("cliente").refresh(true);
				},
				
				async _fetchXCSRFToken() {
					try {
						var url = `/sap/opu/odata/sap/zod_pedido_srv/CLIENTESet?$filter=ID eq 1`;
						var response = await fetch(
							url, {
								method: 'GET',
								headers: {
									"x-csrf-token": "fetch",
									"Accept": "application/json",
									"Content-Type": "application/json; charset=utf-8"
								}
							}
						);

						const token = response.headers.get("X-CSRF-Token");

						return token;
					} catch (e) {
						this._noConnection();
						//mensaje de error conectividad!
					}
				},
				
				validarEnvio: function() {
					var isValid = true;
					var cart = this.getOwnerComponent().getModel("cart");

					if (cart) {
						cart = cart.getData();
						if (cart.items.length === 0) {
							isValid = false;
							return isValid;
						}
						cart.items.forEach(
							(item) => {
								const validator = item.validate();

								if (!validator.isValidQuantity ||
									!validator.isValidDiscount) {
									this._setInvalidInputOnTable(item, validator);
									isValid = false;
								}
							}
						)
					} else {
						isValid = false;
					}

					const client = this.getOwnerComponent().getModel("cliente").getData();

					if (!client.validate()) {
						this._setInvalidInputOnClient();
						isValid = false;
					}

					if (!cart.isValidInvoiceType()) {
						this._setInvalidInvoice();
						isValid = false;
					}
					if (!cart.isValidDeliveryType()) {
						this._setInvalidDelivery();
						isValid = false;
					}

					const invoiceTypeRequiresSecondFiscalIdentifier = "CPD";
					const selectedInvoiceType = this.byId("invoiceType");
					const isEsporadico = client.id === "";
					if (selectedInvoiceType.getSelectedItem().getText().indexOf(invoiceTypeRequiresSecondFiscalIdentifier) > 0 &&
						client.secondId === "" &&
						isEsporadico) {
						MessageBox.error(
							this.getOwnerComponent().getModel("i18n").getProperty("missingSecondFiscalIdentifier"), {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: this.getOwnerComponent().getModel("i18n").getProperty("missingSecondFiscalIdentifierTitle")
							}
						);
						isValid = false;
					}

					return isValid;
				},
				
				_setInvalidInputOnTable: function(item, validator) {
					var table = this.byId("tablaProductos");
					table.getItems().forEach(
						(row) => {
							const rowItem = row.getBindingContext("cart").getObject();
							if (rowItem.equals(item)) {
								row.getCells().forEach(
									(column) => {
										if (column instanceof sap.m.Input) {
											var isQuantityInput = column.getName() === "quantity";
											if (isQuantityInput && !validator.isValidQuantity) {
												column.setValueState(sap.ui.core.ValueState.Error);
												const errorMessage = this.getOwnerComponent().getModel("i18n").getProperty("cartInvalidQuantity");
												column.setValueStateText(errorMessage);
											}

											var isDiscountInput = column.getName() === "discount";
											if (isDiscountInput && !validator.isValidDiscount) {
												column.setValueState(sap.ui.core.ValueState.Error);
												const errorMessage2 = this.getOwnerComponent().getModel("i18n").getProperty("cartInvalidDiscount");
												column.setValueStateText(errorMessage2);
											}
										}
									}
								);
							}
						}
					);
				},
				
				_setInvalidInputOnClient: function() {
					const clientInput = this.byId("rutCliente");

					clientInput.setValueState(sap.ui.core.ValueState.Error);
					const errorMessage = this.getOwnerComponent().getModel("i18n").getProperty("cartNoClientAssigned");
					clientInput.setValueStateText(errorMessage);
				},
				
				_setInvalidInvoice: function() {
					const invoiceInput = this.byId("invoiceType");

					invoiceInput.setValueState(sap.ui.core.ValueState.Error);
					const errorMessage = this.getOwnerComponent().getModel("i18n").getProperty("cartNoInvoiceAssigned");
					invoiceInput.setValueStateText(errorMessage);
				},
				
				_setInvalidDelivery: function() {
					const deliveryInput = this.byId("deliveryType");

					deliveryInput.setValueState(sap.ui.core.ValueState.Error);
					const errorMessage = this.getOwnerComponent().getModel("i18n").getProperty("cartNoDeliveryAssigned");
					deliveryInput.setValueStateText(errorMessage);
				},
				
				promptSendConfirmation: function() {
					if (!this.validarEnvio()) {
						return;
					}

					const saveOrderSaveOption = this.getOwnerComponent().getModel("i18n").getProperty("saveOrderSaveOption");
					const saveOrderEraseOption = this.getOwnerComponent().getModel("i18n").getProperty("saveOrderEraseOption");
					MessageBox.success(
						this.getOwnerComponent().getModel("i18n").getProperty("promptSendMessage"), {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: this.getOwnerComponent().getModel("i18n").getProperty("promptSendTitle"),
							actions: [saveOrderSaveOption, saveOrderEraseOption, sap.m.MessageBox.Action.CANCEL],
							emphasizedAction: saveOrderSaveOption,
							onClose: (event) => {
								if (event === saveOrderSaveOption)
									this.postPurchaseDetails();

								if (event === saveOrderEraseOption)
									this.promptConfirmResetByUser();
							}
						}
					);
				},
				
				async postPurchaseDetails() {
					if (this.getOwnerComponent().getModel("cart").getData().sendingToServer) {
						return;
					}

					if (!this.validarEnvio()) {
						return;
					}

					await this._promptOutsideToleranceWarning(this._findItemsOutsideTolerance());

					this.getView().setBusy(true);
					this.getOwnerComponent().getModel("cart").getData().sendingToServer = true;

					try {
						const token = await this._fetchXCSRFToken();
						var url = `/sap/opu/odata/sap/zod_pedido_srv/HEADERSet`;
						var response = await fetch(
							url, {
								method: 'POST',
								headers: {
									"x-csrf-token": token,
									"Accept": "application/json",
									"Content-Type": "application/json; charset=utf-8"
								},
								body: JSON.stringify(this._conformToPurchaseDetailsModel())
							}
						);

						var {
							d: result
						} = await response.json();
						const error = "E";
						const success = "CREADO";
						const rejected = "RECHAZADO";
						var errorMessage = "";
						var successMessage = this.getOwnerComponent().getModel("i18n").getProperty("cartOrderSucess") + " ";
						result.NAVRESULTADO.results.forEach(
							(item) => {
								if (item.MSG1 === error) {
									errorMessage += errorMessage === "" ? item.MSG2 : `\n${item.MSG2}`;
								} else if (item.MSG1 === success) {
									successMessage += item.MSG2;
								} else if (item.MSG1 === rejected) {
									errorMessage += errorMessage === "" ? item.MSG2 : `\n${item.MSG2}`;
								}

							}
						)

						if (errorMessage === "") {
							MessageBox.success(
								successMessage, {
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: this.getOwnerComponent().getModel("i18n").getProperty("cartOrderSuccessTitle"),
									onClose: (event) => {
										this.resetAfterSuccess()
									}
								}
							);
						} else {
							MessageBox.error(
								errorMessage, {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: this.getOwnerComponent().getModel("i18n").getProperty("cartOrderFailureTitle")
								}
							);
						}
					} catch (e) {
						this._noConnection();
					}

					this.getView().setBusy(false);
					this.getOwnerComponent().getModel("cart").getData().sendingToServer = false;
				},
				
				_conformToPurchaseDetailsModel: function() {
					const ITEMSet = [];

					const cart = this.getOwnerComponent().getModel("cart").getData();
					cart.items.forEach(
						(item, index) => {
							var discount = 0;
							if (item.discount !== 0) {
								discount = item.discount;
								if (item.discountOperator === "-") {
									discount = item.discount * -1;
								} else {
									discount = item.discount;
								}
							}

							const conformingItem = {
								ICAMPO1: (index + 1).toString().trim(),
								ICAMPO2: item.matnr.toString().trim(),
								ICAMPO3: item.quantity.toString().trim(),
								ICAMPO4: item.werks.toString().trim(),
								ICAMPO5: item.netPrice.toString().trim(),
								ICAMPO6: item.currency.toString().trim(),
								ICAMPO7: item.charg.toString().trim(),
								ICAMPO8: discount.toString().trim(),
								ICAMPO9: item.lgort.toString().trim()
							};
							ITEMSet.push(conformingItem);
						}
					);

					const client = this.getOwnerComponent().getModel("cliente").getData();

					var payload;
					const isEsporadico = client.id === "";
					if (!isEsporadico) {
						payload = {
							d: {
								CAMPO1: client.id,
								CAMPO6: cart.invoiceType,
								CAMPO7: cart.deliveryType,
								ITEMSet,
								NAVRESULTADO: []
							}
						}
					} else {
						payload = {
							d: {
								CAMPO1: client.id,
								CAMPO2: client.rut,
								CAMPO3: client.phone,
								CAMPO4: client.street,
								CAMPO5: client.name1,
								CAMPO6: cart.invoiceType,
								CAMPO7: cart.deliveryType,
								CAMPO8: client.secondId,
								ITEMSet,
								NAVRESULTADO: []
							}
						}
					}

					return payload;
				},
				
				navToClient: function() {
					var router = sap.ui.core.UIComponent.getRouterFor(this);
					router.navTo("Client");
				},
				
				_noConnection: function() {
					const errorMessage = this.getOwnerComponent().getModel("i18n").getProperty("noConnectivity");
					const title = this.getOwnerComponent().getModel("i18n").getProperty("noConnectivityTitle");
					MessageBox.error(
						errorMessage, {
							icon: sap.m.MessageBox.Icon.ERROR,
							title
						}
					);
				},
				
				_refreshClientModel: function() {
					this.getOwnerComponent().getModel("cliente").refresh(true);
					const inputCliente = this.byId("rutCliente");
					this._clearControlValueState(inputCliente);
				},
				
				resetAfterSuccess: function() {
					this.getOwnerComponent().getModel("cart").getData().items = [],
						this.getOwnerComponent().getModel("cart").getData().total = 0;
					this.getOwnerComponent().getModel("cart").getData().tax = 0;
					this.getOwnerComponent().getModel("cart").getData().netTotal = 0;
					this._instantiateClient();
					this.byId("invoiceType").setSelectedKey("default");
					this.byId("deliveryType").setSelectedKey("default");
					this.byId("rutCliente").setValue("");
					this.onNavBack();
				},
				
				promptConfirmResetByUser: function() {
					MessageBox.success(
						this.getOwnerComponent().getModel("i18n").getProperty("promptEraseOrderMessage"), {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: this.getOwnerComponent().getModel("i18n").getProperty("promptEraseOrderTitle"),
							actions: [sap.m.MessageBox.Action.DELETE, sap.m.MessageBox.Action.CANCEL],
							emphasizedAction: sap.m.MessageBox.Action.CANCEL,
							onClose: (event) => {
								if (event === sap.m.MessageBox.Action.DELETE)
									this.resetAfterSuccess();
							}
						}
					);
				},
				
				_findItemsOutsideTolerance: function() {
					var warnAboutThese = [];
					const cart = this.getOwnerComponent().getModel("cart").getData();
					cart.items.forEach(
						(item) => {
							const quantity = item.quantity;
							const discount = item.discount < 0 ? item.discount * -1 : item.discount;

							const toleranceInfo = this._isWithinTolerance(quantity, discount);
							if (!toleranceInfo.isAcceptable) {
								item.tolerance = toleranceInfo.tolerance;
								warnAboutThese.push(item);
							}
						}
					);

					return warnAboutThese;
				},
				
				_isWithinTolerance: function(price, discount) {
					//This depends on tolerance array being arranged in a desc fashion.
					//This arrangement is being handled when it is first instanced
					const tolerance = this.getOwnerComponent().getModel("tolerance").getData();
					var applicableDiscount = 0;
					tolerance.forEach(
						tol => {
							if (price <= tol.priceBracket)
								applicableDiscount = tol.maximumDiscount;
						}
					)

					var toleranceInfo = {
						isAcceptable: discount <= applicableDiscount,
						tolerance: applicableDiscount
					}

					return toleranceInfo;
				},
				
				_promptOutsideToleranceWarning: function(warnAboutThese) {
					const title = this.getOwnerComponent().getModel("i18n").getProperty("toleranceTitle");
					const icon = sap.m.MessageBox.Icon.WARNING;

					const maxDiscountApplicable = this.getOwnerComponent().getModel("i18n").getProperty("maxDiscountApplicable");
					var errorMessage = this.getOwnerComponent().getModel("i18n").getProperty("toleranceMessage");
					warnAboutThese.forEach(
						item => {
							errorMessage += `\n${item.description} ${item.marca} 
							${maxDiscountApplicable}: ${item.tolerance}\n`
						}
					)

					const accept = this.getOwnerComponent().getModel("i18n").getProperty("acceptButton");

					const promesa = function (resolve, reject) {
						if (warnAboutThese.length === 0) {
							resolve(true);
						} else {
							MessageBox.error(
								errorMessage, {
									icon,
									title,
									actions: [accept, MessageBox.Action.CANCEL],
									emphasizedAction: MessageBox.Action.CANCEL,
									onClose(event) {
										if (event === accept) {
											resolve(true);
										} else {
											reject("Cancelled by user");
										}
									}
								}
							);
						}
					}

					return new Promise(promesa);
				},
				
				async fetchTolerance(contador = 0) {
					try {
						const url = `/sap/opu/odata/sap/zod_pedido_srv/TOLERANCIASet`

						var response = await fetch(
							url, {
								method: 'GET',
								headers: {
									"x-csrf-token": "fetch",
									"Accept": "application/json",
									"Content-Type": "application/json; charset=utf-8"
								}
							}
						);

						var tolerance = await response.json();
						var betterTolerance = [];
						tolerance.d.results.forEach(
							(tol) => {
								const item = {
									maximumDiscount: Number(tol.KBETR.trim()),
									priceBracket: Number(tol.KSTBW.trim())
								}

								betterTolerance.push(item);
							}
						);

						betterTolerance.sort(
							function (a, b) {
								return b.priceBracket - a.priceBracket;
							}
						)

						var model = new JSONModel(betterTolerance);
						this.getOwnerComponent().setModel(model, "tolerance");
					} catch (e) {
						if (contador != 3) {
							this.fetchTolerance(contador++);
						} else {
							this._noConnection();
						}
					}
				},
				
				async fetchInvoiceType(contador = 0) {
					try {
						const url = `/sap/opu/odata/sap/zod_pedido_srv/TIPO_FACTURASet`

						var response = await fetch(
							url, {
								method: 'GET',
								headers: {
									"x-csrf-token": "fetch",
									"Accept": "application/json",
									"Content-Type": "application/json; charset=utf-8"
								}
							}
						);

						var invoiceTypes = await response.json();
						var betterInvoiceType = [{
							type: "default",
							description: this.getOwnerComponent().getModel("i18n").getProperty("defaultInvoice"),
							perceptionTax: 0
						}];
						invoiceTypes.d.results.forEach(
							(inv) => {
								const item = {
									type: inv.KONDA.trim(),
									description: inv.VTEXT.trim(),
									perceptionTax: Number(inv.KBETR.trim())
								}

								betterInvoiceType.push(item);
							}
						);

						var model = new JSONModel(betterInvoiceType);
						this.getOwnerComponent().setModel(model, "invoiceType");
					} catch (e) {
						if (contador != 3) {
							this.fetchTolerance(contador++);
						} else {
							this._noConnection();
						}
					}
				},
				
				async fetchDeliveryOptions(contador = 0) {
					try {
						const url = `/sap/opu/odata/sap/zod_pedido_srv/DESPACHOSet`

						var response = await fetch(
							url, {
								method: 'GET',
								headers: {
									"x-csrf-token": "fetch",
									"Accept": "application/json",
									"Content-Type": "application/json; charset=utf-8"
								}
							}
						);

						var delivery = await response.json();
						var betterDeliveryChoice = [{
							type: "default",
							description: this.getOwnerComponent().getModel("i18n").getProperty("defaultDelivery")
						}];
						delivery.d.results.forEach(
							(del) => {
								const item = {
									type: del.VSBED.trim(),
									description: del.VTEXT.trim()
								}

								betterDeliveryChoice.push(item);
							}
						);

						var model = new JSONModel(betterDeliveryChoice);
						this.getOwnerComponent().setModel(model, "deliveryOptions");
					} catch (e) {
						if (contador != 3) {
							this.fetchTolerance(contador++);
						} else {
							this._noConnection();
						}
					}
				},
				
				onInvoiceChange: function(event) {
					this._clearControlValueState(event.getSource());
					var cart = this.getOwnerComponent().getModel("cart");
					var invoiceType = event.getSource().getSelectedItem().getBindingContext("invoiceType").getObject()
					cart.getData().changeInvoiceType(invoiceType.type);
					cart.getData().changePerceptionTax(invoiceType.perceptionTax)
					this._calculateEverything(cart);
				},
				
				onDeliveryChange: function(event) {
					this._clearControlValueState(event.getSource());
					var cart = this.getOwnerComponent().getModel("cart");
					var type = event.getSource().getSelectedKey();
					cart.getData().changeDelivertyType(type);
					this._calculateEverything(cart);
				},
				
				_clearControlValueState: function(control) {
					control.setValueState(sap.ui.core.ValueState.None);
					control.setValueStateText("");
				},
				
				async clientSelectDialog() {
					const dialogo = (resolve, reject) => {
						const select = new sap.m.TableSelectDialog(
							"selectDialog", {
								cancel() {
									this.destroy();
									reject("cancelado por el usuario")
								},
								confirm: async(e) => {
									//This hack was done because I was unable to understand how to bind stuff manually
									//pls help if you do.

									const fiscalIdentifier = e.getParameters().selectedItem.getCells()[0].getText();
									const table = e.getSource();
									await this.fetchClient(fiscalIdentifier)

									table.destroy();
									resolve({
										yey: true
									});
								},
								search: async(e) => {
									const name = e.getParameters().value.trim();
									const table = e.getSource(); // after the await this would be lost, so here it is.
									if (name) {
										await this.fetchClientList(name);
										this.fillClientListTable(table)
									}
								}
							}
						);
						this._clientSelectCreateColumns(select);
						select.open();
					}

					const promesa = new Promise(dialogo);

					await promesa;

					console.log("todo ok!");
				},
				
				_clientSelectCreateColumns: function(table) {
					if (table.getColumns().length > 0)
						table.destroyColumns();

					const fiscalIdentifier = new sap.m.Column({});
					const fid = this.getOwnerComponent().getModel("i18n").getProperty("cartFiscalIdentifier");
					fiscalIdentifier.setHeader(new sap.m.Text({
						text: fid
					}));
					table.addColumn(fiscalIdentifier);

					const name = new sap.m.Column({});
					const n = this.getOwnerComponent().getModel("i18n").getProperty("cartName");
					name.setHeader(new sap.m.Text({
						text: n
					}));
					table.addColumn(name);
				},
				
				async fetchClientList(nombre) {
					try {
						const pagContainer = this.getOwnerComponent().getModel("clientePagination");
						var url =
							`/sap/opu/odata/sap/zod_pedido_srv/CLIENTESet?$inlinecount=allpages&$top=${pagContainer.getData().pagination.$top}&$skip=${pagContainer.getData().pagination.$skip}&$filter=substringof('${nombre}', NAME1)`;
						var response = await fetch(
							url, {
								method: 'GET',
								headers: {
									"x-csrf-token": "fetch",
									"Accept": "application/json",
									"Content-Type": "application/json; charset=utf-8"
								}
							}
						);
						var {
							d: clients
						} = await response.json();
						this.getOwnerComponent().setModel(new JSONModel(clients), "clientList");
					} catch (e) {
						this._noConnection();
					}
				},
				
				fillClientListTable: function(table) {
					if (table.getItems().length > 0)
						table.destroyItems();

					const list = this.getOwnerComponent().getModel("clientList").getData();

					list.results.forEach(
						(client) => {
							const filas = new sap.m.ColumnListItem();
							filas.insertCell(new sap.m.Text({
								text: client.ID
							}), 0);
							filas.insertCell(new sap.m.Text({
								text: client.NAME1
							}), 1);
							filas.insertCell(new sap.m.Text({
								text: client.STRAS
							}), 2);
							table.addItem(filas);
						}
					);

				},
				
				initializeClientListPagination: function() {
					const pagination = {
						pagination: {
							$top: 100,
							$skip: 0,
							currentPage: 0,
							availableData: 0,
							changing: false
						}
					};

					var model = new JSONModel(pagination);
					this.getOwnerComponent().setModel(model, "clientePagination");
				},
				
				onAfterRendering: function() {
					var cart = this.getOwnerComponent().getModel("cart");
					this.fetchInvoiceType();
					this.fetchTolerance();
					this.fetchDeliveryOptions();
					this.initializeClientListPagination();
				}
			}
		);
	}
);