import React from 'react';
import Icon from '@app/components/icon/icon';
import { useStore } from '@app/store';
import { getBasename } from '@app/utils/utils';
import { MouseEvent, ReactNode } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  height: 40px;
  background: ${(props) =>
    props.theme.colors['editorGroupHeader.tabsBackground']};
  border-bottom: 1px solid ${(props) => props.theme.colors['tab.border']};
  color: ${(props) => props.theme.colors['foreground']};
  user-select: none;
  display: flex;
`;

type TabProps = {
  isSelected?: boolean;
  children?: ReactNode;
  onClick: (evt: MouseEvent) => void;
  onClose: (evt: MouseEvent) => void;
};

const TabContainer = styled.div<Omit<TabProps, 'onClose'>>`
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0px 20px;
  color: ${(props) =>
    props.isSelected
      ? props.theme.colors['tab.activeForeground']
      : props.theme.colors['tab.inactiveForeground']};
  background: ${(props) =>
    props.isSelected ? props.theme.colors['tab.activeBackground'] : 'none'};
  border-right: 1px solid ${(props) => props.theme.colors['tab.border']};
  border-bottom: 1px solid
    ${(props) =>
      props.isSelected
        ? props.theme.colors['tab.activeBorder'] ||
          props.theme.colors['tab.activeBackground']
        : 'none'};
  cursor: pointer;
`;

const CloseButton = styled.div`
  margin-left: 10px;
`;

const Tab = ({ isSelected, children, onClick, onClose }: TabProps) => {
  return (
    <TabContainer isSelected={isSelected} onClick={onClick}>
      {children}
      <CloseButton
        onClick={(evt) => {
          evt.stopPropagation();

          onClose(evt);
        }}
        className="codicon codicon-close"
      />
    </TabContainer>
  );
};

const FileNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

type TabsProps = {
  filePaths?: string[];
};

export default function Tabs({ filePaths = [] }: TabsProps) {
  const setSelecetedFile = useStore((state) => state.setSelectedFile);
  const selectedFile = useStore((state) => state.selectedFile);
  const closeFile = useStore((state) => state.closeFile);

  return (
    <Container>
      {filePaths.map((filePath, index) => {
        const filename = getBasename(filePath);

        return (
          <Tab
            isSelected={filePath === selectedFile}
            key={index}
            onClick={() => setSelecetedFile(filePath)}
            onClose={() => {
              closeFile(filePath);
            }}
          >
            <FileNameContainer>
              <Icon entityName={filename} />
              <div style={{ marginLeft: '5px' }}>{filename}</div>
            </FileNameContainer>
          </Tab>
        );
      })}
    </Container>
  );
}
