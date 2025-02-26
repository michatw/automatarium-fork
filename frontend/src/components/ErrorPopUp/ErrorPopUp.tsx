import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { alertHeadingStyle, alertStyle } from './ErrorPopUpStyle';

interface ErrorPopUpProps {
  isVisible: boolean;
  setVisibility: (string, boolean) => void;
  errorMessage: string;
}

// The error pop-up component is always present but it's visibility is toggled in case of an error.
const ErrorPopUp: React.FC<ErrorPopUpProps> = ({isVisible, setVisibility, errorMessage}) => {

  if (!isVisible) {
    return null;
  }

  return (
    <div>
      <Alert variant="danger" style={alertStyle}>
        <Alert.Heading style={alertHeadingStyle}>Oh no! You got an error!</Alert.Heading>
        <p>
          {errorMessage}
        </p>
        <div style={{ position: 'absolute', top: '0px', right: '10px' }}>
          <Button onClick={() => setVisibility("", false)} variant="light" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              &times;
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default ErrorPopUp;
