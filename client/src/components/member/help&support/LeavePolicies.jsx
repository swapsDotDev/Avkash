import React from "react"
import { Link } from "react-router-dom"
import { Grid, Box, Text } from "@radix-ui/themes"
import { useTranslation } from "react-i18next"

const LeavePolicies = () => {
  const { t } = useTranslation()

  return (
    <Grid className="p-3 sm:p-4 md:p-5 lg:p-6 h-[85vh] relative">
      <Box className="mb-6 sm:mb-4 md:mb-4 lg:mb-0">
        <Link
          to="/helpsupport"
          className="bg-blue-800 hover:bg-blue-700 text-white text-xs sm:text-sm md:text-base lg:text-base font-bold my-0 sm:my-4 md:my-4 lg:my-5 px-1.5 py-1.5 sm:px-3 md:px-3 lg:px-4 sm:py-1.5 md:py-1.5 lg:py-2 rounded absolute top-0 left-21"
        >
          {t("backButton")}
        </Link>
      </Box>
      <Text className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 text-black dark:text-white">
        {t("leavePoliciesTitle")}
      </Text>

      <Box className="mb-8">
        <Box className="font-semibold mb-2 text-black dark:text-white">
          <Text className="text-base sm:text-base md:text-base lg:text-xl">
            {t("purposeTitle")}
          </Text>
        </Box>
        <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
          {t("purposeContent")}
        </Text>
      </Box>

      <Box className="mb-8">
        <Box>
          <Text className="text-base sm:text-base md:text-base lg:text-xl font-semibold mb-2 text-black dark:text-gray-300">
            {t("eligibilityTitle")}
          </Text>
        </Box>
        <Text className="text-sm sm:text-base md:text-lg lg:text-lg dark:text-gray-300">
          {t("eligibilityContent")}
        </Text>
      </Box>

      <Box className="mb-8">
        <Text className="text-xl font-semibold mb-2 text-black dark:text-gray-300">
          {t("typesOfLeaveTitle")}
        </Text>
        <ul className="list-disc list-inside text-lg">
          <li>
            <Text
              weight={"bold"}
              className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300"
            >
              {t("annualLeaveTitle")}
            </Text>
            &thinsp;-
            <Text className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300">
              &thinsp;
              {t("annualLeaveContent")}
            </Text>
          </li>
          <li>
            <Text
              weight={"bold"}
              className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300"
            >
              {t("sickLeaveTitle")}
            </Text>
            &thinsp;-
            <Text className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300">
              &thinsp;
              {t("sickLeaveContent")}
            </Text>
          </li>
          <li>
            <Text
              weight={"bold"}
              className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300"
            >
              {t("maternityLeaveTitle")}
            </Text>
            &thinsp;-
            <Text className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300">
              &thinsp;
              {t("maternityLeaveContent")}
            </Text>
          </li>
          <li>
            <Text
              weight={"bold"}
              className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300"
            >
              {t("paternityLeaveTitle")}
            </Text>
            &thinsp;-
            <Text className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300">
              &thinsp;
              {t("paternityLeaveContent")}
            </Text>
          </li>
          <li>
            <Text
              weight={"bold"}
              className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300"
            >
              {t("bereavementLeaveTitle")}
            </Text>
            &thinsp;-
            <Text className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300">
              &thinsp;
              {t("bereavementLeaveContent")}
            </Text>
          </li>
          <li>
            <Text
              weight={"bold"}
              className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300"
            >
              {t("leaveWithoutPayTitle")}
            </Text>
            &thinsp;-
            <Text className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300">
              &thinsp;
              {t("leaveWithoutPayContent")}
            </Text>
          </li>
        </ul>
      </Box>

      <Box className="mb-8">
        <ul className="list-disc list-inside text-lg dark:text-gray-300">
          <li>
            <Text
              weight={"bold"}
              className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300"
            >
              {t("applyingLeaveTitle")}
            </Text>
            &thinsp;-
            <Text className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300">
              &thinsp;
              {t("applyingLeaveContent")}
            </Text>
          </li>
          <li>
            <Text
              weight={"bold"}
              className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300"
            >
              {t("leaveBalanceTitle")}
            </Text>
            &thinsp;-
            <Text className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300">
              &thinsp;
              {t("leaveBalanceContent")}
            </Text>
          </li>
          <li>
            <Text
              weight={"bold"}
              className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300"
            >
              {t("leaveCarryoverTitle")}
            </Text>
            &thinsp;-
            <Text className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300">
              &thinsp;
              {t("leaveCarryoverContent")}
            </Text>
          </li>
          <li>
            <Text
              weight={"bold"}
              className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300"
            >
              {t("terminationTitle")}
            </Text>
            &thinsp;-
            <Text className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300">
              &thinsp;
              {t("terminationContent")}
            </Text>
          </li>
          <li>
            <Text
              weight={"bold"}
              className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300"
            >
              {t("amendmentsTitle")}
            </Text>
            &thinsp;-
            <Text className="text-sm sm:text-sm md:text-lg lg:text-lg dark:text-gray-300">
              &thinsp;
              {t("amendmentsContent")}
            </Text>
          </li>
        </ul>
      </Box>
    </Grid>
  )
}

export default LeavePolicies
