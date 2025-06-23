import { CreateOrganization } from "@clerk/clerk-react"
import React from "react"
import { Box } from "@radix-ui/themes"
import PropTypes from "prop-types"

const Createorg = ({ setisaccess }) => {
  return (
    <Box className="h-screen">
      <Box className="flex justify-center items-center h-full">
        <CreateOrganization
          className="flex content-center h-full"
          afterCreateOrganizationUrl={() => {
            setisaccess(true)
          }}
        />
      </Box>
    </Box>
  )
}
Createorg.propTypes = {
  setisaccess: PropTypes.func.isRequired,
}

export default Createorg
