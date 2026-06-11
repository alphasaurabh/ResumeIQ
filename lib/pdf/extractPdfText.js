global.DOMMatrix = class DOMMatrix {
	constructor() { }
};
import { PDFParse } from "pdf-parse";
import path from "node:path";
import { pathToFileURL } from "node:url";

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
	const workerFilePath = path.join(
		process.cwd(),
		"node_modules",
		"pdf-parse",
		"node_modules",
		"pdfjs-dist",
		"legacy",
		"build",
		"pdf.worker.mjs"
	);
	PDFParse.setWorker(pathToFileURL(workerFilePath).href);

	const parser = new PDFParse({
		data: buffer,
		disableWorker: true,
	});

	try {
		const parsed = await parser.getText();
		return (parsed?.text || "").replace(/^\uFEFF/, "").trim();
	} finally {
		await parser.destroy();
	}
}

export default extractPdfText;
