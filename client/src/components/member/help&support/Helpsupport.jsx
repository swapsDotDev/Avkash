import React, { useState } from "react"
import {
  Dialog,
  Text,
  Box,
  Flex,
} from "@radix-ui/themes"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "react-router-dom"
import SettingCard from "../SettingCard"
import {
  faUsers,
  faEnvelope,
  faPhone,
  faBalanceScale,
  faComment,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons"
import FeedbackFormModal from "./FeedbackFormModal"
import { useTranslation } from "react-i18next"

const Helpsupport = () => {
  const [showFeedbackForm, setShowFeedbackForm] =
    useState(false)
  const { t } = useTranslation()
  const handleFeedbackFormToggle = () => {
    setShowFeedbackForm(!showFeedbackForm)
  }

  return (
    <Box className="w-full h-[85vh]">
      <Flex className="w-full flex-col sm:flex-col md:flex-col lg:flex-row gap-0 sm:gap-2 md:gap-3 lg:gap-4">
        <SettingCard
          icon={faUsers}
          title={t("contactUsTitle")}
        >
          <Box>
            <Text className="text-sm sm:text-sm md:text-base lg:text-base dark:text-gray-300">
              {t("contactUsContent")}
            </Text>
            <Box className="mt-10">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="mr-2 text-blue-800 "
              />
              <Text
                as="a"
                href="mailto:support@avkash.com"
                className="text-blue-800 hover:underline mt-5 text-sm sm:text-sm md:text-base lg:text-base"
              >
                support@avkash.com
              </Text>
            </Box>
            <Text>
              <Box className="mt-5">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="mr-2 text-blue-800"
                />
                <Text
                  as="a"
                  href="tel:123-456-7890"
                  className="text-blue-800 hover:underline text-sm sm:text-sm md:text-base lg:text-base"
                >
                  xxx-xxxx-xxx
                </Text>
              </Box>
            </Text>
          </Box>
        </SettingCard>

        <SettingCard
          icon={faCalendarAlt}
          title={t("leaveRequestTitle")}
        >
          <Box className="overflow-y-auto">
            <Text className="text-sm sm:text-sm md:text-base lg:text-base dark:text-gray-300">
              {t("leaveRequestContent")}
            </Text>
            <Box className="mt-12">
              <Link
                to="/leave-request"
                className="text-blue-800 hover:underline"
              >
                <Text className="text-sm sm:text-sm md:text-base lg:text-base">
                  {t("leaveRequests")}
                </Text>
              </Link>
            </Box>
          </Box>
        </SettingCard>
      </Flex>
      <Flex className="w-full  flex-col sm:flex-col md:flex-col lg:flex-row gap-0 sm:gap:gap-2 md:gap-3 lg:gap-4 ">
        <SettingCard
          icon={faBalanceScale}
          title={t("complianceTitle")}
        >
          <Box className="overflow-y-auto max-h-52">
            <Text className="text-sm sm:text-sm md:text-base lg:text-base dark:text-gray-300">
              {t("complianceContent")}
            </Text>
            <Box className="mt-10">
              <Link
                to="/leave-policies"
                className="text-blue-800 hover:underline"
              >
                <Text className="text-sm sm:text-sm md:text-base lg:text-base">
                  {t("leavePolicies")}
                </Text>
              </Link>
            </Box>
          </Box>
        </SettingCard>
        <SettingCard
          icon={faComment}
          title={t("feedbackTitle")}
          className={
            showFeedbackForm ? "enlarged" : ""
          }
        >
          <Box className="overflow-y-auto">
            <Text className="text-sm sm:text-sm md:text-base lg:text-base dark:text-gray-300">
              {t("feedbackContent")}
            </Text>
            <Box className="mt-10">
              <Dialog.Root
                open={showFeedbackForm}
                onOpenChange={
                  handleFeedbackFormToggle
                }
              >
                <Dialog.Trigger size="3">
                  <Text className="text-blue-800 hover:underline cursor-pointer">
                    <Text className="text-sm sm:text-sm md:text-base lg:text-base	">
                      {" "}
                      {t("submitFeedback")}
                    </Text>
                  </Text>
                </Dialog.Trigger>
                <Dialog.Content className="bg-white dark:bg-gray-800 rounded-lg">
                  <Dialog.Description>
                    <FeedbackFormModal
                      handleCloseModal={
                        handleFeedbackFormToggle
                      }
                    />
                  </Dialog.Description>
                </Dialog.Content>
              </Dialog.Root>
            </Box>
          </Box>
        </SettingCard>
      </Flex>
    </Box>
  )
}

export default Helpsupport
