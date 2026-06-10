const removeIsolatedNumbers = (text) => {
	return text.replace(/\b\d{1,2}\b/g, " ");
};

const removeDuplicateWords = (text) => {
	const words = text.split(/\s+/);
	const seen = new Set();
	const unique = [];

	for (const word of words) {
		const lower = word.toLowerCase();
		if (!seen.has(lower)) {
			seen.add(lower);
			unique.push(word);
		}
	}

	return unique.join(" ");
};

const removeBrokenURLs = (text) => {
	return text
		.replace(/https?:\/\/\S*\s/g, " ")
		.replace(/www\.\S*\s/g, " ")
		.replace(/\[[\w\s]+\]\(.*?\)/g, " ");
};

const removePDFNoise = (text) => {
	return text
		.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
		.replace(/[\u2000-\u206F\u3000-\u303F]/g, " ")
		.replace(/[\uFEFF\uFFF0-\uFFFF]/g, " ");
};

const normalizeWhitespace = (text) => {
	return text.replace(/\s+/g, " ").trim();
};

export function cleanArtifacts(inputText = "") {
	if (!inputText || typeof inputText !== "string") {
		return "";
	}

	let cleaned = inputText;
	cleaned = removePDFNoise(cleaned);
	cleaned = removeBrokenURLs(cleaned);
	cleaned = removeIsolatedNumbers(cleaned);
	cleaned = removeDuplicateWords(cleaned);
	cleaned = normalizeWhitespace(cleaned);

	return cleaned;
}

export default cleanArtifacts;
