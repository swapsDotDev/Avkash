import {
  Chart as ChartJS,
  Filler,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Doughnut } from "react-chartjs-2"
import axios from "axios"
import toast from "react-hot-toast"
import { useUser } from "@clerk/clerk-react"
import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Box, Text } from "@radix-ui/themes"
import { useOrganizationContext } from "../../OrganizationContext"

const BASE_URL = process.env.REACT_APP_BASE_URL

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

function DoughnutChart() {
  const [takenLeavesCount, setTakenLeavesCount] =
    useState(0)
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
  const { organizationName, org_slug, socket } =
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
      } catch {
        toast.error("Error fetching user data")
      }
    }
    fetchUserData()
  }, [
    user.id,
    organizationName,
    defaultJoinMonth,
  ])

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
            const startDate = new Date(
              request.start_date
            )
            const JoinMonth =
              startDate.getMonth() >= 7 ? 7 : 0
            if (JoinMonth === defaultJoinMonth) {
              let leavesWithoutSwaps = 0
              if (
                request.leave_type !==
                  "Emergency Leave" &&
                !request.is_unplanned &&
                request.leavedates
              ) {
                Object.values(
                  request.leavedates
                ).forEach((dateOptions) => {
                  if (!dateOptions.useSwap) {
                    if (dateOptions.fullLeave) {
                      leavesWithoutSwaps += 1
                    } else if (
                      dateOptions.firstHalf ||
                      dateOptions.secondHalf
                    ) {
                      leavesWithoutSwaps += 0.5
                    }
                  }
                })
              } else if (
                request.leave_type ===
                  "Emergency Leave" ||
                request.is_unplanned
              ) {
                leavesWithoutSwaps =
                  request.span || 1
              }
              totalAcceptedDays +=
                leavesWithoutSwaps
            }
          }
        }
      )

      setTakenLeavesCount(totalAcceptedDays)
    } catch {
      toast.error(
        "Error fetching leave request details"
      )
    }
  }

  useEffect(() => {
    fetchLeaveRequestDetails()
  }, [
    joinDate,
    user.id,
    organizationName,
    defaultJoinMonth,
  ])

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

  const totalDays =
    getTotalLeavesForJoinDate(joinDate)
  const remain = totalDays - takenLeavesCount

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 15,
        },
      },
    },
  }

  const labels = [
    t("takenLeaves"),
    t("remainingLeaves"),
  ]

  const data = {
    labels,
    datasets: [
      {
        label: t("leaves"),
        data: [takenLeavesCount, remain],
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <Box className="relative flex flex-col rounded-[0.4rem] w-full p-6 py-3 bg-base-100 dark:bg-gray-800 dark:text-white shadow-xl mt-3 border border-gray-300 dark:border-gray-600">
      <Box className="text-xl font-semibold dark:text-white">
        <Text size="5">{t("leaveChart")}</Text>
      </Box>
      <Box className="divider my-1 dark:border-gray-700"></Box>
      <Doughnut
        options={options}
        data={data}
        className="flex justify-center items-center max-h-48 mx-auto"
      />
    </Box>
  )
}
const getTotalLeavesForJoinDate = (joinDate) => {
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

export default DoughnutChart
