import createStore from 'zustand';
import vsDarkTheme from './themes/vs-dark';
import vsLightTheme from './themes/vs-light';
import { getColorMode, loadMonacoModels, saveColorMode } from './utils/utils';

type State = {
  openFiles: string[];
  colorMode: 'light' | 'dark';
  files: Record<string, { code: string }>;
  setOpenFiles: (files: string[]) => void;
  selectedFile: string;
  setSelectedFile: (filePath: string) => void;
  theme: any;
  toggleColorMode: () => void;
  closeFile: (filePath: string) => void;
  setFiles: (files: Record<string, { code: string }>) => void;
};

export const useStore = createStore<State>((set) => ({
  openFiles: [],
  colorMode: getColorMode(),
  files: {},
  setFiles: (files: Record<string, { code: string }>) =>
    set(() => {
      loadMonacoModels(files);

      return { files };
    }),
  toggleColorMode: () =>
    set((state) => {
      const colorMode = state.colorMode;

      if (colorMode === 'dark') {
        saveColorMode('light');

        return { theme: vsLightTheme, colorMode: 'light' };
      } else {
        saveColorMode('dark');

        return { theme: vsDarkTheme, colorMode: 'dark' };
      }
    }),
  setOpenFiles: (files) => set(() => ({ openFiles: files })),
  selectedFile: '',
  setSelectedFile: (filePath) =>
    set((state) => {
      const openFiles = [...state.openFiles];

      if (!openFiles.includes(filePath)) {
        openFiles.push(filePath);
      }

      return { selectedFile: filePath, openFiles };
    }),
  theme: getColorMode() === 'dark' ? vsDarkTheme : vsLightTheme,
  closeFile: (filePath) =>
    set((state) => {
      let openFiles = [...state.openFiles];
      const fileIndex = openFiles.indexOf(filePath);

      if (~fileIndex) {
        openFiles.splice(fileIndex, 1);
      }

      if (openFiles.length > 0 && state.selectedFile === filePath) {
        return { openFiles, selectedFile: openFiles[0] };
      } else {
        return { openFiles };
      }
    })
}));
