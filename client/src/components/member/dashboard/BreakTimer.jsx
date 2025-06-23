import React from "react"
import { Box, Text } from "@radix-ui/themes"
import PropTypes from "prop-types"

function MyStopwatch(props) {
  const formatTimeUnit = (unit) =>
    String(unit).padStart(2, "0")

  const textColorClass =
    props.timer.hours > 0 ||
    (props.timer.minutes >= 45 &&
      props.timer.seconds > 0)
      ? "text-red-500"
      : "dark:text-white text-black"

  return (
    <Box className="text-center dark:bg-gray-800 transition-colors duration-200">
      <Box
        className={`text-8xl sm:text-sm md:text-8xl lg:text-8xl ${textColorClass}`}
      >
        <Text className="dark:text-white">
          <Text className="px-5 dark:text-white">
            {formatTimeUnit(props.timer.hours)}
          </Text>
          :
          <Text className="px-5 dark:text-white">
            {formatTimeUnit(props.timer.minutes)}
          </Text>
          :
          <Text className="px-5 dark:text-white">
            {formatTimeUnit(props.timer.seconds)}
          </Text>
        </Text>
      </Box>
    </Box>
  )
}

export default MyStopwatch
MyStopwatch.propTypes = {
  timer: PropTypes.object,
}
