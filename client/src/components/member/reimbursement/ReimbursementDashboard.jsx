import React, { useState } from "react"
import { Grid, Box, Flex } from "@radix-ui/themes"
import ReimbursementFormModal from "./ReimbursementFormModal"
import ReimbursementHistory from "./ReimbursementHistory"
import ReimbursementPieChart from "./ReimbursementPieChart"
import ReimbursementStatus from "./ReimbursementStatus"
import { useOrganizationContext } from "../../OrganizationContext"

const ReimbursementDashboard = () => {
  const [refresh, setRefresh] = useState(false)
  const { organizationName, socket, org_slug } =
    useOrganizationContext()

  const handleModalClose = () => {
    setRefresh(!refresh)
  }

  return (
    <Grid
      style={{ width: "100%", height: "99%" }}
    >
      <Box className="flex-1 overflow-visible w-full">
        <Grid className="grid-layout overflow-hidden">
          <Box className="flex box-border rounded-lg justify-end items-center mr-6">
            <ReimbursementFormModal
              onClose={handleModalClose}
            />
          </Box>

          <Flex
            className="flex flex-col mb-6 md:flex-row sm:flex-row"
            style={{
              gap: "8px",
              padding: "0 8px",
            }}
          >
            <Box className="px-2 flex-1">
              <ReimbursementPieChart />
            </Box>
            <Box className="px-2 flex-1 ml-2">
              <ReimbursementStatus />
            </Box>
          </Flex>

          <Box
            className="mx-3 rounded-lg bg-white dark:bg-gray-800"
            style={{ overflow: "hidden" }}
          >
            <ReimbursementHistory
              refresh={refresh}
              organizationName={organizationName}
              org_slug={org_slug}
              socket={socket}
            />
          </Box>
        </Grid>
      </Box>
    </Grid>
  )
}

export default ReimbursementDashboard
