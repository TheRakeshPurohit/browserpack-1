import styled from 'styled-components';
import { useEffect } from 'react';
import previewManager from '@app/utils/preview-manager';
import { FILES } from '@app/templates/react';

const Container = styled.div`
  height: calc(100vh-25px);
  width: 100%;
`;

export default function BrowserPreview() {
  useEffect(() => {
    previewManager.init(FILES);

    previewManager.onReady(async () => {
      await previewManager.bundle();
      previewManager.run();
    });
  }, []);

  return <Container id="browser-preview"></Container>;
}
