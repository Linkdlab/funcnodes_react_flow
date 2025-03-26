import { FuncNodesReactFlowZustandInterface } from "../states/fnrfzst.t";

const development: boolean =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

const print_object_size = (
  obj: any,
  message: string,
  fnrf_zst: FuncNodesReactFlowZustandInterface | undefined
): void => {
  if (!fnrf_zst) {
    return;
  }
  if (fnrf_zst.dev_settings.debug) {
    fnrf_zst.logger.debug(
      "Object size: " + JSON.stringify(obj).length + " chars. " + message
    );
  }
};

const print_object = (
  obj: any,
  fnrf_zst: FuncNodesReactFlowZustandInterface | undefined
): void => {
  if (!fnrf_zst) {
    return;
  }
  if (fnrf_zst.dev_settings.debug) {
    fnrf_zst.logger.debug("Object: ", obj);
  }
};

export { print_object_size, print_object, development };
