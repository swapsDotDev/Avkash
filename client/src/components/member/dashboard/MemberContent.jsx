import React, { useState } from "react"
import { Box } from "@radix-ui/themes"
import Onleaves from "./Onleaves"
import UpcommingHolidaysCart from "./UpcommingHolidaysCart"
import LeavesBalanceCard from "./LeaveBalance"
import Timesheet from "./Timesheet"
import PropTypes from "prop-types"

const DashboardContent = (props) => {
  const [swapCount, setSwapCount] = useState(0)
  return (
    <Box className="h-[85vh]">
      <Box className="grid lg:grid-cols-2 mt-2 grid-cols-1 gap-6 min-h-[38%]">
        <Timesheet
          timer={props.timer}
          setSwapCount={setSwapCount}
        />
        <LeavesBalanceCard
          swapCount={swapCount}
        />{" "}
      </Box>
      <Box className="grid lg:grid-cols-2 mt-2 grid-cols-1 gap-6 min-h-[38%]">
        <Onleaves />
        <UpcommingHolidaysCart />
      </Box>
    </Box>
  )
}
DashboardContent.propTypes = {
  timer: PropTypes.string,
}

export default DashboardContent
