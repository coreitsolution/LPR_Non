import React, {useState, useEffect} from 'react'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Checkbox,
  IconButton,
} from '@mui/material';
import { useForm } from "react-hook-form";

// Icons
import { Icon } from '../../components/icons/Icon'
import { Save, Trash2 } from "lucide-react";

// Types
import { UserPermission } from '../../features/types';
import { 
  UserGroup, 
  CenterPermissionKey,
  UserGroupResponse,
} from "../../features/dropdown/dropdownTypes";

// Icons
import { KeyboardArrowUp } from '@mui/icons-material';

// Components
import AutoComplete from '../../components/auto-complete/AutoComplete';
import Loading from "../../components/loading/Loading";

// i18n
import { useTranslation } from 'react-i18next';

// Utils
import { reformatString } from "../../utils/commonFunction";
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { PopupMessage } from '../../utils/popupMessage';

// Config
import { getUrls } from '../../config/runtimeConfig';

interface ManagePermissionProps {
  open: boolean;
  onClose: () => void;
}

const ManagePermission: React.FC<ManagePermissionProps> = ({open, onClose}) => {
  const { CENTER_API } = getUrls();
  
  // Data
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);

  // Options
  const [userRolesOptions, setUserRolesOptions] = useState<{ label: string ,value: number }[]>([]);

  // State
  const [isAccordionCenterOpen, setIsAccordionCenterOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDefaultPermission, setIsDefaultPermission] = useState(true);
  const [isNewPermission, setIsNewPermission] = useState(false);

  // Constants
  const USER_ROLE_ID = 1;

  // Key
  const centerKeys: CenterPermissionKey[] = [
    "realtime",
    "conditionSearch",
    // "beforeAfterSearch",
    // "suspiciousPersonManage",
    // "suspiciousPersonSearch",
    "specialPlateManage",
    // "specialPlateSearch",
    // "executiveReport",
    "manageUser",
    "setting",
    // "manageCheckpointCameras"
  ];

  // i18n
  const { t } = useTranslation();

  // Constant
  const DEFAULT_CENTER_PERMISSION = {
    realtime: {
      select: false,
    },
    conditionSearch: {
      select: false,
    },
    // beforeAfterSearch: {
    //   select: false,
    // },
    // suspiciousPersonManage: {
    //   select: false,
    // },
    // suspiciousPersonSearch: {
    //   select: false,
    // },
    specialPlateManage: {
      select: false,
    },
    // specialPlateSearch: {
    //   select: false,
    // },
    // executiveReport: {
    //   select: false,
    // },
    manageUser: {
      select: false,
    },
    setting: {
      select: false,
    },
    // manageCheckpointCameras: {
    //   select: false,
    // },
  };

  const DEFAULT_CENTER_PERMISSION_NAME = {
    realtime: {
      name: t('text.ct-real-time-vehicle-analysis-system'),
    },
    conditionSearch: {
      name: t('text.ct-conditional-search'),
    },
    // beforeAfterSearch: {
    //   name: t('text.ct-before-after-search'),
    // },
    // suspiciousPersonManage: {
    //   name: t('text.ct-suspicious-person-search'),
    // },
    // suspiciousPersonSearch: {
    //   name: t('text.ct-suspicious-person-manage'),
    // },
    specialPlateManage: {
      name: t('text.ct-special-plate-manage'),
    },
    // specialPlateSearch: {
    //   name: t('text.ct-special-plate-search'),
    // },
    // executiveReport: {
    //   name: t('text.ct-executive-report'),
    // },
    manageUser: {
      name: t('text.ct-manage-user'),
    },
    setting: {
      name: t('text.ct-setting'),
    },
    // manageCheckpointCameras: {
    //   name: t('text.ct-checkpoint-cameras'),
    // },
  };

  const {
    register,
    handleSubmit,
    setValue,
  } = useForm();

  const [formData, setFormData] = useState<UserPermission>({
    userRoleId: USER_ROLE_ID,
    center: DEFAULT_CENTER_PERMISSION,
  });

  useEffect(() => {
    if (open) {
      fetchUserPermission();
      setValue("roleType", "object");
    }
    else {
      clearData();
    }
  }, [open])

  useEffect(() => {
    if (userGroups) {
      const options = userGroups.map((row) => ({
        label: reformatString(row.group_name),
        value: row.id,
      }));
      setUserRolesOptions(options);
    }
  }, [userGroups]);

  const fetchUserPermission = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      const response = await fetchClient<UserGroupResponse>(combineURL(CENTER_API, "/user-groups/get"), {
        method: "GET",
        signal: controller.signal,
      });

      if (response.success && response.data.length > 0) {
        setUserGroups(response.data);
        setFormData((prev) => ({
          ...prev,
          userRoleId: response.data[0].id,
          center: response.data[0].permissions.center,
          checkpoint: response.data[0].permissions.checkpoint
        }));
        setIsDefaultPermission(true);
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  };

  const addNewPermission = async (data: any) => {
    try {
      setIsLoading(true);

      const body = {
        group_name: data.userRoleName.toString().toLowerCase(),
        description: "",
        permissions: {
          center: formData.center,
        }
      }

      const response = await fetchClient<UserGroupResponse>(combineURL(CENTER_API, "/user-groups/create"), {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (response.success) {
        PopupMessage(t('message.success.save-success'), t('message.success.save-success-message'), "success");
        fetchUserPermission();
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
    finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const updatePermission = async () => {
    try {
      setIsLoading(true);

      const body = {
        id: formData.userRoleId,
        permissions: {
          center: formData.center,
        }
      }

      const response = await fetchClient<UserGroupResponse>(combineURL(CENTER_API, "/user-groups/update"), {
        method: "PUT",
        body: JSON.stringify(body),
      });

      if (response.success) {
        PopupMessage(t('message.success.save-success'), t('message.success.save-success-message'), "success");
        fetchUserPermission();
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
    finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const deletePermission = async (id: number) => {
    try {
      setIsLoading(true);

      const response = await fetchClient<UserGroupResponse>(combineURL(CENTER_API, "/user-groups/delete"), {
        method: "DELETE",
        queryParams: {
          ids: [id].toString()
        },
      });

      if (response.success) {
        PopupMessage(t('message.success.delete-success'), "", "success");
        fetchUserPermission();
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-deleting-data'), errorMessage, "error");
    }
    finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const handleDropdownChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUserRoleChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();

    if (typeof value === "string") {
      setFormData((prev) => ({
        ...prev,
        center: DEFAULT_CENTER_PERMISSION,
      }));
      setIsNewPermission(true);
      setValue("userRoleName", value);
      setValue("roleType", "string");
    }
    else if (value) {
      handleDropdownChange("userRoleId", value.value);
      userGroups.forEach((permission) => {
        if (permission.id === value.value) {
          setFormData((prev) => ({
            ...prev,
            center: permission.permissions.center ?? DEFAULT_CENTER_PERMISSION,
          }));
        }
      });
      setValue("userRoleName", value);
      setValue("roleType", "object");
      if (value.label.toString().toLowerCase() !== "admin" && value.label.toString().toLowerCase() !== "user" && value.label.toString().toLowerCase() !== "super user") {
        setIsDefaultPermission(false);
      }
    }
    else {
      handleDropdownChange("userRoleId", '');
      setValue("userRoleName", '');
      setValue("roleType", "");
    }
  };

  const handleInputChange = (
    event: React.SyntheticEvent<Element, Event> | React.ChangeEvent<{}>, 
    value: string
  ) => {
    if (event === null) return;
    if (value === "") {
      setIsNewPermission(false);
      setIsDefaultPermission(true);
    }
    setValue("userRoleName", value);
    setValue("roleType", "string");
  }

  const handleStatusCenterChange = (event: React.ChangeEvent<HTMLInputElement>, key: keyof typeof formData.center) => {
    const isChecked = event.target.checked;
    
    setFormData((prevState) => ({
      ...prevState,
      center: {
        ...prevState.center,
        [key]: {
          select: isChecked
        }
      }
    }));
  };

  const getCheckedCount = () => {
    const centerCheckedCount = centerKeys.reduce((count, key) => {
      return count + (formData.center[key]?.select ? 1 : 0);
    }, 0);
    return centerCheckedCount;
  };

  const handleCancelClick = () => {
    setFormData((prev) => ({
      ...prev,
      userRoleId: USER_ROLE_ID,
      center: DEFAULT_CENTER_PERMISSION,
    }));
    setUserGroups([]);
    onClose();
  };

  const handleSaveClick = async (data: any) => {
    if (data.roleType === "string" || isNewPermission) {
      await addNewPermission(data);
    }
    else if (data.roleType === "object") {
      await updatePermission();
    }
  }

  const handleDeletePermission = async () => {
    const data = userRolesOptions.find((opt) => opt.value === formData.userRoleId)
  
    if (!data) return;
    await deletePermission(data?.value);
  }

  const clearData = () => {
    setValue("roleType", "");
    setValue("userRoleName", "");
  }

  return (
    <Dialog id='manage-user-permission' open={open} maxWidth="xl" fullWidth>
      { isLoading && <Loading /> }
      <DialogTitle className='bg-black'>
        {/* Header */}
        {
          (() => {
            const centerCheckedCount = getCheckedCount();
            return (
              <div 
              className='flex justify-between items-end'
              >
                <Typography variant="h5" component="div" color="white" className="font-bold">
                  {`${t('screen.manage-user-permission.title')}`}
                </Typography>
                <div className='text-white text-[14px]'>
                  { 
                    `${t('text.selected-count')} : ${centerCheckedCount}` 
                  }
                </div>
              </div>
            )
          })()
        }
      </DialogTitle>
      <DialogContent className='bg-black'>
        <form className='flex flex-col' onSubmit={handleSubmit(handleSaveClick)}>
          {/* User Role */}
          <div className='flex gap-2'>
            <div className='w-[350px]'>
              <AutoComplete 
                id="user-role-select"
                sx={{ marginTop: "10px"}}
                value={
                  userRolesOptions.find((opt) => opt.value === formData.userRoleId) || null
                }
                onChange={handleUserRoleChange}
                onInputChange={handleInputChange}
                options={userRolesOptions}
                label={t('component.user-permission')}
                labelFontSize="15px"
                freeSolo={true}
                register={register("userRoleName", { 
                  required: false,
                })}
              />
            </div>

            {
              isDefaultPermission ? null : (
                <div className='flex items-end justify-center mb-[-2px]'>
                <IconButton onClick={() => handleDeletePermission()}>
                  <Icon icon={Trash2} size={29} color="#FF0000" />
                </IconButton>
              </div>
              )
            }
          </div>

          {/* Permission Table */}
          <div className='h-[65vh]'>
            <TableContainer 
              component={Paper} 
              className='mt-5'
              sx={{ maxHeight: "63vh", backgroundColor: "transparent" }}
            >
              <Table sx={{ minWidth: 650, backgroundColor: "#48494B"}}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#242727", position: "sticky", top: 0, zIndex: 1 }}>
                    <TableCell align="center" sx={{ color: "#FFFFFF", width: "75%" }}>{t('table.column.active-menu')}</TableCell>
                    <TableCell align="center" sx={{ color: "#FFFFFF", width: "15%" }}>{t('table.column.access-right')}</TableCell>
                    <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} sx={{ border: 0, padding: "0px" }}>
                      {/* Center Permission */}
                      <Accordion
                        expanded={isAccordionCenterOpen}
                        onChange={() => setIsAccordionCenterOpen(!isAccordionCenterOpen)}
                        sx={{
                          "&.MuiAccordion-root" : {
                            "&.Mui-expanded" : {
                              margin: "1px 0px",
                            }
                          }
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<KeyboardArrowUp sx={{ fontSize: "28px", color: "black"}} />}
                          sx={{
                            backgroundColor: "#CCD0CF",
                            flexDirection: "row-reverse",
                            gap: "10px"
                          }}
                          id="center-permission-part"
                        >
                          <Typography component="span" style={{ color: "black", fontWeight: 500 }}>
                            {t('accordion-summary.center')}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ padding: 0 }}>
                          <Table>
                            <TableBody>
                              {centerKeys.map((key) => (
                                <TableRow
                                  key={`center-permission-${key}`}
                                  sx={{ '& td, & th': { borderBottom: '1px dashed #D9D9D9' } }}
                                >
                                  <TableCell
                                    align="center"
                                    sx={{
                                      backgroundColor: "#393B3A",
                                      color: "#FFFFFF",
                                      paddingLeft: "50px",
                                      textAlign: "left",
                                      width: "75%"
                                    }}
                                  >
                                    {DEFAULT_CENTER_PERMISSION_NAME[key].name}
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      backgroundColor: "#48494B",
                                      color: "#FFFFFF",
                                      padding: "0px",
                                      width: "5%"
                                    }}
                                  >
                                    <Checkbox
                                      sx={{
                                        color: "#FFFFFF",
                                        "&.Mui-checked": { color: "#FFFFFF" },
                                        "& .MuiSvgIcon-root": { fontSize: 30 }
                                      }}
                                      checked={formData.center[key]?.select || false}
                                      onChange={(e) => handleStatusCenterChange(e, key)}
                                    />
                                  </TableCell>
                                  <TableCell
                                    sx={{ backgroundColor: "#393B3A", padding: "0px", width: "14%" }}
                                  />
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionDetails>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Button Part */}
          <div className='flex justify-end mt-5 gap-2'>
            <Button
              type="submit"
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
        </form>
      </DialogContent>
    </Dialog>
  )
};

export default ManagePermission;