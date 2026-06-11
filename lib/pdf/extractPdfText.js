import PDFParser from "pdf2json";

const toBuffer = (input) => {
	if (Buffer.isBuffer(input)) return input;
	if (input instanceof Uint8Array) return Buffer.from(input);
	if (input instanceof ArrayBuffer) return Buffer.from(input);

	throw new Error("Invalid buffer");
};

export async function extractPdfText(input) {
	const buffer = toBuffer(input);

	return new Promise((resolve, reject) => {
		const pdfParser = new PDFParser();

		pdfParser.on("pdfParser_dataError", (err) => {
			reject(err);
		});

		pdfParser.on("pdfParser_dataReady", (pdfData) => {
			let text = "";

			for (const page of pdfData.Pages || []) {
				const rows = {};

				for (const item of page.Texts || []) {
					const y = Math.round(item.y);

					if (!rows[y]) {
						rows[y] = [];
					}

					rows[y].push(
						decodeURIComponent(item.R?.[0]?.T || "")
					);
				}

				const sortedRows = Object.keys(rows)
					.map(Number)
					.sort((a, b) => a - b);

				for (const row of sortedRows) {
					text += rows[row].join(" ") + "\n";
				}

				text += "\n";
			}

			resolve(text.trim());
		});

		pdfParser.parseBuffer(buffer);
	});
}

export default extractPdfText;