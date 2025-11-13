import { 
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import React from 'react';

interface RadioButtonValue {
  value: string
  label: string
}

interface RowRadioButtonsGroupProps {
  id?: string
  radioButtonTitle: string;
  radioButtonTitleFontSize?: string;
  radioButtonValue: RadioButtonValue[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  error?: boolean;
  register?: any;
}

const RowRadioButtonsGroup: React.FC<RowRadioButtonsGroupProps> = ({
  id, 
  radioButtonTitle, 
  radioButtonValue, 
  value, 
  onChange,
  radioButtonTitleFontSize = "15px",
  error,
  register,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event);
    if (register) {
      register.onChange({
        target: { name: register.name, value: event.target.value || "" },
      });
    }
  }
  
  return (
    <FormControl id={id} error={error}>
      <FormLabel id="demo-row-radio-buttons-group-label" 
        sx={{ 
          color: "white", 
          fontSize: radioButtonTitleFontSize,
          "&.Mui-focused": {
            color: "inherit",
          },
        }}
      >
        {radioButtonTitle}
      </FormLabel>
      <RadioGroup
        row
        name="row-radio-buttons-group"
        className='pl-3 py-2 pr-2 gap-5'
        value={value}
        onChange={handleChange}
      >
        {
          radioButtonValue.map((data, index) => (
            <React.Fragment key={index}>
              <FormControlLabel 
                value={data.value} 
                control={
                  <Radio sx={{
                    color: "white",
                    width: 16,
                    height: 16,
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    '&.Mui-checked': {
                      color: 'black',
                    },
                    "&:hover": {
                      backgroundColor: "#E7E7E7",
                    },
                  }} />
                }
                sx={{
                  gap: 2,
                }}
                label={data.label}
              />
            </React.Fragment>
          ))
        }
      </RadioGroup>
    </FormControl>
  );
}

export default RowRadioButtonsGroup;