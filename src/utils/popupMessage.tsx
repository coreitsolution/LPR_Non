import Swal, { SweetAlertIcon } from 'sweetalert2'
import "./popupMessage.css"

export function PopupMessage(title: string, text: string, icon: SweetAlertIcon): Promise<boolean> {
  return (
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: 'swal-popup-zindex',
      }
    }).then((result) => {
      return result.isConfirmed
    })
  )
}

export function PopupMessageWithConfirmButton(
  title: string, 
  text: string, 
  confirmButtonText: string, 
  icon: SweetAlertIcon
): Promise<boolean> {
  return (
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonText: confirmButtonText,
      showCloseButton: true,
      customClass: {
        popup: 'swal-popup-zindex',
      }
    }).then((result) => {
      return result.isConfirmed
    })
  )
}

export function PopupMessageWithCancel(
  title: string, 
  text: string, 
  confirmButtonText: string, 
  cancelButtonText: string, 
  icon: SweetAlertIcon,
  iconColor?: string): 
Promise<boolean> {
  return (
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      showCloseButton: true,
      iconColor: iconColor ? iconColor : "",
      customClass: {
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
      },
    }).then((result) => {
      return result.isConfirmed
    })
  )
}

export function PopupMessageCustomTextWithCancel(
  title: string, 
  html: string, 
  confirmButtonText: string, 
  cancelButtonText: string, 
  icon: SweetAlertIcon,
  iconColor?: string): 
Promise<boolean> {
  return (
    Swal.fire({
      title: title,
      html: html,
      icon: icon,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      showCloseButton: true,
      iconColor: iconColor ? iconColor : "",
      customClass: {
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
      },
    }).then((result) => {
      return result.isConfirmed
    })
  )
}

export function PopupMessageWithCustomImage(title: string, text: string, confirmButtonText: string, imageUrl: string, imageAlt: string): Promise<boolean> {
  return (
    Swal.fire({
      title: title,
      text: text,
      imageUrl,
      imageWidth: 300,
      imageHeight: 100,
      imageAlt,
      showConfirmButton: true,
      confirmButtonText: confirmButtonText,
      showCloseButton: true,
      customClass: {
        confirmButton: 'custom-confirm-button',
        popup: 'swal-popup-zindex',
      }
    }).then((result) => {
      return result.isConfirmed
    })
  )
}