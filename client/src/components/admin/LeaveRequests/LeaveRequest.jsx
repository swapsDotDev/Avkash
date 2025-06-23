import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react"
import {
  Flex,
  Table,
  Badge,
  Dialog,
  Button,
  Text,
  Box,
  Popover,
} from "@radix-ui/themes"
import { RxCrossCircled } from "react-icons/rx"
import axios from "axios"
import { IoClose } from "react-icons/io5"
import ModernPagination from "../../ModernPagination"
import { BsFunnel } from "react-icons/bs"
import { IoFilter } from "react-icons/io5"
import toast from "react-hot-toast"
import * as Label from "@radix-ui/react-label"
import "../../Style.css"
import { FadeLoader } from "react-spinners"
import SearchBox from "../../SearchBox"
import moment from "moment"
import { useOrganizationContext } from "../../OrganizationContext"

const monthTextToNumber = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
}

function LeaveRequest() {
  const [loading, setLoading] = useState(true)
  const [leaverequest, setLeaverequest] =
    useState([])
  const [currentPage, setCurrentPage] =
    useState(0)
  const [selectedMonth, setSelectedMonth] =
    useState("")
  const [
    appliedStatusFilter,
    setAppliedStatusFilter,
  ] = useState([])
  const [
    appliedMonthFilter,
    setAppliedMonthFilter,
  ] = useState(null)
  const [
    appliedLeaveTypeFilter,
    setAppliedLeaveTypeFilter,
  ] = useState(null)
  const [statusFilter, setStatusFilter] =
    useState([])
  const [leaveTypeFilter, setLeaveTypeFilter] =
    useState("")
  const itemsPerPage = 9
  const { organizationName, socket, org_slug } =
    useOrganizationContext()
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [
    filteredLeaverequest,
    setFilteredLeaverequest,
  ] = useState([])
  const [userdesignation, setUserDesignation] =
    useState([])
  const [searchVal, setSearchVal] = useState("")
  const [statuses, setStatuses] = useState("")
  const socketRef = useRef(socket)
  const [openDialogId, setOpenDialogId] =
    useState(null)
  const [
    currentConfirmation,
    setCurrentConfirmation,
  ] = useState(null)

  useEffect(() => {
    socketRef.current = socket
  }, [socket])

  const fetchLeaveRequests =
    useCallback(async () => {
      setLoading(true)
      try {
        const [leaveResponse, userResponse] =
          await Promise.all([
            axios.get(
              `${BASE_URL}/get_all_leave_requests`,
              {
                params: {
                  organization_name:
                    organizationName,
                  org_slug: org_slug,
                },
              }
            ),
            axios.get(
              `${BASE_URL}/get_user_info`,
              {
                params: {
                  organization_name:
                    organizationName,
                  org_slug: org_slug,
                },
              }
            ),
          ])

        const allLeaveRequests =
          leaveResponse.data.leave_requests
        const userInfo =
          userResponse.data.users_info

        setLeaverequest(allLeaveRequests)
        setFilteredLeaverequest(allLeaveRequests)
        setUserDesignation(userInfo)
      } catch (error) {
        toast.error(
          "Error fetching leave request details"
        )
      } finally {
        setLoading(false)
      }
    }, [organizationName, org_slug, BASE_URL])

  useEffect(() => {
    fetchLeaveRequests()
  }, [statuses, organizationName, org_slug])

  useEffect(() => {
    const handleMessage = () => {
      fetchLeaveRequests()
    }
    if (socket) {
      socket.addEventListener(
        "message",
        handleMessage
      )
    }
    return () => {
      if (socket) {
        socket.removeEventListener(
          "message",
          handleMessage
        )
      }
    }
  }, [socket])

  const updateUserStatus = (_id, status) => {
    const date = new Date()
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
            org_slug: org_slug,
          },
        }
      )
      .then((response) => {
        if (
          socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          socket.send("Submit")
        }
        toast.success(
          "Leave request status updated successfully"
        )
        const updatedLeaveRequest = response.data
        setLeaverequest((prevLeaverequests) =>
          prevLeaverequests.map((req) =>
            req._id === _id
              ? {
                  ...req,
                  status:
                    updatedLeaveRequest.status,
                }
              : req
          )
        )
        setStatuses(status)
      })
      .catch(() => {
        toast.error("Error updating user status")
      })
  }

  const handleViewPDF = (attachment) => {
    const pdfWindow = window.open()
    pdfWindow.document.write(
      `<iframe width='100%' height='100%' src='data:application/pdf;base64,${attachment}'></iframe>`
    )
  }

  const applyFilter = () => {
    setAppliedMonthFilter(selectedMonth)
    setAppliedStatusFilter(statusFilter)
    setAppliedLeaveTypeFilter(leaveTypeFilter)
    setCurrentPage(0)
  }

  const clearFilters = () => {
    setSelectedMonth("")
    setLeaveTypeFilter("")
    setStatusFilter([])
    setAppliedMonthFilter(null)
    setAppliedStatusFilter([])
    setAppliedLeaveTypeFilter(null)
    setCurrentPage(0)
  }

  const filterData = (data) => {
    if (
      !appliedMonthFilter &&
      appliedStatusFilter.length === 0 &&
      !appliedLeaveTypeFilter
    ) {
      return data
    }
    return data.filter((request) => {
      const monthMatch =
        !appliedMonthFilter ||
        new Date(request.start_date).getMonth() +
          1 ===
          monthTextToNumber[appliedMonthFilter]
      const statusMatch =
        appliedStatusFilter.length === 0 ||
        appliedStatusFilter.includes(
          request.status
        )
      const leaveTypeMatch =
        !appliedLeaveTypeFilter ||
        request.leave_type ===
          appliedLeaveTypeFilter
      return (
        monthMatch &&
        statusMatch &&
        leaveTypeMatch
      )
    })
  }

  useEffect(() => {
    setFilteredLeaverequest(
      filterData(leaverequest)
    )
  }, [
    appliedStatusFilter,
    appliedLeaveTypeFilter,
    appliedMonthFilter,
    leaverequest,
  ])

  const handleSearchFilter = (val) => {
    if (val === "") {
      clearFilters()
    }
    setSearchVal(val)
    const lowerCaseSearchVal = val.toLowerCase()
    const searchFilteredData =
      filteredLeaverequest.filter((data) => {
        const startDateString = moment(
          data.start_date
        ).format("YYYY-MM-DD")
        const endDateString = moment(
          data.end_date
        ).format("YYYY-MM-DD")
        const usernameMatch =
          data.username &&
          data.username
            .toLowerCase()
            .includes(lowerCaseSearchVal)
        const designationMatch = userdesignation
          .find(
            (user) =>
              user.user_id === data.user_id
          )
          ?.designation?.toLowerCase()
          .includes(lowerCaseSearchVal)
        const statusMatch =
          data.status &&
          data.status
            .toLowerCase()
            .includes(lowerCaseSearchVal)
        const leaveTypeMatch =
          data.leave_type &&
          data.leave_type
            .toLowerCase()
            .includes(lowerCaseSearchVal)
        return (
          startDateString.includes(
            lowerCaseSearchVal
          ) ||
          endDateString.includes(
            lowerCaseSearchVal
          ) ||
          usernameMatch ||
          designationMatch ||
          statusMatch ||
          leaveTypeMatch
        )
      })
    setFilteredLeaverequest(searchFilteredData)
    if (
      totalPages <= currentPage &&
      totalPages > 0
    ) {
      setCurrentPage(totalPages - 1)
    }
  }

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  const months = Object.keys(monthTextToNumber)

  const toggleStatusFilter = (status) => {
    setStatusFilter((prevStatus) =>
      prevStatus.includes(status)
        ? prevStatus.filter(
            (item) => item !== status
          )
        : [...prevStatus, status]
    )
  }

  const totalPages = Math.ceil(
    filteredLeaverequest.length / itemsPerPage
  )

  const paginatedData = useMemo(() => {
    const sortedData = [
      ...filteredLeaverequest,
    ].sort(
      (a, b) =>
        new Date(b.timestamp) -
        new Date(a.timestamp)
    )
    const startIndex = currentPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedData.slice(startIndex, endIndex)
  }, [currentPage, filteredLeaverequest])

  const handleConfirmation = (
    requestId,
    action,
    status
  ) => {
    setCurrentConfirmation({
      requestId,
      action,
      status,
    })
  }

  const handleConfirm = () => {
    if (currentConfirmation) {
      updateUserStatus(
        currentConfirmation.requestId,
        currentConfirmation.status
      )
      setCurrentConfirmation(null)
    }
  }

  const handleCancel = () => {
    setCurrentConfirmation(null)
  }

  return (
    <Box>
      <Flex
        justify="space-between"
        alignItems="center"
        className="mb-2"
      >
        <SearchBox
          placeholder="Search Leave"
          searchValue={searchVal}
          handleOnchange={handleSearchFilter}
        />
        <Flex className="mr-5">
          <Popover.Root className="relative flex flex-col w-full p-6 py-3 bg-base-100 dark:bg-gray-800 dark:text-white">
            <Popover.Trigger asChild>
              <Button>
                <BsFunnel
                  width="16"
                  height="16"
                />{" "}
                Filter
              </Button>
            </Popover.Trigger>
            <Popover.Content
              className="rounded bg-white dark:bg-gray-800 p-4 w-[375px] shadow-lg mr-3"
              sideOffset={5}
            >
              <Flex className="text-blue-700 dark:text-blue-500 font-normal text-2xl mb-5">
                Apply Filter:
                <Popover.Close>
                  <Button
                    width="24"
                    height="16"
                    variant="soft"
                    color="gray"
                    style={{
                      padding: "6px",
                      borderRadius: 20,
                      marginLeft: "12vw",
                    }}
                  >
                    <IoClose className="w-4 h-4 text:black dark:text-white" />
                  </Button>
                </Popover.Close>
              </Flex>
              <Flex className="relative">
                <Label.Root className="block mb-1 font-sm text-black dark:text-white">
                  Month:
                </Label.Root>
              </Flex>
              <select
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(e.target.value)
                }
                className="w-full p-1 border mb-2 border-gray-300 dark:border-gray-600 rounded-md text-sm text-black dark:text-white"
              >
                <option value="">
                  Select Month
                </option>
                {months.map((month, index) => (
                  <option
                    key={index}
                    value={month}
                  >
                    {month}
                  </option>
                ))}
              </select>
              <Flex className="relative">
                <Label.Root className="block mb-1 font-sm text-black dark:text-white">
                  Leave Type:
                </Label.Root>
              </Flex>
              <select
                value={leaveTypeFilter}
                onChange={(e) =>
                  setLeaveTypeFilter(
                    e.target.value
                  )
                }
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-black dark:text-white"
              >
                <option value="">All</option>
                <option value="Casual Leave">
                  Casual Leave
                </option>
                <option value="Medical Leave">
                  Medical Leave
                </option>
                <option value="Others">
                  Others
                </option>
              </select>
              <Flex className="flex mt-5">
                <Flex className="flex items-center mr-4">
                  <Label.Root
                    className="pl-[5px] text-[16px] leading-none text-green-500"
                    htmlFor="accepted"
                  >
                    <input
                      className="mr-2 size-3.5"
                      type="checkbox"
                      id="accepted"
                      onChange={() =>
                        toggleStatusFilter(
                          "accepted"
                        )
                      }
                      checked={statusFilter.includes(
                        "accepted"
                      )}
                    />
                    Accepted
                  </Label.Root>
                </Flex>
                <Flex className="flex items-center mr-3.5">
                  <Label.Root
                    className="pl-[5px] text-[15px] personally-none text-blue-500 dark:text-white"
                    htmlFor="in_review"
                  >
                    <input
                      className="mr-2 size-3.5"
                      type="checkbox"
                      id="in_review"
                      onChange={() =>
                        toggleStatusFilter(
                          "in_review"
                        )
                      }
                      checked={statusFilter.includes(
                        "in_review"
                      )}
                    />
                    In Review
                  </Label.Root>
                </Flex>
                <Flex className="flex items-center mr-4">
                  <Label.Root
                    className="pl-[5px] text-[15px] leading-none text-red-500"
                    htmlFor="rejected"
                  >
                    <input
                      className="mr-2 size-3.5"
                      type="checkbox"
                      id="rejected"
                      onChange={() =>
                        toggleStatusFilter(
                          "rejected"
                        )
                      }
                      checked={statusFilter.includes(
                        "rejected"
                      )}
                    />
                    Rejected
                  </Label.Root>
                </Flex>
              </Flex>
              <Box className="flex justify-end mt-6 space-x-3">
                <Button
                  width="16"
                  height="16"
                  color="red"
                  variant="soft"
                  style={{
                    padding: "6px",
                    borderRadius: 5,
                  }}
                  className="dark:text-white dark:bg-red-700 dark:hover:bg-red-800"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
                <Button
                  width="16"
                  height="16"
                  variant="solid"
                  style={{
                    padding: "6px",
                    borderRadius: 5,
                  }}
                  onClick={applyFilter}
                >
                  <IoFilter className="mr-1" />{" "}
                  Apply
                </Button>
              </Box>
            </Popover.Content>
          </Popover.Root>
        </Flex>
      </Flex>
      <Box className="min-h-[83vh] flex flex-col justify-between p-1 rounded-lg bg-white dark:bg-gray-800 px-6 relative shadow-xl mt-3 mr-5 border border-gray-300 dark:border-gray-600">
        {loading ? (
          <Box className="text-center text-gray-600 mt-3 text-2xl relative flex flex-col rounded-[0.4rem] w-full p-6 py-3 bg-base-100 dark:bg-gray-800 shadow-md h-[82vh]">
            <Box className="flex justify-center h-full items-center">
              <FadeLoader color="#2563eb" />
            </Box>
          </Box>
        ) : filteredLeaverequest.length === 0 ? (
          <Box className="flex items-center justify-center text-gray-600 mt-3 text-lg relative flex flex-col rounded-[0.4rem] w-full p-6 py-3 bg-base-100 min-h-[82vh] dark:bg-gray-800 dark:text-white">
            <Box className="text-center text-gray-600 dark:text-white justify-center text-lg">
              Currently there are no Leave
              Requests.
            </Box>
          </Box>
        ) : (
          <Box className="relative flex flex-col rounded-[0.4rem] w-full p-1 sm:p-1 md:p-4 lg:p-6 py-1 sm:py-1 md:py-2 lg:py-3 bg-base-100 min-h-[82vh] dark:bg-gray-800 dark:text-white">
            <Table.Root className="my-1 sm:my-1 md:my-2 lg:my-2 p-1 lg:p-2 md:p-2 sm:p-1 mx-0 sm:mx-1 md:mx-2 lg:mx-2 rounded-lg">
              <Table.Header>
                <Table.Row className="text-center font-semibold text-sm sm:text-sm md:text-base lg:text-base dark:bg-gray-800 text-black dark:text-white">
                  {[
                    "Name",
                    "Start Date",
                    "End Date",
                    "Designation",
                    "Leave Type",
                    "Status",
                    "Available",
                    "Actions",
                  ].map((columnHeader, index) => (
                    <Table.ColumnHeaderCell
                      key={index}
                    >
                      {columnHeader}
                    </Table.ColumnHeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {paginatedData.map(
                  (request, index) => (
                    <Table.Row
                      key={index}
                      className="text-center font-medium text-xs sm:text-xs md:text-sm lg:text-sm dark:bg-gray-800 text-black dark:text-white"
                    >
                      <Table.RowHeaderCell>
                        {request.username}
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        {request.start_date}
                      </Table.Cell>
                      <Table.Cell>
                        {request.end_date}
                      </Table.Cell>
                      <Table.Cell>
                        {userdesignation.find(
                          (user) =>
                            user.user_id ===
                            request.user_id
                        )?.designation || "N/A"}
                      </Table.Cell>
                      <Table.Cell>
                        {request.leave_type}
                      </Table.Cell>
                      <Table.Cell className="select-item">
                        {request.status && (
                          <Flex
                            gap="2"
                            justify="center"
                            align="center"
                          >
                            <Badge
                              color={
                                request.status ===
                                "pending"
                                  ? "yellow"
                                  : request.status ===
                                      "in_review"
                                    ? "indigo"
                                    : request.status ===
                                        "accepted"
                                      ? "green"
                                      : request.status ===
                                          "cancelled"
                                        ? "gray"
                                        : "crimson"
                              }
                              className="dark:text-white"
                            >
                              {request.status
                                .replace("_", " ")
                                .replace(
                                  /\w/,
                                  (c) =>
                                    c.toUpperCase()
                                )
                                .replace(
                                  /r/,
                                  "R"
                                )}
                            </Badge>
                            {request.auto_approved && (
                              <Badge
                                color="blue"
                                className="dark:text-white text-xs"
                              >
                                Auto
                              </Badge>
                            )}
                          </Flex>
                        )}
                      </Table.Cell>
                      <Table.Cell className="ml-10">
                        {request.leave_available}
                      </Table.Cell>
                      <Table.Cell>
                        <Dialog.Root
                          open={
                            openDialogId ===
                            request._id
                          }
                          onOpenChange={(open) =>
                            setOpenDialogId(
                              open
                                ? request._id
                                : null
                            )
                          }
                        >
                          <Dialog.Trigger>
                            <Button size="1">
                              View Details
                            </Button>
                          </Dialog.Trigger>
                          <Dialog.Content
                            style={{
                              maxWidth: 500,
                            }}
                            className="position: relative bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-md"
                          >
                            <Dialog.Close asChild>
                              <RxCrossCircled
                                size="1.5em"
                                className="crosscircleclose dark:text-white"
                              />
                            </Dialog.Close>
                            <Dialog.Title>
                              Leave Details
                            </Dialog.Title>
                            <Dialog.Description
                              size="2"
                              mb="4"
                            >
                              View and manage
                              leave details.
                            </Dialog.Description>
                            <Flex
                              direction="column"
                              gap="3"
                            >
                              <Label.Root className="flex justify-between items-center w-full mb-2">
                                <Text
                                  as="div"
                                  size="2"
                                  mb="1"
                                  weight="bold"
                                >
                                  Start Date :
                                </Text>
                                <Box className="flex-grow ml-14">
                                  {
                                    request.start_date
                                  }
                                </Box>
                              </Label.Root>
                              <Label.Root className="flex justify-between items-center w-full mb-2">
                                <Text
                                  as="div"
                                  size="2"
                                  mb="1"
                                  weight="bold"
                                >
                                  End Date :
                                </Text>
                                <Box className="flex-grow ml-16">
                                  {
                                    request.end_date
                                  }
                                </Box>
                              </Label.Root>
                              <Label.Root className="flex justify-between items-center w-full mb-2">
                                <Text
                                  as="div"
                                  size="2"
                                  mb="1"
                                  weight="bold"
                                >
                                  Leave Type :
                                </Text>
                                <Box className="flex-grow ml-12">
                                  {
                                    request.leave_type
                                  }
                                </Box>
                              </Label.Root>
                              <Label.Root className="flex justify-between items-center w-full mb-2">
                                <Text
                                  as="div"
                                  size="2"
                                  mb="1"
                                  weight="bold"
                                >
                                  Total Leaves :
                                </Text>
                                <Box className="flex-grow ml-12">
                                  {request.span}
                                </Box>
                              </Label.Root>
                              <Label.Root className="flex justify-between items-center w-full mb-2">
                                <Text
                                  as="div"
                                  size="2"
                                  mb="1"
                                  weight="bold"
                                >
                                  Specification :
                                </Text>
                                <Box className="w-52 h-32 overflow-y-auto flex-grow ml-10 border border-gray-300 rounded p-2">
                                  {request.leavedates &&
                                    Object.entries(
                                      request.leavedates
                                    ).map(
                                      ([
                                        date,
                                        options,
                                      ]) => (
                                        <Box
                                          key={
                                            date
                                          }
                                        >
                                          <Text as="p">
                                            {date}{" "}
                                            :{" "}
                                            {options[
                                              "firstHalf"
                                            ] ? (
                                              <>
                                                First
                                                Half
                                                {options[
                                                  "wfh"
                                                ] &&
                                                  ", Second Half(WFH)"}
                                                {options[
                                                  "useSwap"
                                                ] &&
                                                  " (Swap used)"}
                                              </>
                                            ) : options[
                                                "secondHalf"
                                              ] ? (
                                              <>
                                                Second
                                                Half
                                                {options[
                                                  "wfh"
                                                ] &&
                                                  ", First Half(WFH)"}
                                                {options[
                                                  "useSwap"
                                                ] &&
                                                  " (Swap used)"}
                                              </>
                                            ) : options[
                                                "fullLeave"
                                              ] ? (
                                              <>
                                                Full
                                                Leave
                                                {options[
                                                  "useSwap"
                                                ] &&
                                                  " (Swap used)"}
                                              </>
                                            ) : options[
                                                "wfh"
                                              ] ? (
                                              <>
                                                WFH
                                              </>
                                            ) : null}
                                          </Text>
                                        </Box>
                                      )
                                    )}
                                </Box>
                              </Label.Root>
                              <Label.Root className="flex justify-between items-center w-full mb-2">
                                <Text
                                  as="div"
                                  size="2"
                                  mb="1"
                                  weight="bold"
                                >
                                  Description :
                                </Text>
                                <Box
                                  className={
                                    request.description
                                      ? "w-52 h-32 overflow-y-auto flex-grow ml-10 border border-gray-300 rounded p-2"
                                      : "flex-grow ml-12"
                                  }
                                >
                                  {request.description ||
                                    "Not-Mentioned"}
                                </Box>
                              </Label.Root>

                              <Label.Root className="flex justify-between items-center w-full mb-2">
                                <Text
                                  as="div"
                                  size="2"
                                  mb="1"
                                  weight="bold"
                                >
                                  Attachment :
                                </Text>
                                <Box className="flex-grow ml-12">
                                  <Flex>
                                    {request.attachment ? (
                                      <Box
                                        className="text-blue-500 underline"
                                        onClick={() =>
                                          handleViewPDF(
                                            request.attachment
                                          )
                                        }
                                      >
                                        View PDF
                                      </Box>
                                    ) : (
                                      "Not-Mentioned"
                                    )}
                                  </Flex>
                                </Box>
                              </Label.Root>
                            </Flex>
                            <Flex
                              gap="3"
                              mt="4"
                              justify="end"
                            >
                              <Button
                                color="indigo"
                                variant="soft"
                                disabled={
                                  request.is_notified ||
                                  request.auto_approved
                                }
                                className="dark:text-white dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                onClick={() =>
                                  handleConfirmation(
                                    request._id,
                                    "in_review",
                                    "in_review"
                                  )
                                }
                              >
                                In Review
                              </Button>
                              <Button
                                color="cyan"
                                variant="soft"
                                disabled={
                                  request.is_notified ||
                                  request.auto_approved
                                }
                                className="dark:text-white dark:bg-cyan-500 dark:hover:bg-cyan-600"
                                onClick={() =>
                                  handleConfirmation(
                                    request._id,
                                    "accept",
                                    "accepted"
                                  )
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                color="crimson"
                                variant="soft"
                                disabled={
                                  request.is_notified ||
                                  request.auto_approved
                                }
                                className="dark:text-white dark:bg-red-800 dark:hover:bg-red-900"
                                onClick={() =>
                                  handleConfirmation(
                                    request._id,
                                    "reject",
                                    "rejected"
                                  )
                                }
                              >
                                Reject
                              </Button>
                            </Flex>
                            {currentConfirmation &&
                              currentConfirmation.requestId ===
                                request._id && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 pb-20">
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[240px] mx-4 shadow-xl min-w-[120px] min-h-[120px] flex flex-col items-center justify-between gap-6 mb-4">
                                    <Text className="text-base font-medium text-center text-black dark:text-white">
                                      Are you sure
                                      ?
                                    </Text>
                                    <Flex
                                      gap="4"
                                      justify="center"
                                      width="100%"
                                    >
                                      <Button
                                        variant="soft"
                                        color="gray"
                                        onClick={
                                          handleCancel
                                        }
                                        className="min-w-[80px] dark:bg-gray-300 dark:hover:bg-gray-400"
                                      >
                                        No
                                      </Button>
                                      <Button
                                        variant="solid"
                                        color="indigo"
                                        onClick={() => {
                                          handleConfirm()
                                          setOpenDialogId(
                                            null
                                          )
                                        }}
                                        className="min-w-[80px]"
                                      >
                                        Yes
                                      </Button>
                                    </Flex>
                                  </div>
                                </div>
                              )}
                          </Dialog.Content>
                        </Dialog.Root>
                      </Table.Cell>
                    </Table.Row>
                  )
                )}
              </Table.Body>
            </Table.Root>
            {!loading &&
              filteredLeaverequest.length >
                itemsPerPage && (
                <Flex
                  justify="center"
                  className="absolute bottom-[2vh] right-1/2 translate-x-1/2"
                >
                  <ModernPagination
                    total={
                      filteredLeaverequest.length
                    }
                    pageSize={itemsPerPage}
                    onPageChange={
                      handlePageChange
                    }
                    showEdges={true}
                    currentPage={currentPage}
                  />
                </Flex>
              )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default LeaveRequest
