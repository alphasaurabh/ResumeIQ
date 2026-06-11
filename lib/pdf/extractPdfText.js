const toBuffer = (input) => {
	if (Buffer.isBuffer(input)) return input;
	if (input instanceof Uint8Array) return Buffer.from(input);
	if (input instanceof ArrayBuffer) return Buffer.from(input);

	throw new Error("Invalid buffer");
};

export async function extractPdfText(input) {
	const buffer = toBuffer(input);

	// Polyfill for pdfjs on Vercel
	global.DOMMatrix =
		global.DOMMatrix ||
		class DOMMatrix {
			constructor() {}
		};

	const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

	const loadingTask = pdfjsLib.getDocument({
		data: new Uint8Array(buffer),
		disableWorker: true,
		useWorkerFetch: false,
		isEvalSupported: false,
	});

	const pdf = await loadingTask.promise;

	let text = "";

	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const content = await page.getTextContent();

		text +=
			content.items
				.map((item) => item.str || "")
				.join(" ") + "\n";
	}

	await pdf.destroy();

	return text.replace(/^\uFEFF/, "").trim();
}

export default extractPdfText;