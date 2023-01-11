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

	let file;

	$dragArea.on("dragenter dragstart dragend dragleave dragover drag drop", function (e) {
		e.preventDefault()
		e.stopPropagation()
	})

	$dragArea.on("dragenter", function (e) {
		$dragText.first().text("Släpp för att ladda upp").next().hide()
		vanillaDragArea.classList.add("active")
	})

	$dragArea.on("dragleave", function (e) {
		$dragText.first().text("Dra din fil hit").next().show()
		vanillaDragArea.classList.remove("active")
	})

	$dragArea.on("drop", function (e) {
		$dragText.first().text("Dra din fil hit").next().show()
		vanillaDragArea.classList.remove("active")
	
		file = e.originalEvent.dataTransfer.files[0]

		let fileType = file.type
		switch (file.name.toLowerCase().split(".")[1]) {
			case "skv":
				fileType = "text/skv"
				break;
			case "reg":
				fileType = "text/reg"
				break;
			case "bst":
				fileType = "text/bst"
				break;
		}

		let validExtensions = ["text/skv", "text/reg", "text/bst" ]
		if (validExtensions.includes(fileType)) {
			let fileReader = new FileReader()
			fileReader.onload = () => {
				let fileContent = fileReader.result
				$container.html(`<table id="processed"><thead></thead><tbody></tbody></table>`)

				// Get processed input file
				let processedFile = processFile(fileContent, fileType)

				$(".container").prepend(file.name)

				// Set table head content
				let row = "<tr>"
				$.each(processedFile[0], function(key) {
					row += "<th>" + key + "</th>"
				})
				row += "</tr>"
				$("table#processed thead").append(row)

				// Set table body content
				$.each(processedFile, function(index) {
					let row = "<tr>"
					$.each(processedFile[index], function(key, value) {
						row += "<td>" + value + "</td>"
					})
					row += "</tr>"
					$("table#processed tbody").append(row)
				})

			}
			fileReader.readAsText(file, "ISO-8859-1")
		} else {
			alert("Filen är inte en .SKV/.REG/.BST-fil")
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
				fileRow = fileRow.slice(1)
				headers = ["RAD_TYP", "BESTÄLL_ANTAL", "ART_NR", "MÄRKESKOD", "BENÄMNING", ""]
				break;
		}

		const fileRowResult = fileRow.map(function (row) {
			const values = row.split(delimiter)
			const elements = headers.reduce(function (object, header, index) {
				object[header] = values[index]
				return object
			}, {})
			return elements
		})

		return fileRowResult
	}
})