import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReferralWidget from "../widgets/ReferralWidget";
import { getContract } from "src/app/services/web3.service";
import PresaleData from "src/abis/Presale.json";
import { useAccount } from "wagmi";
import AccessDenied from "../widgets/AccessDenied";

function ManagerPage() {

  const { isConnected, address } = useAccount();
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(false);

  const container = {
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const init = async () => {
      if (isConnected) {
        setLoading(true);
        const isManager = await checkManager();
        setLoading(false);

        setIsManager(isManager);
      } 
    };
    init();
  }, [address, isConnected]);

  const checkManager = async () => {
    const presaleContract = await getContract(
      PresaleData.address,
      PresaleData.abi
    );
    let isManagerWhitelisted = await presaleContract.managerWhitelist(address);
    return isManagerWhitelisted;
  };

  if (!isManager) {
    return (
      <>
        <AccessDenied loading={loading}/>
      </>
    );
  } else
    return (
      <>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-32 w-full p-24 md:p-32"
          variants={container}
          initial="hidden"
          animate="show"
        >
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 w-full p-24 md:p-32"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="sm:col-span-2 lg:col-span-1 ">
          </motion.div>
          <motion.div variants={item} className="sm:col-span-2 lg:col-span-1 md:ml-[-150px] sm:ml-0">
            <ReferralWidget isManager={true} />
          </motion.div>
          <motion.div variants={item} className="sm:col-span-2 lg:col-span-1 ">
          </motion.div>
        </motion.div>
      </>
    );
}

export default ManagerPage;
