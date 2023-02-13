$(document).ready(function () {
	// Initialize variables
	let form = $("#form");
	let fileInput = $("#fileInput");
	let saveButton = $("#saveButton");
	let manualChassi = $("#manualChassi");
	let table = $("#table");


	let DATE = "";
	let MÄRKESKOD = "";
	let ARTIKELNUMMER = "";
	let BENÄMNING = "";
	let BESTÄLLNINGSANTAL = "";
	let LISTA_ID = "";
	let AO_NUMMER = "";
	let REGNUMMER = "";
	let CHASSINUMMER = "";
	let BESTÄLL_MÄRKNING = "";

	$("#manualChassi").on("click", function () {
		CHASSINUMMER = prompt("Ange chassinummer");
		$("#form").submit();
	});

	$("#form").on("change", function () {
		$("#form").submit();
	});

	$("#form").submit(function (event) {
		event.preventDefault();

		let file = $("#fileInput").prop("files")[0];
		let reader = new FileReader();
		let data, rows, cells, headerRow, dataRow

		MÄRKESKOD = file.name.split("_")[0];
		DATE = file.name.split("_")[1];

		if (file.name.split(".")[1] === "skv") {
			reader.readAsText(file, "ISO-8859-1");
			reader.onload = function (e) {
				let headers, variables;
				data = e.target.result;
				rows = data.replace(/\n$/, "").split("\n");
				table.empty();

				let array = [];
				// Loop through the uploaded content to create table data rows
				dataRow += "<tbody>";
				for (var i = 1; i < rows.length; i++) {
					cells = rows[i].split(";");
					ARTIKELNUMMER = cells[0].trim();
					BENÄMNING = cells[1].trim();
					BESTÄLLNINGSANTAL = cells[2].trim();
					AO_NUMMER = cells[4].trim();
					REGNUMMER = cells[5].trim();

					// Loop through the variables array to create table data cells
					variables = [MÄRKESKOD, ARTIKELNUMMER, BENÄMNING, BESTÄLLNINGSANTAL, AO_NUMMER, REGNUMMER, CHASSINUMMER]
					dataRow += "<tr>";
					for (var j = 0; j < variables.length; j++) {
						dataRow += `<td>${variables[j]}</td>`;
					}
					dataRow += "</tr>";

					// Push the variables as a named object to the array
					array.push({
						ARTIKELNUMMER: ARTIKELNUMMER,
						BENÄMNING: BENÄMNING,
						BESTÄLLNINGSANTAL: BESTÄLLNINGSANTAL,
						AO_NUMMER: AO_NUMMER,
						REGNUMMER: REGNUMMER
					})

				}
				dataRow += "</tbody>";
				console.warn(array)

				// Loop through the headers array to create table header cells
				headers = ["Märkeskod", "Artikelnummer", "Benämning", "Beställningsantal", "AO-nummer", "Regnummer", "Chassinummer"];
				headers = headers.map(header => header.toUpperCase().replace(/-/g, "_"));
				headerRow = "<thead><tr>";
				for (var i = 0; i < headers.length; i++) {
					if (array.some(obj => obj[headers[i]])) {
						headerRow += `<th>${headers[i]}</th>`;
					}
				}
				headerRow += "</tr></thead>";

				table.prepend(headerRow);
				table.append(dataRow);

				saveButton.show();
				manualChassi.show();
				table.show();
			};
		} else {
			alert("Du kan bara ladda upp .SKV filer.");
		}
	});

	$("#saveButton").click(function () {
		var data = "";
		$("#table tr").each(function () {
			var cells = $(this).find("td");
			if (cells.length) {
				cells.each(function () {
					data += $(this).text() + "\t";
				});
				data = data.substring(0, data.length - 1);
				data += "\n";
			}
		});
		var blob = new Blob([data], { type: "text/plain" });
		var a = document.createElement("a");
		a.download = "table.txt";
		a.href = URL.createObjectURL(blob);
		a.click();
	});
});

