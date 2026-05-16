const normalizeLine = (line) => line.replace(/\s+/g, " ").trim();

export function cleanResumeText(inputText = "") {
	if (typeof inputText !== "string") {
		return "";
	}

	const normalizedNewlines = inputText.replace(/\r\n?/g, "\n");

	const cleanedSymbols = normalizedNewlines
		// Remove unusual symbols while keeping common resume punctuation.
		.replace(/[^\p{L}\p{N}\s@.+\-_/,:;()&|]/gu, " ")
		.replace(/[^\S\n]+/g, " ");

	const cleanedLines = cleanedSymbols
		.split("\n")
		.map(normalizeLine)
		.join("\n")
		.replace(/\n{3,}/g, "\n\n");

	return cleanedLines.trim();
}

export default cleanResumeText;
