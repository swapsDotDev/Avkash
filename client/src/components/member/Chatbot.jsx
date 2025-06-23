import React, { useEffect, useState } from "react"
import { useUser } from "@clerk/clerk-react"
import axios from "axios"
import toast from "react-hot-toast"
import { useOrganizationContext } from "../OrganizationContext"

const Chatbot = () => {
  const { user } = useUser()
  const username = user.firstName
  const [upcomingHolidays, setUpcomingHolidays] =
    useState([])
  const [flag, setFlag] = useState(false)
  const [scriptRun, setScriptRun] = useState(true)
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { organizationName, org_slug } =
    useOrganizationContext()
  const defaultJoinMonth =
    new Date().getMonth() >= 7 ? 7 : 0
  const [joinDate, setJoinDate] = useState(
    new Date(
      new Date().getFullYear(),
      defaultJoinMonth,
      1
    )
  )
  const [takenLeavesCount, setTakenLeavesCount] =
    useState(0)

  const getTotalLeavesForJoinDate = (
    joinDate
  ) => {
    const currentDate = new Date()
    const diffMonths =
      (currentDate.getFullYear() -
        joinDate.getFullYear()) *
        12 +
      (currentDate.getMonth() -
        joinDate.getMonth())
    return diffMonths * 1.5
  }

  useEffect(() => {
    const fetchUpcomingHolidays = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/holidays`,
          {
            params: {
              org_slug: org_slug,
            },
          }
        )

        const data = response.data.data
        if (data && data.length > 0) {
          const upcoming = data
            .filter((item) => {
              const holidayDate = new Date(
                item.date
              )
              return holidayDate >= new Date()
            })
            .slice(0, 2)

          const formattedHolidays = upcoming.map(
            (item) => {
              const holidayName = item.summary
              const holidayDate = new Date(
                item.date
              )
              return `${holidayName} on ${holidayDate.toDateString()}`
            }
          )

          setUpcomingHolidays(formattedHolidays)
        } else {
          setUpcomingHolidays([
            "No upcoming holidays",
          ])
        }
      } catch (error) {
        toast.error("Error fetching holidays")
        setUpcomingHolidays([
          "Error fetching holidays",
        ])
      }
    }
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
      } catch (error) {
        toast.error("Error fetching user data")
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
          let totalAcceptedDays = 0

          response.data.leave_requests.forEach(
            (request) => {
              if (request.status === "accepted") {
                const startDate = new Date(
                  request.start_date
                )
                const JoinMonth =
                  startDate.getMonth() >= 7
                    ? 7
                    : 0
                if (
                  JoinMonth === defaultJoinMonth
                ) {
                  const totalDays =
                    request.span || 0
                  totalAcceptedDays += totalDays
                }
              }
            }
          )
          setTakenLeavesCount(totalAcceptedDays)
          setFlag(true)
        })
        .catch(() => {
          toast.error(
            "Error fetching leave request details"
          )
        })
    }
    fetchLeaveRequestDetails()

    fetchUpcomingHolidays()
    if (user.id && organizationName && org_slug) {
      fetchUserData()
    }
  }, [])

  useEffect(() => {
    if (
      flag &&
      upcomingHolidays.length > 0 &&
      scriptRun
    ) {
      const script =
        document.createElement("script")
      script.src =
        "https://cdn.botpress.cloud/webchat/v1/inject.js"
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        window.botpressWebChat.init({
          composerPlaceholder:
            "Say Something to Seva ...",
          botId:
            "7aa224d9-cf4d-4791-9c05-79a6ecd1e657",
          hostUrl:
            "https://cdn.botpress.cloud/webchat/v1",
          messagingUrl:
            "https://messaging.botpress.cloud",
          clientId:
            "7aa224d9-cf4d-4791-9c05-79a6ecd1e657",
          botName: "Seva",
          avatarUrl:
            "https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg?size=338&ext=jpg&ga=GA1.1.1395880969.1709510400&semt=ais",
          enableConversationDeletion: true,
          lazySocket: true,
          themeName: "prism",
          webhookId:
            "7872e718-df3b-4f6c-bad4-149113811baf",
          frontendVersion: "v1",
          showPoweredBy: false,
          theme: "prism",
          themeColor: "#2563eb",
          userData: {
            name: username,
            totalleaves:
              getTotalLeavesForJoinDate(
                joinDate
              ).toString(),
            takenleaves:
              takenLeavesCount.toString(),
            remainingleaves: (
              getTotalLeavesForJoinDate(
                joinDate
              ) - takenLeavesCount
            ).toString(),
            upcomingHolidays1:
              upcomingHolidays[0],
            upcomingHolidays2:
              upcomingHolidays[1],
          },
        })

        window.botpressWebChat.onEvent(
          (event) => {
            window.location = event.value.url
          },
          ["TRIGGER"]
        )
      }
      setScriptRun(false)
    }
  }, [
    upcomingHolidays,
    username,
    takenLeavesCount,
    joinDate,
  ])

  return (
    <div
      id="webchat"
      className="bg-white dark:bg-gray-900 text-black dark:text-white h-full"
    />
  )
}

export default Chatbot
