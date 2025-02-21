import FuseScrollbars from "@fuse/core/FuseScrollbars";
import { styled } from "@mui/material/styles";
import { Box, Link } from "@mui/material";
import clsx from "clsx";
import { memo } from "react";
import NavbarToggleButton from "../../../../shared-components/NavbarToggleButton";
import UserNavbarHeader from "../../../../shared-components/UserNavbarHeader";
import Navigation from "../../../../shared-components/Navigation";

const Root = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  "& ::-webkit-scrollbar-thumb": {
    boxShadow: `inset 0 0 0 20px ${
      theme.palette.mode === "light"
        ? "rgba(0, 0, 0, 0.24)"
        : "rgba(255, 255, 255, 0.24)"
    }`,
  },
  "& ::-webkit-scrollbar-thumb:active": {
    boxShadow: `inset 0 0 0 20px ${
      theme.palette.mode === "light"
        ? "rgba(0, 0, 0, 0.37)"
        : "rgba(255, 255, 255, 0.37)"
    }`,
  },
}));

const StyledContent = styled(FuseScrollbars)(({ theme }) => ({
  overscrollBehavior: "contain",
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  backgroundRepeat: "no-repeat",
  backgroundSize: "100% 40px, 100% 10px",
  backgroundAttachment: "local, scroll",
}));

function NavbarStyle1Content(props) {
  return (
    <Root
      className={clsx(
        "flex flex-auto flex-col overflow-hidden h-full",
        props.className
      )}
    >
      <StyledContent
        className="flex flex-1 flex-col min-h-0"
        option={{ suppressScrollX: true, wheelPropagation: false }}
      >
        <UserNavbarHeader />

        <Navigation layout="vertical" />

        <div className="flex flex-0 items-center justify-center py-48 opacity-10">
          <img
            className="w-full max-w-64"
            src="assets/images/logo/logo.png"
            alt="footer logo"
          />
        </div>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            position: "fixed",
            width: "280px",
            maxWidth: "280px",
            minWidth: "280px",
            bottom: "25px",
            typography: "body1",
            "& > :not(style) + :not(style)": {
              ml: 2,
            },
          }}
        >
          {/* <Link
            href="https://twitter.com/vaultfi_io"
            sx={{
              background: "transparent !important",
              borderBottom: "0 !important",
            }}
            target="_blank"
          >
            <img
              className="w-full"
              style={{ width: "35px" }}
              src="assets/images/social-icons/facebook.svg"
              alt="footer logo"
            />
            
          </Link> */}
          <Link
            href="https://x.com/Euron_Eth?t=iNFhaBEEdU7DCXV06s1yiA&s=09"
            sx={{
              background: "transparent !important",
              borderBottom: "0 !important",
            }}
            target="_blank"
          >
            <img
              className="w-full"
              style={{ width: "35px" }}
              src="assets/images/social-icons/x.svg"
              alt="footer logo"
            />
            
          </Link>
          <Link
            href="https://www.instagram.com/euronofficialeth/profilecard/?igsh=MThhbnpjOXdyc3pndA=="
            sx={{
              background: "transparent !important",
              borderBottom: "0 !important",
            }}
            target="_blank"
          >
            <img
              className="w-full"
              style={{ width: "35px" }}
              src="assets/images/social-icons/instagram.svg"
              alt="footer logo"
            />
            
          </Link>
          <Link
            href="https://t.me/EuronCommunity/"
            sx={{
              background: "transparent !important",
              borderBottom: "0 !important",
            }}
            target="_blank"
          >
            <img
              className="w-full"
              style={{ width: "35px" }}
              src="assets/images/social-icons/telegram.svg"
              alt="footer logo"
            />
            
          </Link>
          <Link
            href="https://www.tiktok.com/@euronofficial?_t=8rOuOIqmOYS&_r=1"
            sx={{
              background: "transparent !important",
              borderBottom: "0 !important",
            }}
            target="_blank"
          >
            <img
              className="w-full"
              style={{ width: "37px" }}
              src="assets/images/social-icons/tiktok.svg"
              alt="footer logo"
            />
            
          </Link>
          
          
        </Box>
      </StyledContent>
    </Root>
  );
}

export default memo(NavbarStyle1Content);
