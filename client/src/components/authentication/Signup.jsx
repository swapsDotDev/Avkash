import React from "react"
import { SignUp } from "@clerk/clerk-react"
import "../Style.css"
import { Box } from "@radix-ui/themes"

const Signup = () => {
  return (
    <Box className="h-screen">
      <Box className="flex justify-center items-center h-full">
        <SignUp afterSignUpUrl={"/dashboard"} />
      </Box>
    </Box>
  )
}

export default Signup
