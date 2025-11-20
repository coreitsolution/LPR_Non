import React, { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useAppDispatch } from '../../app/hooks';
import { useForm } from "react-hook-form";
import { 
  Typography,
  Button,
} from "@mui/material";
import dayjs from "dayjs";

// Icons
import { Save, Download } from "lucide-react";
import { Icon } from "../../components/icons/Icon";

// Components
import AutoComplete from '../../components/auto-complete/AutoComplete';
import TextBox from '../../components/text-box/TextBox';
import DatePickerBuddhist from "../../components/date-picker-buddhist/DatePickerBuddhist";

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Utils
import { formatThaiID, formatPhone } from "../../utils/commonFunction"
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { PopupMessage, PopupMessageWithCancel, PopupMessageWithConfirmButton } from '../../utils/popupMessage';

// Types
import { 
  FileUploadResponse, 
  UserPermission, 
  UserResponse, 
  User 
} from "../../features/types";

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../../config/runtimeConfig';

// API
import { userInfo } from '../../features/auth/authSlice';

interface FormData {
  prefixId: number
  firstName: string
  lastName: string
  email: string
  nationalId: string
  phone: string
  position: string
  agency: string
  status: string
  userRoleId: number
  username: string
  password: string
  dateOfBirth: Date | null
  imageUrl: string
  permission: UserPermission | null
};


const UserInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen } = useHamburger();
  const { CENTER_API, CENTER_FILE_URL } = getUrls();
  const dispatch = useAppDispatch();

  // Options
  const [prefixOptions, setPrefixOptions] = useState<{ label: string ,value: number }[]>([]);

  // Route
  const isAllowed = location.state?.allowed || false;

  // Data
  const [user, setUser] = useState<User | null>(null);

  // State
  const [isEdit, setIsEdit] = useState(false);

  // i18n
  const { t } = useTranslation();

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  const { authData } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<FormData>({
    prefixId: 0,
    firstName: "",
    lastName: "",
    email: "",
    nationalId: "",
    phone: "",
    position: "",
    agency: "",
    status: "",
    userRoleId: 0,
    username: "",
    password: "",
    dateOfBirth: null,
    imageUrl: "",
    permission: null,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!isAllowed) {
      navigate("/center");
    } 
    else {
      setUser(authData.userInfo);
    }
  }, [isAllowed, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        prefixId: user.title_id,
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        nationalId: formatThaiID(user.idcard ?? ""),
        phone: formatPhone(user.phone ?? ""),
        position: user.job_position,
        agency: user.agency,
        status: user.status,
        userRoleId: user.user_group_id,
        username: user.username,
        password: "",
        dateOfBirth: user.dob,
        imageUrl: user.image_url,
        permission: user.permissions,
      })
      setValue("prefix", user.title_id);
      setValue("firstName", user.firstname);
      setValue("lastName", user.lastname);
      setValue("email", user.email);
      setValue("nationalId", user.idcard);
      setValue("phone", user.phone);
      setValue("userRoleId", user.user_group_id);
      setValue("username", user.username);
      setValue("password", "");
      setValue("dateOfBirth", user.dob);
      setValue("imageUrl", user.image_url);
      setValue("permission", user.permissions);
      setValue("agency", user.agency);
      setValue("position", user.job_position);
      setValue("status", user.status === "active" ? 1 : 0);
      const user_group = sliceDropdown.userGroups?.data.find(userGroup => userGroup.id === authData.userInfo?.user_group_id && (userGroup.group_name.toLowerCase() === "super user" || userGroup.group_name.toLowerCase() === "admin"));
      setIsEdit(user_group ? true : false);
    }
  }, [user]);

  useEffect(() => {
    if (sliceDropdown.prefix && sliceDropdown.prefix.data) {
      const options = sliceDropdown.prefix.data.map((row) => ({
        label: row.title_th,
        value: row.id,
      }));
      setPrefixOptions(options);
    }
  }, [sliceDropdown.prefix]);
  
  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDropdownChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrefixChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("prefixId", value.value);
    }
    else {
      handleDropdownChange("prefixId", '');
    }
  };

  const handleDateOfBirthChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      dateOfBirth: date,
    }));
  };

  const handleNationalIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const cleaned = input.replace(/\D/g, '');
    
    if (cleaned.length <= 13) {
      const formatted = formatThaiID(cleaned)
      handleTextChange("nationalId", formatted);
      handleTextChange("username", formatted);
      setValue("username", cleaned);
    }
    return cleaned;
  }

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const cleaned = input.replace(/\D/g, '');
    
    if (cleaned.length <= 10) {
      const formatted = formatPhone(cleaned)
      handleTextChange("phone", formatted)
    }
    return cleaned
  };

  const handleCancelClick = () => {
    navigate("/center/manage-user");
  }

  const onSubmit = (data: any) => {
    if (user) {
      updateUser(data);
    }
  }

  const updateUser = async (data: any) => {
    try {
      const { all } = isDataChanged();
      if (!all) {
        PopupMessage(
          t('message.warning.no-change-found'),
          t('message.warning.data-not-change'),
          "warning"
        )
        return;
      }

      const confirmed = await PopupMessageWithCancel(t('message.warning.edit-confirmation'), t('message.warning.edit-confirmation-message'), t('button.confirm'), t('button.cancel'), "warning", "#FDB600")

      if (!confirmed) return;

      const nationId = data.nationalId.replaceAll("-", "");
      const newDob = dayjs(data.dateOfBirth).format("YYYY-MM-DD HH:mm:ss");
      const oldDob = dayjs(user?.dob).format("YYYY-MM-DD HH:mm:ss");
      const phone = data.phone.replaceAll("-", "");

      const body = JSON.stringify({
        id: user?.id,
        ...( formData.permission?.userRoleId 
          && { user_group_id: formData.permission?.userRoleId }
        ),
        ...( data.prefixId!== user?.title_id
          && { title_id: data.prefixId?.value }
        ),
        ...( data.username !== user?.username
          && { username: data.username }
        ),
        ...( data.password 
          && { password: data.password }
        ),
        ...( nationId !== user?.idcard
          && { idcard: nationId }
        ),
        ...( newDob !== oldDob
          && { dob: newDob }
        ),
        ...( data.firstName !== user?.firstname
          && { firstname: data.firstName }
        ),
        ...( data.lastName !== user?.lastname
          && { lastname: data.lastName }
        ),
        ...( phone !== user?.phone
          && { phone: phone }
        ),
        ...( data.email !== user?.email
          && { email: data.email }
        ),
        ...( formData.imageUrl !== user?.image_url
          && { image_url: formData.imageUrl }
        ),
        ...( formData.permission !== user?.permissions
          && { permissions: formData.permission }
        ),
        ...( data.position !== user?.job_position
          && { job_position: data.position }
        ),
        visible: true,
        updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      })

      const response = await fetchClient<UserResponse>(combineURL(CENTER_API, "/users/update"), {
        method: "PATCH",
        body,
      })

      if (response.success) {
        if (data.username !== user?.username) {
          await PopupMessageWithConfirmButton(t('message.success.save-success'), t('message.success.please-re-login'),  t('button.confirm'), 'info');
          localStorage.removeItem('token');
          localStorage.removeItem("userId");
          window.location.href = '/login';
          return;
        }
        await dispatch(userInfo({ filter: `id=${authData.userId}` }))
        PopupMessage(t('message.success.save-success'), "", "success");
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const fileArray = Array.from(files)
    
    try {
      const formData = new FormData()
      fileArray.forEach(file => {
        formData.append("files", file)
      })

      const response = await fetchClient<FileUploadResponse>(combineURL(CENTER_API, "/upload/"), {
        method: "POST",
        isFormData: true,
        body: formData,
      })

      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: response.data[0].url,
        }))
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      PopupMessage(t('message.error.error-upload-file'), errorMessage, "error");
    }
  }

  const handleDeleteImage = useCallback(async (url: string) => {
    try {
      const body = JSON.stringify({
        urls: [url]
      })

      await fetchClient<FileUploadResponse>(combineURL(CENTER_API, `/upload/remove`), {
        method: "POST",
        body,
      })

      setFormData((prev) => ({
        ...prev,
        imageUrl: "",
      }))
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-deleting-data'), errorMessage, "error");
    }
  }, []);

  const isDataChanged = () => {
    const isImageChanged = formData.imageUrl !== user?.image_url;

    const isOtherDataChanged =
      formData.prefixId!== user?.title_id  ||
      formData.firstName !== user?.firstname ||
      formData.lastName !== user?.lastname ||
      formData.email !== user?.email ||
      formData.nationalId.replaceAll("-", "") !== user?.idcard ||
      formData.phone.replaceAll("-", "") !== user?.phone ||
      formData.position !== user?.job_position ||
      formData.agency !== user?.agency ||
      formData.status !== user?.status ||
      formData.userRoleId !== user?.user_group_id ||
      formData.username !== user?.username ||
      formData.password ||
      formData.dateOfBirth !== user?.dob ||
      formData.imageUrl !== user?.image_url ||
      formData.permission !== user?.permissions;

    return { all: isOtherDataChanged || isImageChanged };
  };

  return (
    <div id='user-info' className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} pr-2.5 transition-all duration-500`}>
      {/* Header */}
      <Typography variant="h5" color="white" className="font-bold">{t('screen.user-info.title')}</Typography>
      <form onSubmit={handleSubmit(onSubmit)} className='h-full'>
        <div className='flex flex-col relative h-full'>
          <div className='grid grid-cols-4 gap-[4%] p-[25px]'>
            {/* User Image */}
            <div className='row-span-3 flex justify-center items-center relative h-[295px]' title=''>
              {
                formData.imageUrl ? (
                  <div className="absolute inset-0">
                    <img src={`${CENTER_FILE_URL}${formData.imageUrl}`} alt="User Image" className="object-contain w-full h-full" />
                    <button
                      type="button"
                      className="absolute z-52 top-2 right-2 text-white bg-red-500 rounded-full w-[30px] h-[30px] flex items-center justify-center hover:cursor-pointer"
                      onClick={() => handleDeleteImage(formData.imageUrl)}
                    >
                      &times;
                    </button>
                  </div>
                ) :
                (
                  <div className='flex border border-white border-dashed w-full h-full'>
                    {/* No Images */}
                    <div className="flex flex-col justify-center items-center w-full h-full">
                      <Icon icon={Download} size={80} color="#999999" />
                      <span className="text-[18px] text-nobel mt-5">
                        {t('button.upload-image')}
                      </span>
                    </div>                    
                  </div>
                )
              }
              {/* Hidden File Input */}
              <input
                id="image-upload"
                type="file"
                name="images"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageUpload}
              />
            </div>

            {/* User Info */}
            <AutoComplete 
              id="prefix-select"
              sx={{ marginTop: "10px"}}
              value={formData.prefixId}
              onChange={handlePrefixChange}
              options={prefixOptions}
              label={t('component.prefix')}
              placeholder={t('placeholder.prefix')}
              labelFontSize="15px"
              error={!!errors.prefix}
              register={register("prefix", { 
                required: true,
              })}
              required={true}
            />

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="first-name"
              label={t('component.first-name')}
              placeholder={t('placeholder.first-name')}
              value={formData.firstName}
              onChange={(event) =>
                handleTextChange("firstName", event.target.value)
              }
              error={!!errors.firstName}
              register={register("firstName", { 
                required: true,
              })}
              required={true}
            />

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="last-name"
              label={t('component.last-name')}
              placeholder={t('placeholder.last-name')}
              value={formData.lastName}
              onChange={(event) =>
                handleTextChange("lastName", event.target.value)
              }
              error={!!errors.lastName}
              register={register("lastName", { 
                required: true,
              })}
              required={true}
            />

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="national-id"
              label={t('component.pid')}
              placeholder={t('placeholder.pid')}
              value={formData.nationalId}
              onChange={handleNationalIdChange}
              error={!!errors.nationalId}
              register={register("nationalId", { 
                required: true,
                validate: (value) => {
                  const digitsOnly = value.replace(/\D/g, '').slice(0, 13);
                  if (digitsOnly.length !== 13) return "";
                  return true;
                }
              })}
              required={true}
            />

            <div>
              <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
                {t('component.birth-day')}
              </Typography>
              <DatePickerBuddhist
                value={formData.dateOfBirth}
                sx={{
                  marginTop: "8px",
                  "& .MuiOutlinedInput-input": {
                    fontSize: 15
                  }
                }}
                className="w-full"
                id="start-date-time"
                onChange={(value) => handleDateOfBirthChange(value)}
                error={!!errors.dateOfBirth}
                register={register("dateOfBirth", { 
                  required: true,
                })}
              >
              </DatePickerBuddhist>
            </div>

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="phone"
              label={t('component.phone-number')}
              placeholder={t('placeholder.phone-number')}
              value={formData.phone}
              onChange={handlePhoneChange}
              error={!!errors.phone}
              register={register("phone", { 
                required: true,
                validate: (value) => {
                  const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
                  if (digitsOnly.length !== 10) return "";
                  return true;
                }
              })}
              required={true}
            />

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="email"
              label={t('component.email')}
              placeholder={t('placeholder.email')}
              value={formData.email}
              onChange={(event) =>
                handleTextChange("email", event.target.value)
              }
              error={!!errors.email}
              register={register("email", { 
                required: false,
              })}
            />

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="position"
              label={t('component.position')}
              placeholder={t('placeholder.position-text')}
              value={formData.position}
              onChange={(event) =>
                handleTextChange("position", event.target.value)
              }
              required={true}
              error={!!errors.position}
              register={register("position", { 
                required: true,
              })}
            />

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="agency"
              label={t('component.agency')}
              placeholder={t('placeholder.agency-text')}
              value={formData.agency}
              required={true}
              error={!!errors.agency}
              register={register("agency", { 
                required: true,
              })}
              disabled={true}
            />

            <div className='col-start-1 mt-2'>
              <div className='flex items-center justify-center h-full'>
                <label>{`${t('component.status')} : ${formData.status === "active" ? t('component.active') : t('component.inactive')}`}</label>
              </div>
            </div>

            <div className='col-start-2 col-span-3 border-b border-white mt-5'></div>

            <div className='col-start-2'>
              <TextBox
                sx={{ marginTop: "10px", fontSize: "15px" }}
                id="username"
                label="Username"
                value={formData.username}
                required={false}
                error={!!errors.username}
                register={register("username", { 
                  required: false,
                })}
                disabled={true}
              />
            </div>

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              type="password"
              id="password"
              label="Password"
              value={formData.password}
              onChange={(event) =>
                handleTextChange("password", event.target.value)
              }
              error={!!errors.password}
              register={register("password", { 
                required: false,
              })}
              required={false}
              disabled={!isEdit}
            />
          </div>

          {/* Button Part */}
          <div className='flex absolute bottom-11 right-0 gap-2'>
            <Button
              type='submit'
              variant="contained"
              className="primary-btn"
              startIcon={ <Save />}
              sx={{
                width: "100px",
                height: "40px",
                textTransform: "capitalize",
                '& .MuiSvgIcon-root': { 
                  fontSize: 20
                } 
              }}
              disabled={!formData.permission}
            >
              {t('button.save')}
            </Button>

            <Button
              variant="text"
              className="secondary-checkpoint-search-btn"
              sx={{
                width: "100px",
                height: "40px",
                textTransform: "capitalize",
                '& .MuiSvgIcon-root': { 
                  fontSize: 20
                } 
              }}
              onClick={handleCancelClick}
            >
              {t('button.cancel')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default UserInfo;