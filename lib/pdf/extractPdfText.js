import pdf from "pdf-parse";

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

	const data = await pdf(buffer);

	return (data?.text || "").replace(/^\uFEFF/, "").trim();
}

export default extractPdfText;