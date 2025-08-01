import * as React from "react";
import { useState } from "react";
import Select, { ActionMeta, SingleValue } from "react-select";
import "./select.scss";

export interface CustomSelectProps<
  Option extends { value: string; label: string }
> {
  options: Option[];
  items_per_page?: number;
  className?: string;
  defaultValue?: Option;
  onChange: (
    newValue: SingleValue<Option>,
    actionMeta: ActionMeta<Option>
  ) => void;
}

export const CustomSelect = <Option extends { value: string; label: string }>({
  options,
  items_per_page,
  className,
  defaultValue,
  onChange,
}: CustomSelectProps<Option>) => {
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
  var paginatedOptions;
  if (items_per_page !== undefined) {
    paginatedOptions = filteredOptions.slice(
      currentPage * items_per_page,
      (currentPage + 1) * items_per_page
    );
  } else {
    paginatedOptions = filteredOptions;
  }

  const customStyles = {
    control: (base: { [key: string]: any | undefined }) => ({
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
      value={defaultValue}
    />
  );
};
