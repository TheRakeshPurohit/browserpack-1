import styled from 'styled-components';
import Browserpack from '@client';
import { FILES } from '../../templates/react';
import { useEffect } from 'react';

const Container = styled.div`
  height: calc(100vh-25px);
  width: 100%;
`;

export default function BrowserPreview() {
  useEffect(() => {
    const manager = new Browserpack('#browser-preview', FILES);

    manager.onReady(async () => {
      await manager.bundle();
      manager.run();
    });
  });

  return <Container id="browser-preview"></Container>;
}
