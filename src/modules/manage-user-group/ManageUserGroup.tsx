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
} from '@mui/material';
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

// Icons
import { Save } from "lucide-react";

// Types
import { User, UserPermission } from '../../features/types';
import { UserGroup, CenterPermissionKey } from "../../features/dropdown/dropdownTypes";

// Icons
import { KeyboardArrowUp } from '@mui/icons-material';

// Components
import AutoComplete from '../../components/auto-complete/AutoComplete';

// i18n
import { useTranslation } from 'react-i18next';

// Utils
import { reformatString } from "../../utils/commonFunction";

interface ManageUserGroupProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  userRoleId: number | null;
  setPermission: (permission: UserPermission) => void;
}

const ManageUserGroup: React.FC<ManageUserGroupProps> = ({open, onClose, user, setPermission, userRoleId}) => {
  // Data
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);

  // Options
  const [userRolesOptions, setUserRolesOptions] = useState<{ label: string ,value: number }[]>([]);

  // State
  const [isAccordionCenterOpen, setIsAccordionCenterOpen] = useState(true);

  // Constants
  const USER_ROLE_ID = 3;

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
    "manageCheckpointCameras"
  ];

  // i18n
  const { t } = useTranslation();

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

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
    manageCheckpointCameras: {
      select: false,
    },
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
    manageCheckpointCameras: {
      name: t('text.ct-checkpoint-cameras'),
    },
  };

  const DEFAULT_CHECKPOINT_PERMISSION = {
    realtime: {
      select: false,
    },
    suspiciousPersonManage: {
      select: false,
    },
    suspiciousPersonSearch: {
      select: false,
    },
    specialPlateManage: {
      select: false,
    },
    specialPlateSearch: {
      select: false,
    },
  };

  const [formData, setFormData] = useState<UserPermission>({
    userRoleId: USER_ROLE_ID,
    userRole: "",
    center: DEFAULT_CENTER_PERMISSION,
  });

  useEffect(() => {
    if (open && user && userRoleId && userRoleId > 0) {
      const permission = sliceDropdown.userGroups?.data.find(permission => permission.id === userRoleId);

      setFormData((prev) => ({
        ...prev,
        userRoleId: userRoleId,
        userRole: permission?.group_name || "",
        center: user.permissions?.center || DEFAULT_CENTER_PERMISSION,
      }));
    }
    else {
      const permission = sliceDropdown.userGroups?.data.find(permission => permission.id === USER_ROLE_ID);
      const centerPermission = permission?.permissions.center || DEFAULT_CENTER_PERMISSION;
      const checkpointPermission = permission?.permissions.checkpoint || DEFAULT_CHECKPOINT_PERMISSION;

      setFormData((prev) => ({
        ...prev,
        userRoleId: USER_ROLE_ID,
        userRole: permission?.group_name || "",
        center: centerPermission,
        checkpoint: checkpointPermission
      }));
    }
  }, [open, userRoleId, user])

  useEffect(() => {
    if (sliceDropdown.userGroups && sliceDropdown.userGroups.data) {
      const options = sliceDropdown.userGroups.data.map((row) => ({
        label: reformatString(row.group_name),
        value: row.id,
      }));
      setUserRolesOptions(options);
      setUserGroups(sliceDropdown.userGroups.data);
    }
  }, [sliceDropdown.userGroups]);

  const handleDropdownChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUserRoleChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("userRoleId", value.value);
      userGroups.forEach((permission) => {
        if (permission.id === value.value) {
          setFormData((prev) => ({
            ...prev,
            center: permission.permissions.center ?? DEFAULT_CENTER_PERMISSION,
            checkpoint: permission.permissions.checkpoint ?? DEFAULT_CHECKPOINT_PERMISSION
          }));
        }
      });
    }
    else {
      handleDropdownChange("userRoleId", '');
    }
  };

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
    onClose();
  };

  const handleSaveClick = async () => {
    setPermission(formData);
    onClose();
  }

  return (
    <Dialog id='manage-user-group' open={open} maxWidth="xl" fullWidth>
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
                  {`${t('screen.manage-user-group.title')}`}
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
        <div className='flex flex-col'>
          {/* User Role */}
          <div className='w-[350px]'>
            <AutoComplete 
              id="user-role-select"
              sx={{ marginTop: "10px"}}
              value={formData.userRoleId}
              onChange={handleUserRoleChange}
              options={userRolesOptions}
              label={t('component.user-group')}
              labelFontSize="15px"
            />
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
              onClick={handleSaveClick}
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
      </DialogContent>
    </Dialog>
  )
};

export default ManageUserGroup;