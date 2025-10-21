import React from 'react';
import { Container, Alert, Button, Typography, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Send to error tracking service (Sentry, etc.) in production
    // if (process.env.NODE_ENV === 'production') {
    //   sendToErrorTracking(error, errorInfo);
    // }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Box textAlign="center">
            <ErrorOutlineIcon
              sx={{ fontSize: 80, color: 'error.main', mb: 2 }}
            />
            <Typography variant="h4" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <pre style={{ fontSize: '0.75rem', overflow: 'auto', maxHeight: '200px' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </Alert>
            )}

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                onClick={this.handleReload}
                sx={{ mr: 2 }}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/'}
              >
                Go to Home
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
