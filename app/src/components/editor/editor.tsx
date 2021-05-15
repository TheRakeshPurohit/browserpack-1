import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '@app/store';
import styled from 'styled-components';
import Breadcrumbs from './components/breadcrumbs/breadcrumbs';
import EmptyState from './components/empty-state/empty-state';
import Tabs from './components/tabs/tabs';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { initVimMode } from 'monaco-vim';
import { getVimStatusContainerId } from '@app/utils/utils';
import useKeys from '@rooks/use-keys';
import useDebounce from '@rooks/use-debounce';
import previewManager from '@app/utils/preview-manager';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

export default function Editor() {
  const selectedFile = useStore((state) => state.selectedFile);
  const openFiles = useStore((state) => state.openFiles);
  const colorMode = useStore((state) => state.colorMode);
  const monacoEditorRef = useRef<MonacoEditor | null>();
  const getEditorModel = (selectedFile: string) => {
    if (monacoEditorRef.current && selectedFile) {
      const editorModel = monaco.editor
        .getModels()
        .find((model) => model.uri.path === `${selectedFile}`);

      return editorModel;
    }
  };
  const onFileSave = useDebounce(() => {
    const editorModel = getEditorModel(selectedFile);

    if (editorModel) {
      previewManager.patch({
        [selectedFile]: {
          content: editorModel.getValue()
        }
      });
    }
  }, 250);
  const loadEditorModel = (selectedFile: string) => {
    if (monacoEditorRef.current && selectedFile) {
      const editorModel = getEditorModel(selectedFile);

      if (editorModel) {
        monacoEditorRef.current.editor?.setModel(editorModel);
      }
    }
  };
  const onEditorDidMount = useCallback((editor) => {
    initVimMode(editor, document.getElementById(getVimStatusContainerId()));
  }, []);
  useKeys(['Control', 's'], () => onFileSave());

  useKeys(['Meta', 's'], (evt) => {
    evt.preventDefault();

    onFileSave();
  });

  // load the file whenever a selection is changed
  useEffect(() => {
    loadEditorModel(selectedFile);
  }, [selectedFile]);

  return openFiles.length > 0 ? (
    <Container>
      <Tabs filePaths={openFiles} />
      <Breadcrumbs filePath={selectedFile} />
      <MonacoEditor
        ref={(ref) => {
          monacoEditorRef.current = ref;
          // load the selected file
          loadEditorModel(selectedFile);
        }}
        options={{
          minimap: {
            enabled: false
          },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on'
        }}
        theme={`vs-${colorMode}`}
        editorDidMount={onEditorDidMount}
      />
    </Container>
  ) : (
    <EmptyState />
  );
}
