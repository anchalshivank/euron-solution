import AppBar from "@mui/material/AppBar";
import { ThemeProvider } from "@mui/material/styles";
import { Link, Box } from "@mui/material";

import Toolbar from "@mui/material/Toolbar";
import { memo } from "react";
import { useSelector } from "react-redux";
import { selectFooterTheme } from "app/store/fuse/settingsSlice";
import clsx from "clsx";

function FooterLayout1(props) {
  const footerTheme = useSelector(selectFooterTheme);

  return (
    <ThemeProvider theme={footerTheme}>
      <AppBar
        id="fuse-footer"
        className={clsx("relative z-20 shadow-md", props.className)}
        color="default"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? footerTheme.palette.background.paper
              : footerTheme.palette.background.default,
        }}
      >
        <Toolbar className="min-h-48 md:min-h-64 px-8 sm:px-12 py-0 flex items-center overflow-x-auto">
          <div className="flex grow shrink-0">
            Copyright ©2024 Euron.io
          </div>
          <div className="flex grow shrink-0 px-12 justify-end">
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                typography: "body1",
                "& > :not(style) + :not(style)": {
                  ml: 2,
                },
              }}
            >
              <Link
                href="mailto:info@euron.io"
                underline="none"
                sx={{
                  color: "white !important",
                  opacity: "0.5",
                  background: "transparent !important",
                  borderBottom: "0 !important",
                }}
                target="_blank"
              >
                info@euron.io
              </Link>
              <Link
                href="https://euron.io/privacy-policy"
                underline="none"
                sx={{
                  color: "white !important",
                  opacity: "0.5",
                  background: "transparent !important",
                  borderBottom: "0 !important",
                }}
                target="_blank"
              >
                Privacy Policy
              </Link>
              <Link
                href="https://euron.io/terms-of-use"
                underline="none"
                sx={{
                  color: "white !important",
                  opacity: "0.5",
                  background: "transparent !important",
                  borderBottom: "0 !important",
                }}
                target="_blank"
              >
                Terms of Use
              </Link>
            </Box>
          </div>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default memo(FooterLayout1);
