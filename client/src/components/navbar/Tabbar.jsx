import { themeChange } from "theme-change"
import React, { useEffect, useState } from "react"
import { Box, Flex } from "@radix-ui/themes"
import {
  IoIosSearch,
  IoMdMic,
} from "react-icons/io"
import * as Label from "@radix-ui/react-label"
import { UserButton } from "@clerk/clerk-react"
import CustomProfilePage from "../member/CustomProfilePage"
import DynamicTitle from "./DynamicTitle"
import { useTranslation } from "react-i18next"
import Notifications from "./Notifications"
import AdminNotifications from "./AdminNotifications"
import AnnouncementIcon from "../../components/navbar/AnnouncementIcon"
import PropTypes from "prop-types"
import { SunIcon } from "lucide-react"
import { Moon } from "lucide-react"

const Tabbar = ({ isMember }) => {
  const [currentTheme, setCurrentTheme] =
    useState(localStorage.getItem("theme"))

  useEffect(() => {
    themeChange(false)
    if (currentTheme === null) {
      if (
        window.matchMedia &&
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
      ) {
        setCurrentTheme("dark")
      } else {
        setCurrentTheme("light")
      }
    }
  }, [currentTheme])
  const { t } = useTranslation()
  return (
    <Box className="navbar sticky top-0 bg-base-100 dark:bg-gray-900 dark:text-white z-10 transition-colors duration-200">
      <Flex className="flex-1">
        <h1 className="sm:text-sm md:text-lg lg:text-2xl font-semibold ml-2 dark:text-white transition-colors duration-200">
          <DynamicTitle />
        </h1>
      </Flex>
      <Flex className="flex-none">
        <AnnouncementIcon />
        <Label.Root className="swap">
          <input type="checkbox" />
          <Moon
            data-set-theme="light"
            data-act-class="ACTIVECLASS"
            className={
              "w-6 h-6 text-black " +
              (currentTheme === "light"
                ? "swap-off"
                : "swap-on")
            }
          />
          <SunIcon
            data-set-theme="dark"
            data-act-class="ACTIVECLASS"
            className={
              "fill-current w-6 h-6 text-gray-400 " +
              (currentTheme === "dark"
                ? "swap-off"
                : "swap-on")
            }
          />
        </Label.Root>
        {isMember ? (
          <Notifications />
        ) : (
          <AdminNotifications />
        )}
        <Box className="hidden md:flex items-center bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-full p-1.5 transition-colors duration-200">
          <IoIosSearch
            size="1.2em"
            className="dark:text-gray-300"
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="outline-none bg-transparent dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
          />
          <IoMdMic
            size="1.2em"
            className="dark:text-gray-300"
          />
        </Box>
        <Flex className="flex ml-2">
          <UserButton>
            <UserButton.UserProfilePage
              label="User info"
              url="../member/CustomProfilePagecl"
              labelIcon={
                <svg
                  className="h-4.5 w-6 text-gray-700 dark:text-gray-300"
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
              <CustomProfilePage />
            </UserButton.UserProfilePage>
            <UserButton.UserProfilePage label="account" />
            <UserButton.UserProfilePage label="security" />
          </UserButton>
        </Flex>
      </Flex>
    </Box>
  )
}
Tabbar.propTypes = {
  isMember: PropTypes.bool.isRequired,
}
export default Tabbar
