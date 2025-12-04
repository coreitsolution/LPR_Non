import React, { useState, useEffect } from 'react';
import { FileDown } from "lucide-react";
import { motion } from "framer-motion";

// Material UI
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface ProgressBarWithLabelProps extends LinearProgressProps {
  value: number,
  message: string,
}

const ProgressBarWithLabel: React.FC<ProgressBarWithLabelProps> = ({value, message, ...props}) => {
  const [gradientPosition, setGradientPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev + 1) % 200);
    }, 20);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className='fixed inset-0 flex flex-col items-center justify-center h-screen w-screen'
      style={{
        background: "rgba(0, 0, 0, 0.7)",
        zIndex: 9999,
      }}
    >
      {/* Logo */}
      <img
        src="/project-logo/logo.png"
        alt="Loading Logo"
        className="w-[10vw] h-[10vh] mb-4"
      />
      {/* Progress Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '600px', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={value}
            sx={{
              backgroundColor: "grey.200",
              "& .MuiLinearProgress-bar": { 
                borderRadius: 5,
                backgroundColor: 'var(--primary-color)',
              }
            }}
            {...props} 
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >{`${Math.round(value)}%`}</Typography>
        </Box>
      </Box>
      {/* Message */}
      <Box sx={{ display: 'flex', mt: 1 }}>
        <motion.div
          className="w-5 h-5 mb-4 flex items-center justify-center"
          animate={{
            color: value < 100 ? gradientPosition < 100 ? '#808080' : 'var(--primary-color)' : 'var(--primary-color)'
          }}
          transition={{ duration: 0.2 }}
        >
          <FileDown size={48} strokeWidth={1.5} />
        </motion.div>
        <Typography variant="body1" sx={{ color: '#FFFFFF', textAlign: 'center', ml: 1, alignItems: 'center' }}>
          {message}
        </Typography>
      </Box>
    </div>
  )
}

export default ProgressBarWithLabel;