import { memo, useEffect } from "react";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Alert
} from "@mui/material";

import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShareIcon from '@mui/icons-material/Share';

import { useAccount } from "wagmi";

function HelperWidget({ isManager }) {
  const theme = useTheme();
  const updateFlag = useSelector((state) => state.updateFlag.value);
  const dispatch = useDispatch();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const init = async () => {

    };
    init();
  }, [isConnected, address, updateFlag]);

  const goToRampNetwork = () => {
    window.open("https://ramp.network/buy", "_blank"); // Opens in a new tab
  }

  return (
    <Paper className="flex flex-col flex-auto p-24 shadow rounded-2xl overflow-hidden h-full">
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <Typography variant="h6" gutterBottom>
          Guide to Purchasing Tokens
        </Typography>
        <div className="mt-3 sm:mt-0 sm:ml-2"></div>
      </div>
      <div className="mt-10 mb-10">
        <hr />
      </div>
      <div className="mb-10"></div>


      {/* Step 1 */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <WalletIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" color="primary">
            Step 1: Connect Your Wallet
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Click on <Button variant="contained" color="primary" size="small">Connect Wallet</Button> to link your wallet to our platform.
        </Typography>
      </Box>
      <Divider />

      {/* Step 2 */}
      <Box sx={{ mt: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" color="primary">
            Step 2: Purchase Tokens with BEP-20 USDC
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Once your wallet is connected, select the amount of tokens to purchase using BEP-20 USDC. If you don’t have USDC, you can:
        </Typography>
        <List dense sx={{ ml: 3 }}>
          <ListItem>
            <ListItemText primary="Swap with another token in your wallet." />
          </ListItem>
          <ListItem>
            {/* <ListItemText primary={<>
							Use MoonPay to purchase USDC via credit card or bank transfer. Click the <Button variant="outlined" color="primary" size="small">Buy Crypto</Button> button to access MoonPay and complete your purchase.
						</>} /> */}

            <ListItemText primary={<>
              Use trusted platforms such as Ramp Network, Coinbase, or Crypto.com to purchase USDC via credit card or bank transfer. 
              By clicking  <Button variant="outlined" color="primary" size="small" onClick={goToRampNetwork}>Buy Crypto</Button> on our platform, you will be redirected seamlessly to Ramp Network for your convenience.
            </>} />
          </ListItem>
        </List>
      </Box>
      <Divider />

      {/* Step 3 */}
      <Box sx={{ mt: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <ShareIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" color="primary">
            Step 3: Create and Share Your Referral Link
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          Generate your unique referral link and share it to earn bonus tokens from purchases made by your referrals. Our referral program offers two reward structures:
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="white">
            Standard Referral Program
          </Typography>
          <List dense sx={{ ml: 3 }}>
            <ListItem>
              <ListItemText primary="Level 1: Earn a 7.5% bonus of tokens from your direct referrals' purchases." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Level 2: Earn a 5% bonus of tokens from purchases made by your referrals' referrals." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Level 3: Earn a 2.5% bonus from purchases made by third-level referrals." />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="white">
            Influencer Referral Program
          </Typography>
          <List dense sx={{ ml: 3 }}>
            <ListItem>
              <ListItemText primary="Level 1: Earn a 10% bonus of tokens from your direct referrals' purchases." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Level 2: Earn a 7.5% bonus of tokens from purchases made by your referrals' referrals." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Level 3: Earn a 5% bonus from purchases made by third-level referrals." />
            </ListItem>
          </List>
        </Box>

        <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Only users who have purchased tokens can create a referral link.
          </Typography>
        </Alert>
      </Box>

    </Paper>
  );
}

export default memo(HelperWidget);
