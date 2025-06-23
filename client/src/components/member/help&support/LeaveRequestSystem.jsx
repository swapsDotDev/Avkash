import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Grid, Box, Text } from "@radix-ui/themes"
const LeaveRequestSystem = () => {
  const { t } = useTranslation()

  return (
    <Grid className="p-3 sm:p-4 md:p-5 lg:p-6 h-[85vh]  relative">
      <Box className="mb-6  sm:mb-4 md:mb-4 lg:mb-0">
        <Link
          to="/helpsupport"
          className="bg-blue-800 hover:bg-blue-700 text-white text-xs sm:text-sm md:text-base lg:text-base font-bold my-0 sm:my-4 md:my-4 lg:my-5 px-1.5 py-1.5 sm:px-3 md:px-3 lg:px-4 sm:py-1.5 md:py-1.5 lg:py-2 rounded absolute top-0 left-21"
        >
          {t("backButton")}
        </Link>
      </Box>
      <Text className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 text-black dark:text-white">
        {t("leaveRequestSystemTitle")}
      </Text>
      <Box className="instructions mb-2 sm:mb-4 md:mb-5 lg:mb-8">
        <Text
          weight={"bold"}
          className="text-base sm:text-base md:text-base lg:text-xl dark:text-white"
        >
          {t("submitLeaveRequestTitle")}
        </Text>
        <Box>
          <ol className="list-decimal pl-2 sm:pl-3 md:pl-5 lg:pl-6">
            <li>
              <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                {t("loginInstructions")}
              </Text>
              &thinsp;
            </li>
            <li>
              <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                {t("navigateInstructions")}
              </Text>
              &thinsp;
            </li>
            <li>
              <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                {t("clickInstructions")}
              </Text>
              &thinsp;
            </li>
            <li>
              <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                {t("fillOutFormInstructions")}
              </Text>
              &thinsp;
            </li>
            <ul className="list-disc pl-8">
              <li>
                <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                  {t(
                    "selectLeaveTypeInstruction"
                  )}
                </Text>
              </li>
              <li>
                <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                  {t("chooseDatesInstruction")}
                </Text>
                &thinsp;
              </li>
              <li>
                <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                  {t("provideReasonInstruction")}
                </Text>
                &thinsp;
              </li>
              <li>
                <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                  {t(
                    "attachDocumentsInstruction"
                  )}
                </Text>
              </li>
            </ul>
            <li>
              <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                {t("reviewInfoInstruction")}
              </Text>
              &thinsp;
            </li>
            <li>
              <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                {t("submitRequestInstruction")}
              </Text>
              &thinsp;
            </li>
            <li>
              <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                {t("waitApprovalInstruction")}
              </Text>
              &thinsp;
            </li>
            <li>
              <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
                {t(
                  "receiveNotificationInstruction"
                )}
              </Text>
            </li>
          </ol>
        </Box>
      </Box>
      <Box className="note">
        <Text className="text-3xl font-semibold text-black dark:text-white">
          <Text className="text-base sm:text-base md:text-base lg:text-xl dark:text-gray-300">
            {t("importantNotesTitle")}
          </Text>
          &thinsp;
        </Text>
        <ul className="list-disc pl-2 sm:pl-3 md:pl-5 lg:pl-6">
          <li>
            <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
              {t("submitInAdvanceNote")}
            </Text>
            &thinsp;
          </li>
          <li>
            <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
              {t("beHonestNote")}
            </Text>
          </li>
          <li>
            <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
              {t("trackBalanceNote")}
            </Text>
            &thinsp;
          </li>
          <li>
            <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
              {t("urgentRequestsNote")}
            </Text>
            &thinsp;
          </li>
        </ul>
      </Box>
    </Grid>
  )
}

export default LeaveRequestSystem
