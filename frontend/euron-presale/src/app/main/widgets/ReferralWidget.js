import { memo, useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import axios from "axios";
import { lighten, useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Typography,
  FormHelperText,
  TextField,
  Link,
} from "@mui/material";
import { CopyField } from "@eisberg-labs/mui-copy-field";
import {
  getContract,
  fromBigNum,
} from "src/app/services/web3.service";
import { useAccount } from "wagmi";
import PresaleData from "src/abis/Presale.json";
import { showMessage } from "app/store/fuse/messageSlice";
import { formatNumberWithCommas } from "src/app/services/utils.service.js";

function ReferralWidget({ isManager }) {
  const theme = useTheme();
  const updateFlag = useSelector((state) => state.updateFlag.value);
  const dispatch = useDispatch();
  const { address, isConnected } = useAccount();

  // const defaultUrl = "https://presale-euron.site/main?r=";
  // const defaultManagerUrl = "https://presale-euron.site/main?m=";
  const defaultUrl = process.env.REACT_APP_API_URL+'main?r=';
  const defaultManagerUrl = process.env.REACT_APP_API_URL+'main?r=';

  const [refUrl, setRefUrl] = useState(isManager ? defaultManagerUrl : defaultUrl);
  const [refCode, setRefCode] = useState("");
  const [isCreatedRefCode, setIsCreatedRefCode] = useState(false);

  const [refereeCount, setRefereeCount] = useState(0);

  const [managerReferralCount, setManagerReferralCount] = useState(0);
  const [managerBonusEarned, setManagerBonusEarned] = useState(0);

  const [isBuyer, setIsBuyer] = useState(true);

  // const [referralData, setReferralData] = useState([]);

  const [referrerCode, setReferrerCode] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRefCode = (event) => {
    const value = event.target.value;
    if (validateInput(value) === true) {
      setRefCode(value);
      setRefUrl(isManager ? defaultManagerUrl + value : defaultUrl + value);
    }
  };

  useEffect(() => {
    const init = async () => {

      const params = new URLSearchParams(window.location.search);
      const refCode = params.get("r");

      if (refCode){
        setReferrerCode(refCode);
        setShowPopup(true);
      }

      if (isConnected) {
        setIsCreatedRefCode(false);
        getReferralCodeIfExsits(address);
        await fetchChainData();
      }
    };
    init();
  }, [isConnected, address, updateFlag]);

  const claimReferral = () => {
    setLoading(true);
  
    // Construct the new API URL
    const claimUrl = `${process.env.REACT_APP_REFERRAL_CLAIMING_SERVICE}claim/${referrerCode}`;
  
    axios.post(claimUrl)
      .then((response) => {
        dispatch(showMessage({ message: "Referral claimed successfully!", variant: "success" }));
        setShowPopup(false);
      })
      .catch((error) => {
        dispatch(showMessage({ message: "Error claiming referral!", variant: error.response.data.error}));
      })
      .finally(() => {
        setLoading(false);
        setShowPopup(false);
      });
  };
  

  const getReferralCodeIfExsits = (address) => {

    const apiURL = isManager ? process.env.REACT_APP_REFERRAL_QUERY_SERVICE + "manager/address/" + address : process.env.REACT_APP_REFERRAL_QUERY_SERVICE + "address/" + address;
    axios
      .get(apiURL)
      .then((response) => {
        if (response.status == 200) {
          const ref_code = response.data.data.ref_code;
          setRefCode(ref_code);
          setRefUrl(isManager ? defaultManagerUrl + ref_code : defaultUrl + ref_code);
          setIsCreatedRefCode(true);
        } else {
          setRefUrl(isManager ? defaultManagerUrl : defaultUrl);
          setRefCode("");
          setIsCreatedRefCode(false);
        }
      })
      .catch((error) => {
        dispatch(
          showMessage({
            message: "DB Connection Error!",
            variant: "warning",
            anchorOrigin: {
              vertical: "top",
              horizontal: "right",
            },
          })
        );
      });
  };

  const fetchChainData = async () => {
    // const presaleContract = await getContract(
    //   PresaleData.address,
    //   PresaleData.abi
    // );

    // let refereeCount = await presaleContract.getReferreeCount(address);
    // setRefereeCount(fromBigNum(refereeCount, 0));

    // let isBuyer = await presaleContract.isTokenBuyer(address);
    // setIsBuyer(isBuyer);

    // if (isManager) {

    //   console.log("isManager",  isManager);
    //   let managerReferralCount = await presaleContract.managerRefereeCount(address);
    //   setManagerReferralCount(fromBigNum(managerReferralCount, 0));

    //   let managerBonusEarned = await presaleContract.managerBonusRequested(address);
    //   setManagerBonusEarned(fromBigNum(managerBonusEarned));
    // }
    const presaleContract = await getContract(
      PresaleData.address,
      PresaleData.abi
    );

    let refereeCount = await presaleContract.getReferreeCount(address);
    setRefereeCount(fromBigNum(refereeCount, 0));

    let isBuyer = await presaleContract.isTokenBuyer(address);
    setIsBuyer(true);

    if (isManager) {

      let managerReferralCount = await presaleContract.managerRefereeCount(address);
      setManagerReferralCount(fromBigNum(managerReferralCount, 0));

      let managerBonusEarned = await presaleContract.managerBonusRequested(address);
      setManagerBonusEarned(fromBigNum(managerBonusEarned));
    }
  };

  const handleCreateRefCode = async () => {
    if (refCode.length == 0) {
      dispatch(
        showMessage({
          message: "Please enter the referral code.",
          variant: "warning",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        })
      );
      return;
    }
    if (!isValidRefCode(refCode)) {
      dispatch(
        showMessage({
          message: "Referral code should be validated!",
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        })
      );
      return;
    }

    storeReferralDataToDB({ address: address, ref_code: refCode, is_manager_code: isManager });
  };

  const storeReferralDataToDB = async (formData) => {

    const apiURL = (isManager ? process.env.REACT_APP_REFERRAL_GENERATION_SERVICE + "/manager" : process.env.REACT_APP_REFERRAL_GENERATION_SERVICE) + "create_ref";
    setLoading(true);
    await axios
      .post(apiURL, formData)
      .then((response) => {
        if (response.status == 201) {
          setIsCreatedRefCode(true);
          dispatch(
            showMessage({
              message: isManager ? "Your manager code was created successfully!" : "Your referral code was created successfully!",
              variant: "success",
              anchorOrigin: {
                vertical: "top",
                horizontal: "right",
              },
            })
          );
          setLoading(false);
          setRefCode(response.data.ref_code);
          setRefUrl(isManager ? defaultManagerUrl + response.data.ref_code : defaultUrl + response.data.ref_code);
          setIsCreatedRefCode(true);
          return;
        }
        if (response.status == 204) {
          dispatch(
            showMessage({
              message: isManager ? "The manager code exists." : "The referral code exists.",
              variant: "error",
              anchorOrigin: {
                vertical: "top",
                horizontal: "right",
              },
            })
          );

          setLoading(false);
          return;
        }
      })
      .catch((error) => {
        dispatch(
          showMessage({
            message: "DB Connection Error!\n" + error,
            variant: "error",
            anchorOrigin: {
              vertical: "top",
              horizontal: "right",
            },
          })
        );
        setLoading(false);
        return;
      });
    setLoading(false);
  };

  const isValidRefCode = (refCode) => {
    // Regular expression to match the conditions:
    // - ^[A-Za-z]: starts with a letter
    // - (?=.*\d)(?=.*[A-Za-z]): contains at least one letter and one number
    // - [A-Za-z\d]{5,}$: at least 5 characters long, only letters and numbers
    const regex = /^[A-Za-z](?=.*\d)(?=.*[A-Za-z])[A-Za-z\d]{4,}$/;

    // Test the string against the regular expression
    return regex.test(refCode);
  };

  const validateInput = (input) => {
    if (input === "") {
      return true;
    } else if (input.length >= 1) {
      // Regular expression to match only letters and numbers
      const regex = /^[a-zA-Z0-9]+$/;
      // Test the input against the regex
      return regex.test(input);
    }
  };

  const handleCopy = () => {
    dispatch(
      showMessage({
        message: "Copied to clipboard!",
        variant: "success",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      })
    );
  };

  return (
    <Paper className="flex flex-col flex-auto p-24 shadow rounded-2xl overflow-hidden h-full">
{showPopup && (
  <div 
    style={{
      position: "fixed",
      top: "200px",
      left: "70%",
      transform: "translateX(-50%)",
      background: "#4f46e5",
      color: "white",
      padding: "10px 20px",
      borderRadius: "8px",
      boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
      zIndex: 1000
    }}
  >
    <p>You have been referred by <strong>{referrerCode}</strong></p>
    <button 
      style={{
        background: "white",
        color: "#4f46e5",
        padding: "5px 10px",
        borderRadius: "5px",
        cursor: "pointer",
        marginLeft: "10px"
      }}
      onClick={claimReferral}
      disabled={loading}
    >
      {loading ? "Claiming..." : "Claim Referral"}
    </button>
  </div>
)}


      {/* Existing Referral Code Input */}
      <TextField label="Referral Code" size="small" value={refCode} disabled={true} />
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <Typography className="text-lg font-medium tracking-tight leading-6 truncate">
          {isManager ? "Create Manager Link" : "Create Referral Link"}
        </Typography>
        <div className="mt-3 sm:mt-0 sm:ml-2"></div>
      </div>
      <div className="mt-10 mb-10">
        <hr />
      </div>
      <div className="mb-10"></div>

      <div className="flex flex-col flex-auto mt-10 mb-10">
        <TextField
          label={isManager ? "Manager Code" : "Referral Code"}
          size="small"
          value={refCode}
          disabled={
            !isConnected 
            // || !isBuyer 
            // || isCreatedRefCode
          }
          onChange={(e) => handleRefCode(e)}
        />

        <FormHelperText id="component-helper-text">
          {isManager ? "Manager code should be start with a letter and be at least 5" : "Referral code should be start with a letter and be at least 5"} characters with a mix of numbers and letters, NO symbols
        </FormHelperText>
      </div>
      <div className="flex flex-col flex-auto mt-20 mb-20">
        {!isConnected ? (
          <div className="flex flex-col flex-auto mt-10 mb-10 items-center">
            <Typography>Please connect your wallet!</Typography>
          </div>
        ) : !isBuyer ? (
          <div className="flex flex-col flex-auto mt-10 mb-10 items-center">
            <Typography>
              {isManager ? "Manager code creation valid only after purchase!" : "Referral code creation valid only after purchase!"}
            </Typography>
          </div>
        ) : (
          <CopyField
            disabled={true}
            label={isManager ? "Manager link" : "Referral link"}
            value={refUrl}
            size="small"
            onCopySuccess={handleCopy} // This triggers when the copy button is clicked
          />
        )}
      </div>
      {isConnected && isBuyer ? (

        <>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              bottom: "25px",
              typography: "body1",
              "& > :not(style) + :not(style)": {
                ml: 2,
              },
            }}
            className="gap-15 mt-20"
          >
            <Typography className="mt-5">Share on</Typography>
            {/* <Link
              href={""
                // "https://twitter.com/intent/tweet?text=%F0%9F%8E%89+I+just+participated+in+%40vaultfi_io+presale%21+%F0%9F%8E%89%0D%0A%0D%0AUse+my+link+and+get+5%25+bonus+tokens%21+%0D%0Ahttps%3A%2F%2Fvaultfi-presale-web.vercel.app%2Fpresale%3Fr%3D$" +
                // refCode +
                // "%0D%0A%0D%0APre-sale+will+end+once+all+tokens+are+sold-out.+Don%27t+miss+out%21%0D%0A%0D%0A%40vaultfi_io+is+a+fully+audited+DeFi+protocol+with+APY+backed+by+revenue+generating+businesses+led+by+%40coinrockcap%0D%0A%0D%0A%23VaultFi+%23DeFi+%23CoinRock+%23Presale"
              }
              sx={{
                background: "transparent !important",
                borderBottom: "0 !important",
              }}
              target="_blank"
            >
              <img
                className="w-full"
                style={{ width: "28px" }}
                src="assets/images/social-icons/facebook.svg"
                alt="footer logo"
              />
            </Link> */}
            <Link
              href={"https://x.com/Euron_Eth?t=iNFhaBEEdU7DCXV06s1yiA&s=09"
                // "https://twitter.com/intent/tweet?text=%F0%9F%8E%89+I+just+participated+in+%40vaultfi_io+presale%21+%F0%9F%8E%89%0D%0A%0D%0AUse+my+link+and+get+5%25+bonus+tokens%21+%0D%0Ahttps%3A%2F%2Fvaultfi-presale-web.vercel.app%2Fpresale%3Fr%3D$" +
                // refCode +
                // "%0D%0A%0D%0APre-sale+will+end+once+all+tokens+are+sold-out.+Don%27t+miss+out%21%0D%0A%0D%0A%40vaultfi_io+is+a+fully+audited+DeFi+protocol+with+APY+backed+by+revenue+generating+businesses+led+by+%40coinrockcap%0D%0A%0D%0A%23VaultFi+%23DeFi+%23CoinRock+%23Presale"
              }
              sx={{
                background: "transparent !important",
                borderBottom: "0 !important",
              }}
              target="_blank"
            >
              <img
                className="w-full"
                style={{ width: "32px" }}
                src="assets/images/social-icons/x.svg"
                alt="footer logo"
              />
            </Link>

            <Link
              href={"https://www.instagram.com/euronofficialeth/profilecard/?igsh=MThhbnpjOXdyc3pndA=="
                // "https://twitter.com/intent/tweet?text=%F0%9F%8E%89+I+just+participated+in+%40vaultfi_io+presale%21+%F0%9F%8E%89%0D%0A%0D%0AUse+my+link+and+get+5%25+bonus+tokens%21+%0D%0Ahttps%3A%2F%2Fvaultfi-presale-web.vercel.app%2Fpresale%3Fr%3D$" +
                // refCode +
                // "%0D%0A%0D%0APre-sale+will+end+once+all+tokens+are+sold-out.+Don%27t+miss+out%21%0D%0A%0D%0A%40vaultfi_io+is+a+fully+audited+DeFi+protocol+with+APY+backed+by+revenue+generating+businesses+led+by+%40coinrockcap%0D%0A%0D%0A%23VaultFi+%23DeFi+%23CoinRock+%23Presale"
              }
              sx={{
                background: "transparent !important",
                borderBottom: "0 !important",
              }}
              target="_blank"
            >
              <img
                className="w-full"
                style={{ width: "30px" }}
                src="assets/images/social-icons/instagram.svg"
                alt="footer logo"
              />
            </Link>
            <Link
              href={"https://t.me/EuronGroupDiscussion/"
                // "https://t.me/share/url?url=https%3A%2F%2Fvaultfi-presale-web.vercel.app%2Fpresale%3Fr%3D$" +
                // refCode +
                // "&text=%F0%9F%8E%89+I+just+participated+in+%40vaultfi_io+presale%21+%F0%9F%8E%89%0D%0A%0D%0AUse+my+link+and+get+5%25+bonus+tokens%21+%0D%0A"
              }
              sx={{
                background: "transparent !important",
                borderBottom: "0 !important",
              }}
              target="_blank"
            >
              <img
                className="w-full"
                style={{ width: "28px" }}
                src="assets/images/social-icons/telegram.svg"
                alt="footer logo"
              />
            </Link>

            <Link
              href={"https://www.tiktok.com/@euronofficial?_t=8rOuOIqmOYS&_r=1"
                // "https://t.me/share/url?url=https%3A%2F%2Fvaultfi-presale-web.vercel.app%2Fpresale%3Fr%3D$" +
                // refCode +
                // "&text=%F0%9F%8E%89+I+just+participated+in+%40vaultfi_io+presale%21+%F0%9F%8E%89%0D%0A%0D%0AUse+my+link+and+get+5%25+bonus+tokens%21+%0D%0A"
              }
              sx={{
                background: "transparent !important",
                borderBottom: "0 !important",
              }}
              target="_blank"
            >
              <img
                className="w-full"
                style={{ width: "30px" }}
                src="assets/images/social-icons/tiktok.svg"
                alt="footer logo"
              />
            </Link>
            <Link
              href={"https://www.whatsapp.com/"
                // "https://t.me/share/url?url=https%3A%2F%2Fvaultfi-presale-web.vercel.app%2Fpresale%3Fr%3D$" +
                // refCode +
                // "&text=%F0%9F%8E%89+I+just+participated+in+%40vaultfi_io+presale%21+%F0%9F%8E%89%0D%0A%0D%0AUse+my+link+and+get+5%25+bonus+tokens%21+%0D%0A"
              }
              sx={{
                background: "transparent !important",
                borderBottom: "0 !important",
              }}
              target="_blank"
            >
              <img
                className="w-full"
                style={{ width: "28px" }}
                src="assets/images/social-icons/whatsapp.svg"
                alt="footer logo"
              />
            </Link>
          </Box>
        </>

      ) : (
        ""
      )}
      <div className="flex flex-col flex-auto mt-5"></div>

      <div className="flex flex-col flex-auto mt-5 mb-10">
        <LoadingButton
          variant="contained"
          color="primary"
          disabled={
            !isConnected 
            // || !isBuyer 
            // || isCreatedRefCode
          }
          loading={loading}
          loadingPosition="end"
          onClick={handleCreateRefCode}
        >
          {isManager ? "Create Manager Code" : "Create Referral Code"}
        </LoadingButton>
        <div className="flex flex-col flex-auto mt-10"></div>
      </div>

      {
        isManager ? (
          <Box
            sx={{
              backgroundColor: (_theme) =>
                _theme.palette.mode === "light"
                  ? lighten(theme.palette.background.default, 0.4)
                  : lighten(theme.palette.background.default, 0.02),
            }}
            className="grid grid-cols-2 border-t divide-x -m-24 mt-16"
          >
            <div className="flex flex-col items-center justify-center p-24 sm:p-32">
              <div className="text-4xl font-semibold leading-none tracking-tighter">
                {formatNumberWithCommas(managerBonusEarned)}
              </div>
              <Typography className="mt-4 text-center text-secondary">
                Bonus earned
              </Typography>
            </div>
            <div className="flex flex-col items-center justify-center p-6 sm:p-8">
              <div className="text-4xl font-semibold leading-none tracking-tighter">
                {formatNumberWithCommas(managerReferralCount)}
              </div>
              <Typography className="mt-4 text-center text-secondary">
                Referrals
              </Typography>
            </div>
          </Box>

        ) : (
          <Box
            sx={{
              backgroundColor: (_theme) =>
                _theme.palette.mode === "light"
                  ? lighten(theme.palette.background.default, 0.4)
                  : lighten(theme.palette.background.default, 0.02),
            }}
            className="grid grid-cols-1 border-t divide-x -m-24 mt-10"
          >

            <div className="flex flex-col items-center justify-center p-24 sm:p-32">
              <div className="text-5xl font-semibold leading-none tracking-tighter">
                {formatNumberWithCommas(refereeCount)}
              </div>
              <Typography className="mt-4 text-center text-secondary">
                Referrals
              </Typography>
            </div>
          </Box>
        )
      }

    </Paper>
  );
}

export default memo(ReferralWidget);
