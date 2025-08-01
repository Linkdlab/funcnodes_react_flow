const generate_edge_id = ({
  src_nid,
  src_ioid,
  trg_nid,
  trg_ioid,
}: {
  src_nid: string;
  src_ioid: string;
  trg_nid: string;
  trg_ioid: string;
}) => {
  return [`${src_nid}:${src_ioid}`, `${trg_nid}:${trg_ioid}`].sort().join("--");
};

export { generate_edge_id };
