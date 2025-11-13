import "../Loading.scss";

// i18n
import { useTranslation } from 'react-i18next';

const LoadingTemplate = () => {
  // i18n
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center">
      {/* <div className="pulse"></div> */}
      <div className="spinner"></div>

      <p className="pt-6" style={{ fontWeight: "bolder", color: "white" }}>
        {`${t('text.please-wait-a-moment')}...`}
      </p>
    </div>
  );
};

export default LoadingTemplate;
