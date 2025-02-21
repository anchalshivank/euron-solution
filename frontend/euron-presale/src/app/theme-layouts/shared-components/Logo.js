import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

const Root = styled('div')(({ theme }) => ({
  '& > .logo-icon': {
    transition: theme.transitions.create(['width', 'height'], {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
  '& > .badge': {
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
}));

function Logo() {
  return (
    <Root className="flex items-center">
      <Box display="flex" flexDirection="column" alignItems="center" width="95%">
        <img
          className="logo-icon mt-10"
          src="assets/images/logo/euron_logo.png"
          alt="logo"
          style={{ width: '100%' }}
        />
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: 'lowercase',
            marginTop: '-10px',
            alignSelf: 'flex-end',
            textAlign: 'right',
          }}
        >
          pre-sale
        </Typography>
      </Box>
    </Root>
  );
}

export default Logo;
