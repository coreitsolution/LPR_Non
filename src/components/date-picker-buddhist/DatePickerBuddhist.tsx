import { DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker, DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers"
import buddhistEraAdapter from "../../utils/buddhistEraAdapter"
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Material UI
import Typography from '@mui/material/Typography'

// i18n
import { useTranslation } from 'react-i18next';

type CustomDatePickerProps = Omit<DatePickerProps<Dayjs>, 'value' | 'onChange'> & {
  id?: string
  label?: string
  labelTextSize?: string
  className?: string
  value: Date | null
  onChange: (date: Date | null, context: any) => void
  isWithTime?: boolean
  error?: boolean
  register?: any
  sx?: object
  maxDate?: Dayjs
}

const DatePickerBuddhist: React.FC<CustomDatePickerProps> = ({
  id,
  label,
  labelTextSize,
  onChange,
  value,
  isWithTime,
  error = false, 
  register,
  sx = {},
  maxDate,
  className,
  ...props
}) => {
  // i18n
  const { t, i18n } = useTranslation();

  const dayjsValue = value ? dayjs(value) : null;

  const handleDateChange = (date: dayjs.Dayjs | null, context: any) => {
    if (onChange) {
      onChange(date?.toDate() || null, context);
      if (register) {
        register.onChange({
          target: { name: register.name, value: date?.toDate() || null },
        });
      }
    }
  }

  const textFieldProps = {
    size: 'medium' as 'medium',
    style: { height: '40px', justifyContent: 'center' },
    fullWidth: true,
    inputProps: {
      placeholder: isWithTime ? t('placeholder.date-time') : t('placeholder.date'),
    },
    error: error,
    sx: {
      '& .MuiOutlinedInput-root': {
        height: '40px',
        borderRadius: '5px',
        backgroundColor: 'white',
        '& fieldset': {
          borderColor: error ? 'red' : 'default',
          borderWidth: '2px',
        },
        '&:hover fieldset': {
          borderColor: error ? 'red' : 'default',
          borderWidth: '2px',
        },
        '&.Mui-focused fieldset': {
          borderColor: error ? 'red' : 'default',
          borderWidth: '2px',
        },
      },
      ...sx,
    },
  }

  const datePickerProps = {
    value: dayjsValue,
    onChange: handleDateChange,
    slotProps: { textField: textFieldProps },
    ...(maxDate && { maxDate }),
  };

  return (
    <div id={id} className={`flex flex-col w-full ${className || ''}`}>
      {label && (
        <Typography
          variant="subtitle1"
          color="white"
          sx={{ fontSize: labelTextSize }}
        >
          {label}
        </Typography>
      )}
      <LocalizationProvider 
        dateAdapter={i18n.language === "th" ? buddhistEraAdapter : AdapterDayjs} 
        adapterLocale={i18n.language === "th" ? "th" : "en"}
      >
        {
          !isWithTime ? 
          (
            <DatePicker
              {...props}
              {...datePickerProps}
            />
          ) : 
          (
            <DateTimePicker
              {...props as DateTimePickerProps<Dayjs>}
              {...datePickerProps}
            />
          )}
      </LocalizationProvider>
    </div>
  )
}

export default DatePickerBuddhist