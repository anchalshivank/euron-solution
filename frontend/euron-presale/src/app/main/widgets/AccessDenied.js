import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate } from 'react-router-dom';
import { useAccount } from "wagmi";

const AccessDenied = ({ loading }) => {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        {loading ? <Typography variant="h5" color="primary" gutterBottom>
          Loading...
        </Typography> :
          <>
            <Box display="flex" justifyContent="center" mb={2}>
              <BlockIcon sx={{ fontSize: 50, color: 'error.main' }} />
            </Box>
            <Typography variant="h4" color="error" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {isConnected ? "You do not have the necessary permissions to generate a manager link." : "Please connect your wallet to generate a manager link."}
              <br /> Please contact an administrator if you believe this is an error.
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="large"
              sx={{ mt: 3 }}
              onClick={() => {
                // Add redirect logic here
                navigate('/presale');
              }}
            >
              Return to Presale
            </Button>
          </>}
      </Paper>
    </Container>
  );
}

export default AccessDenied;
