import Paper from "@mui/material/Paper";
import { lighten, useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  FormHelperText,
  LinearProgress,
  TextField,
  Button,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateStatus } from "src/app/store/updateFlagSlice";

import FuseCountdown from "@fuse/core/FuseCountdown";
import LoadingButton from "@mui/lab/LoadingButton";
import axios from "axios";
import {
  getContract,
  getEtherSigner,
  fromBigNum,
  toBigNum,
} from "src/app/services/web3.service";
import { useAccount } from "wagmi";
import { showMessage } from "app/store/fuse/messageSlice";
import {
  formatNumberWithCommas,
  convertSecondsToDate,
} from "src/app/services/utils.service.js";
import PresaleData from "src/abis/Presale.json";
import USDTData from "src/abis/Usdt.json";
import { use } from "i18next";

const LinearProgressWithLabel = ({ value }) => {
  return (
    <Box position="relative" display="inline-flex" width="100%">
      <LinearProgress
        variant="determinate"
        value={value}
        style={{ width: "100%", height: "35px" }}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="body2" sx={{ color: "white" }}>{`${parseFloat(value).toFixed(1)}% sold`}</Typography>
      </Box>
    </Box>
  );
};

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

function TokenRequestWidget(props) {
  const theme = useTheme();
  const query = useQuery();

  const updateFlag = useSelector((state) => state.updateFlag.value);
  const dispatch = useDispatch();

  const ZERO_ADDR = "0x0000000000000000000000000000000000000000";
  const MIN_TOKEN_VALUE = 10000;
  const MAX_TOKEN_VALUE = 12500000;
  const TOTAL_MAX_ALLOCATION = 300000000;
  const TOKEN_PRICE = 0.01;
  const STEP = 10000;

  const { address, isConnected } = useAccount();

  const [maxAllocation] = useState(MAX_TOKEN_VALUE);

  const [refCode, setRefCode] = useState("");
  const [referrer, setReferrer] = useState(ZERO_ADDR);

  const [inputTokens, setInputTokens] = useState(MIN_TOKEN_VALUE);
  const [usdtForTokens, setUsdtForTokens] = useState(
    MIN_TOKEN_VALUE * TOKEN_PRICE
  );

  const [isPresaleRound, setIsPresaleRound] = useState(false);
  const [presaleTokenLimited, setPresaleTokenLimited] = useState(0);
  const [presaleEndAt, setPresaleEndAt] = useState(null);

  const [totalTokensRequested, setTotalTokensRequested] = useState(0);

  const [tokenRequested, setTokenRequested] = useState(0);
  const [bonusRequested, setBonusRequested] = useState(0);

  const [loading, setLoading] = useState(false);

  const [isEnded, setIsEnded] = useState(false);

  const [isManagerLink, setIsManagerLink] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      await fetchChainDataWithoutConnect();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const init = async () => {
      let refCodeParam = query.get("r");
      let managerCodeParam = query.get("m");

      if (refCodeParam == null && managerCodeParam != null) {
        setRefCode(managerCodeParam);
      } else if (refCodeParam != null && managerCodeParam == null) {
        setRefCode(refCodeParam);
      }

      if (isConnected) {
        if (refCodeParam != null && managerCodeParam == null) {
          getReferrerAddr(refCodeParam, false);
          setIsManagerLink(false);
        } else if (managerCodeParam != null && refCodeParam == null) {
          getReferrerAddr(managerCodeParam, true);
          setIsManagerLink(true);
        }
        await fetchChainStatus();

      }

    };
    init();
  }, [isConnected, address, updateFlag]);

  const getReferrerAddr = (code, isManager) => {
    const apiURL = isManager ? process.env.REACT_APP_API_URL + "/manager/" + code : process.env.REACT_APP_API_URL + "/referrer/" + code;
    axios
      .get(apiURL)
      .then((response) => {
        console.log("response", response);
        if (response.status != 200) {
          dispatch(
            showMessage({
              message: "InVailed Referral Code!",
              variant: "error",
              anchorOrigin: {
                vertical: "top",
                horizontal: "right",
              },
            })
          );
          return;
        } else {
          if (address === response.data.address) {
            dispatch(
              showMessage({
                message:
                  "Error: You are using your own referral code!\n We will ignore this!",
                variant: "error",
                anchorOrigin: {
                  vertical: "top",
                  horizontal: "right",
                },
              })
            );
          } else {
            setReferrer(response.data.address);
          }
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

  const fetchChainDataWithoutConnect = async () => {
    // const signer = await getEtherSigner();
    const presaleContract = await getContract(
      PresaleData.address,
      PresaleData.abi
    );

    // getting PresaleRound info
    let isPresaleRound = await presaleContract.checkPresaleRound();
    setIsPresaleRound(isPresaleRound);

    if (isPresaleRound) {
      let duration = await presaleContract.duration();
      let startedAt = await presaleContract.startedAt();
      setPresaleEndAt(convertSecondsToDate(fromBigNum(startedAt, 0) + fromBigNum(duration, 0)));
      let tokenLimited = fromBigNum(await presaleContract.accountBuyLimit());
      setPresaleTokenLimited(tokenLimited);
    }
  }

  const fetchChainStatus = async () => {
    // const signer = await getEtherSigner();

    // const signer = await getEtherSigner();
    const presaleContract = await getContract(
      PresaleData.address,
      PresaleData.abi
    );

    let tokenRequested = fromBigNum(await presaleContract.getTokensRequestedOfWallet(address));
    setTokenRequested(tokenRequested);

    let bonusRequested = fromBigNum(await presaleContract.getReferralBonusRequested(address));
    setBonusRequested(bonusRequested);

    let totalTokensRequested = fromBigNum(await presaleContract.totalTokensRequested());
    setTotalTokensRequested(totalTokensRequested);

    if (totalTokensRequested >= TOTAL_MAX_ALLOCATION) {
      setIsEnded(true);
    }
  };

  const incrementValue = () => {
    const roundedInputTokens = Math.round(inputTokens / STEP) * STEP;
    const increaseValue = Math.min(roundedInputTokens + STEP, MAX_TOKEN_VALUE);
    setInputTokens(Math.min(roundedInputTokens + STEP, MAX_TOKEN_VALUE));
    setUsdtForTokens(
      Math.min(calculateUSDT(increaseValue), MAX_TOKEN_VALUE * TOKEN_PRICE)
    );
  };

  // Handler to decrement the value
  const decrementValue = () => {
    const roundedInputTokens = Math.round(inputTokens / STEP) * STEP;
    const decreaseValue = Math.max(roundedInputTokens - STEP, MIN_TOKEN_VALUE);
    setInputTokens(Math.max(roundedInputTokens - STEP, MIN_TOKEN_VALUE));
    setUsdtForTokens(
      Math.max(calculateUSDT(decreaseValue), MIN_TOKEN_VALUE * TOKEN_PRICE)
    );
  };

  const handleInputTokens = (event) => {
    const value = event.target.value;
    if (
      /^\d*$/.test(value) &&
      (parseInt(value, 10) >= MIN_TOKEN_VALUE ||
        parseInt(value, 10) <= maxAllocation)
    ) {
      setInputTokens(value);
      setUsdtForTokens(calculateUSDT(value));
    }
  };

  const handleDepositUSDT = async () => {

    if (!isConnected) {
      return;
    }

    if (Math.round(inputTokens / STEP) != inputTokens / STEP) {
      dispatch(
        showMessage({
          message: "Error: Token amount should be in increments of 10k!",
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        })
      );
      setInputTokens(Math.round(inputTokens / STEP) * STEP);
      return;
    }
    const signer = await getEtherSigner();
    const presaleContract = await getContract(
      PresaleData.address,
      PresaleData.abi,
      signer
    );

    let usdt = calculateUSDT(parseInt(inputTokens));

    if(parseFloat(usdt) < 100) {
      dispatch(
        showMessage({
          message: "Error: Token purchase amount should be greater than 100 USDC!",
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        })
      );
      return;
    }

    if (isPresaleRound) {
      if (parseInt(inputTokens) + parseInt(tokenRequested) > presaleTokenLimited) {
        dispatch(
          showMessage({
            message: "Error: Pre-sale allocation reached!",
            variant: "error",
            anchorOrigin: {
              vertical: "top",
              horizontal: "right",
            },
          })
        );
        return;
      }
    }

    // if (totalTokensRequested >= TOTAL_MAX_ALLOCATION) {
    //   dispatch(
    //     showMessage({
    //       message: "Error: Presale sold out",
    //       variant: "error",
    //       anchorOrigin: {
    //         vertical: "top",
    //         horizontal: "right",
    //       },
    //     })
    //   );
    //   return;
    // }

    // if (totalTokensRequested + parseInt(inputTokens) > TOTAL_MAX_ALLOCATION) {
    //   dispatch(
    //     showMessage({
    //       message: "Error: Presale allocation is almost sold out. Remaining: " + (TOTAL_MAX_ALLOCATION - totalTokensRequested),
    //       variant: "error",
    //       anchorOrigin: {
    //         vertical: "top",
    //         horizontal: "right",
    //       },
    //     })
    //   );
    //   return;
    // }

    const usdtContract = await getContract(
      USDTData.address,
      USDTData.abi,
      signer
    );

    setLoading(true);
    console.log("usdt", usdt);

    
    try {
      console.log("Before approval transaction...");
      let tx = await usdtContract.approve(PresaleData.address, toBigNum(usdt));
      await tx.wait();
      console.log("After approval transaction...");

      const allowance = await usdtContract.allowance(address, PresaleData.address);
      console.log("Allowance:", fromBigNum(allowance));

      try {
        let tx = await presaleContract.deposit(
          toBigNum(usdt),
          referrer,
          refCode,
          isManagerLink
        );
        await tx.wait();
        console.log("Deposit transaction completed.");

        dispatch(
          showMessage({
            message: "You deposited successfully!",
            variant: "success",
            anchorOrigin: {
              vertical: "top",
              horizontal: "right",
            },
          })
        );
        dispatch(updateStatus());
      } catch (err) {
        console.log(err);
        dispatch(
          showMessage({
            message: err.reason,
            variant: "error",
            anchorOrigin: {
              vertical: "top",
              horizontal: "right",
            },
          })
        );
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      dispatch(
        showMessage({
          message: err.reason,
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        })
      );
    }
    setLoading(false);
  };

  const calculateRateOfProgressBar = () => {
    let rate = ((totalTokensRequested / TOTAL_MAX_ALLOCATION) * 100).toFixed(1);
    return rate;
  };

  const calculateUSDT = (tokens) => {
    return (TOKEN_PRICE * tokens).toFixed(2);
  };

  return (
    <Paper className="flex flex-col flex-auto p-24 shadow rounded-2xl overflow-hidden h-full">
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <div className="mt-3 sm:mt-0 sm:ml-2">
          <Typography className="text-lg font-medium tracking-tight leading-6 truncate">
            {isPresaleRound ? (isConnected ? "Presale Started" : "Kindly connect your wallet to the BNB Smart Chain") : (isConnected ? "Presale has not started" : "Kindly connect your wallet to the BNB Smart Chain")}
          </Typography>
        </div>
      </div>

      <div className="mt-10 mb-10">
        <hr></hr>
      </div>

      <div className="flex flex-col flex-auto mt-10 items-center">
        <Typography>
          {isEnded && "Presale is over!"}
          {!isEnded && isPresaleRound && "Time left until presale ends"}
        </Typography>
      </div>

      <div className="flex flex-col items-center mt-5 mb-5">
        {!isEnded && isPresaleRound &&
          (presaleEndAt ? (
            <FuseCountdown endDate={presaleEndAt} />
          ) : (
            isPresaleRound && (
              <Typography className="mt-10 mb-10">Loading...</Typography>
            )
          ))}

        {!isPresaleRound && <FuseCountdown endDate={"0"} />}
      </div>

      <div className="flex flex-col flex-auto mt-5"></div>

      <Box sx={{ width: "100%" }}>
        <LinearProgressWithLabel value={calculateRateOfProgressBar()} />
      </Box>

      <div className="flex flex-col flex-auto mt-20 mb-20"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-10 gap-24">
        <div className=" flex flex-col flex-auto sm:col-span-2 md:col-span-4 lg:col-span-3">
          <Box display="flex" alignItems="left" justifyContent="left" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={decrementValue}
              disabled={!isConnected || !isPresaleRound || isEnded}
            >
              -
            </Button>
            <div className="flex flex-col flex-auto">
              <TextField
                label={"Token amount"}
                value={inputTokens}
                onChange={handleInputTokens}
                variant="outlined"
                size="small"
                disabled={!isConnected || !isPresaleRound || isEnded}
              />
              <FormHelperText
                id="component-helper-text"
                sx={{ textAlign: "left" }}
              >
                Payable: {formatNumberWithCommas(usdtForTokens)} USDC (BEP-20)
              </FormHelperText>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={incrementValue}
              disabled={!isConnected || !isPresaleRound || isEnded}
            >
              +
            </Button>
          </Box>
        </div>

        <div className="flex flex-col flex-auto sm:col-span-2 md:col-span-4 lg:col-span-1">
          <LoadingButton
            variant="contained"
            color="primary"
            loading={loading}
            loadingPosition="end"
            onClick={handleDepositUSDT}
            disabled={!isConnected || !isPresaleRound || isEnded}
          >
            Enter
          </LoadingButton>
        </div>
      </div>

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
            {formatNumberWithCommas(tokenRequested)}
          </div>
          <Typography className="mt-4 text-center text-secondary">
            Tokens purchased
          </Typography>
        </div>
        <div className="flex flex-col items-center justify-center p-6 sm:p-8">
          <div className="text-4xl font-semibold leading-none tracking-tighter">
            {formatNumberWithCommas(bonusRequested)}
          </div>
          <Typography className="mt-4 text-center text-secondary">
            Bonus earned
          </Typography>
        </div>
      </Box>
    </Paper>
  );
}

export default memo(TokenRequestWidget);
