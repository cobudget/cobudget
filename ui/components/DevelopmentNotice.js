import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Button, Snackbar, IconButton } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";

export default function DevelopmentNotice() {
  const [open, setOpen] = React.useState(true);
  const intl = useIntl();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={open}
        onClose={handleClose}
        message={intl.formatMessage({
          defaultMessage:
            "Hi! This platform is under development, don't use it for anything real.. :-)",
        })}
        action={
          <React.Fragment>
            <Button
              component="a"
              color="secondary"
              size="small"
              href="https://github.com/Edgeryders-Participio/multi-dreams"
              target="_blank"
            >
              <FormattedMessage defaultMessage="Go to GitHub repository" />
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  );
}
