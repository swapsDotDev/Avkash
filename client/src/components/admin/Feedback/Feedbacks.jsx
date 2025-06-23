import React, { useState, useEffect } from "react"
import { AiFillClockCircle } from "react-icons/ai"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faComment,
  faReply,
} from "@fortawesome/free-solid-svg-icons"
import axios from "axios"
import toast from "react-hot-toast"
import * as Popover from "@radix-ui/react-popover"
import { LuFilter } from "react-icons/lu"
import {
  Flex,
  Box,
  Text,
  Button,
} from "@radix-ui/themes"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import * as Tooltip from "@radix-ui/react-tooltip"
import { RiDeleteBin6Line } from "react-icons/ri"
import { FadeLoader } from "react-spinners"
import ModernPagination from "../../ModernPagination"
import { useOrganizationContext } from "../../OrganizationContext"

const Feedbacks = () => {
  const [formData, setFormData] = useState({
    data: [],
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [replyToId, setReplyToId] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [currentPage, setCurrentPage] =
    useState(0)
  const [itemsPerPage] = useState(7)
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [characterCount, setCharterCount] =
    useState(feedback.trim().length)
  const { organizationName, socket, org_slug } =
    useOrganizationContext()
  const [submitted, setSubmitted] =
    useState(false)

  const handleFeedbackChange = (e) => {
    const value = e.target.value
    setFeedback(value)
  }

  useEffect(() => {
    fetchData()
    const handleMessage = () => {
      fetchData()
    }
    socket.addEventListener(
      "message",
      handleMessage
    )
    return () =>
      socket.removeEventListener(
        "message",
        handleMessage
      )
  }, [])

  const fetchData = () => {
    axios
      .get(`${BASE_URL}/feedback`, {
        params: {
          org_slug: org_slug,
          organization_name: organizationName,
        },
      })
      .then((response) => {
        const reversedData =
          response.data.data.reverse()
        setFormData({ data: reversedData })
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const handleReplyClick = (feedbackId) => {
    setReplyToId(feedbackId)
  }

  const handleClose = () => {
    setReplyToId(null)
    setFeedback("")
  }

  const handleSubmit = () => {
    const _id = replyToId
    const reply = feedback
    axios
      .put(
        `${BASE_URL}/update_feedback_status/${_id}`,
        {
          reply: reply,
        },
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then(() => {
        if (
          socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          socket.send("Submit")
        }
        setSubmitted(true)
        setTimeout(
          () => setSubmitted(false),
          2000
        )
        handleClose()
      })
  }

  const handleDeleteFeedback = (feedbackId) => {
    axios
      .delete(
        `${BASE_URL}/feedback/${feedbackId}`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then(() => {
        const updatedData = formData.data.filter(
          (item) => item._id !== feedbackId
        )
        const updatedTotalPages = Math.ceil(
          updatedData.length / itemsPerPage
        )
        const updatedCurrentPage =
          updatedTotalPages === totalPages
            ? currentPage
            : Math.max(currentPage - 1, 0)
        setFormData({ data: updatedData })
        setCurrentPage(updatedCurrentPage)
      })
      .catch(() => {
        toast.error(
          "Error deleting feedback. Please try again later."
        )
      })
  }

  const feedbackData = formData.data || []

  const formatTimestamp = (timestamp) => {
    const currentDate = new Date()
    const feedbackDate = new Date(timestamp)
    if (
      currentDate.toDateString() ===
      feedbackDate.toDateString()
    ) {
      return "Today"
    } else {
      const yesterday = new Date(currentDate)
      yesterday.setDate(currentDate.getDate() - 1)
      if (
        yesterday.toDateString() ===
        feedbackDate.toDateString()
      ) {
        return "Yesterday"
      } else {
        return feedbackDate.toLocaleDateString(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )
      }
    }
  }

  const filteredData = () => {
    const currentDate = new Date()

    switch (filter) {
      case "all":
        return feedbackData

      case "today":
        return feedbackData.filter((feedback) => {
          const feedbackDate = new Date(
            feedback.timestamp
          )
          return (
            feedbackDate.getDate() ===
              currentDate.getDate() &&
            feedbackDate.getMonth() ===
              currentDate.getMonth() &&
            feedbackDate.getFullYear() ===
              currentDate.getFullYear()
          )
        })

      case "lastWeek": {
        const today = currentDate.getDay()
        const startOfLastCompleteWeek = new Date(
          currentDate
        )
        startOfLastCompleteWeek.setDate(
          startOfLastCompleteWeek.getDate() -
            today -
            6
        )
        const endOfLastCompleteWeek = new Date(
          startOfLastCompleteWeek
        )
        endOfLastCompleteWeek.setDate(
          endOfLastCompleteWeek.getDate() + 6
        )

        return feedbackData.filter((feedback) => {
          const feedbackDate = new Date(
            feedback.timestamp
          )
          return (
            feedbackDate >=
              startOfLastCompleteWeek &&
            feedbackDate <= endOfLastCompleteWeek
          )
        })
      }

      case "lastMonth": {
        const startOfLastMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        )
        const endOfLastMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          31
        )

        return feedbackData.filter((feedback) => {
          const feedbackDate = new Date(
            feedback.timestamp
          )
          return (
            feedbackDate >= startOfLastMonth &&
            feedbackDate <= endOfLastMonth
          )
        })
      }

      default:
        return feedbackData
    }
  }

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  const paginatedData = filteredData().slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  const totalPages = Math.ceil(
    filteredData().length / itemsPerPage
  )

  return (
    <Box className="flex h-[100%]">
      <Box className="flex h-auto w-[100%]">
        {loading ? (
          <Box className="flex w-full justify-center items-center py-80">
            <FadeLoader color="#2563eb" />
          </Box>
        ) : (
          <Box className="flex-1 flex flex-col relative">
            {submitted && (
              <Box className="fixed inset-0 flex items-center justify-center bg-gray-900 dark:bg-gray-800 bg-opacity-50 z-50">
                <Box className="bg-white dark:bg-gray-700 p-6 sm:p-8 rounded-lg w-[60vw] sm:w-[30vw] md:w-[30vw] lg:w-[30vw] h-40 sm:h-40 md:h-40 lg:h-60">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-20 h-20 mt-10 mb-3 text-blue-600"
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
                    <Text className="text-sm dark:text-white">
                      Feedback response submitted
                      successfully!!
                    </Text>
                  </div>
                </Box>
              </Box>
            )}
            <Box>
              <Flex className="absolute z-[2] top-0 right-2">
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <Button className="mt-3">
                      <Flex className="p-1 h-9 rounded-full">
                        <LuFilter
                          color="white"
                          className="mt-1 w-[20px] h-[20px] inline-flex items-center justify-center text-violet11 cursor-default outline-none"
                        />
                        <Box className="mt-1">
                          <Text
                            className="text-white mt-1.5 text-[95%]"
                            ml="1"
                            mr="1"
                          >
                            Filter
                          </Text>
                        </Box>
                      </Flex>
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content
                    sideOffset={5}
                    className="z-[100] rounded-xl p-2 bg-white dark:bg-gray-800 shadow-md border border-gray-300 dark:border-gray-600"
                  >
                    <style>
                      {`
                          .filter-button.active {
                            background-color: #3E63DD !important;
                            color: #ffffff !important;
                          }
                          .filter-button:hover {
                            background-color: #f3f4f6;
                            color: #000 !important;
                          }
                          .dark .filter-button:hover {
                            background-color: #616161;
                            color: #fff !important;
                          }
                          .filter-button {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 500;
                            user-select: none;
                          }
                        `}
                    </style>
                    <div
                      className="filter-container"
                      style={{
                        maxWidth: "fit-content",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div
                        className={`filter-button ${
                          filter === "all"
                            ? "active"
                            : ""
                        } bg-white dark:bg-[#424242] text-black dark:text-white`}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition:
                            "background-color 0.2s",
                        }}
                        onClick={() => {
                          setFilter("all")
                          setCurrentPage(0)
                        }}
                      >
                        All
                      </div>
                      <div
                        className={`filter-button ${
                          filter === "today"
                            ? "active"
                            : ""
                        } bg-white dark:bg-[#424242] text-black dark:text-white`}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition:
                            "background-color 0.2s",
                        }}
                        onClick={() => {
                          setFilter("today")
                          setCurrentPage(0)
                        }}
                      >
                        Today
                      </div>
                      <div
                        className={`filter-button ${
                          filter === "lastWeek"
                            ? "active"
                            : ""
                        } bg-white dark:bg-[#424242] text-black dark:text-white`}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition:
                            "background-color 0.2s",
                        }}
                        onClick={() => {
                          setFilter("lastWeek")
                          setCurrentPage(0)
                        }}
                      >
                        Last Week
                      </div>
                      <div
                        className={`filter-button ${
                          filter === "lastMonth"
                            ? "active"
                            : ""
                        } bg-white dark:bg-[#424242] text-black dark:text-white`}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition:
                            "background-color 0.2s",
                        }}
                        onClick={() => {
                          setFilter("lastMonth")
                          setCurrentPage(0)
                        }}
                      >
                        Last Month
                      </div>
                    </div>
                    <Popover.Arrow className="fill-white dark:fill-gray-800" />
                  </Popover.Content>
                </Popover.Root>
              </Flex>
              <Box className="h-[70vh] mt-7 sm:mt-7 md:mt-7 lg:mt-9 max-w-full mx-auto">
                <Box className="flex flex-col">
                  {paginatedData.length === 0 ? (
                    <Box className="flex items-center justify-center h-full absolute inset-0">
                      <Text className="text-gray-600 dark:text-white text-sm sm:text-md md:text-lg lg:text-lg">
                        Currently there are no
                        Feedbacks.
                      </Text>
                    </Box>
                  ) : (
                    paginatedData.map(
                      (feedback, index) => (
                        <Box
                          key={index}
                          className="flex gap-3"
                        >
                          <Box className="flex flex-col w-full p-1.5 relative rounded-[0.4rem] border-b h-auto bg-white dark:bg-gray-800 sm:h-auto md:h-auto lg:h-auto mt-2 mb-2 border-gray-300 dark:border-gray-600 shadow-md co pl-3 pr-3 transition duration-200">
                            <Box className="w-full">
                              <Box className="flex">
                                <FontAwesomeIcon
                                  icon={faComment}
                                  className="text-blue-800 text-xs sm:text-sm md:text-xl lg:text-xl h-5 mt-1 mr-3 ml-2"
                                />
                                <Box className="flex flex-col">
                                  <Box>
                                    <Text className="text-sm sm:text-sm md:text-base lg:text-base	text-black dark:text-white">
                                      {
                                        feedback.feedback
                                      }
                                    </Text>
                                  </Box>
                                  <Box className="flex align-center mt-1">
                                    <Box className="mt-0.5">
                                      <AiFillClockCircle className="text-gray-600/85 dark:text-white mr-1" />
                                    </Box>
                                    <Text className="text-xs sm:text-sm md:text-sm lg:text-sm text-gray-600 dark:text-gray-300">
                                      {formatTimestamp(
                                        feedback.timestamp
                                      )}
                                    </Text>
                                  </Box>
                                </Box>
                                <Flex className="ml-auto items-center mr-0 sm:mr-10 md:mr-10 lg:mr-12">
                                  <Tooltip.Provider>
                                    <Tooltip.Root>
                                      <Tooltip.Trigger
                                        asChild
                                      >
                                        <Box
                                          className=""
                                          onClick={() =>
                                            handleReplyClick(
                                              feedback._id
                                            )
                                          }
                                        >
                                          <FontAwesomeIcon
                                            icon={
                                              faReply
                                            }
                                            className="text-blue-800 dark:text-blue-500 text-md sm:text-md md:text-xl lg:text-2xl cursor-pointer mr-2 sm:mr-4 md:mr-4 lg:mr-5"
                                          />
                                        </Box>
                                      </Tooltip.Trigger>
                                      <Tooltip.Portal>
                                        <Tooltip.Content className="px-3 py-1 mt-1 bg-blue-700 text-white rounded-md shadow-md">
                                          <Text className="text-white ml-1 pt-1 text-lg transition-colors duration-300 cursor-pointer">
                                            Reply
                                          </Text>
                                          <Tooltip.Arrow className="fill-blue-700" />
                                        </Tooltip.Content>
                                      </Tooltip.Portal>
                                    </Tooltip.Root>
                                  </Tooltip.Provider>
                                  <Box className="mt-1">
                                    <AlertDialog.Root>
                                      <AlertDialog.Trigger
                                        asChild
                                      >
                                        <RiDeleteBin6Line
                                          color="gray dark:text-white"
                                          className="cursor-pointer text-md sm:text-md md:text-xl lg:text-2xl dark:text-white"
                                          title="Delete"
                                        />
                                      </AlertDialog.Trigger>
                                      <AlertDialog.Portal>
                                        <AlertDialog.Overlay className="AlertDialogOverlay" />
                                        <AlertDialog.Content className="AlertDialogContent bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md">
                                          <AlertDialog.Title className="AlertDialogTitle text-black dark:text-white">
                                            Confirm
                                            Delete?
                                          </AlertDialog.Title>
                                          <AlertDialog.Description className="AlertDialogDescription text-black dark:text-white">
                                            Are
                                            you
                                            sure
                                            to
                                            delete
                                            the
                                            Feedback?
                                          </AlertDialog.Description>
                                          <Box
                                            style={{
                                              display:
                                                "flex",
                                              gap: 25,
                                              justifyContent:
                                                "flex-end",
                                            }}
                                          >
                                            <AlertDialog.Cancel
                                              asChild
                                            >
                                              <Box className="px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md text-red-600 dark:text-white dark:bg-red-700">
                                                <Button
                                                  onClick={
                                                    handleClose
                                                  }
                                                >
                                                  Cancel
                                                </Button>
                                              </Box>
                                            </AlertDialog.Cancel>
                                            <AlertDialog.Cancel
                                              asChild
                                            >
                                              <AlertDialog.Action
                                                asChild
                                              >
                                                <Box className="hover:bg-blue-600 bg-blue-800 text-white cursor-pointer transition-colors duration-300 ease-out rounded px-4 py-1 item-center">
                                                  <Button
                                                    onClick={() =>
                                                      handleDeleteFeedback(
                                                        feedback._id
                                                      )
                                                    }
                                                  >
                                                    Delete
                                                  </Button>
                                                </Box>
                                              </AlertDialog.Action>
                                            </AlertDialog.Cancel>
                                          </Box>
                                        </AlertDialog.Content>
                                      </AlertDialog.Portal>
                                    </AlertDialog.Root>
                                  </Box>
                                </Flex>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      )
                    )
                  )}
                </Box>
                <Flex
                  justify="center"
                  align="center"
                  className="absolute bottom-[-13vh] left-1/2 transform -translate-x-1/2"
                >
                  {filteredData().length >
                    itemsPerPage && (
                    <ModernPagination
                      total={
                        filteredData().length
                      }
                      pageSize={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={
                        handlePageChange
                      }
                      showEdges={true}
                    />
                  )}
                </Flex>
              </Box>
            </Box>

            {replyToId !== null && (
              <Box className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                <Box className="bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 lg:p-7 font rounded-lg w-[80vw] sm:w-[35vw] md:w-[35vw] lg:w-[] border border-gray-300 dark:border-gray-600 shadow-md">
                  <Box className="mb-0.5 sm:mb-1 md:mb-1 lg:mb-2">
                    <Text
                      weight={"bold"}
                      className="text-blue-900 dark:text-blue-500 text-sm sm:text-sm md:text-xl lg:text-xl"
                    >
                      Reply to Feedbacks
                    </Text>
                  </Box>
                  <Box className="border-none">
                    <Box>
                      <Box mb="1">
                        <Text
                          htmlFor="feedback"
                          className=" text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Enter more than 10
                          characters (
                          {characterCount}/100
                          characters):
                        </Text>
                      </Box>
                    </Box>
                    <textarea
                      id="feedback"
                      name="feedback"
                      rows={4}
                      required
                      value={feedback}
                      onChange={(e) => {
                        handleFeedbackChange(e)
                        setFeedback(
                          e.target.value
                        )
                        setCharterCount(
                          e.target.value.trim()
                            .length
                        )
                      }}
                      placeholder="Enter your feedback..."
                      className="w-full bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200 resize-none"
                    />

                    <Box
                      height={"3"}
                      ml="2"
                    >
                      {characterCount > 0 &&
                        characterCount < 10 && (
                          <Text className="text-xs sm:text-sm md:text-sm lg:text-sm font text-red-500">
                            Please enter at least
                            10 characters
                          </Text>
                        )}
                      {characterCount > 100 && (
                        <Text className="text-xs sm:text-sm md:text-sm lg:text-sm font text-red-500">
                          Please enter less than
                          100 characters
                        </Text>
                      )}
                    </Box>
                  </Box>

                  <Box className="flex justify-end mt-2">
                    <Button
                      variant="soft"
                      color="red"
                      onClick={handleClose}
                      className="px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md text-red-600 dark:text-white dark:bg-red-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      style={{ marginRight: 8 }}
                      disabled={
                        characterCount <= 10 ||
                        characterCount > 100
                      }
                      onClick={() => {
                        handleSubmit()
                        handleClose()
                      }}
                      className={`inline-flex mt-4 items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-500 focus:outline-none ${
                        characterCount <= 10 ||
                        characterCount > 100
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      Reply
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
export default Feedbacks
