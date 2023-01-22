sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/unified/DateRange", 
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat", 
	"sap/ui/core/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/DatePicker",
	"sap/m/ComboBox",
	"sap/m/MessageBox",
	"sap/ui/model/resource/ResourceModel",
	"sap/m/ColumnListItem"
	],
	function(Controller, Core, DateRange, MessageToast, DateFormat, coreLibrary, Dialog, Button, Label, mobileLibrary, Text, TextArea, DatePicker, ComboBox, MessageBox, ResourceModel, ColumnListItem) {
	"use strict";

	var CalendarType = coreLibrary.CalendarType;
	var ButtonType = mobileLibrary.ButtonType;
	var DialogType = mobileLibrary.DialogType;
	var oComboBox = new sap.m.ComboBox();
	var oGeisterComboBox2 = new sap.m.ComboBox();
	var oDatePickerVon = new sap.m.DatePicker();
	oDatePickerVon.setValueFormat("yyyy-MM-dd");
	var oDatePickerBis = new sap.m.DatePicker();
	oDatePickerBis.setValueFormat("yyyy-MM-dd");
	
	return Controller.extend("Urlaubsantraege.controller.mainView", {
		onInit: function() {
			this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd.MM.yyyy"});
			
			var oModel = this.getOwnerComponent().getModel();
			
			//Import für i18n Sprachen
			var i18nModel = new ResourceModel({
            bundleName: "Urlaubsantraege.i18n.i18n"
	        });
	        this.getView().setModel(i18nModel, "i18n");

			//ComboBox Items mit AbsenceTypes befüllen
			oComboBox.setModel(oModel);
			oComboBox.bindItems({
				path: "/AbsenceTypesSet",
				template: new sap.ui.core.ListItem
				({
					key: "{AbsKey}",
					text: "{AbsText}"
				})
			});
			
			oGeisterComboBox2.setModel(oModel);
			oGeisterComboBox2.bindItems({
				path: "/StatusTypesSet",
				template: new sap.ui.core.ListItem
				({
					key: "{AbsKey}",
					text: "{AbsText}"
				})
			});
			
			//Requests Table mit Daten befüllen und Formatierung der Felder
			this.byId("requestsTable").bindItems({
		    	path: "/AbsenceSet",
		    	sorter: {path: "StartDate"},
		    	template: new ColumnListItem({
	        	cells: [
		            new Text({text: {
		                path: "StartDate",
		                formatter: function(value) {
		                    return oDateFormat.format(value);
		                }
	        		}}),
		            new Text({text: {
		                path: "EndDate",
		                formatter: function(value) {
		                    return oDateFormat.format(value);
		                }
	        		}}),
					new Text({text: {
            			path: "Type",
		                formatter: function(value) {
		                    return oModel.getProperty("/AbsenceTypesSet('"+value+"')/AbsText");
		                }
        		    }
    				}),
	                new Text({text: "{Description}"}),
	                new Text({text: {
            			path: "Status",
		                formatter: function(value) {
		                    return oModel.getProperty("/StatusTypesSet('"+value+"')/StatusText");
		                }
        		    }
    				})
	            	]
	        	})
	    		});
		},

		//Funktion, die ausgeführt wird wenn auf dem Kalender geklickt wird
		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.getSource();
			oDatePickerVon.setValue(this.oFormatYyyymmdd.format(oCalendar.getSelectedDates()[0].getStartDate()));
			if(oCalendar.getSelectedDates()[0].getEndDate())
			{
				oDatePickerBis.setValue(this.oFormatYyyymmdd.format(oCalendar.getSelectedDates()[0].getEndDate()));
			}
		},

		//Antrag löschen
		onDeleteDialogPress: function (){
		var oTable = this.byId("requestsTable");
		var oSelectedItem = oTable.getSelectedItem();
		var oBundle = this.getView().getModel("i18n").getResourceBundle();
		if (oSelectedItem) {
		   	var oContext = oSelectedItem.getBindingContext();
		    this.getView().getModel().remove(oContext.getPath());
		    MessageToast.show(oBundle.getText("delete_success"));
		} else 
		{
		    MessageBox.alert(oBundle.getText("delete_error"));
		}
		},

		//Antrag erstellen
		onSubmitDialogPress: function () {
		var oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (!this.oSubmitDialog) {
				// REQUEST DIALOG
				this.oSubmitDialog = new Dialog({
					type: DialogType.Message,
					title: oBundle.getText("Create_request"),
					content: [
						new Label({
							text: oBundle.getText("Create_request_begin")+"*:"
						}),
						new Label({
							text: oBundle.getText("Create_request_end")+"*:"
						}),
						new Label({
							text: oBundle.getText("Create_request_type")+"*:",
							width: "500px"
						}),
						new Label({
							text: oBundle.getText("Create_request_description")+":",
							width: "500px"
						}),
						new TextArea("submissionNote", {
							width: "100%",
							placeholder: ""
						})

					],
					//SUBMIT BUTTON
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: oBundle.getText("button_submit"),
						enabled: true,
						press: function () {
							if(oComboBox.getSelectedItem() && (oDatePickerVon.getValue() && oDatePickerBis.getValue() !== ""))
							{
								if(oDatePickerBis.getValue() < oDatePickerVon.getValue())
								{
									MessageBox.alert(oBundle.getText("end_before_from"));
								}else{
								  var newAbsence = 
								  {
								    StartDate: new Date(oDatePickerVon.getValue()),
								    EndDate: new Date(oDatePickerBis.getValue()),
								    "Type": oComboBox.getSelectedKey(),
								    "Status": "01",
								    "Description":  Core.byId("submissionNote").getValue()
								  };
								this.getOwnerComponent().getModel().create("/AbsenceSet", newAbsence, {
							    success: function(oData, response) {
							      //handle success
							      MessageToast.show(oBundle.getText("Create_request_entry_success"));
							    },
							    error: function(oError) {
							      //handle error
							      MessageToast.show(oBundle.getText("Create_request_entry_error"));
							    }
								});
								this.oSubmitDialog.close();
								}
							}else{
								MessageBox.alert(oBundle.getText("Create_request_missing_fields"));
							}
						}.bind(this)
					}),
					//CANCEL BUTTON
					endButton: new Button({
						text: oBundle.getText("button_cancel"),
						press: function () {
							this.oSubmitDialog.close();
						}.bind(this)
					})
				});
			}
			this.oSubmitDialog.insertContent(oDatePickerVon,1);
			this.oSubmitDialog.insertContent(oDatePickerBis,3);
			this.oSubmitDialog.insertContent(oComboBox,5);
			this.oSubmitDialog.open();
		}
	});
});