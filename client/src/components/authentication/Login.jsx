import React from "react"
import { SignIn } from "@clerk/clerk-react"
import { Box } from "@radix-ui/themes"

const Login = () => {
  return (
    <Box className="h-screen">
      <Box className="flex justify-center items-center h-full">
        <SignIn
          appearance={{
            elements: {
              footer: "hidden",
            },
          }}
          afterSignInUrl={"/"}
        />
      </Box>
    </Box>
  )
}

export default Login
