import React from 'react';
import styled from 'styled-components';
import VSCodeLogo from './logo.svg';

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.colors['editor.background']};
`;

export default function EmptyState() {
  return (
    <Container>
      <img
        src={VSCodeLogo}
        alt="vscode logo"
        style={{ height: '100%', width: '100%', maxWidth: '256px' }}
      />
    </Container>
  );
}
