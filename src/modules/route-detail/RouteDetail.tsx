import React, { useEffect, useCallback, useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
} from '@mui/material';
import { Map as LeafletMap } from 'leaflet';

// Icons
import CautionIcon from "../../assets/icons/caution-mark.png";
import CarIcon from "../../assets/icons/car-front.png";
import RouteList from "../../assets/icons/route-list.png";
import OwnerIcon from "../../assets/icons/owner.png";

// Components
import BaseMap from '../../components/base-map/BaseMap';

// Types
import { SearchPlateCondition, Route } from '../../features/search/SearchTypes';

// Hooks
import { useMapSearch } from "../../hooks/useOpenStreetMapSearch";

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../../config/runtimeConfig';

interface RouteDetailProps {
  open: boolean;
  onClose: () => void;
  plateDetailList: SearchPlateCondition[];
}

const RouteDetail: React.FC<RouteDetailProps> = ({open, onClose, plateDetailList}) => {
  const { CENTER_FILE_URL } = getUrls();
  const [map, setMap] = useState<LeafletMap | null>(null);

  // i18n
  const { t, i18n } = useTranslation();

  const {
    drawRoute,
  } = useMapSearch(map);

  useEffect(() => {
    if (open && plateDetailList.length > 0) {
      let latLonList = [];
      for (let i = 0; i < plateDetailList.length; i++) {
        const data = plateDetailList[i].plateRoute
        if (!data) continue;
        const routeList = data[0].routes.map((data: Route) => ({
          lat: data.latitude,
          lon: data.longitude,
        }));

        latLonList.push({ id: plateDetailList[i].id, routeList: routeList});
      };

      if (!latLonList) return;
      drawRoute(latLonList);
    }
  }, [map]);

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance)
  }, []);

  return (
    <Dialog id='route-detail' open={open} maxWidth="xl" fullWidth>
      <DialogTitle className='bg-black'>
        {/* Header */}
        <div>
          <Typography variant="h5" color="white" className="font-bold">{t('screen.route-map.title')}</Typography>
        </div>
        {/* Caution */}
        {
          i18n.language === "th" && (
            <div className='flex space-x-4'>
              <div className='flex items-center justify-center space-x-4'>
                <img src={CautionIcon} alt="Caution Icon" className='w-[15px] h-[15px]' />
                <label className='text-[#9F0C0C] text-[15px] font-bold underline'>ห้ามนำข้อมูลและรูปภาพ</label>
                <img src={CautionIcon} alt="Caution Icon" className='w-[15px] h-[15px]' />
              </div>
              <div className='flex flex-col text-[13px] text-white'>
                <p>ภายในเว็บไซต์ Thailpr ไปเผยแพร่ เนื่องจากเป็นข้อมูลความลับของทางราชการ ไม่อนุญาตให้นำข้อมูลดังกล่าวไปเผยแพร่ ในทุกช่องทาง ก่อนได้รับอนุญาต </p>
                <p><span className='underline'>*หากผู้ใดนำข้อมูลไปเผยแพร่และก่อให้เกิดความเสียหาย</span> แก่ทางราชการหรือก่อให้เกิดความเสียหายกับบุคคลอื่น อาจเข้าข่ายเป็นความผิดตาม พ.ร.บ.คอมพิวเตอร์ เจ้าของรหัสจะถูกตัดสิทธิ์การใช้งานระบบ LPR และถูกดำเนินการทางวินัย *</p>
              </div>
            </div>
          )
        }
        {
          i18n.language === "en" && (
            <div className='flex space-x-4'>
              <div className='flex items-center justify-center space-x-4'>
                <img src={CautionIcon} alt="Caution Icon" className='w-[15px] h-[15px]' />
                <div className='flex flex-col w-[200px] items-center justify-center'>
                  <label className='text-[#9F0C0C] text-[15px] font-bold underline'>Do not use information</label>
                  <label className='text-[#9F0C0C] text-[15px] font-bold underline'>and images</label>
                </div>
                <img src={CautionIcon} alt="Caution Icon" className='w-[15px] h-[15px]' />
              </div>
              <div className='flex flex-col text-[13px] text-white'>
                <p>It is not published on the website because it is confidential government information. Dissemination of such information is not permitted. In all channels, before permission is granted. </p>
                <p><span className='underline'>*If anyone disseminates the information and causes damage</span> To the government or causing damage to other persons may be considered an offense under Computer Crime Act: The owner of the code will be disqualified from using the LPR system and will face disciplinary action. *</p>
              </div>
            </div>
          )
        }
        {
          i18n.language === "la" && (
            <div className='flex space-x-4'>
              <div className='flex items-center justify-center space-x-4'>
                <img src={CautionIcon} alt="Caution Icon" className='w-[15px] h-[15px]' />
                <div className='flex flex-col w-[130px] items-center justify-center'>
                  <label className='text-[#9F0C0C] text-[15px] font-bold underline'>ຫ້າມນໍາໃຊ້ຂໍ້ມູນ</label>
                  <label className='text-[#9F0C0C] text-[15px] font-bold underline'>ແລະຮູບພາບ</label>
                </div>
                <img src={CautionIcon} alt="Caution Icon" className='w-[15px] h-[15px]' />
              </div>
              <div className='flex flex-col text-[13px] text-white'>
                <p>
                  ຂໍ້ມູນນີ້ບໍ່ໄດ້ຖືກເຜີຍແຜ່ໃນເວັບໄຊ ເນື່ອງຈາກເປັນຂໍ້ມູນລັບຂອງລັດຖະບານ ການເຜີຍແຜ່ຂໍ້ມູນນີ້ບໍ່ໄດ້ຮັບອະນຸຍາດໃນທຸກຊ່ອງທາງ ກ່ອນຈະໄດ້ຮັບການອະນຸຍາດ
                </p>
                <p>
                  <span className='underline'>*ຖ້າຜູ້ໃດເຜີຍແຜ່ຂໍ້ມູນແລະເຮັດໃຫ້ເກີດຄວາມເສຍຫາຍ</span> ໃຫ້ແກ່ລັດຖະບານ ຫຼືເຮັດໃຫ້ບຸກຄົນອື່ນເສຍຫາຍ ອາດຈະຖືວ່າເປັນການກະທໍາຜິດຕາມພາລະບັດອາຊະຍາກຳທາງຄອມພິວເຕີ: ເຈົ້າຂອງລະຫັດຈະຖືກຕັດສິນບໍ່ໃຫ້ໃຊ້ລະບົບ LPR ແລະຈະຖືກລົງໂທດຕາມລະບຽບ. *
                </p>
              </div>
            </div>
          )
        }
      </DialogTitle>
      <DialogContent className='bg-black'>
        <div className='flex flex-col space-y-6'>
          {/* Contents */}
          <div className='grid grid-cols-[auto_55%] border border-[#384043]'>
            {/* Map Part */}
            <div className='relative h-full w-full border-r-2 border-[#384043]'>
              <BaseMap 
                onMapLoad={handleMapLoad}
              />
            </div>
            {/* Route Detail Part */}
            <div>
              <Typography variant="h6" color="white" className="font-bold bg-[#393B3A] px-3 py-1">{t('text.vehicle-route')}</Typography>
              <div className='h-[83vh] overflow-y-auto'>
                {
                  plateDetailList.map((data, index) => (
                    <div key={`route_data_${index}`}>
                      <div className='flex px-3 py-1 space-x-1 bg-[#48494B]'>
                        <img src={CarIcon} alt={`Car Icon ${index + 1}`} className='w-[22px] h-[22px]' />
                        <p className='text-white text-[15px]'>{`${t('text.car-no')} ${index + 1}`}</p>
                      </div>
                      <div className='grid grid-cols-2 py-2'>
                        {/* Column 1 */}
                        <div className='border-r border-[#384043] px-2 space-y-2'>
                          {/* Image */}
                          <div className='flex items-center justify-center h-40 bg-black'>
                            <div className='h-40 w-[60%] relative'>
                              <img src={`${CENTER_FILE_URL}${data.vehicle_image}`} alt="Vehicle Image" className='h-full w-full' />
                              <img src={`${CENTER_FILE_URL}${data.plate_image}`} alt="Plate Image" className='h-[30%] w-[100px] absolute bottom-0 left-0' />
                            </div>
                          </div>
                          {/* Vehicle Detail */}
                          <div className='text-white'>
                            <div className='flex items-center justify-start space-x-1 mb-2'>
                              <img src={RouteList} alt='Vehicle Detail Icon' className='w-[22px] h-[22px]' />
                              <label className='text-[15px]'>{t('text.vehicle-data')}</label>
                            </div>
                            <div className='grid grid-cols-[30%_auto] text-[14px] h-[20vh] overflow-y-auto'>
                              <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                {t('text.vehicle-plate')}
                              </div>
                              <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                {data.plate}
                              </div>

                              <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                {t('text.brand')}
                              </div>
                              <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                {data.vehicle_make_details && i18n.language === "th" ? data.vehicle_make_details.make_th || "-" : data.vehicle_make_details.make_en || "-"}
                              </div>

                              <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                {t('text.color')}
                              </div>
                              <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                {data.vehicle_color_details && i18n.language === "th" ? data.vehicle_color_details.color_th || "-" : data.vehicle_color_details.color_en || "-"}
                              </div>

                              <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                {t('text.model')}
                              </div>
                              <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                {data.vehicle_model_details && i18n.language === "th" ? data.vehicle_model_details.model_th || "-" : data.vehicle_model_details.model_en || "-"}
                              </div>

                              <div className='bg-[#393B3A] p-2'>
                                {t('text.plate-group')}
                              </div>
                              <div className='bg-[#48494B] p-2'>
                                {data.vehicle_body_type_details && i18n.language === "th" ? data.vehicle_body_type_details.body_type_th || "-"  : data.vehicle_body_type_details.body_type_en || "-"}
                              </div>
                            </div>
                          </div>
                          {/* Owner Detail */}
                          <div className='text-white'>
                            <div className='flex items-center justify-start space-x-1 mb-2'>
                              <img src={OwnerIcon} alt='Owner Icon' className='w-[22px] h-[22px]' />
                              <label className='text-[15px]'>{t('text.owner-info')}</label>
                            </div>
                            <div className='grid grid-cols-[30%_auto] text-[14px] h-[14.2vh] overflow-y-auto'>
                              <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                {t('text.owner-name')}
                              </div>
                              <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                {data.ownerName || "-"}
                              </div>

                              <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                {t('text.owner-pid')}
                              </div>
                              <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                {data.ownerNationalId || "-"}
                              </div>

                              <div className='bg-[#393B3A] p-2'>
                                {t('text.owner-address')}
                              </div>
                              <div className='bg-[#48494B] p-2'>
                                {data.ownerAddress || "-"}
                              </div>
                            </div>
                          </div>
                          {/* Ownership Detail */}
                          <div className='text-white'>
                            <div className='flex items-center justify-start space-x-1 mb-2'>
                              <img src={OwnerIcon} alt='Ownership Icon' className='w-[22px] h-[22px]' />
                              <label className='text-[15px]'>{t('text.ownership-info')}</label>
                            </div>
                            <div className='grid grid-cols-[30%_auto] text-[14px] h-[14.2vh] overflow-y-auto'>
                              <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                {t('text.ownership-name')}
                              </div>
                              <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                {data.ownershipName || "-"}
                              </div>

                              <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                {t('text.ownership-pid')}
                              </div>
                              <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                {data.ownershipNationalId || "-"}
                              </div>

                              <div className='bg-[#393B3A] p-2'>
                                {t('text.ownership-address')}
                              </div>
                              <div className='bg-[#48494B] p-2'>
                                {data.ownershipAddress || "-"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 2 */}
                        <div className='px-2 space-y-2'>
                          <div className='text-white'>
                            <div className='flex items-center justify-start space-x-1'>
                              <img src={RouteList} alt='Route Icon' className='w-[22px] h-[22px]' />
                              <label>{t('text.travel-order')}</label>
                            </div>
                            <div className='h-[75vh] overflow-y-auto'>
                              <table className='w-full'>
                                <thead className='bg-[#242727] h-[35px] sticky top-0'>
                                  <tr className='text-[14px]'>
                                    <td className='text-center'>{t('table.column.checkpoint')}</td>
                                    <td className='w-[42%] text-center'>{t('table.column.time')}</td>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    data.plateRoute && data.plateRoute[0].routes.map((route, index) => (
                                      <tr key={`data_${index}`} className='h-10 text-[14px] border-b border-[#ADADAD] border-dashed'>
                                        <td className='pl-3 text-start bg-[#393B3A]'>{route.camera_name}</td>
                                        <td className='text-center bg-[#48494B]'>{route.epoch_end}</td>
                                      </tr>
                                    ))
                                  }
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='flex justify-end'>
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
              onClick={onClose}
            >
              {t('button.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RouteDetail;