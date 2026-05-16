import { create } from "zustand";

const useResumeStore = create((set) => ({
	selectedFile: null,
	isUploading: false,
	uploadProgress: 0,
	parsedData: null,
	uploadError: "",
	setIsUploading: (isUploading) => set({ isUploading }),
	setUploadProgress: (uploadProgress) => set({ uploadProgress }),
	setParsedData: (parsedData) => set({ parsedData }),
	setSelectedFile: (file) =>
		set({
			selectedFile: file,
			isUploading: false,
			uploadProgress: 0,
			parsedData: null,
			uploadError: "",
		}),
	setUploadError: (message) =>
		set({
			uploadError: message,
		}),
	clearUploadedFile: () =>
		set({
			selectedFile: null,
			isUploading: false,
			uploadProgress: 0,
			parsedData: null,
			uploadError: "",
		}),
}));

export default useResumeStore;
