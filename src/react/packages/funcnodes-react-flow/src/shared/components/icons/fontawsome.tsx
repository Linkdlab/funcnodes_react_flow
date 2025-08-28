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
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

interface FontAwesomeWrapperIconProps
  extends Omit<FontAwesomeIconProps, "icon"> {}

const _InnerIcon = (props: FontAwesomeIconProps) => {
  const { style, ...rest } = props;
  return (
    <span style={style}>
      <FontAwesomeIcon {...rest} />
    </span>
  );
};

export const MenuRoundedIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faBars} />;
};

export const ChevronRightIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faChevronRight} />;
};

export const ChevronLeftIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faChevronLeft} />;
};

export const FullscreenIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faExpand} />;
};

export const FullscreenExitIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faCompress} />;
};

export const CloseFullscreenIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faDownLeftAndUpRightToCenter} />;
};

export const OpenInFullIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faUpRightAndDownLeftFromCenter} />;
};

export const ChevronDownIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faChevronDown} />;
};

export const ChevronUpIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faChevronUp} />;
};

export const ExpandLessIcon = ChevronUpIcon;

export const CloseIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faXmark} />;
};

export const LockOpenIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faLockOpen} />;
};

export const LockIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faLock} />;
};

export const LanIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faNetworkWired} />;
};

export const PlayCircleFilledIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faCirclePlay} />;
};

export const SearchIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faMagnifyingGlass} />;
};

export const GearIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faGear} />;
};

export const CheckmarkIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faCircleCheck} />;
};

export const ErrorIcon = (props: FontAwesomeWrapperIconProps) => {
  return <_InnerIcon {...props} icon={faCircleXmark} />;
};
