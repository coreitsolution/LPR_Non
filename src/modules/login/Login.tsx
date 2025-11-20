import { Th, Gb } from "react-flags-select"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RootState } from "../../app/store"
import { useSelector } from "react-redux"
import { useAppDispatch } from '../../app/hooks'
import { useNavigate } from 'react-router-dom'

// API
import { login, clearError, userInfo } from '../../features/auth/authSlice'

// Icons
import { FaEye, FaEyeSlash } from "react-icons/fa"

// utils
import { PopupMessage } from "../../utils/popupMessage"

// i18n
import { useTranslation } from "react-i18next";

// Config
import { getUrls } from '../../config/runtimeConfig';

const LoginPage = () => {
  const version = __APP_VERSION__
  const { PROJECT_NAME } = getUrls();

  // i18n
  const { t, i18n } = useTranslation();

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useAppDispatch()
  const { authData, authError, authStatus } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [languageSelected, setLanguageSelect] = useState("th");

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) {
      PopupMessage(t('message.warning.please-input-username'), "", "warning")
      return
    }
    if (!password) {
      PopupMessage(t('message.warning.please-input-password'), "", "warning")
      return
    }
    dispatch(clearError())
    dispatch(login({ username, password }))
  }

  useEffect(() => {
    if (authError) {
      if (authError.toLowerCase().includes('invalid')) {
        PopupMessage(t('message.error.something-wrong-occur'), t('message.error.user-password-invalid'), "error")
      } else {
        PopupMessage(t('message.error.something-wrong-occur'), t('message.error.error-occurred'), "error")
      }
    }
  }, [authError])

  useEffect(() => {
    const fetchUserInfo = async () => {
      await dispatch(userInfo({ filter: `id=${authData.userId}` }))
      navigate('/center')
    }

    if (authData && authData.isAuthenticated && (authData.token && authData.token !== "undefined")) {
      fetchUserInfo();
    }
    
  }, [authData, navigate])

  const handleForgetPassword = () => {
    PopupMessage(t('message.info.forgot-password'), t('message.info.contact-admin'), "info")
  }

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value
    setLanguageSelect(selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
  }

  return (
    <div id='login' className="flex items-center justify-center min-h-screen relative">
      <div className="absolute top-2 right-5 grid grid-cols-[20px_auto] border border-white rounded-[5px] py-[3px] px-3">
        <span className="mr-[5px]">
          {
            (() => {
              switch (languageSelected) {
                case 'th':
                  return <Th />;
                case 'en':
                  return <Gb />;
                default:
                  return <Th />;
              }
            })()
          }
        </span>
        <select 
          className="bg-transparent text-[12px] text-center focus:outline-none focus:ring-0" 
          value={languageSelected} 
          onChange={handleLanguageChange}
        >
          <option className="text-black" value="th">Thai</option>
          <option className="text-black" value="en">English</option>
        </select>
      </div>
      <motion.div
        className="flex flex-col gap-2 w-full max-w-md p-8 bg-white rounded-xl shadow-lg border-[#2B9BED] border"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex justify-center items-center" 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8 }}
        >
          <div 
            className="bg-center bg-no-repeat bg-contain w-full min-h-[250px]" 
            style={{ backgroundImage: `url("/project-logo/logo.png")` }}
          >
          </div>
        </motion.div>

        {/* Form Fields */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit}>
            <div className='mb-[25px]'>
              <input
                type="text"
                className="w-full text-black px-4 py-2 border border-[#C5C8CB] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Username"
                name="username"
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className='mb-[25px] relative'>
              <input
                type={showPassword ? "text" : "password"} // Toggle input type
                className="w-full text-black px-4 py-2 border border-[#C5C8CB] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='current-password'
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className='mt-[50px] text-center w-full'>
              <motion.button
                type="submit"
                className={`mr-2.5 h-[50px] w-full text-white rounded-lg shadow transition ${
                  authStatus === 'loading' ? 'bg-gray-400' : 'bg-[#2B9BED] hover:bg-blue-700'
                }`}
                whileHover={authStatus === 'loading' ? {} : { scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={authStatus === 'loading'}
              >
                {authStatus === 'loading' ? t('button.logging-in') : t('button.login')}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-2 text-start text-sm text-gray-500"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            className="text-black hover:underline"
            onClick={handleForgetPassword}
          >
            {t('button.forget-password')}
          </button>
        </motion.div>

        <div className='flex justify-center mt-[50px]'>
          <div className='w-[230px] text-center border-x border-[#CBD3D9]'>
            <label
              className="text-[#2B9BED]"
            >
              <span className='font-bold text-[15px]'>{PROJECT_NAME}</span>
            </label>
          </div>
        </div>

        <div className='flex justify-center mt-2.5'>
          <label
            className="text-[#A0A6AA]"
          >
            <span className='text-[15px]'>{`Ver ${version}`}</span>
          </label>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage