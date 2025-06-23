import React, { useState } from "react"
import axios from "axios"
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
} from "@radix-ui/themes"
import { useUser } from "@clerk/clerk-react"
import { withTranslation } from "react-i18next"
import { useOrganizationContext } from "../../OrganizationContext"
import PropTypes from "prop-types"

const FeedbackFormModal = ({
  handleCloseModal,
  t,
}) => {
  FeedbackFormModal.propTypes = {
    handleCloseModal: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] =
    useState(false)
  const [error, setError] = useState("")
  const { user } = useUser()
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { organizationName, socket, org_slug } =
    useOrganizationContext()

  const handleSubmit = () => {
    const date = new Date()

    axios
      .post(
        `${BASE_URL}/feedback`,
        {
          feedback: feedback,
          email:
            user.primaryEmailAddress.emailAddress,
          user_id: user.id,
          timestamp: date,
        },
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then(() => {
        setSubmitted(true)
        if (
          socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          socket.send(feedback)
        }
        setTimeout(() => {
          handleCloseModal()
        }, 1000)
      })
  }

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value)
    setError("")
  }

  const characterCount = feedback.trim().length

  return (
    <Box className="rounded-5 pl-4 pr-4 h-52 sm:h-52 md:h-52 lg:h-60 bg-white dark:bg-gray-800 text-black dark:text-white">
      {!submitted && (
        <>
          <Flex className="mb-0.5 sm:mb-2 md:mb-2 lg:mb-2">
            <Heading className="text-blue-800 dark:text-blue-400">
              <Text className="text-base sm:text-base md:text-lg lg:text-xl">
                {t("Feedback")}
              </Text>
            </Heading>
          </Flex>
          <label
            htmlFor="feedback"
            className="text-sm font-medium mb-2 text-black dark:text-gray-300"
          >
            <Text className="text-xs sm:text-sm md:text-sm lg:text-sm">
              {t("YourFeedback")} (
              {characterCount}/100 characters):
            </Text>
          </label>
          <textarea
            id="feedback"
            name="feedback"
            rows="4"
            required
            value={feedback}
            onChange={handleFeedbackChange}
            className="focus:ring-green-500 focus:border-green-500 block w-full shadow-sm text-sm sm:text-base md:text-base lg:text-base border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-black dark:text-white"
            placeholder={t("EnterFeedback")}
          ></textarea>
          <Box height={"3"}>
            {characterCount > 0 &&
              characterCount < 10 && (
                <Text className="text-xs sm:text-sm md:text-sm lg:text-sm text-red-500">
                  {t("PleaseEnterAtLeast10Chars")}
                </Text>
              )}
            {characterCount > 100 && (
              <Text className="text-xs sm:text-sm md:text-sm lg:text-sm text-red-500">
                {t("PleaseEnterLessThan100Chars")}
              </Text>
            )}
            {error && (
              <Text className="text-xs sm:text-sm md:text-sm lg:text-sm text-red-500">
                {error}
              </Text>
            )}
          </Box>
          <Box className="flex justify-end gap-3 mt-2 sm:mt-0 md:mt-0 lg:mt-0">
            <Button
              variant="soft"
              color="red"
              onClick={handleCloseModal}
              className="dark:bg-red-700 dark:text-white"
            >
              <Text className="text-xs sm:text-sm md:text-sm lg:text-sm">
                {t("Cancel")}
              </Text>
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className={`inline-flex items-center rounded-md mr-3 shadow-sm text-xs sm:text-sm md:text-sm lg:text-sm font-medium text-white bg-blue-500 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-600 focus:outline-none ${
                characterCount <= 10 ||
                characterCount > 100
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              disabled={
                characterCount <= 10 ||
                characterCount > 100
              }
            >
              <Text className="text-xs sm:text-sm md:text-sm lg:text-sm">
                {t("SubmitFeedback")}
              </Text>
            </Button>
          </Box>
        </>
      )}
      {submitted && (
        <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 text-black dark:text-white">
          <svg
            className="w-20 h-20 mt-10 mb-3 text-blue-600 dark:text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4"
            />
          </svg>
          <Text className="text-2xl mb-1 dark:text-white">
            {t("ThankYou")}
          </Text>
          <Text className="text-sm dark:text-gray-300">
            {t("FeedbackSubmittedSuccessfully")}
          </Text>
        </div>
      )}
    </Box>
  )
}

export default withTranslation()(
  FeedbackFormModal
)
