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
	"sap/m/MessageBox"
	],
	function(Controller, Core, DateRange, MessageToast, DateFormat, coreLibrary, Dialog, Button, Label, mobileLibrary, Text, TextArea, DatePicker, ComboBox,MessageBox) {
	"use strict";

	var CalendarType = coreLibrary.CalendarType;
	var ButtonType = mobileLibrary.ButtonType;
	var DialogType = mobileLibrary.DialogType;

	return Controller.extend("Urlaubsantraege.controller.mainView", {
		
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "dd-MM-YYYY", calendarType: CalendarType.Gregorian});
		},

		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.getSource();
			this._updateText(oCalendar.getSelectedDates()[0]);
		},

		_updateText: function(oSelectedDates) {
			var oSelectedDateFrom = this.byId("selectedDateFrom"),
				oSelectedDateTo = this.byId("selectedDateTo"),
				oDate;

			if (oSelectedDates) {
				oDate = oSelectedDates.getStartDate();
				if (oDate) {
					oSelectedDateFrom.setText(this.oFormatYyyymmdd.format(oDate));
				} else {
					oSelectedDateTo.setText("No Date Selected");
				}
				oDate = oSelectedDates.getEndDate();
				if (oDate) {
					oSelectedDateTo.setText(this.oFormatYyyymmdd.format(oDate));
				} else {
					oSelectedDateTo.setText("No Date Selected");
				}
			} else {
				oSelectedDateFrom.setText("No Date Selected");
				oSelectedDateTo.setText("No Date Selected");
			}
		},

		handleSelectThisWeek: function() {
			this._selectWeekInterval(6);
		},

		handleSelectWorkWeek: function() {
			this._selectWeekInterval(4);
		},

		handleWeekNumberSelect: function(oEvent) {
			var oDateRange = oEvent.getParameter("weekDays"),
				iWeekNumber = oEvent.getParameter("weekNumber");

			if (iWeekNumber % 5 === 0) {
				oEvent.preventDefault();
				MessageToast.show("You are not allowed to select this calendar week!");
			} else {
				this._updateText(oDateRange);
			}
		},

		_selectWeekInterval: function(iDays) {
			var oCurrent = new Date(), // get current date
				iWeekStart = oCurrent.getDate() - oCurrent.getDay() + 1,
				iWeekEnd = iWeekStart + iDays, // end day is the first day + 6
				oMonday = new Date(oCurrent.setDate(iWeekStart)),
				oSunday = new Date(oCurrent.setDate(iWeekEnd)),
				oCalendar = this.byId("calendar");

			oCalendar.removeAllSelectedDates();
			oCalendar.addSelectedDate(new DateRange({startDate: oMonday, endDate: oSunday}));

			this._updateText(oCalendar.getSelectedDates()[0]);
		},
		
		onSubmitDialogPress: function () {
			if (!this.oSubmitDialog) {
				this.oSubmitDialog = new Dialog({
					type: DialogType.Message,
					title: "Confirm",
					content: [
						new Label({
							text: "Beginn*:",
							labelFor: "von"
						}),
						new DatePicker("von", {
						      value: "{/thing/OutOfServiceDate}",
						      type: "Date",
						      enabled: true,
						      displayFormat: "dd-MM-YYYY"
						}),
						new Label({
							text: "Ende*:",
							labelFor: "bis"
						}),
						new DatePicker("bis", {
						      value: "{/thing/OutOfServiceDate}",
						      type: "Date",
						      enabled: true,
						      displayFormat: "dd-MM-YYYY"
						}),
						new Label({
							text: "Beschreibung:",
							labelFor: "submissionNote"
						}),
						new TextArea("submissionNote", {
							width: "100%",
							placeholder: "",
							liveChange: function (oEvent) {
								var sText = oEvent.getParameter("value");
								this.oSubmitDialog.getBeginButton().setEnabled(sText.length > 0);
							}.bind(this)
						})

					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Submit",
						enabled: false,
						press: function () {
							var sText = Core.byId("submissionNote").getValue();
							MessageToast.show("Note is: " + sText);
							this.oSubmitDialog.close();
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

			this.oSubmitDialog.open();
		}
	});

});