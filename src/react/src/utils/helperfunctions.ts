import { FuncNodesReactFlowZustandInterface } from "../states/fnrfzst.t";
import { useFuncNodesContext } from "@/providers";

const set_io_value = ({
  nid,
  ioid,
  value,
  set_default = false,
}: {
  nid: string;
  ioid: string;
  value: any;
  set_default?: boolean;
}) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
  fnrf_zst.worker?.set_io_value({
    nid: nid,
    ioid: ioid,
    value: value,
    set_default: set_default,
  });
};

const helperfunctions = { set_io_value };

export default helperfunctions;
export { set_io_value };
