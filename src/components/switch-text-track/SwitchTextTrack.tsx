import Switch, { switchClasses } from "@mui/material/Switch";
import { styled } from "@mui/material/styles";

interface TextTrackSwitchProps {
  uncheckedText: string;
  checkedText: string;
}

const SwitchTextTrack = styled(Switch, {
  shouldForwardProp: (prop) =>
    prop !== "uncheckedText" && prop !== "checkedText",
})<TextTrackSwitchProps>(({ uncheckedText, checkedText }) => ({
  width: 150,
  height: 48,
  padding: 8,

  [`& .${switchClasses.switchBase}`]: {
    padding: 11,
    color: "#ff6a00",
    transition: "transform 0.4s ease, color 0.3s ease",
    [`&.${switchClasses.checked}`]: {
      color: "#185a9d",
      transform: "translateX(100px)",
      "&:hover": {
        backgroundColor: "rgba(24,90,257,0.08)",
      },
      [`& + .${switchClasses.track}`]: {
        background:
          "linear-gradient(260deg,rgba(57,27,15,1) 23%, rgba(122,63,38,1) 57%, rgba(179,108,44,1) 87%)",
        "&:before": { opacity: 1 },
        "&:after": { opacity: 0 },
      },
    },
  },

  [`& .${switchClasses.thumb}`]: {
    width: 26,
    height: 26,
    backgroundColor: "#fff",
  },

  [`& .${switchClasses.track}`]: {
    background:
      "linear-gradient(80deg,rgba(30,32,77,1) 23%, rgba(47,52,158,1) 57%, rgba(50,70,209,1) 87%)",
    opacity: "1 !important",
    borderRadius: 20,
    position: "relative",
    transition: "background 0.4s ease",
    "&:before, &:after": {
      display: "inline-block",
      position: "absolute",
      top: "50%",
      width: "50%",
      transform: "translateY(-50%)",
      color: "#fff",
      textAlign: "center",
      fontSize: "0.95rem",
      fontWeight: 600,
      transition: "opacity 0.25s ease",
    },
    "&:before": {
      content: `"${uncheckedText}"`,
      left: 6,
      opacity: 0,
    },
    "&:after": {
      content: `"${checkedText}"`,
      right: 24,
      opacity: 1,
    },
  },
}));

export default SwitchTextTrack;