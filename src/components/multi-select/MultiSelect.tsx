import React, { useState, useEffect } from "react";
import Chip from "@mui/material/Chip";
import { TextField, Autocomplete } from "@mui/material";

interface MultiselectProps {
  options: {value: any, label: string}[];
  onChange: (selectedIds: string[]) => void;
  selectedValues?: {value: any, label: string}[];
  sx?: object;
  limitTags?: number;
  error?: boolean;
  clearError?: () => void;
  register?: any;
  placeHolder?: string;
  disabled?: boolean;
}

const Multiselect: React.FC<MultiselectProps> = ({ 
  options, 
  onChange, 
  selectedValues = [],
  sx,
  limitTags = 1,
  error = false, 
  register, 
  placeHolder = "",
  disabled,
}) => {
  const [value, setValue] = useState<{value: any, label: string}[]>([]);

  useEffect(() => {
    if (selectedValues) {
      setValue(selectedValues);
    }
  }, [selectedValues]);

  const handleSelectionChange = (
    event: React.SyntheticEvent,
    newValue: { value: any; label: string }[]
  ) => {
    event.stopPropagation();
    event.preventDefault();

    let processedValue = [...newValue];

    const hasAll = processedValue.find((v) => v.value === 0);
    const hasOthers = processedValue.find((v) => v.value !== 0);
    const hasAllInPrevious = selectedValues.find((v) => v.value === 0);

    if (hasAllInPrevious && hasOthers) {
      processedValue = processedValue.filter((v) => v.value !== 0);
    }
    else if (hasAll && hasOthers) {
      processedValue = [{ value: 0, label: hasAll.label }];
    }
    else if (!hasAll && hasOthers) {
      processedValue = processedValue.filter((v) => v.value !== 0);
    }

    setValue(processedValue);
    const selectedIds = processedValue.map((option) => option.value);
    onChange(selectedIds);

    if (register) {
      register.onChange({
        target: { name: register.name, value: processedValue },
      });
    }
  };

  return (
    <Autocomplete
      multiple
      id="tags-demo"
      options={options}
      getOptionLabel={(option) => option.label}
      value={value}
      limitTags={limitTags}
      onChange={handleSelectionChange}
      disabled={disabled}
      sx={{
        borderRadius: "5px",
        backgroundColor: "white",
        "& .MuiInputBase-root": {
          minHeight: "40px",
          maxHeight: "40px",
          padding: "2px 8px",
          "& .MuiInputBase-input": {
            height: "25px",
            padding: "0 !important"
          },
          "&.Mui-error": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#d32f2f",
              borderWidth: "2px"
            }
          },
        },
        "& .MuiOutlinedInput-root": {
          "& > div": {
            padding: "3px !important",
            gap: "4px",
            display: "flex",
          }
        },
        ...sx,
      }}
      renderTags={(tagValue, getTagProps) => {
        const numTags = tagValue.length;
        const limitTag = limitTags;

        return (
          <>
            {tagValue.slice(0, limitTag).map((option, index) => {
              const tagProps = getTagProps({ index });
              return (
                <Chip
                  {...tagProps}
                  key={`chip-${option.value}-${index}`}
                  label={option.label}
                  style={{
                    backgroundColor: "rgba(26, 109, 223, 1)",
                    color: "white",
                    borderRadius: "4px",
                  }}
                />
              );
            })}

            {numTags > limitTags && 
              (
                <div className="absolute top-[6px] right-[65px]">{` +${numTags - limitTags}`}</div>
              )
            }
          </>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          error={error}
          placeholder={value.length === 0 ? placeHolder : ""}
        />
      )}
    />
  );
}

export default Multiselect;
