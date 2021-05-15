import { useStore } from '@hackbox/store';
import React from 'react';
import styled from 'styled-components';
import {
  getLanguageNameFromExt,
  getVimStatusContainerId
} from '@hackbox/utils/utils';

const Container = styled.div`
  background: ${(props) => props.theme.colors['statusBar.background']};
  color: ${(props) => props.theme.colors['statusBar.foreground']};
  height: 25px;
  width: 100%;
  border-top: ${(props) =>
      props.theme.colors['statusBar.border'] ? '0.5px' : 0}
    solid ${(props) => props.theme.colors['statusBar.border']};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 5px 0px;
  box-sizing: border-box;
  font-size: 0.8em;
`;

const Content = styled.div`
  padding: 0 15px;
  display: flex;
  > div + div {
    margin-left: 20px;
  }
`;

const VimStatusContainer = styled.div`
  input {
    background: ${(props) => props.theme.colors['statusBar.background']};
    color: ${(props) => props.theme.colors['statusBar.foreground']};
    border: 0;
    outline: none;
  }
`;

export default function Statusbar() {
  const selectedFile = useStore((state) => state.selectedFile);
  const language = getLanguageNameFromExt(selectedFile);

  return (
    <Container id="status-bar">
      <Content>
        <VimStatusContainer>
          <div id={getVimStatusContainerId()}></div>
        </VimStatusContainer>
        <div>{language}</div>
        <div className="codicon codicon-bell-dot" />
      </Content>
    </Container>
  );
}
