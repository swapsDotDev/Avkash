import React, { useEffect, useState } from "react"
import {
  Text,
  Box,
  Flex,
  Switch,
  Dialog,
  Button,
} from "@radix-ui/themes"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@radix-ui/react-dropdown-menu"
import {
  UserButton,
  UserProfile,
} from "@clerk/clerk-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faLanguage,
  faCaretDown,
  faBell,
  faEnvelope,
  faUserEdit,
} from "@fortawesome/free-solid-svg-icons"
import CustomProfilePage from "../CustomProfilePage"
import SettingCard from "../SettingCard"
import { useTranslation } from "react-i18next"
import { useUser } from "@clerk/clerk-react"
import toast from "react-hot-toast"
import axios from "axios"
import { useOrganizationContext } from "../../OrganizationContext"

const Setting = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { t, i18n } = useTranslation()
  const [language, setLanguage] = useState(
    i18n.language
  )
  const { user } = useUser()
  const [isDropdownOpen, setIsDropdownOpen] =
    useState(false)
  const [
    isNotificationEnabled,
    setIsNotificationEnabled,
  ] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [
    isEmailNotificationEnabled,
    setIsEmailNotificationEnabled,
  ] = useState(true)
  const { organizationName, org_slug } =
    useOrganizationContext()
  const [currentTheme, setCurrentTheme] =
    useState(
      localStorage.getItem("theme") || "light"
    )

  useEffect(() => {
    const handleThemeChange = () => {
      setCurrentTheme(
        localStorage.getItem("theme") || "light"
      )
    }
    window.addEventListener(
      "storage",
      handleThemeChange
    )
    return () =>
      window.removeEventListener(
        "storage",
        handleThemeChange
      )
  }, [])

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang)
    setLanguage(lang)
    setIsDropdownOpen(false)
  }

  const dropdownItems = [
    { lang: "en", label: "english" },
    { lang: "hi", label: "hindi" },
    { lang: "mr", label: "marathi" },
  ]

  const handleNotificationChange = (checked) => {
    axios
      .put(
        `${BASE_URL}/switch_desktop_notfication/${user.id}`,
        {},
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
            switch: checked,
          },
        }
      )
      .then((response) => {
        toast.success(response.data.message)
        setIsNotificationEnabled(checked)
      })
      .catch(() => {
        toast.error(
          "Error in updating notification status"
        )
      })
  }

  const handleEmailNotificationChange = (
    checked
  ) => {
    axios
      .put(
        `${BASE_URL}/switch_email_notfication/${user.id}`,
        {},
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
            switch: checked,
          },
        }
      )
      .then((response) => {
        toast.success(response.data.message)
        setIsEmailNotificationEnabled(checked)
      })
      .catch(() => {
        toast.error(
          "Error in updating notification status"
        )
      })
  }

  useEffect(() => {
    axios
      .get(
        `${BASE_URL}/desktop_notfication_status/${user.id}`,
        {
          params: {
            organization_name: organizationName,
          },
        }
      )
      .then((response) => {
        setIsNotificationEnabled(
          response.data.desktop_notification
        )
      })
    axios
      .get(
        `${BASE_URL}/email_notfication_status/${user.id}`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then((response) => {
        setIsEmailNotificationEnabled(
          response.data.email_notification
        )
      })
  }, [user.id, organizationName])

  return (
    <Box className="w-full h-[85vh]">
      <Flex className="w-full flex-col sm:flex-col md:flex-col lg:flex-row gap-0 sm:gap-2 md:gap-3 lg:gap-4">
        <SettingCard
          icon={faLanguage}
          title={t("languagePreferenceTitle")}
        >
          <Text
            as="p"
            className="text-sm sm:text-sm md:text-base lg:text-base text-gray-700 dark:text-gray-200"
          >
            {t("selectLanguageText")}
          </Text>
          <Box className="flex items-center space-x-1 my-5">
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger className="inline-flex items-center space-x-1 text-sm bg-white dark:bg-gray-800 rounded-md px-3 py-1 cursor-pointer hover:bg-green-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors duration-200 min-w-[120px]">
                <Text
                  as="span"
                  className="text-gray-900 dark:text-white"
                >
                  {t("selectLanguage")}
                </Text>
                <FontAwesomeIcon
                  icon={faCaretDown}
                  className="text-gray-900 dark:text-white cursor-pointer border border-gray-200 dark:border-gray-600 rounded-full p-1 hover:bg-green-100 dark:hover:bg-gray-600 transition-colors duration-200"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="absolute z-10 right-0 mt-[-5px] w-[120px] rounded-md shadow-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                style={{
                  left: "-65px",
                  padding: "0.25rem 0",
                }}
              >
                {dropdownItems.map(
                  ({ lang, label }) => (
                    <Box
                      key={lang}
                      className={`${
                        language === lang
                          ? "font-bold"
                          : ""
                      } border-b border-gray-300 dark:border-gray-600 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                      onClick={() =>
                        handleLanguageChange(lang)
                      }
                    >
                      <Box className="text-sm px-3">
                        {t(label)}
                      </Box>
                    </Box>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </Box>
        </SettingCard>
        <SettingCard
          icon={faBell}
          title={t("DesktopNotification")}
        >
          <Text className="text-sm sm:text-sm md:text-base lg:text-base text-gray-700 dark:text-gray-200">
            {t(
              "ClickheretoOnOffDesktopNotification"
            )}
            <Box mt="4">
              <Flex
                align="center"
                gap="2"
              >
                <Switch
                  size="3"
                  checked={isNotificationEnabled}
                  onCheckedChange={
                    handleNotificationChange
                  }
                  required
                  name="desktop-notifications"
                  value="enabled"
                  className="bg-gray-300 dark:bg-gray-600"
                />
              </Flex>
            </Box>
          </Text>
        </SettingCard>
      </Flex>

      <Flex className="flex-col sm:flex-col md:flex-col lg:flex-row gap-0 sm:gap-2 md:gap-3 lg:gap-4">
        <SettingCard
          icon={faEnvelope}
          title={t("EmailNotification")}
        >
          <Text className="text-sm sm:text-sm md:text-base lg:text-base text-gray-700 dark:text-gray-200">
            {t(
              "ClickheretoOnOffEmailNotification"
            )}
            <Box mt="4">
              <Flex
                align="center"
                gap="2"
              >
                <Switch
                  size="3"
                  checked={
                    isEmailNotificationEnabled
                  }
                  onCheckedChange={
                    handleEmailNotificationChange
                  }
                  required
                  name="email-notifications"
                  value="enabled"
                  className="bg-gray-300 dark:bg-gray-600"
                />
              </Flex>
            </Box>
          </Text>
        </SettingCard>
        <SettingCard
          icon={faUserEdit}
          title={t("UpdateProfile")}
        >
          <Box className="text-sm sm:text-sm md:text-base lg:text-base mb-3 text-gray-700 dark:text-gray-200">
            {t("UpdateYourProfile")}
          </Box>
          <Box>
            <Dialog.Root
              open={openForm}
              onOpenChange={setOpenForm}
            >
              <Dialog.Trigger>
                <Button className="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200">
                  {t("EditProfile")}
                </Button>
              </Dialog.Trigger>

              <Dialog.Content
                style={{
                  maxWidth: "fit-content",
                  padding: "0",
                  backgroundColor:
                    currentTheme === "dark"
                      ? "#1F2937"
                      : "#FFFFFF",
                }}
              >
                <UserProfile>
                  <UserButton.UserProfilePage
                    label="User info"
                    url="../member/CustomProfilePagecl"
                    labelIcon={
                      <svg
                        className="h-4.5 w-6 text-grey-700 dark:text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    }
                  >
                    <CustomProfilePage
                      setOpenForm={setOpenForm}
                    />
                  </UserButton.UserProfilePage>
                  <UserButton.UserProfilePage label="account" />
                  <UserButton.UserProfilePage label="security" />
                </UserProfile>
              </Dialog.Content>
            </Dialog.Root>
          </Box>
        </SettingCard>
      </Flex>
    </Box>
  )
}

export default Setting
