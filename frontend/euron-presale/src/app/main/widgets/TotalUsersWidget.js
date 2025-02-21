import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { memo } from "react";
import { useSelector } from "react-redux";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { formatNumberWithCommas } from "src/app/services/utils.service.js";
import { useAccount } from "wagmi";
import { getContract, fromBigNum } from "src/app/services/web3.service";
import PresaleData from "src/abis/Presale.json";

function TotalUsersWidget() {
  const { address, isConnected } = useAccount();
  const updateFlag = useSelector((state) => state.updateFlag.value);

  const [totalUser, setTotalUser] = useState(0);

  useEffect(() => {
    const init = async () => {
      await fetchChainData();
    };
    init();
  }, [isConnected, address, updateFlag]);

  const fetchChainData = async () => {
    const presaleContract = await getContract(
      PresaleData.address,
      PresaleData.abi
    );

    let _totalUser = fromBigNum(await presaleContract.getBuyerLength(), 0);
    setTotalUser(_totalUser);
  };

  return (
    <Paper className="flex flex-col flex-auto shadow rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-8 pt-12">
        <Typography
          className="px-16 lg:text-lg mb:text-1xl font-medium tracking-tight leading-6 truncate"
        >
          {"# of Buyers"}
        </Typography>
      
      </div>
      <div className="text-center mt-20 mb-20">
        <Typography
          className="lg:text-4xl mb:text-3xl font-bold tracking-tight leading-none"
          color="primary"
        >
          {formatNumberWithCommas(totalUser)}
        </Typography>
      </div>
      <div className="text-center mt-10 mb-10"></div>
    </Paper>
  );
}

export default memo(TotalUsersWidget);
