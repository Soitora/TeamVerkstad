$(document).ready(function () {
	// Initialize variables
	let $form = $("#form");
	let $fileInput = $("#fileInput");
	let $manualChassi = $("#manualChassi");
	let $manualKey = $("#manualKey");
	let $saveButtonText = $("#saveButtonText");
	let $saveButtonExcel = $("#saveButtonExcel");
	let $copyButton = $("#copyButton");
	let $saveVolvoPartsOnline = $("#saveVolvoPartsOnline");
	let $saveVehoSAP = $("#saveVehoSAP");
	let $savePartslink24 = $("#savePartslink24");
	let $copyOmniplus = $("#copyOmniplus");
	let $table = $("#convertedTable");

	let DATE = "";
	let MÄRKESKOD = "";
	let ARTIKELNUMMER = "";
	let BENÄMNING = "";
	let BESTÄLLNINGSANTAL = "";
	let LISTA_ID = "";
	let ARBETSORDER = "";
	let REGNUMMER = "";
	let CHASSINUMMER = "";
	let NYCKELNUMMER = "";
	let BESTÄLL_MÄRKNING = "";

	var GLOBAL_DATA = [];

	$fileInput.customFileInput()

	$manualChassi.on("click", function () {
		CHASSINUMMER = prompt("Ange chassinummer");
		$form.submit();
	});

	$manualKey.on("click", function () {
		NYCKELNUMMER = prompt("Ange nyckelnummer");
		$form.submit();
	});

	$form.on("change", function () {
		$form.submit();
	});

	$form.submit(function (event) {
		event.preventDefault();
		clearPreviousEntry();

		let file = $fileInput.prop("files")[0];
		let reader = new FileReader();
		let data, rows, cells, headerRow = "", dataRow = "";

		MÄRKESKOD = file.name.split("_")[0];
		DATE = file.name.split("_")[1].split(".")[0];

		if (file.name.split(".")[1] === "skv") {
			reader.readAsText(file, "ISO-8859-1");
			reader.onload = function (e) {
				let headers, variables;
				data = e.target.result;
				rows = data.replace(/\n$/, "").split("\n");
				$table.empty();

				// Loop through the uploaded content to create table data rows
				dataRow += "<tbody>";
				for (var i = 0; i < rows.length; i++) {
					cells = rows[i].split(";");
					ARTIKELNUMMER = cells[0].trim();
					BENÄMNING = cells[1].trim();
					BESTÄLLNINGSANTAL = cells[2].trim();
					LISTA_ID = cells[3].trim();
					ARBETSORDER = cells[4].trim();
					REGNUMMER = cells[5].trim();
					BESTÄLL_MÄRKNING = "KST 23"

					if (!ARBETSORDER && !REGNUMMER) {
						BESTÄLL_MÄRKNING += ` Lager`;
					} else if (!REGNUMMER) {
						BESTÄLL_MÄRKNING += ` ${ARBETSORDER}`;
					} else if (!ARBETSORDER) {
						BESTÄLL_MÄRKNING += ` ${REGNUMMER}`;
					} else {
						BESTÄLL_MÄRKNING += ` ${REGNUMMER} AO${ARBETSORDER}`;
					}


					// Loop through the variables array to create table data cells
					variables = [MÄRKESKOD, ARTIKELNUMMER, BENÄMNING, BESTÄLLNINGSANTAL, ARBETSORDER, REGNUMMER, CHASSINUMMER, NYCKELNUMMER]
					dataRow += "<tr>";
					for (var j = 0; j < variables.length; j++) {
						dataRow += `<td>${variables[j]}</td>`;
					}
					dataRow += "</tr>";

					// Push the variables as a named object to the array
					GLOBAL_DATA.push({
						Lista_ID: LISTA_ID,
						Datum: DATE,
						Märkeskod: MÄRKESKOD,
						Artikelnummer: ARTIKELNUMMER,
						Benämning: BENÄMNING,
						Beställningsantal: BESTÄLLNINGSANTAL,
						ARBETSORDER: ARBETSORDER,
						Regnummer: REGNUMMER,
						Chassinummer: CHASSINUMMER,
						Nyckelnummer: NYCKELNUMMER,
						Märkning: BESTÄLL_MÄRKNING,
					})

				}
				dataRow += "</tbody>";
				console.warn(GLOBAL_DATA)

				// Loop through the headers array to create table header cells
				headers = ["MK", "Artikelnummer", "Benämning", "Antal", "Arbetsorder", "Regnummer", "Chassinummer", "Nyckelnummer"];
				headerRow = "<thead><tr>";
				for (var i = 0; i < headers.length; i++) {
					if (headers[i]) {
						headerRow += `<th id="${headers[i]}">${headers[i]}</th>`;
					}
				}
				headerRow += "</tr></thead>";

				$table.prepend(headerRow);
				$table.append(dataRow);

				$saveButtonText.show();
				$saveButtonExcel.show();
				$copyButton.show();
				$table.show();

				// Hide empty columns
				$table.each(function(a, tbl) {
					var currentTableRows = $(tbl).find("tbody tr").length;
					$(tbl).find("th").each(function(i) {
						var remove = 0;
						var currentTable = $(this).parents("table");

						var tds = currentTable.find("tr td:nth-child(" + (i + 1) + ")");
						tds.each(function(j) { if ($(this).text().trim() === "") remove++; });

						if (remove == currentTableRows) {
							$(this).addClass().hide();
							tds.hide();
						}
					});
				});

				$table.find("th:visible:first").addClass("firstVisible");
				$table.find("th:visible:last").addClass("lastVisible");
			};

			revealExtraButtons(MÄRKESKOD);
		} else {
			alert("Du kan bara ladda upp .SKV filer.");
		}
	});

	$(".mainButtons button, .extraButtons button").on("click", function (buttonType) {
		switch(buttonType.target.id) {
			case "saveButtonText":
				mainDownloader("file", "text");
				break;
			case "saveButtonExcel":
				mainDownloader("file", "excel");
				break;
			case "copyButton":
				mainDownloader("copy", "text");
				break;
			case "saveVolvoPartsOnline":
				mainDownloader("file", "volvopartsonline");
				break;
			case "saveVehoSAP":
				mainDownloader("file", "vehosap");
				break;
			case "savePartslink24":
				mainDownloader("file", "partslink24");
				break;
			case "copyOmniplus":
				mainDownloader("copy", "omniplus");
				break;
		}
	})

	function mainDownloader(type, format) {
		let FILE_FORMAT = [], fileType, data = "", blob, a

		if (type === "file") {
			switch(format) {
				case "text":
					console.log("Saving as Text!")
					fileType = "text/plain"
					fileName = `Text ${MÄRKESKOD} - ${DATE}.txt`
					for (var i = 0; i < GLOBAL_DATA.length; i++) {
						FILE_FORMAT += [GLOBAL_DATA[i].Artikelnummer, GLOBAL_DATA[i].Beställningsantal].join("\t") + "\n"
					}
					break;
				case "excel":
					console.log("Saving as Excel!")
					fileType = "text/csv;charset=utf-8"
					fileName = `Excel ${MÄRKESKOD} - ${DATE}.csv`
					for (var i = 0; i < GLOBAL_DATA.length; i++) {
						FILE_FORMAT += [GLOBAL_DATA[i].Artikelnummer, GLOBAL_DATA[i].Beställningsantal].join(";") + "\n"
					}
					break;
				case "volvopartsonline":
					console.log("Saving as Volvo Parts Online!")
					fileType = "text/csv;charset=utf-8"
					fileName = `Volvo Parts Online - ${DATE}.csv`
					for (var i = 0; i < GLOBAL_DATA.length; i++) {
						FILE_FORMAT += [GLOBAL_DATA[i].Märkeskod, GLOBAL_DATA[i].Artikelnummer, GLOBAL_DATA[i].Beställningsantal, GLOBAL_DATA[i].Märkning].join(";") + "\n"
					}
					break;
				case "vehosap":
					console.log("Saving as VehoSAP!")
					fileType = "text/csv;charset=utf-8"
					fileName = `Veho SAP - ${DATE}.csv`
					for (var i = 0; i < GLOBAL_DATA.length; i++) {
						FILE_FORMAT += [GLOBAL_DATA[i].Artikelnummer, GLOBAL_DATA[i].Beställningsantal, GLOBAL_DATA[i].Nyckelnummer, GLOBAL_DATA[i].Chassinummer, GLOBAL_DATA[i].Märkning.replaceAll("KST 23", "K23")].join(";") + "\n"
					}
					break;
				case "partslink24":
					console.log("Saving as Partslink24!")
					fileType = "text/csv;charset=utf-8"
					fileName = `Partslink24 - ${DATE}.csv`
					for (var i = 0; i < GLOBAL_DATA.length; i++) {
						FILE_FORMAT += [GLOBAL_DATA[i].Artikelnummer, GLOBAL_DATA[i].Beställningsantal].join(";") + "\n"
					}
					break;
			}

			blob = new Blob([FILE_FORMAT], { type: fileType });
			a = document.createElement("a");
			a.download = fileName;
			a.href = URL.createObjectURL(blob);
			a.click();

		} else if (type === "copy") {
			switch (format) {
				case "text":
					console.log("Copying as Text!")
					for (var i = 0; i < GLOBAL_DATA.length; i++) {
						FILE_FORMAT += [GLOBAL_DATA[i].Artikelnummer, GLOBAL_DATA[i].Beställningsantal].join("\t") + "\n"
					}
					navigator.clipboard.writeText(FILE_FORMAT)
					break;
				case "omniplus":
					console.log("Copying as OmniPlus!")
					for (var i = 0; i < GLOBAL_DATA.length; i++) {
						FILE_FORMAT += [GLOBAL_DATA[i].Artikelnummer, GLOBAL_DATA[i].Beställningsantal].join("\t") + "\n"
					}
					navigator.clipboard.writeText(FILE_FORMAT)
					break;
			}
		} else {
			alert("Något gick fel!");
		}
	}

	function clearPreviousEntry() {
		GLOBAL_DATA = [];
		$saveVolvoPartsOnline.hide();
		$saveVehoSAP.hide();
		$savePartslink24.hide();
		$copyOmniplus.hide();
	}

	function revealExtraButtons(MÄRKESKOD) {
		switch (MÄRKESKOD) {
			case "VO":
				$saveVolvoPartsOnline.show();
				break;
			case "MB":
				$saveVehoSAP.show();
				$savePartslink24.show();
				$manualChassi.show();
				$manualKey.show();
				break;
			case "EV":
				$copyOmniplus.show();
		}
	}
});
