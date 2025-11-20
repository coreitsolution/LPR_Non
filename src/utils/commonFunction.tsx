import bcrypt from 'bcryptjs';
import { toast } from 'react-toastify';

// Types
import { Option } from '../features/types';

// Constants
const SALT_ROUNDS = 10;

export const reformatString = (input: string): string => {
  return input
    .split('_') // Split the string by underscores
    .map(word => 
        word
            .split('-') // Split the string by hyphens
            .map(subWord => 
                /^[A-Z]+$/.test(subWord) ? subWord : subWord.charAt(0).toUpperCase() + subWord.slice(1).toLowerCase()
            )
            .join('-') // Rejoin the hyphenated parts
    )
    .join(' ') // Rejoin the parts with spaces
}

export const formatThaiID = (value: string) => {
  return value.replace(
    /(\d{1})(\d{0,4})?(\d{0,5})?(\d{0,2})?(\d{0,1})?/,
    (_, p1, p2, p3, p4, p5) => [p1, p2, p3, p4, p5].filter(Boolean).join('-')
  )
}

export const formatNumber = (price: number) => {
  return new Intl.NumberFormat('en-US').format(price)
}

export const formatPhone = (value: string) => {
  return value.replace(
    /(\d{0,3})?(\d{0,3})?(\d{0,4})?/,
    (_, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join('-')
  )
}

export const isEquals = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b)
}

export const isNumber = (value: string) => {
  return /^[0-9]*$/.test(value)
}

export const getFileNameWithoutExtension = (filePath: string): string => {
  const fileName = filePath.split('/').pop()?.split('\\').pop() || ""
  return fileName.split('.').slice(0, -1).join('.') || fileName 
}

export const makeRandomText = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => 
    characters[Math.floor(Math.random() * characters.length)]
  ).join('');
};

export const hashPassword = async (plainPassword: string): Promise<string> => {
  const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  return hashed;
};

export const getId = (val: number | Option) => {
  return typeof val === "number" ? val : val.value;
};

export const getStringId = (val: string | Option) => {
  return typeof val === "string" ? val : val.value;
};

export const isStringMatch = (base: string, newString: string) => {
  if (!newString || !base) return false;

  // Except for "*"
  const escaped = base.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
  // Replace "*" with ".*" for matching
  const pattern = '^' + escaped.replace(/\*/g, '.*') + '$';
  const regex = new RegExp(pattern);

  return regex.test(newString);
};

export const getPlateTypeColor = (plateType: number | null) => {
  let color = "white";
  let backgroundColor = "white";
  let pinBackgroundColor = "black";
  let feedBackgroundColor = "#161817";
  let textShadow = "";
  let title = "";
  let showAlert = false;

  switch (plateType) {
    case 1:
      title = "Normal";
      break;
    case 2:
      title = "Guest";
      break;
    case 3:
      color = "white";
      backgroundColor = "#0099ff";
      pinBackgroundColor = "#0099ff";
      feedBackgroundColor = "#0099ff";
      title = "Member";
      showAlert = true;
      break;
    case 4:
      color = "white";
      backgroundColor = "#009900";
      pinBackgroundColor = "#009900";
      feedBackgroundColor = "#009900";
      title = "VIP";
      showAlert = true;
      break;
    case 6:
      color = "white";
      backgroundColor = "#FF0000";
      pinBackgroundColor = "#FF0000";
      feedBackgroundColor = "#FF0000";
      title = "BlackList";
      textShadow = "2px 0 #fff, -2px 0 #fff, 0 2px #fff, 0 -2px #fff, 1px 1px #fff, -1px -1px #fff, 1px -1px #fff, -1px 1px #fff";
      showAlert = true;
      break;
    case 7:
      color = "white";
      backgroundColor = "#FDB600";
      pinBackgroundColor = "#FDB600";
      feedBackgroundColor = "#FDB600";
      title = "WatchList";
      showAlert = true;
      break;
    default:
      color = "white";
      backgroundColor = "white";
      pinBackgroundColor = "black";
      feedBackgroundColor = "#161817";
      title = "";
      break;
  }
  return { color, backgroundColor, feedBackgroundColor, pinBackgroundColor, title, showAlert, textShadow }
}

export const getImageFormat = (src: string) => {
  if (src.startsWith("data:image/png")) return "PNG";
  if (src.startsWith("data:image/jpeg") || src.startsWith("data:image/jpg")) return "JPEG";
  return "JPEG";
};

export const loadFont = async (fontPath: string): Promise<string> => {
  const response = await fetch(fontPath);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

export const showToast = (Component: any, data: any, theme: 'light' | 'dark', toastId: string, style?: React.CSSProperties) => {
  toast((props) => (
    <Component {...props} data={{ ...data, toastId }} />
  ), {
    autoClose: false,
    closeOnClick: false,
    draggable: false,
    theme,
    containerId: "notification-list-toast",
    toastId,
    style,
  });

  return toastId;
};