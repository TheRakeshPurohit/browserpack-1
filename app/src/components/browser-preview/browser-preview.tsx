import { startSandpack } from '@app/utils/utils';
import styled from 'styled-components';

const Container = styled.div`
  height: calc(100vh-25px);
  width: 100%;
`;

export default function BrowserPreview() {
  return (
    <Container id="browser-preview">
      <iframe
        height="100%"
        width="100%"
        frameBorder="0"
        title="preview"
        ref={(ref) => {
          if (ref) {
            startSandpack(ref);
          }
        }}
      ></iframe>
    </Container>
  );
}
