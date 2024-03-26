import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { SortDirection } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";

import { useMemo, useState } from "react";

import "./table.scss";

interface TableData {
  columns: string[];
  index: string[];
  data: any[][];
}

type comparertype = (a: any, b: any) => 1 | -1 | 0;
type _SD = "asc" | "desc";

interface TransFormedTableData {
  header: string[];
  rows: any[][];
}

const transform_table_data = (data: TableData): TransFormedTableData => {
  const rows = [];
  if (data === undefined) {
    // return empty table if data is undefined
    return {
      header: [],
      rows: [],
    };
  }
  if (data.data === undefined) {
    // if data.data is undefined, make it empty
    data.data = [];
  }

  if (data.columns === undefined) {
    // if np columns are defined, create columns based on the first row

    // if data is empty, there are no columns
    if (data.data.length === 0) {
      data.columns = [];
    } else {
      // create columns based on the first row
      data.columns = data.data[0].map((_, i) => `col${i}`);
    }
  }
  if (data.index === undefined) {
    // if no index is defined, create index based on the number of rows
    data.index = data.data.map((_, i) => `row${i}`);
  }

  for (let i = 0; i < data.index.length; i++) {
    const row = [data.index[i]];
    for (let j = 0; j < data.columns.length; j++) {
      row.push(data.data[i][j]);
    }
    rows.push(row);
  }
  return {
    header: ["index", ...data.columns],
    rows: rows,
  };
};

function SortableTable({ tabledata }: { tabledata: TableData }) {
  // State to manage the sorted column and direction
  const transformed_table_data: TransFormedTableData = useMemo(
    () => transform_table_data(tabledata),
    [tabledata]
  );
  const [orderDirection, setOrderDirection] = useState<_SD>("asc");
  const [orderBy, setOrderBy] = useState("index");

  let order_by_index = transformed_table_data.header.indexOf(orderBy);
  if (order_by_index === -1) {
    order_by_index = 0;
  }

  // Function to handle sorting
  const handleSort = (column: string) => {
    const isAsc = orderBy === column && orderDirection === "asc";
    setOrderDirection(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };
  // Function to sort data
  const sortData = (data: any[][], comparator: comparertype) => {
    const stabilizedThis: [any[], number][] = data.map((el, index) => [
      el,
      index,
    ]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      return order;
    });
    return stabilizedThis.map((el) => el[0]);
  };

  // Comparator function for sorting
  const getComparator = (order: _SD, orderBy: string): comparertype => {
    return order === "desc"
      ? (a, b) => (b[order_by_index] < a[order_by_index] ? -1 : 1)
      : (a, b) => (a[order_by_index] < b[order_by_index] ? -1 : 1);
  };

  // Sort the rows
  const sortedRows = sortData(
    transformed_table_data.rows,
    getComparator(orderDirection, orderBy)
  );
  return (
    <TableContainer className="tablecontainer">
      <Table size="small">
        <TableHead className="tableHead">
          <TableRow className="tableheadercolor">
            {transformed_table_data.header.map((column) => (
              <TableCell
                key={column}
                sortDirection={orderBy === column ? orderDirection : false}
                className="tableheadercolor"
              >
                <TableSortLabel
                  active={orderBy === column}
                  direction={orderBy === column ? orderDirection : "asc"}
                  onClick={() => handleSort(column)}
                  className="tableheadercolor"
                  sx={{
                    "& .MuiTableSortLabel-icon": {
                      color: "inherit !important",
                    },
                  }}
                >
                  {column}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((row, index) => (
            <TableRow key={tabledata.index[index]}>
              {row.map((cell, i) => (
                <TableCell key={i} className={i == 0 ? "indexcol" : "datacol"}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export { SortableTable };
