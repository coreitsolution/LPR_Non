import React from "react"

// Material UI
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from '@mui/material/Typography';

// i18n
import { useTranslation } from 'react-i18next';

export type OptionType = {
  value: any
  label: string
}

type AutoCompleteProps = {
  id?: string
  value: any
  onChange: (event: React.SyntheticEvent<Element, Event>, value: OptionType | null) => void
  onInputChange?: (
    event: React.SyntheticEvent<Element, Event> | React.ChangeEvent<{}>,
    value: string
  ) => void
  options: OptionType[]
  label: string
  placeholder?: string
  labelFontSize?: string
  sx?: object
  disabled?: boolean
  required?: boolean
  title?: string
  error?: boolean;
  register?: any;
  freeSolo?: boolean;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({
  id,
  value,
  onChange,
  onInputChange,
  options,
  label,
  placeholder,
  labelFontSize = "15px",
  sx,
  disabled,
  title,
  error = false,
  required = false,
  register, 
  freeSolo = false,
  ...props
}) => {
  // i18n
  const { t } = useTranslation();

  const handleSelectionChange = (event: React.SyntheticEvent, newValue: OptionType | null) => {
    event.stopPropagation();
    event.preventDefault();
    onChange(event, newValue);

    if (register) {
      register.onChange({
        target: { name: register.name, value: newValue || "" },
      });
    }
  };

  const handleInputChange = (
    event: React.SyntheticEvent<Element, Event> | React.ChangeEvent<{}>,
    newValue: string
  ) => {
    if (onInputChange) {
      onInputChange(event, newValue)
    }
    if (register && freeSolo) {
      register.onChange({
        target: { name: register.name, value: newValue },
      })
    }
  }

  const renderHighlightedText = (label: string, inputValue: string) => {
    if (!inputValue) return label;

    const index = label.toLowerCase().indexOf(inputValue.toLowerCase());
    if (index === -1) return label;

    const beforeMatch = label.slice(0, index);
    const match = label.slice(index, index + inputValue.length);
    const afterMatch = label.slice(index + inputValue.length);

    return (
      <>
        {beforeMatch}
        <b className="font-extrabold">{match}</b>
        <span className="font-light">{afterMatch}</span>
      </>
    );
  }

  return (
    <div className={`flex flex-col w-full`}>
      <Typography sx={{ fontSize: labelFontSize || undefined }} variant='subtitle1' color='white'>
        {label}
        {
          required && <span className="text-red-500"> *</span>
        }
      </Typography>
      <Autocomplete
        disablePortal
        freeSolo={freeSolo}
        value={
          freeSolo
            ? value || ""
            : options.find((option) => option.value === value) || null
        }
        onChange={handleSelectionChange}
        onInputChange={handleInputChange}
        options={options}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label || ""
        }
        noOptionsText={t('text.data-not-found')}
        filterOptions={(options, state) =>
          options.filter((option) =>
            option.label.toLowerCase().startsWith(state.inputValue.toLowerCase())
          )
        }
        sx={{
          borderRadius: "5px",
          backgroundColor: "white",
          "& .MuiInputBase-root": {
            minHeight: "40px",
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
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder || ""}
            error={error}
            slotProps={{
              inputLabel: {
                sx: { fontSize: labelFontSize },
              }
            }}
          />
        )}
        disabled={disabled}
        title={title || ""}
        renderOption={(props, option, { inputValue }) => {
          const { key, ...otherProps } = props
          return (
            <li {...otherProps} key={key}>
              {renderHighlightedText(option.label, inputValue)}
            </li>
          )
        }}
        {...props}
      />
    </div>
  )
}

export default AutoComplete