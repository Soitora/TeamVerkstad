$(document).ready(function () {
	// Initialize variables
	let form = $("#form");
	let fileInput = $("#fileInput");
	let saveButton = $("#saveButton");
	let manualChassi = $("#manualChassi");
	let table = $("#table");


	let DATE = "";
	let MÄRKESKOD = "";
	let ART_NR = "";
	let BENÄMNING = "";
	let BESTÄLL_ANTAL = "";
	let LISTA_ID = "";
	let AO_NUMMER = "";
	let REG_NUMMER = "";
	let CHASSI_NUMMER = "";
	let BESTÄLL_MÄRKNING = "";

	$("#manualChassi").on("click", function () {
		CHASSI_NUMMER = prompt("Ange chassinummer");
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
			reader.readAsText(file);
			reader.onload = function (e) {
				let headers, variables;
				data = e.target.result;
				rows = data.replace(/\n$/, "").split("\n");
				table.empty();

				// Loop through the uploaded content to create table data rows
				dataRow += "<tbody>";
				for (var i = 1; i < rows.length; i++) {
					cells = rows[i].split(";");
					ART_NR = cells[0];
					BENÄMNING = cells[1];
					BESTÄLL_ANTAL = cells[2];
					AO_NUMMER = cells[4];
					REG_NUMMER = cells[5];

					// Loop through the variables array to create table data cells
					variables = [MÄRKESKOD, ART_NR, BENÄMNING, BESTÄLL_ANTAL, AO_NUMMER, REG_NUMMER, CHASSI_NUMMER]
					dataRow += "<tr>";
					for (var j = 0; j < variables.length; j++) {
						if (variables[j]) {
							dataRow += `<td>${variables[j]}</td>`;
						}
					}
					dataRow += "</tr>";

				}
				dataRow += "</tbody>";

				// Loop through the headers array to create table header cells
				headers = ['Märkeskod', 'Artikelnummer', 'Benämning', 'Beställningsantal', 'AO-nummer', 'Regnummer', 'Chassinummer'];
				headerRow = "<thead><tr>";
				for (var j = 0; j < variables.length; j++) {
					if (variables[j]) {
						headerRow += `<th>${headers[j]}</th>`;
					}
				}
				headerRow += "</tr></thead>";

				table.append(dataRow);
				table.prepend(headerRow);

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