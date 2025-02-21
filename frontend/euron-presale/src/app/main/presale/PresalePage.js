import { motion } from "framer-motion";
import MaxAllocationWidget from "../widgets/MaxAllocationWidget";
import TotalUsersWidget from "../widgets/TotalUsersWidget";
import TokenPriceWidget from "../widgets/TokenPriceWidget";
import ReferralWidget from "../widgets/ReferralWidget";
import HelperWidget from "../widgets/HelperWidget";
import TokenRequestWidget from "../widgets/TokenRequestWidget";


function PresalePage() {
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

  return (
    <>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-32 w-full p-24 md:p-32"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="sm:col-span-2 lg:col-span-1 ">
          <MaxAllocationWidget />
        </motion.div>

        <motion.div variants={item} className="sm:col-span-2 lg:col-span-1 ">
          <TokenPriceWidget />
        </motion.div>

        <motion.div variants={item} className="sm:col-span-2 lg:col-span-1 ">
          <TotalUsersWidget />
        </motion.div>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-32 w-full p-24 md:p-32"
        variants={container}
        initial="hidden"
        animate="show"
      >
      
        <motion.div variants={item} className="sm:col-span-2 lg:col-span-2 ">
          <TokenRequestWidget />
        </motion.div>
        <motion.div variants={item} className="sm:col-span-2 lg:col-span-1 ">
          <ReferralWidget isManager={false}/>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-32 w-full p-24 md:p-32"
        variants={container}
        initial="hidden"
        animate="show"
      >
         <motion.div variants={item} className="sm:col-span-3 lg:col-span-3 ">
          <HelperWidget />
        </motion.div>

      </motion.div>
    </>
  );
}

export default PresalePage;
