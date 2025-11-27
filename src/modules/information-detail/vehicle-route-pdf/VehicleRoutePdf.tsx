import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

// Types
import {
  SearchPlateCondition
} from "../../../features/search/SearchTypes"
import {
  FileData,
} from "../../../features/types";

// Utils
import {
  getImageFormat,
  loadFont
} from "../../../utils/commonFunction"

export const generateVehicleRoutePdfBlob = async (
  data: SearchPlateCondition[],
  t: (key: string) => string,
  i18n: any,
  fileUrl: string,
  mapCapture: FileData[]
) => {

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  try {
    const regularFontBase64 = await loadFont("/fonts/NotoSansThai-Regular.ttf");
    const boldFontBase64 = await loadFont("/fonts/NotoSansThai-Bold.ttf");
    const semiBoldFontBase64 = await loadFont("/fonts/NotoSansThai-SemiBold.ttf");

    doc.addFileToVFS("NotoSansThai-Regular.ttf", regularFontBase64);
    doc.addFileToVFS("NotoSansThai-Bold.ttf", boldFontBase64);
    doc.addFileToVFS("NotoSansThai-SemiBold.ttf", semiBoldFontBase64);

    doc.addFont("NotoSansThai-Regular.ttf", "NotoSansThai", "normal");
    doc.addFont("NotoSansThai-Bold.ttf", "NotoSansThai", "bold");
    doc.addFont("NotoSansThai-SemiBold.ttf", "NotoSansThai", "semi-bold");

    doc.setFont("NotoSansThai", "normal");
  } catch (error) {
    console.warn("Failed to load Thai fonts, using default:", error);
  }

  // Page Header
  const addHeader = (pageNum: number, totalPages: number) => {
    doc.addImage("/project-logo/pdf-logo.png", "JPEG", 8, 3, 18, 15);
    doc.setFont("NotoSansThai", "normal");
    doc.setTextColor("#2A2C2E");
    doc.setFontSize(12);
    doc.text(`${pageNum}/${totalPages}`, pageWidth - 5, 8, { align: "right" });
    doc.setFont("NotoSansThai", "semi-bold");
    doc.setFontSize(15);
    doc.text(t("pdf.search-with-condition-route"), 60, 25);
  };

  const totalPages = Math.ceil(data.length);

  let y = 35;
  let currentPage = 1;
  addHeader(currentPage, totalPages);

  data.forEach((item, index) => {
    // Border outline
    doc.setDrawColor("#777777");
    doc.rect(10, y - 5, pageWidth - 20, 57);

    // Box outline (Plate Info)
    doc.setDrawColor("#777777");
    doc.rect(10, y - 5, pageWidth - 20, 19);

    // Header (Plate Info)
    doc.setFontSize(12);
    doc.setFont("NotoSansThai", "semi-bold");
    doc.text(t('text.vehicle-plate-and-info'), 13, y + 2);
    const regionName =
      item.region
        ? i18n.language === "th"
          ? item.region.name_th
          : item.region.name_en
        : "";

    const makeName =
      item.vehicle_make_details
        ? i18n.language === "th"
          ? item.vehicle_make_details.make_th || ""
          : item.vehicle_make_details.make_en || ""
        : "";

    const modelName =
      item.vehicle_model_details?.model_en || "";

    const colorName =
      item.vehicle_color_details
        ? i18n.language === "th"
          ? item.vehicle_color_details.color_th || ""
          : item.vehicle_color_details.color_en || ""
        : "";

    const textLine = `${item.plate || "-"}${regionName ? ` ${regionName} ` : regionName}${makeName ? ` ${t("text.brand")} ${makeName} ` : ""}${modelName ? ` ${t("text.model-only")} ${modelName} ` : ""}${colorName ? ` ${t("text.color")}${colorName} ` : ""}`;
    
    doc.setFont("NotoSansThai", "normal");
    doc.text(textLine, 13, y + 10);

    // Box outline (Province)
    doc.setDrawColor("#777777");
    doc.rect(10, y + 14, 70, 19);

    // Province
    doc.setFont("NotoSansThai", "semi-bold");
    doc.text(t('text.province-full'), 13, y + 20);
    doc.setFont("NotoSansThai", "normal");
    doc.text(item.province || "-", 13, y + 28);

    // Box outline (District)
    doc.setDrawColor("#777777");
    doc.rect((pageWidth / 2) - 25, y + 14, 65, 19);

    // District
    doc.setFont("NotoSansThai", "semi-bold");
    doc.text(t('text.district-full'), (pageWidth / 2) - 23, y + 20);
    doc.setFont("NotoSansThai", "normal");
    doc.text(item.district || "-", (pageWidth / 2) - 23, y + 28);

    // Box outline (Sub-District)
    doc.setDrawColor("#777777");
    doc.rect(pageWidth - 65, y + 14, 55, 19);

    // Sub-District
    doc.setFont("NotoSansThai", "semi-bold");
    doc.text(t('text.sub-district-full'), pageWidth - 63, y + 20);
    doc.setFont("NotoSansThai", "normal");
    doc.text(item.subDistrict || "-", pageWidth - 63, y + 28);

    // Box outline (Checkpoint)
    doc.setDrawColor("#777777");
    doc.rect(10, y + 33, 70, 19);

    // Checkpoint
    doc.setFont("NotoSansThai", "semi-bold");
    doc.text(t('text.checkpoint'), 13, y + 40);
    doc.setFont("NotoSansThai", "normal");
    doc.text(item.checkpoint.checkpoint_name || "-", 13, y + 48);

    // Box outline (Start/End DateTime)
    doc.setDrawColor("#777777");
    doc.rect((pageWidth / 2) - 25, y + 33, 65, 19);

    // Start/End DateTime
    doc.setFont("NotoSansThai", "semi-bold");
    doc.text(t('text.start-end-date-time'), (pageWidth / 2) - 23, y + 40);
    doc.setFont("NotoSansThai", "normal");
    const routes = item.plateRoute?.[0]?.routes ?? [];
    if (routes.length > 0) {
      const routeStart = routes[0];
      const routeEnd = routes[routes.length - 1];
      doc.setFontSize(10);
      doc.text(
        `${dayjs(routeStart.epoch_end).format("DD/MM/YYYY HH:mm")} - ${dayjs(routeEnd.epoch_end).format("DD/MM/YYYY HH:mm")}`,
        (pageWidth / 2) - 23,
        y + 48
      );
    } 
    else {
      doc.text("-", (pageWidth / 2) - 23, y + 48);
    }

    // Box outline (Report Create Date)
    doc.setDrawColor("#777777");
    doc.rect(pageWidth - 65, y + 33, 55, 19);

    // Report Create Date
    doc.setFontSize(12);
    doc.setFont("NotoSansThai", "semi-bold");
    doc.text(t('text.report-create-date'), pageWidth - 63, y + 40);
    doc.setFont("NotoSansThai", "normal");
    doc.text(dayjs().format("DD/MM/YYYY"), pageWidth - 63, y + 48);

    y += 65;

    // Vehicle Compare Header
    doc.setFontSize(15);
    doc.setFont("NotoSansThai", "bold");
    doc.text(`${t('text.compare-vehicle')} ${index + 1}/${data.length}`, 11, y);

    // Box outline
    doc.setDrawColor("#777777");
    doc.rect(10, y + 10, pageWidth - 20, 65);

    // Box outline (Images)
    doc.setDrawColor("#777777");
    doc.rect(10, y + 10, 55, 65);

    // Images
    const vehicleImage = item.vehicle_image ? `${fileUrl}${item.vehicle_image}` : "/images/no_image.png"
    const plateImage = item.plate_image ? `${fileUrl}${item.plate_image}` : "/images/no_image.png"
    doc.addImage(vehicleImage, getImageFormat(vehicleImage), 13, y + 18, 49, 50);
    doc.addImage(plateImage, getImageFormat(plateImage), 13, y + 48, 35, 20);

    // Vehicle Info
    doc.setFontSize(12);
    doc.setFont("NotoSansThai", "semi-bold");
    doc.text(t('text.vehicle-info'), 68, y + 17);
    doc.setFontSize(10);
    doc.setFont("NotoSansThai", "normal");
    const vehicleInfo = `${item.plate || "-"}${regionName ? ` ${regionName} ` : regionName}${makeName ? ` ${t("text.brand")} ${makeName} ` : ""}${colorName ? ` ${t("text.color")}${colorName} ` : ""}`;
    doc.text(vehicleInfo, 68, y + 24);

    // Transportation Info
    doc.setFontSize(10);
    doc.setFont("NotoSansThai", "semi-bold");
    doc.text(t('text.transportation-info'), 68, y + 31);
    doc.setFont("NotoSansThai", "normal");
    doc.text(vehicleInfo, 68, y + 38);

    const vehicleType = item.vehicle_body_type_details ? i18n.language === "th" ? item.vehicle_body_type_details.body_type_th || "-" : item.vehicle_body_type_details.body_type_en || "-" : "-"
    doc.text(`${t('text.plate-group')} ${vehicleType}`, pageWidth - 68, y + 38);

    doc.text(`${t('text.ownership-name')} ${item.ownerName || "-"}`, 68, y + 45);
    doc.text(`${t('text.nation-id')} ${item.ownerName || "-"}`, pageWidth - 68, y + 45);
    doc.text(`${t('text.owner-address')} ${item.ownerName || "-"}`, 68, y + 52);

    // Remark
    doc.setFont("NotoSansThai", "semi-bold");
    doc.text(t('text.remark'), 68, y + 59);
    doc.setFont("NotoSansThai", "normal");
    doc.text(item.is_special_plate > 0 ? `${t('text.car-plate')}${i18n.language === "th" ? `${item.plate_class_th} (${item.plate_class_en})` : item.plate_class_en}` : "-", 92, y + 59);

    // BlackList
    if (item.isBlackList && item.isBlackList) {
      doc.setFont("NotoSansThai", "semi-bold");
      doc.text(t('text.arrest-warrant'), 68, y + 66);
      doc.setFont("NotoSansThai", "normal");
      doc.text(item.behavior || "-", 92, y + 66);
    }

    y += 66;

    // Box outline
    doc.setDrawColor("#777777");
    doc.rect(10, y + 9, pageWidth - 20, 115);

    // Box outline (Images)
    doc.setDrawColor("#777777");
    doc.rect(10, y + 9, 55, 115);

    let mapImage = "";
    if (mapCapture.length > 0) {
      mapImage = mapCapture[0].url ? `${fileUrl}${mapCapture[0].url}` : "/images/no_image.png"
    }
    else {
      mapImage = "/images/no_image.png"
    }

    doc.addImage(mapImage, getImageFormat(mapImage), 13, y + 18, 49, 60);

    // Route
    doc.setFontSize(12);
    doc.setFont("NotoSansThai", "semi-bold");
    doc.text(t('text.map-route'), 68, y + 17);
    doc.setFontSize(10);
    doc.setFont("NotoSansThai", "normal");
    doc.text(t('text.travel-order'), 68, y + 24);
    doc.setFont("NotoSansThai", "normal");
    doc.text(t('text.checkpoint'), 68, y + 31);
    doc.setFont("NotoSansThai", "normal");
    doc.text(t('text.time'), pageWidth - 68, y + 31);

    y += 31;

    item.plateRoute && item.plateRoute[0].routes.map((route, index) => {
      doc.setFont("NotoSansThai", "normal");
      doc.text(route.camera_name, 68, y + (index + 1) * 7);
      doc.setFont("NotoSansThai", "normal");
      doc.text(dayjs(route.epoch_end).format("DD/MM/YYYY HH:mm"), pageWidth - 68, y + (index + 1) * 7);
    })

    // Page break
    if (index < data.length - 1) {
      doc.addPage();
      currentPage++;
      y = 35;
      addHeader(currentPage, totalPages);
    }
  });

  return doc.output("blob");
};

export const downloadVehicleRoutePdf = async (
  data: SearchPlateCondition[],
  fileName: string,
  t: (key: string) => string,
  i18n: any,
  fileUrl: string,
  mapCapture: FileData[]
) => {
  const blob = await generateVehicleRoutePdfBlob(data, t, i18n, fileUrl, mapCapture);
  saveAs(blob, fileName);
};