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
	"sap/m/ColumnListItem"
	],
	function(Controller, Core, DateRange, MessageToast, DateFormat, coreLibrary, Dialog, Button, Label, mobileLibrary, Text, TextArea, DatePicker, ComboBox, MessageBox, ColumnListItem) {
	"use strict";

	var CalendarType = coreLibrary.CalendarType;
	var ButtonType = mobileLibrary.ButtonType;
	var DialogType = mobileLibrary.DialogType;
	
	var oComboBox = new sap.m.ComboBox();
	var oDatePickerVon = new sap.m.DatePicker();
	var oDatePickerBis = new sap.m.DatePicker();
	oDatePickerVon.setValueFormat("yyyy-MM-dd");
	oDatePickerBis.setValueFormat("yyyy-MM-dd");

	
	return Controller.extend("Urlaubsantraege.controller.mainView", {
			oFormatYyyymmdd: null,
		onInit: function() {
			this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});
			var oModel = this.getOwnerComponent().getModel();
	
			oComboBox.setModel(oModel);
			oComboBox.bindItems({
			path: "/AbsenceTypesSet",
			template: new sap.ui.core.ListItem({
				key: "{AbsKey}",
				text: "{AbsText}"
			})
			});
			
			//var oFilter = new sap.ui.model.Filter("Username", "EQ", "h22p");""
			this.byId("requestsTable").bindItems({
	        path: "/AbsenceSet",
	        //filters: [oFilter]"",
	        sorter: {path: 'StartDate'},
	        template: new ColumnListItem({
            cells: [
                new Text({text: "{StartDate}"}),
                new Text({text: "{EndDate}"}),
                new Text({text: "{Type}"}),
                new Text({text: "{Description}"}),
                new Text({text: "{Status}"})
            	]
        	})
    		});
		},

		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.getSource();
			this._updateText(oCalendar.getSelectedDates()[0]);
		},
		
		
formatDate: function(date) {
    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd-MM-yyyy"});
    return oDateFormat.format(new Date(date));
},
		
		_updateText: function(oSelectedDates) {
			oDatePickerVon.setValue(this.oFormatYyyymmdd.format(oSelectedDates.getStartDate()));
			if(oSelectedDates.getEndDate())
			{
				oDatePickerBis.setValue(this.oFormatYyyymmdd.format(oSelectedDates.getEndDate()));
			}
			},


		
		onDeleteDialogPress: function (){
			    var oTable = this.byId("requestsTable");
    var oSelectedItem = oTable.getSelectedItem();
   if (oSelectedItem) {
   	    var oContext = oSelectedItem.getBindingContext();
    this.getView().getModel().remove(oContext.getPath());
    MessageBox.alert("Eintrag erfolgreich gelöscht");
} else {
    MessageBox.alert("Bitte wählen Sie einen Eintrag aus, bevor Sie löschen");
}
		},

		onSubmitDialogPress: function () {
			if (!this.oSubmitDialog) {
				this.oSubmitDialog = new Dialog({
					type: DialogType.Message,
					title: "Abwesenheitsantrag",
					content: [
						new Label({
							text: "Beginn*:"
						}),
						new Label({
							text: "Ende*:"
						}),
						new Label({
							text: "Art*:",
							width: "500px"
						}),
						new Label({
							text: "Beschreibung:",
							width: "500px"
						}),
						new TextArea("submissionNote", {
							width: "100%",
							placeholder: ""
						})

					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Submit",
						enabled: true,
						press: function () {
							if(oComboBox.getSelectedItem() && (oDatePickerVon.getValue() && oDatePickerBis.getValue() !== ""))
							{

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
							      sap.m.MessageToast.show("Eintrag erfolgreich erstellt");
							    },
							    error: function(oError) {
							      //handle error
							      sap.m.MessageToast.show("Fehler beim Erstellen des Eintrags");
							    }
								});
								this.oSubmitDialog.close();
							}else{
								MessageBox.alert("Bitte fülle die erforderlichen Felder aus.");
							}
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
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