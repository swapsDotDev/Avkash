import React, { useEffect, useState } from "react"
import { FcCalendar } from "react-icons/fc"
import { RxCross2 } from "react-icons/rx"
import { MdFileDownloadDone } from "react-icons/md"
import {
  Flex,
  Text,
  Box,
  Badge,
  Separator,
} from "@radix-ui/themes"
import { useTranslation } from "react-i18next"
import axios from "axios"
import { useUser } from "@clerk/clerk-react"
import { useOrganizationContext } from "../../OrganizationContext"
import toast from "react-hot-toast"
import PropTypes from "prop-types"
const BASE_URL = process.env.REACT_APP_BASE_URL

function LeavesBalanceCard(props) {
  const [takenLeavesCount, setTakenLeavesCount] =
    useState(0)
  const [swapCount, setSwapCount] = useState(0)
  const defaultJoinMonth =
    new Date().getMonth() >= 7 ? 7 : 0
  const [joinDate, setJoinDate] = useState(
    new Date(
      new Date().getFullYear(),
      defaultJoinMonth,
      1
    )
  )
  const { user } = useUser()
  const { t } = useTranslation()
  const { organizationName, org_slug } =
    useOrganizationContext()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/user/${user.id}`,
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          }
        )
        const userData =
          response.data.user_data[0]
        if (userData.swap_count !== undefined) {
          setSwapCount(userData.swap_count)
        }
        if (userData.DateOfJoining) {
          const joiningDate = new Date(
            userData.DateOfJoining
          )
          const JoinMonth =
            joiningDate.getMonth() >= 7 ? 7 : 0
          if (
            joiningDate.getFullYear() ===
              new Date().getFullYear() &&
            JoinMonth === defaultJoinMonth
          ) {
            setJoinDate(joiningDate)
          } else {
            const currentDate = new Date()
            setJoinDate(
              new Date(
                currentDate.getFullYear(),
                defaultJoinMonth,
                1
              )
            )
          }
        }
      } catch (error) {
        toast.error("Error fetching user data")
      }
    }

    fetchUserData()
  }, [user.id, props.swapCount])

  const getTotalLeavesForJoinDate = (
    joinDate
  ) => {
    const currentDate = new Date()
    const diffMonths =
      (currentDate.getFullYear() -
        joinDate.getFullYear()) *
        12 +
      (currentDate.getMonth() -
        joinDate.getMonth()) +
      1
    return diffMonths * 1.5
  }

  useEffect(() => {
    const fetchLeaveRequestDetails = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/get_leave_requests/${user.id}`,
          {
            params: {
              organization_name: organizationName,
            },
          }
        )
        let totalAcceptedDays = 0

        response.data.leave_requests.forEach(
          (request) => {
            if (request.status === "accepted") {
              let swapDaysUsed = 0
              for (const d in request.leavedates) {
                const leaveData =
                  request.leavedates[d]
                if (leaveData.useSwap) {
                  if (leaveData.fullLeave) {
                    swapDaysUsed += 1
                  } else if (
                    leaveData.firstHalf ||
                    leaveData.secondHalf
                  ) {
                    swapDaysUsed += 0.5
                  }
                }
              }
              const startDate = new Date(
                request.start_date
              )
              const JoinMonth =
                startDate.getMonth() >= 7 ? 7 : 0
              if (
                JoinMonth === defaultJoinMonth
              ) {
                const totalDays =
                  request.span || 0
                totalAcceptedDays +=
                  totalDays - swapDaysUsed
              }
            }
          }
        )

        setTakenLeavesCount(totalAcceptedDays)
      } catch (error) {
        toast.error(
          "Error fetching leave request details"
        )
      }
    }
    fetchLeaveRequestDetails()

    const values =
      document.querySelectorAll(".clr")
    values.forEach((value) => {
      const num = parseInt(value.textContent)
      if (num >= 0 && num <= 5) {
        value.style.color = "red"
      } else if (num >= 6 && num <= 12) {
        value.style.color = "orange"
      } else if (num > 12 && num <= 18) {
        value.style.color = "green"
      } else {
        value.style.color =
          document.documentElement.classList.contains(
            "dark"
          )
            ? "white"
            : "black"
      }
    })
  }, [joinDate])

  const total =
    getTotalLeavesForJoinDate(joinDate)
  const remain = total - takenLeavesCount

  const formatLeaveCount = (count) => {
    if (Number.isInteger(count)) {
      if (count < 0) {
        return `${count} `
      } else {
        return count < 10 ? `0${count}` : count
      }
    }
    return count
  }

  return (
    <Box className="relative flex flex-col rounded-[0.4rem] w-full p-6 py-3 bg-base-100 shadow-xl dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
      <Box className="text-xl font-semibold">
        <Text
          size="5"
          className="dark:text-white"
        >
          {t("leaveBalance")}
        </Text>
      </Box>

      <Box className="divider mt-1"></Box>

      <Box className="h-full w-full bg-base-100 dark:bg-gray-800">
        <Flex className="py-1">
          <Box className="w-2/12 h-2 ml-1 pb-2">
            <FcCalendar size="40" />
          </Box>
          <Box className="w-4/5 ">
            <Text className="text-lg flex md:flex-row sm:flex-row font-bold dark:text-white">
              {t("totalLeaves")}
            </Text>
          </Box>
          <Box className="w-4/12">
            <Badge
              size="2"
              color="green"
              className="mx-[4vw] pt-3 flex md:flex-row sm:flex-row dark:text-white"
            >
              {formatLeaveCount(total)}
            </Badge>
          </Box>
        </Flex>

        <Separator
          my="4"
          size="4"
          className="dark:bg-gray-700"
        />
        <Flex className="py-1">
          <Box className="w-2/12 h-2 ml-1">
            <RxCross2
              size="40"
              color="red"
            />
          </Box>
          <Box className="w-4/5">
            <Text className="text-lg flex md:flex-row sm:flex-row font-bold pt-1 dark:text-white">
              {t("leavesTaken")}
            </Text>
          </Box>
          <Box className="w-4/12">
            <Badge
              size="2"
              color="red"
              className="mx-[4vw] pt-3 flex md:flex-row sm:flex-row dark:text-white"
            >
              {formatLeaveCount(takenLeavesCount)}
            </Badge>
          </Box>
        </Flex>

        <Separator
          my="4"
          size="4"
          className="dark:bg-gray-700"
        />
        <Flex className="py-1">
          <Box className="w-2/12 h-2 ml-1">
            <MdFileDownloadDone
              size="40"
              color="limegreen"
            />
          </Box>
          <Box className="w-4/5">
            <Text className="text-lg flex md:flex-row sm:flex-row font-bold pt-1 dark:text-white">
              {t("leavesRemaining")}
            </Text>
          </Box>
          <Box className="w-4/12">
            <Badge
              size="2"
              className="mx-[4vw] pt-3 flex md:flex-row sm:flex-row dark:text-white"
            >
              {formatLeaveCount(remain)}
            </Badge>
          </Box>
        </Flex>
        <Separator
          my="4"
          size="4"
          className="dark:bg-gray-700"
        />
        <Flex className="py-1">
          <Box className="w-2/12 h-2 ml-1">
            <FcCalendar size="40" />
          </Box>
          <Box className="w-4/5 ">
            <Text className="text-lg flex md:flex-row sm:flex-row font-bold dark:text-white">
              Swapped Holidays Available
            </Text>
          </Box>
          <Box className="w-4/12">
            <Badge
              size="2"
              color="blue"
              className="mx-[4vw] pt-3 flex md:flex-row sm:flex-row dark:text-white"
            >
              {formatLeaveCount(swapCount)}{" "}
            </Badge>
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

export default LeavesBalanceCard
LeavesBalanceCard.propTypes = {
  swapCount: PropTypes.number,
}
