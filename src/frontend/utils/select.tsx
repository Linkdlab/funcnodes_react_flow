import React, { useState } from "react";
import Select, { ActionMeta, SingleValue } from "react-select";

import "./select.scss";

const CustomSelect = <Option extends { value: string; label: string }>({
  options,
  items_per_page = 20,
  className,
  defaultValue,
  onChange,
}: {
  options: Option[];
  items_per_page?: number;
  className?: string;
  defaultValue?: Option;
  onChange: (
    newValue: SingleValue<Option>,
    actionMeta: ActionMeta<Option>
  ) => void;
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const handleInputChange = (inputValue: string) => {
    setSearchInput(inputValue.toLowerCase());
    setCurrentPage(0);
  };

  const filteredOptions = options.filter((option) => {
    return (
      option.label.toLowerCase().includes(searchInput) ||
      option.value.toLowerCase().includes(searchInput)
    );
  });

  const paginatedOptions = filteredOptions.slice(
    currentPage * items_per_page,
    (currentPage + 1) * items_per_page
  );

  const customStyles = {
    control: (base: { [key: string]: any }) => ({
      ...base,
      minHeight: undefined,
    }),
  };

  return (
    <Select
      options={paginatedOptions}
      onInputChange={handleInputChange}
      onChange={onChange}
      inputValue={searchInput}
      isSearchable
      placeholder="Select an option..."
      //   menuIsOpen={true}
      className={className}
      unstyled={true}
      styles={customStyles}
      classNamePrefix="styled-select"
      defaultValue={defaultValue}
    />
  );
};

export default CustomSelect;
