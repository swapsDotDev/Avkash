import React, { useState, useEffect } from "react"
import axios from "axios"
import {
  Grid,
  Box,
  Flex,
  Table,
  Button,
  Text,
} from "@radix-ui/themes"
import CustomComponents from "./CustomComponents"
import DepartmentEfficiency from "./DepartmentEfficiency"
import LeaveReq from "./LeaveReq"
import toast from "react-hot-toast"
import { BsPersonWorkspace } from "react-icons/bs"
import { IoPeopleSharp } from "react-icons/io5"
import { TbAlarmAverage } from "react-icons/tb"
import { useUser } from "@clerk/clerk-react"
import { useOrganizationContext } from "../../OrganizationContext"
import * as Dialog from "@radix-ui/react-dialog"
import { RxCrossCircled } from "react-icons/rx"
import ModernPagination from "../../ModernPagination"

const AdminContent = () => {
  const { user } = useUser()
  const [totalHours, setTotalHours] = useState(0)
  const [averageHours, setAverageHours] =
    useState(0)
  const [users, setUsers] = useState(0)
  const [timesheetdata, settimesheetdata] =
    useState([])
  const [userdata, setuserdata] = useState([])
  const { organizationName, org_slug, socket } =
    useOrganizationContext()
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const today = new Date()
  const formattedDate = today
    .toISOString()
    .split("T")[0]
  const [date, setdate] = useState(formattedDate)
  const itemsPerPage = 12
  const [currentPage, setCurrentPage] =
    useState(0)

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/total_working_hours`,
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          }
        )
        if (response.data) {
          const TotalHours =
            response.data.total_working_hours
          setTotalHours(TotalHours.toFixed(2))
          if (TotalHours === 0 || !users) {
            setAverageHours(0)
          }
          if (
            user.organizationMemberships[0]
              .organization.membersCount !== null
          ) {
            const users =
              user.organizationMemberships[0]
                .organization.membersCount
            const avgHours =
              (5 * TotalHours) / users
            setAverageHours(avgHours.toFixed(2))
          } else {
            setAverageHours(0)
          }
        }
      } catch (error) {
        toast.error("Error fetching data")
      }
    }
    fetchData()
    setUsers(
      user.organizationMemberships[0].organization
        .membersCount
    )
    fetchtimesheetdata()
    fetchuserdata()

    const handleMessage = () => {
      fetchtimesheetdata()
      fetchuserdata()
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

  const data = [
    {
      text: (
        <span className="text-oklch-600 font-semibold sm:text-sm md:text-lg lg:text-2xl ">
          Average Hours
        </span>
      ),
      icon: (
        <TbAlarmAverage
          size={46}
          className="p-2 text-[#4a00ff] dark:text-blue-500"
        />
      ),
      badge:
        averageHours !== null ? (
          <span style={{ color: "#4a00ff" }}>
            <Text className="font-bold text-2xl sm:text-2xl md:text-2xl lg:text-2xl dark:text-blue-500">{`${averageHours} hrs`}</Text>
          </span>
        ) : (
          0
        ),
    },
    {
      text: (
        <span className="text-oklch-600 font-semibold sm:text-sm md:text-lg lg:text-2xl ">
          Total Hours
        </span>
      ),
      icon: (
        <BsPersonWorkspace
          size={44}
          className="p-2 text-[#4a00ff] dark:text-blue-500"
        />
      ),
      badge:
        totalHours !== null ? (
          <span style={{ color: "#4a00ff" }}>
            <Text className="font-bold text-2xl sm:text-2xl md:text-2xl lg:text-2xl dark:text-blue-500">{`${totalHours} hrs`}</Text>
          </span>
        ) : (
          0
        ),
    },
  ]

  const fetchtimesheetdata = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/get_timesheet_data`,
        {
          params: {
            org_slug: org_slug,
            organization_name: organizationName,
          },
        }
      )
      settimesheetdata(response.data.data)
    } catch (error) {
      if (
        error.response &&
        error.response.status === 404
      ) {
        settimesheetdata([])
      } else {
        toast.error(
          "Error fetching timesheet data"
        )
      }
    }
  }

  const fetchuserdata = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/get_user_info`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      const user_data =
        response.data.users_info.filter(
          (data) => data.user_role === "member"
        )
      setuserdata(user_data)
    } catch (error) {
      toast.error("Error Fetching user details")
    }
  }

  const mergedData = userdata.map((user) => {
    const checkIn = timesheetdata.find(
      (c) =>
        c.user_id === user.user_id &&
        c.date === date
    )
    return {
      ...user,
      ...(checkIn || {}),
    }
  })
  const sortedMergedData = mergedData.sort(
    (a, b) => {
      const aCheckedIn =
        a.is_checked_in === "true" ? 1 : 0
      const bCheckedIn =
        b.is_checked_in === "true" ? 1 : 0
      return bCheckedIn - aCheckedIn
    }
  )

  const startIndex = currentPage * itemsPerPage
  const paginatedData = sortedMergedData.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const formatTime = (seconds) => {
    if (isNaN(seconds)) {
      return `00:00 min`
    } else {
      const minutes = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0")
      const remainingSeconds = (seconds % 60)
        .toString()
        .padStart(2, "0")
      return `${minutes}:${remainingSeconds} min`
    }
  }

  return (
    <Box className="h-[84vh] w-[100%]">
      <Grid className="grid-layout overflow-hidden w-auto mt-1 sm:mt-1 md:mt-2 lg:mt-2.5 ml-1 sm:ml-1 md:ml-2 lg:ml-2 mr-1 sm:mr-1 md:mr-2 lg:mr-2">
        <Flex
          gap="4"
          className="flex flex-col sm:flex-row md:flex-row"
        >
          <Box
            className={` w-full sm:w-1/3 md:w-1/3 lg:w-1/3  mb-0.5 sm:mb-2 md:mb-2 lg:mb-5 overflow-hidden border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-colors duration-200`}
          >
            <Box className="relative flex flex-col rounded-[0.4rem] w-full h-full bg-base-100 shadow-xl dark:bg-gray-800 dark:text-white">
              <Box className="flex flex-col md:flex-row md:items-center mt-5">
                <Box className="flex-1 pl-2 md:mr-4 text-xl inline-flex">
                  <Box className="flex-1">
                    <span className="text-oklch-600 font-semibold sm:text-sm md:text-lg lg:text-2xl ">
                      Total Members
                    </span>
                  </Box>
                  <IoPeopleSharp
                    size={44}
                    className="p-2 text-[#4a00ff] dark:text-blue-500"
                  />
                </Box>
              </Box>
              <Box className="flex flex-col justify-between md:flex-row md:items-center mt-5">
                <Text className="text-3xl font-bold pb-5 pl-5">
                  {users !== null ? (
                    <span
                      style={{ color: "#4a00ff" }}
                    >
                      <Text className="font-bold text-2xl sm:text-2xl md:text-2xl lg:text-2xl dark:text-blue-500">
                        {users}
                      </Text>
                    </span>
                  ) : (
                    0
                  )}
                </Text>
                <Dialog.Root
                  onOpenChange={(open) => {
                    if (!open)
                      setdate(formattedDate)
                  }}
                >
                  <Dialog.Trigger asChild>
                    <button className="mt-2 text-sm font-medium mr-5 text-[#4a00ff] border border-[#4a00ff] hover:text-white hover:bg-[#4a00ff] px-3 py-1 rounded transition duration-200 dark:text-blue-400 dark:border-blue-400 dark:hover:text-black dark:hover:bg-blue-400">
                      View Attendance
                    </button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed top-0 left-0 w-full h-full bg-gray-500 dark:bg-black/40 bg-opacity-50 flex justify-center items-center z-50">
                      <Dialog.Content className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-lg min-w-[48%] max-w-[45%] max-h-[86vh] min-h-[30vh] overflow-auto">
                        <Flex
                          justify="between"
                          className="w-full flex items-center"
                        >
                          <Text className="text-xl font-semibold mb-4">
                            Employee Attendance
                          </Text>
                          <Box className="flex gap-8">
                            <Box>
                              <input
                                type="date"
                                name="date"
                                id="date"
                                value={date}
                                onChange={(e) =>
                                  setdate(
                                    e.target.value
                                  )
                                }
                                max={
                                  formattedDate
                                }
                                className="appearance-none border border-gray-300 dark:text-white text-gray-700 text-sm rounded-md px-1 py-1 transition duration-200 focus:outline-none focus:ring-0 focus:border-gray-400  cursor-pointer"
                              />
                            </Box>
                            <Dialog.Close asChild>
                              <Box className="dark:text-white">
                                <Button className="dark:text-white">
                                  <RxCrossCircled
                                    size="1.5em"
                                    cursor="pointer"
                                    className="text-[#727171] dark:text-white"
                                  />
                                </Button>
                              </Box>
                            </Dialog.Close>
                          </Box>
                        </Flex>
                        <Box className="overflow-x-auto mt-4">
                          {sortedMergedData.length >
                          0 ? (
                            <>
                              <Table.Root className="min-w-full text-sm text-left border border-gray-200 rounded">
                                <Table.Header className="bg-gray-100">
                                  <Table.Row className="border-b">
                                    <Table.ColumnHeaderCell className="p-2 text-center">
                                      <Box className="p-2 text-center">
                                        Name
                                      </Box>
                                    </Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="p-2 text-center">
                                      <Box className="p-2 text-center">
                                        Status
                                      </Box>
                                    </Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="p-2 text-center">
                                      <Box className="p-2 text-center">
                                        Check-in
                                      </Box>
                                    </Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="p-2 text-center">
                                      <Box className="p-2 text-center">
                                        Check-out
                                      </Box>
                                    </Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="p-2 text-center">
                                      <Box className="p-2 text-center">
                                        Break Time
                                      </Box>
                                    </Table.ColumnHeaderCell>
                                  </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                  {paginatedData.map(
                                    (
                                      employee,
                                      index
                                    ) => {
                                      const {
                                        username,
                                        is_checked_in,
                                        checkin_time,
                                        checkout_time,
                                        break_time,
                                      } = employee

                                      return (
                                        <Table.Row
                                          key={
                                            index
                                          }
                                          className="border-t"
                                        >
                                          <Table.Cell className="p-2 text-center">
                                            <Box className="p-2 text-center dark:text-white">
                                              {
                                                username
                                              }
                                            </Box>
                                          </Table.Cell>
                                          <Table.Cell className="p-2 text-center ">
                                            <Box className="p-2 text-center dark:text-white">
                                              {is_checked_in ===
                                              "true" ? (
                                                checkout_time ? (
                                                  <span className="text-red-600 font-semibold">
                                                    Checked
                                                    Out
                                                  </span>
                                                ) : (
                                                  <span className="text-green-600 font-semibold">
                                                    Checked
                                                    In
                                                  </span>
                                                )
                                              ) : (
                                                <span className="text-red-600 font-semibold">
                                                  Not
                                                  Checked
                                                  In
                                                </span>
                                              )}
                                            </Box>
                                          </Table.Cell>
                                          <Table.Cell className="p-2 text-center">
                                            <Box className="p-2 text-center dark:text-white">
                                              {checkin_time ??
                                                "-"}
                                            </Box>
                                          </Table.Cell>
                                          <Table.Cell className="p-2 text-center">
                                            <Box className="p-2 text-center dark:text-white">
                                              {checkout_time ??
                                                "-"}
                                            </Box>
                                          </Table.Cell>
                                          <Table.Cell className="p-2 text-center">
                                            <Box className="p-2 text-center dark:text-white">
                                              {formatTime(
                                                break_time
                                              )}
                                            </Box>
                                          </Table.Cell>
                                        </Table.Row>
                                      )
                                    }
                                  )}
                                </Table.Body>
                              </Table.Root>
                            </>
                          ) : (
                            <Box className="w-full h-full min-h-[20vh] flex items-center justify-center">
                              <Text>
                                No attendance data
                                available.
                              </Text>
                            </Box>
                          )}
                        </Box>
                        {sortedMergedData?.length >
                          itemsPerPage && (
                          <Box className="mt-4 mb-2 flex justify-center">
                            <ModernPagination
                              total={
                                sortedMergedData?.length
                              }
                              pageSize={
                                itemsPerPage
                              }
                              siblingCount={1}
                              showEdges={true}
                              onPageChange={
                                handlePageChange
                              }
                              currentPage={
                                currentPage
                              }
                            />
                          </Box>
                        )}
                      </Dialog.Content>
                    </Dialog.Overlay>
                  </Dialog.Portal>
                </Dialog.Root>
              </Box>
            </Box>
          </Box>
          {data.map((item, index) => (
            <Box
              key={index}
              className={` w-full sm:w-1/3 md:w-1/3 lg:w-1/3  mb-0.5 sm:mb-2 md:mb-2 lg:mb-5 overflow-hidden border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-colors duration-200`}
            >
              <CustomComponents
                text={item.text}
                icons={item.icon}
                badge={item.badge}
              />
            </Box>
          ))}
        </Flex>
        <Flex
          gap="4"
          className="flex flex-col mt-2.5 sm:mt-0 md:mt-0 lg:mt-0 mb-0 sm:mb-0 md:mb-0 lg:mb-0 sm:flex-row md:flex-row"
        >
          <Box className="w-full sm:w-1/2 ">
            <Box className="overflow-hidden  border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-colors duration-200">
              <DepartmentEfficiency />
            </Box>
          </Box>
          <Box className="w-full sm:w-1/2  ">
            <Box className="overflow-hidden  border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-colors duration-200">
              <LeaveReq />
            </Box>
          </Box>
        </Flex>
      </Grid>
    </Box>
  )
}

export default AdminContent
