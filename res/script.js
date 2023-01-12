$(document).ready(function () {
	var vanillaDragArea = document.querySelector(".drag-area")
	var $dragArea = $(".drag-area")
	var $dragText = $(".header")
	var $container = $(".container")
	var $table = $("table")
	var $thead = $($table).find("thead")
	var $thtr = $($thead).find("tr")
	var $tbody = $($table).find("tbody")
	var $tbtr = $($tbody).find("tr")
	let $tbtd = $($tbtr).find("td")
	var skvMärkeskod

	let file

	$dragArea.on("dragenter dragstart dragend dragleave dragover drag drop", function (e) {
		e.preventDefault()
		e.stopPropagation()
	})

	$dragArea.on("dragenter", function (_e) {
		$dragText.first().text("Släpp för att ladda upp").next().hide()
		vanillaDragArea.classList.add("active")
	})

	$dragArea.on("dragleave", function (_e) {
		$dragText.first().text("Dra din fil hit").next().show()
		vanillaDragArea.classList.remove("active")
	})

	$dragArea.on("drop", function (e) {
		$dragText.first().text("Dra din fil hit").next().show()
		vanillaDragArea.classList.remove("active")
	
		file = e.originalEvent.dataTransfer.files[0]

		let fileType = file.type
		let fileName = file.name

		switch (fileName.toLowerCase().split(".")[1]) {
			case "skv":
				fileType = "text/skv"
				skvMärkeskod = file.name.toUpperCase().split("_")[0]
				break;
			case "reg":
				fileType = "text/reg"
				break;
			case "bst":
				fileType = "text/bst"
				break;
			case "vo":
				fileType = "text/vo"
				skvMärkeskod = file.name.toUpperCase().split("_")[0]
				break;
		}

		let validExtensions = ["text/skv", "text/reg", "text/bst", "text/vo" ]
		if (validExtensions.includes(fileType)) {
			let fileReader = new FileReader()
			fileReader.onload = () => {
				let fileContent = fileReader.result
				let processedFile = processFile(fileContent, fileType)
				postFileProcessing(processedFile)
			}
			fileReader.readAsText(file, "ISO-8859-1")
		} else {
			alert("Filen är inte en .SKV/.REG/.BST/.VO-fil")
		}
	})

	function processFile(fileContent, fileType) {
		let delimiter = ""
		let headers = ""
		let fileRow = fileContent.trim().replaceAll("\r", "").split("\n")
		switch (fileType) {
			case "text/skv":
				delimiter = ";"
				headers = ["ART_NR", "BENÄMNING", "BESTÄLL_ANTAL", "LISTA_ID", "AO_NUMMER", "REG_NUMMER"]
				break;
			case "text/reg":
				delimiter = "\t"
				headers = ["ART_NR", "BESTÄLL_ANTAL", "RAD_NUMMER"]
				break;
			case "text/bst":
				delimiter = ";"
				fileRow = fileContent.trim().replaceAll("\r", "").replaceAll(/;$/gm, "").split("\n").slice(1)
				headers = ["RAD_TYP", "BESTÄLL_ANTAL", "ART_NR", "MÄRKESKOD", "BENÄMNING", "REG_NUMMER"]
				break;
			case "text/vo":
				delimiter = "\t"
				headers = ["ART_NR", "BESTÄLL_ANTAL", "REG_NUMMER"]
				break;
		}

		const fileRowResult = fileRow.map(function (row) {
			const values = row.replace(/;$/, "").split(delimiter)
			const elements = headers.reduce(function (object, header, index) {
				object[header] = values[index]
				Object.keys(object).forEach(function(key, _index) {
					if (this[key] == null) this[key] = "";
				  }, object)

				return object
			}, {})

			return elements
		})

		return fileRowResult
	}

	function postFileProcessing(processedFile) {
		$container.html(`<table id="processed"><thead></thead><tbody></tbody></table>`)

		let fileIdentifier = `
			<span>${file.name}</span>
		`
		$(".container").prepend(fileIdentifier)

		createTable(processedFile)
		downloader(processedFile)
	}

	// Create table from data
	function createTable(processedFile) {
		createTableHeader(processedFile)
		createTableContent(processedFile)
	}

	// Set table head content
	function createTableHeader(processedFile) {
		let tablehead = "<tr>"
		$.each(processedFile[0], function(key) {
			switch (key) {
				case "MÄRKESKOD":
					key = "Märkeskod"
					break;
				case "ART_NR":
					key = "Artikelnummer"
					break;
				case "BENÄMNING":
					key = "Benämning"
					break;
				case "BESTÄLL_ANTAL":
					key = "Antal"
					break;
				case "LISTA_ID":
					key = "Lista ID"
					break;
				case "AO_NUMMER":
					key = "AO-nummer"
					break;
				case "REG_NUMMER":
					key = "Reg-nummer"
					break;
				case "RAD_NUMMER":
					key = "Radnummer"
					break;
				case "RAD_TYP":
					key = "Typ"
					break;
			}
			tablehead += "<th>" + key + "</th>"
		})

		tablehead += "</tr>"
		$("table#processed thead").append(tablehead)
	}

	// Set table body content
	function createTableContent(processedFile) {
		$.each(processedFile, function(index) {
			let tablerow = "<tr>"
			$.each(processedFile[index], function(_key, value) {
				tablerow += "<td>" + value + "</td>"
			})
			tablerow += "</tr>"
			$("table#processed tbody").append(tablerow)
		})
	}

	function downloader(file) {
		let FIL_OBJEKT = []
		let FIRST_MÄRKESKOD = ""
		let MÄRKESKOD = ""
		let ART_NR = ""
		let BENÄMNING = ""
		let BESTÄLL_ANTAL = ""
		let LISTA_ID = ""
		let AO_NUMME  = ""
		let REG_NUMMER = ""
		let CHASSI_NUMMER = ""
		let NYCKEL_NUMMER = ""
		let RAD_NUMMER = ""
		let RAD_TYP = ""
		let BESTÄLL_MÄRKNING = ""

		$.each(file, function(index) {
			let row = file[index]
			FIRST_MÄRKESKOD = skvMärkeskod || file[0]["MÄRKESKOD"] || ""
			MÄRKESKOD = skvMärkeskod || row["MÄRKESKOD"] || ""
			ART_NR = row["ART_NR"] || ""
			BENÄMNING = row["BENÄMNING"] || ""
			BESTÄLL_ANTAL = row["BESTÄLL_ANTAL"] || ""
			LISTA_ID = row["LISTA_ID"] || ""
			AO_NUMMER = row["AO_NUMMER"] || ""
			REG_NUMMER = row["REG_NUMMER"] || ""
			//CHASSI_NUMMER = "" || ""
			//NYCKEL_NUMMER = "" || ""
			RAD_NUMMER = row["RAD_NUMMER"] || ""
			RAD_TYP = row["RAD_TYP"] || ""

			if (FIRST_MÄRKESKOD == "VO") {
				BESTÄLL_MÄRKNING = "KST 23"

				if (AO_NUMMER == "" && REG_NUMMER == "") {
					BESTÄLL_MÄRKNING = "KST 23 Lager"
				} else {
					if (AO_NUMMER !== "" && REG_NUMMER !== "") {
						BESTÄLL_MÄRKNING = `KST 23 ${REG_NUMMER} AO${AO_NUMMER}`
					} else if (AO_NUMMER == "" && REG_NUMMER !== "") {
						BESTÄLL_MÄRKNING = `KST 23 ${AO_NUMMER}`
					} else if (AO_NUMMER !== "" && REG_NUMMER == "") {
						BESTÄLL_MÄRKNING = `KST 23 AO${AO_NUMMER}`
					}
				}

				FIL_OBJEKT += [MÄRKESKOD, ART_NR, BESTÄLL_ANTAL, BESTÄLL_MÄRKNING].join(";") + "\n"
			}

			if (FIRST_MÄRKESKOD == "MB") {
				BESTÄLL_MÄRKNING = "K23"

				if (AO_NUMMER == "" && REG_NUMMER == "") {
					BESTÄLL_MÄRKNING = "K23 Lager"
				} else {
					if (AO_NUMMER !== "" && REG_NUMMER !== "") {
						BESTÄLL_MÄRKNING = `K23 ${REG_NUMMER} AO${AO_NUMMER}`
					} else if (AO_NUMMER == "" && REG_NUMMER !== "") {
						BESTÄLL_MÄRKNING = `K23 AO${REG_NUMMER}`
					} else if (AO_NUMMER !== "" && REG_NUMMER == "") {
						BESTÄLL_MÄRKNING = `K23 AO${AO_NUMMER}`
					}
				}

				FIL_OBJEKT += [ART_NR, BESTÄLL_ANTAL, NYCKEL_NUMMER, CHASSI_NUMMER, BESTÄLL_MÄRKNING].join(";") + "\n"
			}

			if (FIRST_MÄRKESKOD == "EV") {
				FIL_OBJEKT += [ART_NR, BESTÄLL_ANTAL].join("\t") + "\n"
			}
		})

		download(FIRST_MÄRKESKOD, FIL_OBJEKT)

		function download(MÄRKESKOD, FIL_OBJEKT) {
			let downloadType = ""

			if (FIRST_MÄRKESKOD == "VO") {
				let blob = new Blob(
					[FIL_OBJEKT],
					{type: "text/csv;charset=utf-8"}
				);
				saveAs(blob, `${MÄRKESKOD}-Beställning.csv`)
				downloadType = "Volvo_CSV"
			}
			if (FIRST_MÄRKESKOD == "EV") {
				navigator.clipboard.writeText(FIL_OBJEKT)
				downloadType = "EvoBus_Clipboard"
			}

			notifyDownload(downloadType, FIRST_MÄRKESKOD)
		}

		function notifyDownload(downloadType, mk) {
			console.warn("REEEEEEEE")

			let downloadNotify = `
				<span>Laddade ner en fil för märkeskoden <strong>${mk}</strong> med typen <strong>${downloadType}</strong>!</span>
			`

			$(".container").append(downloadNotify)
		}
	}
})

/*
    // Generate content
    if (listDeliverer == "Volvo Truck Center Sweden AB") {
      textLines += `VO,${articleNumber},${articleAmount},${articleKost}\n`
    } else if (listDeliverer == "Mercedes Benz Sverige AB" || listDeliverer == "Veho Import AB") {
      articleKost = "K23 Lager"
      textLines += `${articleNumber.replaceAll(" ", "")};${articleAmount};;;${articleKost}\n`
    } else {
      textLines += `${articleNumber}\t${articleAmount}\n`
    }

    if (listDeliverer == "Mechanum Sverige AB") {
      textLinesPl24 += `${articleNumber.replaceAll(" ", "")};${articleAmount}\n`
    }

  // Text file copy
	$(document).on("click", ".txt-copy", function () {
    navigator.clipboard.writeText(textLines)
	})

  // Text file download
	$(document).on("click", ".txt-download", function () {
    let blob = new Blob(
      [`${textLines}`],
      {type: "text/plain;charset=utf-8"}
    );
    saveAs(blob, `Beställningslista ${dayjs().format("YYMM")}-${listId}.txt`)
	})

  // Excel download
	$(document).on("click", ".excel-download", function () {
    let blob = new Blob(
      [`${textLines}`],
      {type: "text/csv;charset=utf-8"}
    );
    saveAs(blob, `Beställningslista ${dayjs().format("YYMM")}-${listId}.csv`)
	})

  // SAP download
	$(document).on("click", ".sap-download", function () {
    let blob = new Blob(
      [`${textLines}`],
      {type: "text/csv;charset=utf-8"}
    );
    saveAs(blob, `SAP ${dayjs().format("YYMM")}-${listId}.csv`)
	})

  // Partslink24 download
	$(document).on("click", ".pl24-download", function () {
    let blob = new Blob(
      [`${textLinesPl24}`],
      {type: "text/csv;charset=utf-8"}
    );
    saveAs(blob, `Partslink24 Varukorg ${dayjs().format("YYMM")}-${listId}.csv`)
*/