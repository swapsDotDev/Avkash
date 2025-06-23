import React, { useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import * as Toast from "@radix-ui/react-toast"
import { Text } from "@radix-ui/themes"
import PropTypes from "prop-types"
import { useTranslation } from "react-i18next"

const WelcomeToast = ({ position }) => {
  const { user } = useUser()
  const { t } = useTranslation()
  const toastShown =
    sessionStorage.getItem("toastShown")

  useEffect(() => {
    if (user && !toastShown) {
      sessionStorage.setItem("toastShown", true)
    }
  }, [user])
  const userName =
    user?.fullName || user?.firstName || "User"

  return (
    <Toast.Provider swipeDirection="right">
      {user && !toastShown && (
        <Toast.Root
          className="bg-green-400 dark:bg-green-600 rounded-xl shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
          style={{ position: position }}
        >
          <Toast.Description asChild>
            <Text className="text-white dark:text-gray-100 text-[18px] font-serif">
              {t(
                "holidaySummaries.welcomeMessage",
                {
                  fullName: userName,
                }
              )}
              !
            </Text>
          </Toast.Description>
        </Toast.Root>
      )}
      <Toast.Viewport className="[--viewport-padding:_50px] fixed top-8 right-0 p-[var(--viewport-padding)] w-[320px] max-w-[400px] z-[2147483647]" />
    </Toast.Provider>
  )
}
WelcomeToast.propTypes = {
  position: PropTypes.string,
}

export default WelcomeToast
