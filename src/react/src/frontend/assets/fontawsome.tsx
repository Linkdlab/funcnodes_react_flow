import * as React from "react";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChevronRight,
  faChevronLeft,
  faChevronDown,
  faChevronUp,
  faExpand,
  faCompress,
  faDownLeftAndUpRightToCenter,
  faUpRightAndDownLeftFromCenter,
  faXmark,
  faLock,
  faLockOpen,
  faNetworkWired,
  faCirclePlay,
  faMagnifyingGlass,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

interface FontAwesomeWrapperIconProps
  extends Omit<FontAwesomeIconProps, "icon"> {}

const _InnerIcon = (props: FontAwesomeIconProps) => {
  const { style, ...rest } = props;
  return (
    <span style={{ marginLeft: "5px", ...style }}>
      <FontAwesomeIcon {...rest} />
    </span>
  );
};

const MenuRoundedIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faBars} />;
};

const ChevronRightIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faChevronRight} />;
};

const ChevronLeftIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faChevronLeft} />;
};

const FullscreenIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faExpand} />;
};

const FullscreenExitIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faCompress} />;
};

const CloseFullscreenIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faDownLeftAndUpRightToCenter} />;
};

const OpenInFullIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faUpRightAndDownLeftFromCenter} />;
};

const ChevronDownIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faChevronDown} />;
};

const ChevronUpIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faChevronUp} />;
};

const ExpandLessIcon = ChevronUpIcon;

const CloseIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faXmark} />;
};

const LockOpenIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faLockOpen} />;
};

const LockIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faLock} />;
};

const LanIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faNetworkWired} />;
};

const PlayCircleFilledIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faCirclePlay} />;
};

const SearchIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faMagnifyingGlass} />;
};

const GearIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faGear} />;
};

export {
  MenuRoundedIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  FullscreenIcon,
  FullscreenExitIcon,
  OpenInFullIcon,
  CloseFullscreenIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExpandLessIcon,
  CloseIcon,
  LockOpenIcon,
  LockIcon,
  LanIcon,
  PlayCircleFilledIcon,
  SearchIcon,
  GearIcon,
};
