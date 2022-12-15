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
	"sap/m/TextArea"
	],
	function(Controller, Core, DateRange, MessageToast, DateFormat, coreLibrary, Dialog, Button, Label, mobileLibrary, Text, TextArea) {
	"use strict";

	var CalendarType = coreLibrary.CalendarType;
	
	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	return Controller.extend("Urlaubsantraege.controller.mainView", {
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});
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
							text: "Do you want to submit this order?",
							labelFor: "submissionNote"
						}),
						new TextArea("submissionNote", {
							width: "100%",
							placeholder: "Add note (required)",
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
		},
		
		onDeleteDialogPress: function () {
			if (!this.oDeleteDialog) {
				this.oDeleteDialog = new Dialog({
					type: DialogType.Message,
					title: "Confirm",
					content: [
						new Label({
							text: "Do you want to Delete this order?",
							labelFor: "submissionNote"
						}),
						new TextArea("submissionNote", {
							width: "100%",
							placeholder: "Add note (required)",
							liveChange: function (oEvent) {
								var sText = oEvent.getParameter("value");
								this.oDeleteDialog.getBeginButton().setEnabled(sText.length > 0);
							}.bind(this)
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Delete",
						enabled: false,
						press: function () {
							var sText = Core.byId("submissionNote").getValue();
							MessageToast.show("Note is: " + sText);
							this.oDeleteDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oDeleteDialog.close();
						}.bind(this)
					})
				});
			}

			this.oDeleteDialog.open();
		}
		
	});

});