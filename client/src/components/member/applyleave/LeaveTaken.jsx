import React from "react"
import {
  Box,
  Table,
  Text,
  Badge,
} from "@radix-ui/themes"
import { useTranslation } from "react-i18next"

function LeaveTaken() {
  const { t } = useTranslation()
  const fdata = [
    { leave_type: t("casualLeave"), count: 5 },
    { leave_type: t("medicalLeave"), count: 4 },
    { leave_type: t("otherLeaves"), count: 3 },
  ]
  return (
    <Box className="relative flex flex-col rounded-[0.4rem] w-full p-6 py-3 bg-base-100 shadow-xl mt-3 dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
      <Box className="text-xl font-semibold">
        <Text
          size="5"
          className="dark:text-white"
        >
          {t("leaveTypes")}
        </Text>
      </Box>
      <Box className="divider my-1"></Box>
      <Box className="max-h-150">
        <Table.Root>
          <Table.Body>
            {fdata.map((data, index) => (
              <Box
                key={index}
                className="border-b border-gray-200 dark:border-gray-700 p-2 mb-2.5 mt-1.5 ml-2 flex items-center justify-between"
              >
                <Box>
                  <Text
                    as="span"
                    className="font-bold text-lg sm:text-sm md:text-xl lg:text-xl dark:text-white"
                  >
                    {data.leave_type}
                  </Text>
                </Box>
                <Box
                  className="w-[35px] h-[35px] inline-flex items-center justify-center bg-white dark:bg-gray-700"
                  aria-label="Update dimensions"
                >
                  <Text
                    as="span"
                    className="text-gray-700 dark:text-gray-200"
                  >
                    <Badge
                      color="gold"
                      className="dark:text-white"
                    >
                      {data.count}
                    </Badge>
                  </Text>
                </Box>
              </Box>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  )
}
export default LeaveTaken
