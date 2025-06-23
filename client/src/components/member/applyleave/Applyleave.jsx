import React, { useState } from "react"
import { Grid, Box, Flex } from "@radix-ui/themes"
import PieChart from "./Piechart"
import LeaveTaken from "./LeaveTaken"
import LeaveForm from "./LeaveForm"
import Leavehistory from "./Leavehistory"

const Applyleave = () => {
  const [refresh, setRefresh] = useState(false)

  return (
    <Grid
      style={{ width: "100%", height: "99%" }}
    >
      <Box className="flex-1 overflow-visible w-full">
        <Grid className="grid-layout overflow-hidden">
          <Box
            className="flex box-border rounded-lg justify-end items-center mr-6"
            row={1}
          >
            <LeaveForm
              setRefresh={setRefresh}
              refresh={refresh}
            />
          </Box>

          <Flex
            className="flex flex-col mb-2 md:flex-row sm:flex-row"
            row={2}
          >
            <Box className="px-2 flex-1">
              <PieChart />
            </Box>
            <Box className="px-2 flex-1 ml-2">
              <LeaveTaken
                emergency={5}
                personal={2}
                medical={6}
                sick={3}
                Casual={4}
                Privileged={2}
              />
            </Box>
          </Flex>

          <Box
            className="mx-3 rounded-lg md:flex-row sm:flex-row"
            row={3}
          >
            <Leavehistory refresh={refresh} />
          </Box>
        </Grid>
      </Box>
    </Grid>
  )
}
export default Applyleave
