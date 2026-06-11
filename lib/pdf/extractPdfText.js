import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const toBuffer = (input) => {
	if (Buffer.isBuffer(input)) {
		return input;
	}

	if (input instanceof Uint8Array) {
		return Buffer.from(input);
	}

	if (input instanceof ArrayBuffer) {
		return Buffer.from(input);
	}

	throw new Error("extractPdfText expects a Buffer, Uint8Array, or ArrayBuffer.");
};

export async function extractPdfText(input) {
	const buffer = toBuffer(input);

	const loadingTask = pdfjsLib.getDocument({
		data: new Uint8Array(buffer),
	});

	const pdf = await loadingTask.promise;

	let text = "";

	for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
		const page = await pdf.getPage(pageNum);
		const content = await page.getTextContent();

		text +=
			content.items
				.map((item) => item.str)
				.join(" ") + "\n";
	}

	return text.replace(/^\uFEFF/, "").trim();
}

export default extractPdfText;