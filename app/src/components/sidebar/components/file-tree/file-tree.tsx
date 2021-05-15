import React, { useCallback, useEffect } from 'react';
import Tree, {
  DefaultNodeProps,
  treeHandlers,
  useTreeState
} from 'react-hyper-tree';
import styled, { createGlobalStyle } from 'styled-components';
import { FILES } from '@app/templates/react';
import { convertFilesToTree, getBasename } from '@app/utils/utils';
import Icon from '@app/components/icon/icon';
import { useStore } from '@app/store';

const NodeContainer = styled.div`
  display: flex;
  padding: 4px;
  padding-left: 20px;
  align-items: center;
  user-select: none;
  outline: none;
`;

const FileNameContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 5px;
`;

const IconContainer = styled.div<{ isFile?: boolean }>`
  display: flex;
  align-items: center;
  margin-left: ${(props) => (props.isFile ? '15px' : '5px')};
`;

const TreeCSS = createGlobalStyle`
  .selected-node-wrapper {
    background: ${(props: any) =>
      props.theme.colors['list.inactiveSelectionBackground']};
    color: ${(props: any) =>
      props.theme.colors['list.inactiveSelectionForeground']};
  }

  .selected-node-wrapper:focus-within {
    background: ${(props: any) =>
      props.theme.colors['list.activeSelectionBackground']};
    color: ${(props: any) =>
      props.theme.colors['list.activeSelectionForeground']};
  }
  
  :not(.selected-node-wrapper).node-wrapper:hover {
    background: ${(props: any) => props.theme.colors['list.hoverBackground']};
    color: ${(props: any) => props.theme.colors['list.hoverForeground']};
  }

  .node-wrapper {
    user-select: none;
    cursor: pointer;
  }
`;

export default function FileTree() {
  const { required, handlers } = useTreeState({
    data: convertFilesToTree(FILES),
    id: '/'
  });
  const tree = treeHandlers.trees['/'];
  const setSelectedFile = useStore((state) => state.setSelectedFile);
  const selectedFile = useStore((state) => state.selectedFile);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const node = tree.instance.getNodeById(selectedFile);

    if (node) {
      tree.handlers.setSelected(node, true);

      // open all parents of the node
      let parent = node.getParent();

      while (parent) {
        parent.setOpened(true);

        parent = parent.getParent();
      }
    }
  }, [selectedFile, tree.instance.enhancedData]);

  const renderNode = useCallback(
    ({ node, onToggle }: DefaultNodeProps) => {
      const entityName = getBasename(node.data.path);

      return (
        <NodeContainer
          tabIndex={0}
          onClick={(evt) => {
            onToggle(evt);

            tree.handlers.setSelected(node, true);

            if (!node.data.isDir) {
              setSelectedFile(node.data.path);
            }
          }}
        >
          <FileNameContainer>
            {node.data.isDir && (
              <>
                <div
                  className={`codicon codicon-chevron-${
                    node.isOpened() ? 'down' : 'right'
                  }`}
                ></div>
                <IconContainer>
                  <Icon
                    entityName={entityName}
                    isDir={true}
                    isDirOpen={node.isOpened()}
                  />
                </IconContainer>
              </>
            )}
            {!node.data.isDir && (
              <IconContainer isFile={true}>
                <Icon entityName={entityName} />
              </IconContainer>
            )}
            <div style={{ marginLeft: '5px' }}>{entityName}</div>
          </FileNameContainer>
        </NodeContainer>
      );
    },
    [setSelectedFile]
  );

  return (
    <>
      <TreeCSS />
      <Tree
        {...required}
        {...handlers}
        disableLines={true}
        classes={{
          selectedNodeWrapper: 'selected-node-wrapper',
          nodeWrapper: 'node-wrapper'
        }}
        gapMode="padding"
        disableTransitions={true}
        depthGap={12}
        renderNode={renderNode}
      />
    </>
  );
}
