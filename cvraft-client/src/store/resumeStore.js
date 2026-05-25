import { create } from 'zustand';

const useResumeStore = create((set) => ({
  // Auth
  user: null,
  token: localStorage.getItem('cvraft_token') || null,

  // Resume
  rawText: '',
  selectedTemplate: 'T001',
  selectedColor: 'blue',
  currentResumeId: null,
  structuredData: null,
  pdfBlob: null,

  // UI
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('cvraft_token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('cvraft_token');
    set({ user: null, token: null });
  },
  setRawText: (text) => set({ rawText: text }),
  setSelectedTemplate: (id) => set({ selectedTemplate: id }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setCurrentResumeId: (id) => set({ currentResumeId: id }),
  setStructuredData: (data) => set({ structuredData: data }),
  setPdfBlob: (blob) => set({ pdfBlob: blob }),
  setLoading: (bool) => set({ isLoading: bool }),
  setError: (msg) => set({ error: msg }),
}));

export default useResumeStore;
