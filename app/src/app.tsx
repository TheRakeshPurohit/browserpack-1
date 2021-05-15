import React, { useEffect } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import ActivityBar from '@app/components/activity-bar/activity-bar';
import Editor from '@app/components/editor/editor';
import SideBar from '@app/components/sidebar/sidebar';
import Statusbar from '@app/components/statusbar/statusbar';
import 'vscode-codicons/dist/codicon.css';
import { useStore } from './store';
import { FILES } from './templates/react';
import SplitPane from 'react-split-pane';
import BrowserPreview from './components/browser-preview/browser-preview';
import Browserpack from '@client';

console.log(Browserpack);

const Container = styled.div`
  height: 100vh;
`;

const Workspace = styled.div`
  height: calc(100vh - 25px);
  display: flex;
`;

const EditorContainer = styled.div`
  height: calc(100vh - 25px);
  display: flex;
`;

const AciticityBarAndSidebarContainer = styled.div`
  height: calc(100vh - 25px);
  display: flex;
`;

export default function Home() {
  const [selectedSidebarContainer, setSelectedSidebarContainer] = useState<
    string | null
  >('files');
  const setFiles = useStore((state) => state.setFiles);

  useEffect(() => {
    setFiles(FILES);
  }, [setFiles]);

  return (
    <Container>
      <Workspace>
        {selectedSidebarContainer ? (
          <SplitPane minSize={200} defaultSize={300}>
            <AciticityBarAndSidebarContainer>
              <ActivityBar
                defaultSelectedItem={selectedSidebarContainer}
                onSidebarItemClicked={(name) =>
                  setSelectedSidebarContainer(name)
                }
              />
              <SideBar selectedContainer={selectedSidebarContainer} />
            </AciticityBarAndSidebarContainer>
            <EditorContainer>
              <Editor />
              <BrowserPreview />
            </EditorContainer>
          </SplitPane>
        ) : (
          <>
            <ActivityBar
              defaultSelectedItem={selectedSidebarContainer}
              onSidebarItemClicked={(name) => setSelectedSidebarContainer(name)}
            />
            <EditorContainer>
              <Editor />
              <BrowserPreview />
            </EditorContainer>
          </>
        )}
      </Workspace>
      <Statusbar />
    </Container>
  );
}
