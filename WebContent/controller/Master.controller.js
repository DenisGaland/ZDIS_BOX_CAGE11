sap.ui.define([
	"sap/ui/core/mvc/Controller",
	//"box_in_cage/TABLE/TableExampleUtils",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/core/BusyIndicator"
], function(Controller, MessageToast, MessageBox, JSONModel, ODataModel, BusyIndicator) {
	"use strict";

	return Controller.extend("Press_Shop_Fiori5.controller.Master", {

		//Init flux
		onInit: function() {
			var oView = this.getView();
			var osite = oView.byId("__PLANT");
			//Function module ZFIORI_GET_PLANT_OF_USER
			var URL = "/sap/opu/odata/sap/ZGET_PLANT_SRV/S_T001WSet(Type='')";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				var site = response.EPlant + " " + response.ET001w.Name1;
				var Cage = response.Cage;
				osite.setText(site);
				oView.byId("CAGE").setValue(Cage);
				oView.byId("CAGE").focus();
				if (Cage !== "") {
					var searchString = "M" + Cage;
					//Function mdoule Z_GET_BOX_CONTENT
					URL = "/sap/opu/odata/sap/ZRETURN_DC_SRV/ItemsSet?$filter=ZembArt " + "%20eq%20" + "%27" + searchString +
						"%27&$format=json";
					debugger;
					BusyIndicator.show();
					OData.read(URL, function(response) {
						BusyIndicator.hide();
						var newArray = response.results;
						var model = new JSONModel({
							"items": newArray
						});
						oView.setModel(model, "itemModel");
						var table = oView.byId("my_table");
						table.setVisible(true);
						oView.byId("TOOL_BAR").setVisible(true);
						oView.byId("H_BOX").setVisible(true);
						var box = oView.byId("BOX");
						oView.byId("CAGE").setEnabled(false);
						box.addEventDelegate({
							"onAfterRendering": function() {
								$("document").ready(function() {
									box.focus();
								});
							}
						}, this);
					}, function(error) {
						BusyIndicator.hide();
						console.log("Error: " + error.response.body.toString());
						promise.reject();
					});
				}

			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				//promise.reject();
			});
		},

		// Scan Cage
		CheckCage: function() {
			var oView = this.getView();
			var oController = oView.getController();
			var cage = this.getView().byId("CAGE").getValue();
			// Function module Z_CHECK_SCAN_VALUE
			var URL = "/sap/opu/odata/sap/ZCHECK_VALUE_SCAN_SRV/MessageSet(PValue='03" + cage + "')";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				if (response.EMessage !== "" && response.EZtype === "E") {
					var path = $.sap.getModulePath("Press_Shop_Fiori5", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("CAGE").setValue("");
					MessageBox.show(response.EMessage, MessageBox.Icon.ERROR);
				} else {
					oView.byId("H_BOX").setVisible(true);
					var box = oController.getView().byId("BOX");
					oView.byId("CAGE").setEnabled(false);
					box.addEventDelegate({
						"onAfterRendering": function() {
							$("document").ready(function() {
								box.focus();
							});
						}
					}, this);
				}
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				//promise.reject();
			});
		},

		CheckBox: function() {
			var oView = this.getView();
			var oController = oView.getController();
			var box = this.getView().byId("BOX").getValue();
			// Function module Z_CHECK_SCAN_VALUE
			var URL = "/sap/opu/odata/sap/ZCHECK_VALUE_SCAN_SRV/MessageSet(PValue='04" + box + "')";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				if (response.EMessage !== "" && response.EZtype === "E") {
					var path = $.sap.getModulePath("Press_Shop_Fiori5", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("BOX").setValue("");
					MessageBox.show(response.EMessage, MessageBox.Icon.ERROR);
				} else {
					oController.GetData();
				}
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
			});
		},

		CheckSele: function() {
			var oView = this.getView();
			var cage = oView.byId("CAGE").getValue();
			var seal = oView.byId("SELE").getValue();
			var string = cage + "--" + seal;
			//Function mdoule Z_GET_BOX_CONTENT
			var URL = "/sap/opu/odata/sap/ZRETURN_DC_SRV/ItemsSet(ZembArt='L" + string + "')";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				if (response.E_MESSAGE !== "" && response.E_ZTYPE === "O") {
					var oTable = oView.byId("my_table");
					oTable.setVisible(false);
					var oTool = oView.byId("TOOL_BAR");
					oTool.setVisible(false);
					var model = new JSONModel();
					oView.setModel(model, "itemModel");
					var oCage = oView.byId("CAGE");
					oCage.setValue("");
					oCage.setEnabled(true);
					oView.byId("H_BOX").setVisible(false);
					oView.byId("H_SELE").setVisible(false);
					oView.byId("TOOL_BACK").setVisible(false);
					oCage.addEventDelegate({
						"onAfterRendering": function() {
							$("document").ready(function() {
								oCage.focus();
							});
						}
					}, this);
					MessageBox.show(response.E_MESSAGE, MessageBox.Icon.INFORMATION);
				}
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				promise.reject();
			});
		},

		GetData: function() {
			var oView = this.getView();
			var box = oView.byId("BOX").getValue();
			var cage = oView.byId("CAGE").getValue();
			var searchString = "G" + cage + "/" + box;
			oView.byId("BOX").setValue("");
			//Function mdoule Z_GET_BOX_CONTENT
			var URL = "/sap/opu/odata/sap/ZRETURN_DC_SRV/ItemsSet?$filter=ZembArt " + "%20eq%20" + "%27" + searchString + "%27&$format=json";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				var newArray = response.results;
				var model = new JSONModel({
					"items": newArray
				});
				oView.setModel(model, "itemModel");
				oView.byId("my_table").setVisible(true);
				oView.byId("TOOL_BAR").setVisible(true);
				oView.byId("H_TABLE").setVisible(true);
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				promise.reject();
			});

		},

		//Clear Cage
		ClearCage: function() {
			var oView = this.getView();
			var cage = this.getView().byId("CAGE").getValue();
			//Function mdoule Z_GET_BOX_CONTENT
			var URL = "/sap/opu/odata/sap/ZRETURN_DC_SRV/ItemsSet(ZembArt='D" + cage + "')";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				if (response.E_MESSAGE !== "" && response.E_ZTYPE === "O") {
					oView.byId("my_table").setVisible(false);
					oView.byId("TOOL_BAR").setVisible(false);
					var model = new JSONModel();
					oView.setModel(model, "itemModel");
					var oCage = oView.byId("CAGE");
					oCage.setValue("");
					oCage.setEnabled(true);
					oView.byId("H_BOX").setVisible(false);
					oCage.addEventDelegate({
						"onAfterRendering": function() {
							$("document").ready(function() {
								oCage.focus();
							});
						}
					}, this);
					MessageBox.show(response.E_MESSAGE, MessageBox.Icon.INFORMATION);
				}
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				promise.reject();
			});
		},

		//Close Cage
		CloseCage: function() {
			var oView = this.getView();
			//var cage = this.getView().byId("CAGE").getValue();
			oView.byId("H_BOX").setVisible(false);
			oView.byId("H_SELE").setVisible(true);
			oView.byId("TOOL_BAR").setVisible(false);
			oView.byId("TOOL_BACK").setVisible(true);
			var sel = this.getView().byId("SELE");
			sel.addEventDelegate({
				"onAfterRendering": function() {
					$("document").ready(function() {
						sel.focus();
					});
				}
			}, this);
		},

		//Back Cage
		BackCage: function() {
			var oView = this.getView();
			//var cage = this.getView().byId("CAGE").getValue();
			oView.byId("H_BOX").setVisible(true);
			oView.byId("H_SELE").setVisible(false);
			oView.byId("TOOL_BAR").setVisible(true);
			oView.byId("TOOL_BACK").setVisible(false);
			var box = oView.byId("BOX");
			box.addEventDelegate({
				"onAfterRendering": function() {
					$("document").ready(function() {
						box.focus();
					});
				}
			}, this);
		}
	});
});