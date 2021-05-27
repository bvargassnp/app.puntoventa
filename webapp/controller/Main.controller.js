sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	'sap/ui/model/Sorter',
	'sap/m/TablePersoController',
	"sap/ui/model/FilterOperator",
	"ar/com/puntoventa/model/cart",
	"ar/com/puntoventa/Services/Services",
	"ar/com/puntoventa/model/DemoPersoService",
	"ar/com/puntoventa/utils/ExcelDownloaderHelper",
	"ar/com/puntoventa/model/columns",
	"ar/com/puntoventa/model/filterModel",
	"ar/com/puntoventa/model/filtrosLote",
	"ar/com/puntoventa/model/filtrosMaterial",
	"ar/com/puntoventa/model/filtrosEspecie"
], function (Controller, JSONModel, MessageBox, Filter, Sorter, TablePersoController, FilterOperator, cart, Services, DemoPersoService,
	ExcelDownloadHelper, columns, filterModel, filtrosLote, filtrosMaterial, filtrosEspecie) {
	"use strict";
	return Controller.extend("ar.com.puntoventa.controller.Main", {

		onInit: function () {
			this.callProductosService();
			filterModel.initializeModel();
			this.getMatchcodeLotes();
			this.getNumeroMaterial();
			this.getEspecies();
			columns.initializeModel();
			this._oMultiInputLote = this.getView().byId("loteInput");
			this._oTPC = new TablePersoController({
				table: this.byId("tablaProductos"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				componentName: "demoApp",
				persoService: DemoPersoService
			}).activate();
			this.mGroupFunctions = {
				WERKS: function (oContext) {
					var name = oContext.getProperty("WERKS");
					return {
						key: name,
						text: name
					};
				},
				LGORT: function (oContext) {
					var name = oContext.getProperty("LGORT");
					return {
						key: name,
						text: name
					};
				},
				CHARG: function (oContext) {
					var name = oContext.getProperty("CHARG");
					return {
						key: name,
						text: name
					};
				},
				CATEGORIA: function (oContext) {
					var name = oContext.getProperty("CATEGORIA");
					return {
						key: name,
						text: name
					};
				}
			};
			//this._oMultiInput.setTokens(this._getDefaultTokens());

			//this.initializePagination();
			/*this.byId("myScrollContainer").attachBrowserEvent("scroll", (event) => {
				this.onGrowTable(event)
			});

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter
				.getRoute("main")
				.attachMatched(this.reset, this);

			oRouter
				.getRoute("main")
				.attachMatched(this.fetchProductos, this);*/
		},

		onDataExport: function (oEvent) {
			var oTableCust = this.getView().byId("tablaProductos");
			var labelsCust = this.getView().byId("tablaProductos").getColumns();
			this.onExportTable(oTableCust, labelsCust);
		},

		onExportTable: function (oTable, labels) {
			var aLabels = [];
			var aPropertys = [];
			for (var l = 0; labels.length > l; l++) {
				aLabels.push(labels[l].getHeader().getText());
				if (oTable.getItems().length > 0) {
					if (oTable.getItems()[0].getCells()[l].getBinding("title") !== undefined) {
						aPropertys.push(oTable.getItems()[0].getCells()[l].getBinding("title").getPath());
					} else if (oTable.getItems()[0].getCells()[l].getBinding("text") !== undefined) {
						aPropertys.push(oTable.getItems()[0].getCells()[l].getBinding("text").getPath());
					}
				}
			}

			var oEventModel = this.getView().getModel("productos").getData();
			ExcelDownloadHelper.onExport(oEventModel, aLabels, aPropertys, oTable);
		},

		onSearchMaterial: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				aFilters.push(new Filter([
					new sap.ui.model.Filter("MAKTX", FilterOperator.Contains, sQuery)
				], false));
			}

			// update list binding
			var oList = this.byId("tablaProductos");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

		handleViewSettingsDialogButtonPressed: function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("ar.com.puntoventa.view.dialogs.TableDialog", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		handleConfirm: function (oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("tablaProductos");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");

			// apply sorter to binding
			// (grouping comes before sorting)
			var sPath;
			var bDescending;
			var vGroup;
			var aSorters = [];
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aSorters.push(new Sorter(sPath, bDescending, vGroup));
			}
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);

			// apply filters to binding
			var aFilters = [];
			jQuery.each(mParams.filterItems, function (i, oItem) {
				var aSplit = oItem.getKey().split("___");
				var sPath = aSplit[0];
				var sOperator = aSplit[1];
				var sValue1 = aSplit[2];
				var oFilter = new Filter(sPath, sOperator, sValue1);
				aFilters.push(oFilter);
			});
			oBinding.filter(aFilters);
			if (mParams.groupItem !== undefined) {
				// update filter bar
				this.getView().byId("vsdFilterBar").setVisible(true);
				this.getView().byId("vsdFilterLabel").setText("Agrupado por: " + mParams.groupItem.mProperties.text);
			} else {
				this.getView().byId("vsdFilterBar").setVisible(false);
			}
		},

		//TABLE PERSONALIZATION
		onExit: function () {
			this._oTPC.destroy();
		},

		onPersoButtonPressed: function (oEvent) {
			this._oTPC.openDialog();
		},

		onTablePersoRefresh: function () {
			DemoPersoService.resetPersData().done(
				function () {
					this._oTPC.refresh();
				}.bind(this)
			);
		},

		onTableGrouping: function (oEvent) {
			this._oTPC.setHasGrouping(oEvent.getSource().getSelected());
		},

		getMatchcodeLotes: async function () {
			var filter = [
				new Filter("CHARG", "Contains", "")
			];
			let oModel = filtrosLote.initializeModel();
			const {
				results
			} = await Services.getLotes(filter);

			oModel.setProperty("/lotes", results);
		},

		getNumeroMaterial: async function () {
			var filter = [
				new Filter("MATNR", "Contains", "")
			];
			let oModel = filtrosMaterial.initializeModel();
			const {
				results
			} = await Services.getMateriales(filter);
			oModel.setProperty("/materiales", results);
		},

		onHandleMaterial: function () {
			if (!this._oMaterialDialog) {
				this._oMaterialDialog = sap.ui.xmlfragment("ar.com.puntoventa.view.dialogs.valueHelpMaterial", this);
				this.getView().addDependent(this._oMaterialDialog);
			}
			this._oMaterialDialog.open();
		},

		onMaterialDialogSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value"),
				oFilter = new Filter("MATNR", FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		onMaterialDialogClose: function (oEvent) {
			var selected,
				oSelectedItem = oEvent.getParameter("selectedItem");

			oEvent.getSource().getBinding("items").filter([]);

			if (!oSelectedItem) {
				//this._oCentroDialog.destroy();
				return;
			}
			selected = oSelectedItem.getTitle();
			filterModel.getModel().setProperty("/material", selected);
		},
		
		getEspecies: async function () {
			var filter = [
				new Filter("ESPECIE", "Contains", "")
			];
			let oModel = filtrosEspecie.initializeModel();
			const {
				results
			} = await Services.getEspecies(filter);
			oModel.setProperty("/especies", results);
		},
		
		onHandleEspecie: function () {
			if (!this._oEspecieDialog) {
				this._oEspecieDialog = sap.ui.xmlfragment("ar.com.puntoventa.view.dialogs.valueHelpEspecie", this);
				this.getView().addDependent(this._oEspecieDialog);
			}
			this._oEspecieDialog.open();
		},
		
		onEspecieDialogSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value"),
				oFilter = new Filter("ESPECIE", FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		onEspecieDialogClose: function (oEvent) {
			var selected,
				oSelectedItem = oEvent.getParameter("selectedItem");

			oEvent.getSource().getBinding("items").filter([]);

			if (!oSelectedItem) {
				//this._oCentroDialog.destroy();
				return;
			}
			selected = oSelectedItem.getTitle();
			filterModel.getModel().setProperty("/especie", selected);
		},

		onValueHelpRequested: function () {
			var aCols = columns.getModel().getData().cols;

			this._oValueHelpDialogLote = sap.ui.xmlfragment("ar.com.puntoventa.view.dialogs.valueHelpLote", this);
			this.getView().addDependent(this._oValueHelpDialogLote);

			this._oValueHelpDialogLote.getTableAsync().then(function (oTable) {
				oTable.setModel(filtrosLote.getModel());
				oTable.setModel(columns.getModel(), "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/lotes");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/lotes", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({
									text: "{" + column.template + "}"
								});
							})
						});
					});
				}
				this._oValueHelpDialogLote.update();
			}.bind(this));

			this._oValueHelpDialogLote.setTokens(this._oMultiInputLote.getTokens());
			this._oValueHelpDialogLote.open();
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInputLote.setTokens(aTokens);
			this._oValueHelpDialogLote.close();
		},

		onValueHelpCancelPress: function () {
			this._oValueHelpDialogLote.close();
		},

		/*onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
		},*/

		callProductosService: async function () {
			try {
				var oTable = this.getView().byId("tablaProductos");
				oTable.setBusy(true);
				const aData = await this.readProductosService();
				if (aData.results.length > 0) {
					oTable.setBusy(false);
					this.getOwnerComponent().getModel("productos").setProperty("/items", aData.results);
					//this._dialog.close();
				}
			} catch (err) {
				oTable.setBusy(false);
				if (err.responseText !== undefined) {
					let error = JSON.parse(err.responseText).error.message.value;
					sap.m.MessageToast.show(error);
				} else {
					sap.m.MessageToast.show("Error");
				}
			}
		},

		readProductosService: function () {
			return new Promise((res, rej) => {
				this.getOwnerComponent().getModel("pedidos").read("/PEDIDOSet", {
					success: res,
					error: rej
				});
			});
		},

		/*async fetchProductos() {
			if (!this.isThereMoreData()) {
				return;
			}
			const tablaProductos = this.byId("tablaProductos");
			const pagContainer = this.getOwnerComponent().getModel("pagination");
			try {
				tablaProductos.setBusy(true);

				pagContainer.getData().pagination.changing = true;
				pagContainer.refresh(true);
				var url =
					`/sap/opu/odata/sap/zod_pedido_srv/PEDIDOSet?$inlinecount=allpages&$top=${pagContainer.getData().pagination.$top}&$skip=${pagContainer.getData().pagination.$skip}`;
				if (pagContainer.getData().filters !== "") {
					url += pagContainer.getData().filters;
				}

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
				var productos = await response.json();
				productos.d.results.forEach((item, index) => {
					productos.d.results[index].LABST = Number(item.LABST.trim())
				});
				productos.d.results.forEach((item, index) => {
					productos.d.results[index].PRECIO = Number(item.PRECIO.trim())
				});
				const currentProductos = this.getOwnerComponent().getModel("productos");
				if (!currentProductos) {
					var model = new JSONModel(productos);
					this.getOwnerComponent().setModel(model, "productos");
				} else {
					currentProductos.getData().d.results = currentProductos.getData().d.results.concat(productos.d.results);
				}

				this.getOwnerComponent().getModel("productos").refresh(true);
				pagContainer.getData().pagination.availableData = parseInt(productos.d.__count);
				pagContainer.getData().pagination.currentPage++;
				pagContainer.getData().pagination.$skip += pagContainer.getData().pagination.$top;
			} catch (e) {
				this._noConnection();
			}

			tablaProductos.setBusy(false);
			pagContainer.getData().pagination.changing = false;
		},*/

		isThereMoreData: function () {
			const pagContainer = this.getOwnerComponent().getModel("pagination").getData();
			if (pagContainer.pagination.changing) {
				//Blocks further calls until it is done changing
				return false;
			}
			if (pagContainer.pagination.currentPage === 0) {
				return true;
			}

			const isThereMoreData = (pagContainer.pagination.availableData - (pagContainer.pagination.currentPage * pagContainer.pagination.$top)) >
				0;

			return isThereMoreData;
		},

		async addToCart(event) {
			var button = event.getSource();
			button.setEnabled(false);
			button.setBusy(true);

			try {
				var modelUsedByItem = "productos";
				var item = this._instantiateItem(event.getSource().getBindingContext(modelUsedByItem).getObject());

				var cart = this.getOwnerComponent().getModel("cart");

				if (!cart.getData().isDuplicate(item)) {
					var stock = await this.fetchCurrentStock(item);
					item.updateStock(stock);
					var quantity = await this._quantityInput();
					item.changeQuantity(quantity);
					item.calculateTax();
				}

				if (cart.getData().addItem(item)) {
					var success = this.getOwnerComponent().getModel("i18n").getProperty("mainCartAddingSuccess");
					sap.m.MessageToast.show(
						success, {
							my: "center center",
							at: "center center",
						}
					);
				}
			} catch (e) {
				var title = this.getOwnerComponent().getModel("i18n").getProperty("mainCartFailedToAddtitle");
				//pendiente, e.message debe ser modificado!
				if (e != this.getOwnerComponent().getModel("i18n").getProperty("cancelledFromPromise")) {
					MessageBox.warning(
						e.message, {
							icon: sap.m.MessageBox.Icon.WARNING,
							title
						}
					);
				}
			} finally {
				button.setEnabled(true);
				button.setBusy(false);
			}
		},

		_instantiateItem: function (item) {
			var newItem = vitrinaShopCart().Item(
				item.MATNR,
				item.WERKS,
				item.LGORT,
				item.CHARG,
				item.PRECIO,
				item.MONEDA,
				item.LABST,
				item.MAKTX,
				item.IMPORTE,
				item.MEINS,
				item.CALIBRE,
				item.MARCA,
				item.IVA
			);

			return newItem;
		},

		_quantityInput: function () {
			var title = this.getOwnerComponent().getModel("i18n").getProperty("mainQuantityInputPopUp");
			var submitText = this.getOwnerComponent().getModel("i18n").getProperty("mainQuantitySubmitButtonPopUp");
			var cancelText = this.getOwnerComponent().getModel("i18n").getProperty("mainQuantityCancelButtonPopUp");
			var rejectText = this.getOwnerComponent().getModel("i18n").getProperty("cancelledFromPromise")
			const promesa = function (resolve, reject) {
				var quantity = 0;
				var cancel = false;

				const press = () => {
					quantity = Number(input.getValue());
					dialog.close();
				}

				var input = new sap.m.Input(
					"quantityInput", {
						type: sap.m.InputType.Number,
						submit: press
					}
				);

				var dialog = new sap.m.Dialog({
					title,
					type: "Message",
					content: input,
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: submitText,
						press
					}),
					endButton: new sap.m.Button({
						text: cancelText,
						press: () => {
							cancel = true;
							dialog.close();
						}
					}),
					afterClose: () => {
						dialog.destroy();

						if (cancel) {
							reject(rejectText);
						}
						resolve(quantity)
					}
				});

				dialog.open();
			}

			return new Promise(promesa);
		},

		async fetchCurrentStock(item) {
			var itemStock;
			try {
				var url = `/sap/opu/odata/sap/zod_pedido_srv/PEDIDOSet?$filter=`
				url += `MATNR eq '${item.matnr}' `;
				url += `and LGORT eq '${item.lgort}' `
				url += `and WERKS eq '${item.werks}' `;
				url += `and CHARG eq '${item.charg}'`;
				url += `&$select=LABST`;

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
				var stock = await response.json();
				stock.d.results.forEach((item, index) => {
					stock.d.results[index].LABST = Number(item.LABST.trim())
				});
				if (stock.d.results.length > 0) {
					itemStock = stock.d.results[0].LABST;
				} else {
					itemStock = 0;
				}

				this._refreshAProductStock(item, itemStock)
			} catch (e) {
				const errorText = this.getOwnerComponent().getModel("i18n").getProperty("failedToFetchStock");
				throw new Error(errorText);
			}

			return itemStock;
		},

		_refreshAProductStock: function (item, itemStock) {
			const productos = this.getOwnerComponent().getModel("productos");

			const index = productos.getData().d.results.findIndex(
				(existingItem) => {
					return existingItem.MATNR === item.matnr &&
						existingItem.LGORT === item.lgort &&
						existingItem.WERKS === item.werks &&
						existingItem.CHARG === item.charg;
				}
			);

			productos.getData().d.results[index].LABST = itemStock;

			productos.refresh(true);
		},

		navToCart: function () {
			this.getOwnerComponent().getModel("cart").refresh(true);
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("cart");
		},

		initCart: function () {
			var model = new JSONModel(vitrinaShopCart().Cart());
			this.getOwnerComponent().setModel(model, "cart");
		},

		_noConnection: function () {
			const errorMessage = this.getOwnerComponent().getModel("i18n").getProperty("noConnectivity");
			const title = this.getOwnerComponent().getModel("i18n").getProperty("noConnectivityTitle");
			MessageBox.error(
				errorMessage, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title
				}
			);
		},

		onFilter: function (event) {
			/*const pagContainer = this.getOwnerComponent().getModel("pagination");
			if (pagContainer.getData().pagination.changing) {
				return;
			}*/

			var filtros = {};
			var items;
			if (event.getSource() instanceof sap.m.Input) {
				items = event.getSource().getParent().getParent().getParent().getAllFilterItems();
			} else {
				items = event.getSource().getAllFilterItems();
			}

			items.forEach(
				(item) => {
					filtros[item.getName()] = item.getControl().getValue();
				}
			)

			this.applyFilter(filtros);
		},

		applyFilter: function (filtros) {
			//this.reset();
			const namesFromService = {
				almacen: "LGORT",
				calibre: "CALIBRE",
				centroLogistico: "WERKS",
				especie: "ESPECIE",
				numeroMaterial: "MATNR",
				variedad: "VARIEDAD",
				lote: "CHARG",
				classification: "CLASIFICACION_F_V"
			};

			var filter = "&$filter=";
			for (var [key, value] of Object.entries(filtros)) {
				if (value !== "" && key === "lote") {
					const fromReaderConstant = "(10)";
					const indexfromReader = value.indexOf(fromReaderConstant);

					if (indexfromReader > 0) {
						value = value.substring(indexfromReader + fromReaderConstant.length, value.length);

						const removeZeroes = value.split("");
						var firstNonZeroIndex = 0;
						removeZeroes.forEach((item, index) => firstNonZeroIndex = item !== "0" && firstNonZeroIndex === 0 ? index : firstNonZeroIndex)
						value = value.substring(firstNonZeroIndex, value.length);
					}

					filter += filter === "&$filter=" ? `substringof('${value}', ${namesFromService[key]})` :
						` and substringof('${value}', ${namesFromService[key]})`;
				} else if (value !== "") {
					filter += filter === "&$filter=" ? `substringof('${value}', ${namesFromService[key]})` :
						` and substringof('${value}', ${namesFromService[key]})`;
				}
			}

			//const pagination = this.getOwnerComponent().getModel("pagination");
			//pagination.getData().filters = filter;

			this.fetchProductos();
		},

		clearFilters: function () {
			this.byId("filterCharg").setValue("");
			this.byId("filterMatnr").setValue("");
			this.byId("filterEspecie").setValue("");
			this.byId("filterCentro").setValue("");
			this.byId("filterAlmacen").setValue("");
			this.byId("filterVariedad").setValue("");
			this.byId("filterCalibre").setValue("");
			this.byId("filterClassification").setValue("");
		},

		initializePagination: function () {
			const pagination = {
				pagination: {
					$top: 100,
					$skip: 0,
					currentPage: 0,
					availableData: 0,
					changing: false
				},
				filters: ""
			};

			var model = new JSONModel(pagination);
			this.getOwnerComponent().setModel(model, "pagination");
		},

		onGrowTable: function (event) {
			const scrollContainer = this.byId("myScrollContainer").getDomRef();
			const eightyPercent = scrollContainer.clientHeight * 1.2;
			const currentPosition = scrollContainer.scrollHeight - scrollContainer.scrollTop;
			const mustGrow = currentPosition <= eightyPercent;

			if (mustGrow)
				this.fetchProductos();

		},

		reset: function () {
			this.initializePagination();

			this.getOwnerComponent().setModel(undefined, "productos");
		},

		async onSuggest(event) {

			if (event.getParameters().suggestValue === "") {
				return;
			}

			const namesFromService = {
				filterAlmacen: "LGORT",
				filterCalibre: "CALIBRE",
				filterCentro: "WERKS",
				filterEspecie: "ESPECIE",
				filterMatnr: "MATNR",
				filterVariedad: "VARIEDAD",
				filterCharg: "CHARG",
				filterClassification: "CLASIFICACION_F_V"
			};

			var searchFor = event.getParameter("suggestValue");
			var filtro = [];
			if (searchFor) {
				filtro.push(new sap.ui.model.Filter("text", sap.ui.model.FilterOperator.Contains, searchFor));
			}

			const input = event.getSource();
			const filterBy = namesFromService[input.getName()];
			const lookFor = event.getParameters().suggestValue;
			const fromReaderConstant = "(10)";
			if (filterBy === namesFromService.filterCharg && lookFor.indexOf(fromReaderConstant) > 0) {
				return;
			}
			await this.fetchSuggestions(filterBy, lookFor);
			input.setFilterSuggests(false);
			input.getBinding("suggestionItems").filter(filtro);
		},

		fetchSuggestions: function (filterBy, lookFor) {
			const promesa = async function (resolve, reject) {
				try {
					var url =
						`/sap/opu/odata/sap/zod_pedido_srv/PEDIDOSet?$select=${filterBy}&$filter=substringof('${lookFor}',${filterBy}) and GROUPBY eq ''&$top=5`;
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
					var rawSuggestions = await response.json();
					var suggestions = [];
					rawSuggestions.d.results.forEach(
						item => {
							suggestions.push({
								text: item[filterBy]
							})
						}
					);
					var model = new JSONModel(suggestions);
					const modelName = "suggestions" + filterBy;
					this.getOwnerComponent().setModel(model, modelName);
					this.getOwnerComponent().getModel(modelName).refresh(true);
					resolve(true);
				} catch (e) {
					this._noConnection();
					reject("No connection");
				}
			}.bind(this)

			return new Promise(promesa);
		},

		onAfterRendering: function () {
			this.initCart();
			//this.fetchProductos();
		}
	});
});