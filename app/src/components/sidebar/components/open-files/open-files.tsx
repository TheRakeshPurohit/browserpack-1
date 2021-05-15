import React from 'react';
import Icon from '@app/components/icon/icon';
import { useStore } from '@app/store';
import { getBasename } from '@app/utils/utils';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

type OpenFileProps = {
  isSelected?: boolean;
};

const CloseButton = styled.div`
  :hover {
    visibility: visible;
  }
`;

const OpenFile = styled.div<OpenFileProps>`
  padding: 5px;
  cursor: pointer;
  outline: none;
  background: ${(props) =>
    props.isSelected
      ? props.theme.colors['list.inactiveSelectionBackground']
      : 'none'};
  color: ${(props) =>
    props.isSelected
      ? props.theme.colors['list.inactiveSelectionForeground']
      : 'inherit'};

  :hover {
    background: ${(props: any) =>
      !props.isSelected && props.theme.colors['list.hoverBackground']};
    color: ${(props: any) =>
      !props.isSelected && props.theme.colors['list.hoverForeground']};
  }

  :focus {
    background: ${(props) =>
      props.isSelected
        ? props.theme.colors['list.activeSelectionBackground']
        : 'none'};
    color: ${(props) =>
      props.isSelected
        ? props.theme.colors['list.activeSelectionForeground']
        : 'inherit'};
  }

  ${CloseButton} {
    visibility: hidden;
  }

  :hover ${CloseButton} {
    visibility: visible;
  }
`;

type OpenFileContainerProps = {
  isSelected?: boolean;
};

const OpenFileContainer = styled.div<OpenFileContainerProps>`
  margin-left: 20px;
  display: flex;
  align-items: center;
`;

const FileNameContainer = styled.div`
  display: flex;
  align-items: center;
`;

export default function OpenFiles() {
  const setSelecetedFile = useStore((state) => state.setSelectedFile);
  const selectedFile = useStore((state) => state.selectedFile);
  const openFiles = useStore((state) => state.openFiles);
  const closeFile = useStore((state) => state.closeFile);

  return (
    <Container>
      {openFiles.map((filePath, index) => {
        const filename = getBasename(filePath);
        const isSelected = filePath === selectedFile;

        return (
          <OpenFile
            tabIndex={0}
            isSelected={isSelected}
            key={index}
            onClick={() => {
              setSelecetedFile(filePath);
            }}
          >
            <OpenFileContainer>
              <CloseButton
                style={isSelected ? { visibility: 'visible' } : {}}
                onClick={(evt) => {
                  // if we don't stop propogation it would select that file again
                  evt.stopPropagation();

                  closeFile(filePath);
                }}
                className="codicon codicon-close"
              />
              <FileNameContainer>
                <Icon entityName={filename} />
                <div style={{ marginLeft: '5px' }}>{filename}</div>
              </FileNameContainer>
            </OpenFileContainer>
          </OpenFile>
        );
      })}
    </Container>
  );
}
