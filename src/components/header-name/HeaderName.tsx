import React from 'react'
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';

// Material UI
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";

interface HeaderNameProps {
  header: string;
  breadcrumbPaths?: string;
}

const HeaderName: React.FC<HeaderNameProps> = ({header, breadcrumbPaths}) => {
  return (
    <div>
      <Breadcrumbs 
        separator={
          <DoubleArrowIcon fontSize="small" sx={{color: "#838383"}} />
        }
      >
        <Typography variant="h5" color={breadcrumbPaths ? "#838383" : "white"} className="font-bold">{header}</Typography>
        {
          breadcrumbPaths && (
            <Typography variant="h5" color="white" className="font-bold">{breadcrumbPaths}</Typography>
          )
        }
      </Breadcrumbs>
    </div>
  )
}

export default HeaderName;