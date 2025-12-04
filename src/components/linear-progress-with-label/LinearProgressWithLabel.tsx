import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Material UI
import Box from '@mui/material/Box';

interface LinearProgressWithLabelProps {
  value: number;
  maxValueProgress: number;
}

const LinearProgressWithLabel: React.FC<LinearProgressWithLabelProps> = ({value, maxValueProgress}) => {
  const progressPercentage = (value / maxValueProgress) * 100
  const [trigger, setTrigger] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger((prev) => prev + 1)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '0.5px solid #81898E' }}>
      <div className='w-full'>
        <motion.div
          key={trigger}
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          style={{
            height: 3,
            borderRadius: 4,
            background: 'linear-gradient(to right, #FDCC0A99, #81898ECC)',
          }}
        />
      </div>
    </Box>
  )
}

export default LinearProgressWithLabel;