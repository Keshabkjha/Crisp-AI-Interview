import { forwardRef } from 'react';

const WebcamMock = forwardRef<HTMLDivElement>((_props, ref) => (
  <div data-testid="webcam" ref={ref} />
));

WebcamMock.displayName = 'WebcamMock';

export default WebcamMock;
