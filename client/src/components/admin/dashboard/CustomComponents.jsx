import React from "react"
import { Box, Text } from "@radix-ui/themes"
import PropTypes from "prop-types"

function CustomComponents({
  text,
  icons,
  badge,
}) {
  return (
    <Box className="relative flex flex-col rounded-[0.4rem] w-full h-full bg-white dark:bg-gray-800 dark:text-white shadow-md transition-colors duration-200 shadow-xl ">
      <Box className="flex flex-col md:flex-row md:items-center mt-5 ">
        <Box className=" flex-1 pl-2 md:mr-4 text-xl inline-flex">
          <Box className="flex-1">{text}</Box>
          {icons}
        </Box>
      </Box>
      <Box className="">
        <Text className="text-3xl font-bold pb-5 pl-5">
          {badge}
        </Text>
      </Box>
    </Box>
  )
}
CustomComponents.propTypes = {
  text: PropTypes.string,
  icons: PropTypes.node,
  badge: PropTypes.string,
}
export default CustomComponents
