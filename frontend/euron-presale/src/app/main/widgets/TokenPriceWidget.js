import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { memo } from "react";

function TokenPriceWidget() {
  return (
    <Paper className="flex flex-col flex-auto shadow rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-8 pt-12">
        <Typography
          className="px-16 lg:text-lg mb:text-1xl font-medium tracking-tight leading-6 truncate"
        >
          {"Token Price (BEP-20)"}
        </Typography>
      
      </div>
      <div className="text-center mt-20 mb-20">
        <Typography
          className="lg:text-4xl mb:text-3xl font-bold tracking-tight leading-none"
          color="primary"
        >
          0.01 USDC
        </Typography>
      </div>
      <div className="text-center mt-10 mb-10"></div>
    </Paper>
  );
}

export default memo(TokenPriceWidget);
