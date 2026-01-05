import "@mui/material/styles/createPalette";

declare module "@mui/material/styles/createPalette" {
  interface TypeText {
    primaryChannel?: string;
    secondaryChannel?: string;
  }

  interface TypeBackground {
    defaultChannel?: string;
    paperChannel?: string;
  }
}
