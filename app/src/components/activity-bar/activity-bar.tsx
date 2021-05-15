import { useStore } from '@app/store';
import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: ${(props) => props.theme.colors['activityBar.background']};
  color: ${(props) => props.theme.colors['activityBar.foreground']};
  height: 100%;
  width: 50px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
`;

type SidebarItemProps = {
  isSelected?: boolean;
};

const ActivityBarItem = styled.div<SidebarItemProps>`
  width: 60px;
  opacity: ${(props) => (props.isSelected ? 1 : 0.6)};
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
  border-left: ${(props) =>
    props.isSelected
      ? `7px solid ${props.theme.colors['activityBar.activeBorder']}`
      : `7px solid ${props.theme.colors['activityBar.background']}`};
  div {
    font-size: 1.8em !important;
    padding: 15px 0;
    margin-left: -7px;
  }
`;

type ActivityBarProps = {
  defaultSelectedItem: string | null;
  onSidebarItemClicked: (itemName: string | null) => void;
};

export default function ActivityBar({
  onSidebarItemClicked,
  defaultSelectedItem = 'files'
}: ActivityBarProps) {
  const onClicked = (fn: (name: string | null) => void, name: string) => () => {
    setSelectedItem(name);

    if (name === selectedItem) {
      setSelectedItem(null);
      fn(null);
    } else {
      fn(name);
    }
  };
  const [selectedItem, setSelectedItem] = useState<string | null>(
    defaultSelectedItem
  );
  const toggleColorMode = useStore((state) => state.toggleColorMode);

  return (
    <Container>
      <div>
        <ActivityBarItem
          isSelected={selectedItem === 'files'}
          onClick={onClicked(onSidebarItemClicked, 'files')}
        >
          <div className="codicon codicon-files" />
        </ActivityBarItem>
        <ActivityBarItem
          isSelected={selectedItem === 'settings'}
          onClick={onClicked(onSidebarItemClicked, 'settings')}
        >
          <div className="codicon codicon-gear" />
        </ActivityBarItem>
      </div>
      <div>
        <ActivityBarItem onClick={() => toggleColorMode()}>
          <div className="codicon codicon-color-mode" />
        </ActivityBarItem>
      </div>
    </Container>
  );
}
