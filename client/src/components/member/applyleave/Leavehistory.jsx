import {
  Table,
  Badge,
  Box,
  Text,
  Flex,
} from "@radix-ui/themes"
import React, { useState, useEffect } from "react"
import Leavehistoryfunction from "./Leavehistoryfunction"
import axios from "axios"
import toast from "react-hot-toast"
import { useUser } from "@clerk/clerk-react"
import { useTranslation } from "react-i18next"
import ModernPagination from "../../ModernPagination"
import { FadeLoader } from "react-spinners"
import SearchBox from "../../SearchBox"
import { useOrganizationContext } from "../../OrganizationContext"
import PropTypes from "prop-types"

const Leavehistory = (props) => {
  const { t } = useTranslation()
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [leaveHistory, setLeaveHistory] =
    useState([])
  const [
    filteredLeaveHistory,
    setFilteredLeaveHistory,
  ] = useState([])
  const [currentPage, setCurrentPage] =
    useState(0)
  const [searchVal, setSearchVal] = useState("")
  const itemsPerPage = 2
  const [totalPages, setTotalPages] = useState(
    Math.ceil(
      filteredLeaveHistory.length / itemsPerPage
    )
  )
  const { organizationName, socket } =
    useOrganizationContext()
  const translateLeaveType = (leaveType) =>
    t(
      {
        "Casual Leave": "casualLeave",
        "Medical Leave": "medicalLeave",
        Others: "otherLeaves",
      }[leaveType] || leaveType
    )
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
    const offset = selected * itemsPerPage
    setPaginatedLeaveHistory(
      filteredLeaveHistory.slice(
        offset,
        offset + itemsPerPage
      )
    )
  }

  const [offset, setOffset] = useState(
    currentPage * itemsPerPage
  )
  const [
    paginatedLeaveHistory,
    setPaginatedLeaveHistory,
  ] = useState(
    filteredLeaveHistory.slice(
      offset,
      offset + itemsPerPage
    )
  )

  const initialItems = 2
  const [, setInitialLeaveHistory] = useState(
    leaveHistory.slice(0, initialItems)
  )

  const getStatusBadgeColor = (leaves) => {
    if (leaves === "accepted") {
      return {
        color: "green",
        text: t("accepted"),
      }
    } else if (leaves === "pending") {
      return {
        color: "yellow",
        text: t("pending"),
      }
    } else if (leaves === "in_review") {
      return {
        color: "indigo",
        text: t("inReview"),
      }
    } else if (leaves === "cancelled") {
      return {
        color: "gray",
        text: t("cancelled"),
      }
    } else {
      return {
        color: "red",
        text: t("rejected"),
      }
    }
  }

  const fetchLeaveRequestDetails = () => {
    axios
      .get(
        `${BASE_URL}/get_leave_requests/${user.id}`,
        {
          params: {
            organization_name: organizationName,
          },
        }
      )
      .then((response) => {
        const updatedLeaveHistory =
          response.data.leave_requests
            .filter(
              (leave) =>
                (
                  leave.status || ""
                ).toLowerCase() !== "cancelled"
            )
            .reverse()
        setLeaveHistory(updatedLeaveHistory)
        setFilteredLeaveHistory(
          updatedLeaveHistory
        )
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        toast.error(
          "Error fetching leave request details"
        )
      })
  }

  useEffect(() => {
    if (searchVal === "") {
      fetchLeaveRequestDetails()
    }
  }, [props.refresh, user.id])

  useEffect(() => {
    const handleMessage = () => {
      fetchLeaveRequestDetails()
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

  useEffect(() => {
    setTotalPages(
      Math.ceil(
        filteredLeaveHistory.length / itemsPerPage
      )
    )
    setOffset(currentPage * itemsPerPage)
    setPaginatedLeaveHistory(
      filteredLeaveHistory.slice(
        offset,
        offset + itemsPerPage
      )
    )
    setInitialLeaveHistory(
      leaveHistory.slice(0, initialItems)
    )
    if (
      totalPages <= currentPage &&
      totalPages > 0
    ) {
      setCurrentPage(totalPages - 1)
    }
  }, [
    filteredLeaveHistory,
    currentPage,
    initialItems,
    offset,
    totalPages,
  ])

  const handleSearchFilter = (val) => {
    setSearchVal(val)
    const lowerCaseSearchVal = val.toLowerCase()
    setFilteredLeaveHistory(
      leaveHistory.filter((data) => {
        return (
          data.leave_type
            .toLowerCase()
            .includes(lowerCaseSearchVal) ||
          data.status
            .toLowerCase()
            .includes(lowerCaseSearchVal) ||
          data.start_date
            .toLowerCase()
            .includes(lowerCaseSearchVal)
        )
      })
    )
  }

  const updateUserStatus = (_id, status) => {
    const date = new Date().toISOString()
    axios
      .put(
        `${BASE_URL}/update_leave_request_status/${_id}`,
        {
          status: status,
          admin_timestamp: date,
        },
        {
          params: {
            organization_name: organizationName,
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
        toast.success(
          "Leave request cancelled successfully"
        )
        fetchLeaveRequestDetails()
      })
      .catch(() => {
        toast.error(
          "Error Cancelling leave request"
        )
      })
  }

  return (
    <Box
      className="relative flex flex-col rounded-[0.4rem] w-full bg-base-100 dark:bg-gray-800 dark:text-white shadow-xl mt-4 border border-gray-300 dark:border-gray-600"
      style={{ height: "280px" }}
    >
      <Box className="px-4 pt-2 pb-1">
        <Text
          size="5"
          className="text-lg font-semibold dark:text-white"
        >
          {t("leaveHistoryTitle")}
        </Text>
      </Box>
      <Box className="border-t border-gray-200 dark:border-gray-600 mx-4"></Box>
      <Box className="px-4 py-1 mt-1 flex w-full justify-between items-center">
        <SearchBox
          placeholder="Search Leaves"
          searchValue={searchVal}
          handleOnchange={handleSearchFilter}
          style={{
            height: "28px",
            backgroundColor: "white",
            color: "black",
          }}
          className="dark:bg-gray-800 dark:text-white"
        />
      </Box>

      <Box className="flex-1 px-4 pb-2 flex flex-col dark:bg-gray-800">
        {loading ? (
          <Box className="flex justify-center items-center h-full">
            <FadeLoader color="#2563eb" />
          </Box>
        ) : filteredLeaveHistory.length === 0 ? (
          <Box className="flex items-center justify-center text-gray-600 text-lg h-full">
            {searchVal
              ? "No results found for your search"
              : t("noHistoryMessage")}
          </Box>
        ) : (
          <Box className="flex flex-col h-full">
            <Table.Root className="w-full border-collapse">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell className="py-1 px-4 text-sm font-semibold text-center text-black dark:text-white">
                    {t("date")}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="py-1 px-4 text-sm font-semibold text-center text-black dark:text-white">
                    {t("leaveTypes")}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="py-1 px-4 text-sm font-semibold text-center text-black dark:text-white">
                    {t("status")}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="py-1 px-4 text-sm font-semibold text-center text-black dark:text-white">
                    {t("details")}
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {paginatedLeaveHistory.map(
                  (leave, k) => (
                    <Table.Row key={k}>
                      <Table.Cell className="py-1 px-4 text-sm text-center text-black dark:text-white">
                        {leave.start_date}
                      </Table.Cell>
                      <Table.Cell className="py-1 px-4 text-sm text-center text-black dark:text-white">
                        {translateLeaveType(
                          leave.leave_type
                        )}
                      </Table.Cell>
                      <Table.Cell className="py-1 px-4 text-sm text-center">
                        <Flex
                          gap="2"
                          justify="center"
                          align="center"
                        >
                          <Badge
                            color={
                              getStatusBadgeColor(
                                leave.status
                              ).color
                            }
                            className="dark:text-white"
                          >
                            {
                              getStatusBadgeColor(
                                leave.status
                              ).text
                            }
                          </Badge>
                          {leave.auto_approved && (
                            <Badge
                              color="blue"
                              className="dark:text-white text-xs"
                            >
                              Auto
                            </Badge>
                          )}
                        </Flex>
                      </Table.Cell>
                      <Table.Cell className="py-1 px-4 text-sm text-center">
                        <Box>
                          <Leavehistoryfunction
                            leave={leave}
                            updateUserStatus={
                              updateUserStatus
                            }
                          />
                        </Box>
                      </Table.Cell>
                    </Table.Row>
                  )
                )}
              </Table.Body>
            </Table.Root>

            {filteredLeaveHistory.length > 2 && (
              <Box className="absolute bottom-[2vh] left-1/2 transform -translate-x-1/2">
                <ModernPagination
                  total={
                    filteredLeaveHistory.length
                  }
                  pageSize={itemsPerPage}
                  siblingCount={1}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  showEdges={true}
                  style={{ height: "24px" }}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default Leavehistory
Leavehistory.propTypes = {
  refresh: PropTypes.bool,
}
