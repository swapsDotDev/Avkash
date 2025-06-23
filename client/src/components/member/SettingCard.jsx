import React from "react"
import { Box, Text } from "@radix-ui/themes"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import PropTypes from "prop-types"

const SettingCard = ({
  icon,
  title,
  children,
}) => {
  return (
    <Box className="min-h-[320px] max-h-auto w-full rounded-[0.4rem] p-6 py-3 bg-base-100 dark:bg-gray-800 shadow-xl my-2 border border-gray-200 dark:border-gray-600 transition-colors duration-200">
      <Box className="text-xl h-auto font-semibold flex items-center">
        <FontAwesomeIcon
          icon={icon}
          className="text-blue-800 dark:text-blue-400 mr-3 text-sm sm:text-sm md:text-base lg:text-base"
        />
        <Text className="text-sm sm:text-base md:text-base lg:text-xl text-gray-900 dark:text-white">
          {title}
        </Text>
      </Box>
      <Box className="divider m-0 sm:mt-1 md:mt-1 lg:mt-1 border-gray-300 dark:border-gray-600"></Box>
      {children}
      <Box />
    </Box>
  )
}

SettingCard.propTypes = {
  icon: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default SettingCard
