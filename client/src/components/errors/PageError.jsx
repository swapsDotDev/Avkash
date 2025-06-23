import React from "react"
import PropTypes from "prop-types"
import { useNavigate } from "react-router-dom"
import {
  Flex,
  Grid,
  Text,
} from "@radix-ui/themes"
import RobotImage from "../assets/robot.gif"
import { BsStack } from "react-icons/bs"

const PageError = ({ errorType = "404" }) => {
  const navigate = useNavigate()
  const canGoBack = window.history.length > 2

  const errorMessages = {
    404: {
      title: "Error 404. Page Not Found.",
      description:
        "The page you are looking for doesn't exist.",
      buttonText: canGoBack
        ? "Go Back"
        : "Go to Home",
      buttonAction: () =>
        canGoBack ? navigate(-1) : navigate("/"),
    },
  }

  const {
    title,
    description,
    buttonText,
    buttonAction,
  } =
    errorMessages[errorType] ||
    errorMessages["404"]

  return (
    <div className="h-screen w-full bg-base-100 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
      <div>
        <Grid
          columns="1fr 1fr"
          gap={20}
        >
          <div>
            <BsStack
              color="indigo"
              className="mt-2 text-xl"
              style={{
                position: "absolute",
                marginLeft: "25px",
              }}
            />
            <Text
              size="8"
              weight="bold"
              m="5"
              className="avkash text-black dark:text-white transition-colors duration-200"
              style={{ marginLeft: "55px" }}
            >
              AVKASH
            </Text>
            <Flex
              style={{
                position: "relative",
                left: "24px",
                marginTop: "20px",
              }}
            >
              <Text
                size="5"
                style={{
                  fontFamily:
                    "Fredoka One, cursive",
                }}
              >
                <span className="text-black dark:text-white transition-colors duration-200">
                  {title}
                </span>
                <br />
                <span className="text-black dark:text-white transition-colors duration-200">
                  {description}
                </span>
                <br />
                <br />
              </Text>
            </Flex>
            <div className="mt-8 ml-6">
              <button
                onClick={buttonAction}
                className="px-4 py-2 bg-indigo-400 text-white rounded hover:bg-indigo-600 transition-colors"
              >
                {buttonText}
              </button>
            </div>
          </div>
          <Flex style={{ marginLeft: "30px" }}>
            <img
              src={RobotImage}
              alt={`${errorType} Error`}
              style={{
                width: "350px",
                height: "300px",
              }}
            />
          </Flex>
        </Grid>
      </div>
    </div>
  )
}

PageError.propTypes = {
  errorType: PropTypes.oneOf(["404"]),
}

export default PageError
