import React, { useState, useEffect } from "react"
import {
  Flex,
  Text,
  Tabs,
  Dialog,
  Button,
  Box,
  Strong,
} from "@radix-ui/themes"
import { useUser } from "@clerk/clerk-react"
import { GoDotFill } from "react-icons/go"
import { RxCrossCircled } from "react-icons/rx"
import { LiaBusinessTimeSolid } from "react-icons/lia"
import { FaBusinessTime } from "react-icons/fa6"
import {
  MdOutlineTimer,
  MdAccessTime,
} from "react-icons/md"
import axios from "axios"
import toast from "react-hot-toast"
import LastWeek from "./LastWeek"
import OverAll from "./OverAll"
import ThisWeek from "./ThisWeek"
import MyStopwatch from "./BreakTimer"
import { useTranslation } from "react-i18next"
import { useOrganizationContext } from "../../OrganizationContext"
import PropTypes from "prop-types"

const Timesheet = (props) => {
  const { setSwapCount } = props
  const { t } = useTranslation()
  const [activeTab, setActiveTab] =
    useState("Time Sheet")
  const { user } = useUser()
  const [isCheckedIn, setIsCheckedIn] =
    useState(false)
  const [checkindata, setCheckInData] = useState(
    []
  )
  const [
    checkoutCompleted,
    setCheckoutCompleted,
  ] = useState(false)
  const [holidays, setHolidays] = useState([])
  const [isOnLeave, setIsOnLeave] =
    useState(false)
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { organizationName, org_slug, socket } =
    useOrganizationContext()
  const [, setCurrentTheme] = useState(() => {
    return (
      localStorage.getItem("theme") || "light"
    )
  })

  useEffect(() => {
    const observer = new MutationObserver(
      (mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.attributeName ===
            "data-theme"
          ) {
            setCurrentTheme(
              document.documentElement.getAttribute(
                "data-theme"
              ) || "light"
            )
          }
        })
      }
    )
    observer.observe(document.documentElement, {
      attributes: true,
    })
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    fetchCheckinStatus()
    checkforcheckedout()
    checkLeaveStatus()
    const fetchHolidays = () => {
      axios
        .get(`${BASE_URL}/holidays`, {
          params: {
            org_slug: org_slug,
          },
        })
        .then((response) => {
          setHolidays(response.data.data)
        })
        .catch(() => {
          toast.error("Error fetching holidays")
        })
    }
    fetchHolidays()
  }, [])

  const fetchCheckinStatus = () => {
    axios
      .get(
        `${BASE_URL}/check_in_status/${user.id}`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then((response) => {
        const backenddata =
          response.data.user_data[0]
        setCheckInData(backenddata)
        setIsCheckedIn(
          backenddata.is_checked_in === "true"
        )
      })
      .catch(() => {
        toast.error("Please check in for today")
      })
  }

  const checkforcheckedout = () => {
    axios
      .get(
        `${BASE_URL}/check_for_checkout/${user.id}`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then((response) => {
        const backenddata = response.data
        setCheckoutCompleted(
          backenddata.is_checked_in === "true"
        )
      })
      .catch(() => {
        toast.error(
          "Error fetching check-out status"
        )
      })
  }
  const checkLeaveStatus = () => {
    axios
      .get(
        `${BASE_URL}/check_leave_status/${user.id}`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then((response) => {
        setIsOnLeave(response.data.is_on_leave)
      })
      .catch(() => {
        toast.error("Error checking leave status")
      })
  }

  const toggleBreak = () => {
    if (!props.timer.isRunning) {
      props.timer.reset({
        offsetTimestamp: false,
      })
      props.timer.start()
    } else {
      props.timer.reset({
        offsetTimestamp: false,
      })
      props.timer.pause()
      const break_time = props.timer.totalSeconds
      axios
        .put(
          `${BASE_URL}/add_break_time/${user.id}`,
          { break_time },
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
            socket.send("submited")
          }
          toast.success(
            t("BreakTimeSavedSuccessfully")
          )
          fetchCheckinStatus()
        })
        .catch(() => {
          toast.error(
            t(
              "FailedtoupdatebreaktimePleasetryagainlater"
            )
          )
        })
    }
  }
  const addSwapCount = () => {
    const today = new Date()
      .toISOString()
      .split("T")[0]
    const isSuggestedHoliday = holidays?.some(
      (h) =>
        h.date === today &&
        h.holiday_type === "Suggested"
    )

    if (!isSuggestedHoliday) {
      return
    }

    axios
      .put(`${BASE_URL}/addSwap`, null, {
        params: {
          user_id: user.id,
        },
      })
      .then((res) => {
        if (res.data.message) {
          toast.success(res.data.message)
        }
        axios
          .get(`${BASE_URL}/user/${user.id}`, {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          })
          .then((res) => {
            const newCount =
              res.data.user_data[0]?.swap_count
            if (newCount !== undefined)
              setSwapCount(newCount)
          })
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.detail ||
            "Error adding swap count"
        )
      })
  }

  const handleCheckInOut = () => {
    if (isOnLeave) {
      return
    }
    if (!isCheckedIn) {
      postCheckinTime()
    } else {
      postCheckoutTime()
    }
  }

  const postCheckinTime = () => {
    const options = { hour12: true }
    const checkin_time =
      new Date().toLocaleTimeString([], options)
    axios
      .post(
        `${BASE_URL}/add_checkin_time/${user.id}`,
        { checkin_time },
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
          socket.send("submited")
        }
        setIsCheckedIn(true)
        toast.success(t("Checkinsuccessfully"))
        fetchCheckinStatus()
      })
      .catch(() => {
        toast.error(
          "Failed to check in. Please try again later."
        )
      })
  }

  const postCheckoutTime = () => {
    const options = { hour12: true }
    const checkout_time =
      new Date().toLocaleTimeString([], options)
    axios
      .put(
        `${BASE_URL}/add_checkout_time/${user.id}`,
        { checkout_time },
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
          socket.send("submited")
        }
        toast.success(t("Checkoutsuccessfully"))
        setCheckoutCompleted(true)
        addSwapCount()
        totaltime()
        fetchCheckinStatus()
      })
      .catch(() => {
        toast.error(
          "Failed to check out. Please try again later."
        )
      })
  }

  const totaltime = () => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")
    const day = String(
      currentDate.getDate()
    ).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`
    axios
      .put(
        `${BASE_URL}/store_total_worked_hours/${user.id}/${formattedDate}`,
        {},
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then(() => {
        toast.success(
          t("Totalworkedhoursstoredsuccessfully")
        )
        fetchCheckinStatus()
      })
      .catch(() => {
        toast.error(
          t(
            "FailedtostoretotalworkedhoursPleasetryagainlater"
          )
        )
      })
  }
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
    <Box className="relative flex flex-col rounded-[0.4rem] w-full p-6 min-h-[45vh] py-5 pt-0 bg-base-100 shadow-xl dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
      <Tabs.Root
        defaultValue={t("timesheet")}
        onValueChange={(value) =>
          setActiveTab(value)
        }
      >
        <Tabs.List
          id="tablist"
          className="max-w-full"
        >
          <Box className="w-4/12 min-w-fit">
            <Tabs.Trigger
              value={t("timesheet")}
              className="tsTabTrigger dark:text-white"
            >
              <Text
                size="5"
                weight="bold"
                className="dark:text-white"
              >
                {props.timer.isRunning
                  ? t("Onabreak")
                  : t("timesheet")}
              </Text>
            </Tabs.Trigger>
          </Box>
          {!props.timer.isRunning && (
            <>
              <Box className="w-2/12 min-w-fit mt-1">
                <Tabs.Trigger
                  value={t("thisWeek")}
                >
                  <GoDotFill
                    className={
                      activeTab === t("thisWeek")
                        ? "final-color"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  />
                  <Text
                    size="3"
                    className="cursor-pointer text-gray-950 dark:text-gray-200"
                  >
                    {t("thisWeek")}
                  </Text>
                </Tabs.Trigger>
              </Box>
              <Box className="w-2/12 min-w-fit mt-1">
                <Tabs.Trigger
                  value={t("lastWeek")}
                >
                  <GoDotFill
                    ml="4"
                    className={
                      activeTab === t("lastWeek")
                        ? "final-color"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  />
                  <Text
                    className="cursor-pointer text-gray-950 dark:text-gray-200"
                    size="3"
                  >
                    {t("lastWeek")}
                  </Text>
                </Tabs.Trigger>
              </Box>
              <Box className="w-2/12 min-w-fit mt-1">
                <Tabs.Trigger
                  value={t("overAll")}
                >
                  <GoDotFill
                    className={
                      activeTab === t("overAll")
                        ? "final-color"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  />
                  <Text
                    className="cursor-pointer text-gray-950 dark:text-gray-200"
                    size="3"
                  >
                    {t("overAll")}
                  </Text>
                </Tabs.Trigger>
              </Box>
            </>
          )}
        </Tabs.List>
        <Box className="divider mt-1 mb-0 dark:border-gray-700" />
        <Tabs.Content
          value={t("timesheet")}
          className="w-[100%] m-auto"
        >
          {!props.timer.isRunning && (
            <Box className="h-auto px-5 pb-1">
              <Flex
                gap="6"
                mt="3"
              >
                <Box>
                  <FaBusinessTime
                    size="30"
                    className="text-gray-500 dark:text-gray-300"
                  />
                </Box>
                <Text
                  as="p"
                  size="4"
                  className="dark:text-white"
                >
                  <Strong className="dark:text-white">
                    {t("inTime")} -
                  </Strong>{" "}
                  {checkindata.checkin_time}
                </Text>
              </Flex>
              <Flex
                gap="6"
                mt="1"
              >
                <Box>
                  <MdOutlineTimer
                    size="30"
                    className={
                      checkindata.break_time >
                      2700
                        ? "text-red-500"
                        : "text-black dark:text-white"
                    }
                  />
                </Box>
                <Text
                  as="p"
                  size="4"
                  className={
                    checkindata.break_time > 2700
                      ? "text-red-500"
                      : "text-black dark:text-white"
                  }
                >
                  <Strong className="dark:text-white">
                    {t("breakTime")} -
                  </Strong>
                  {formatTime(
                    checkindata.break_time
                  )}
                </Text>
              </Flex>
              {checkoutCompleted && (
                <>
                  <Flex
                    gap="6"
                    mt="3"
                  >
                    <Box>
                      <LiaBusinessTimeSolid
                        size="30"
                        className="text-black dark:text-white"
                      />
                    </Box>
                    <Text
                      as="p"
                      size="4"
                      className="dark:text-white"
                    >
                      <Strong className="dark:text-white">
                        {t("CheckOutTime")} -
                      </Strong>
                      {checkindata.checkout_time}
                    </Text>
                  </Flex>
                  <Flex
                    gap="6"
                    mt="3"
                  >
                    <Box>
                      <MdAccessTime
                        size="30"
                        color="green"
                      />
                    </Box>
                    <Text
                      as="p"
                      size="4"
                      className="dark:text-white"
                    >
                      <Strong className="dark:text-white">
                        {t("averageWorkingHours")}{" "}
                        -
                      </Strong>{" "}
                      {checkindata.worked_hours
                        ? `${checkindata.worked_hours} hours`
                        : "0 hours"}
                    </Text>
                  </Flex>
                </>
              )}
            </Box>
          )}
          {props.timer.isRunning && (
            <Box className="h-auto mx-auto my-6">
              <Text
                as="p"
                className="dark:text-white"
              >
                <MyStopwatch
                  timer={props.timer}
                />
              </Text>
            </Box>
          )}
          <Box className="h-auto w-100%">
            <Flex
              gap="2"
              direction="row-reverse"
            >
              <Dialog.Root>
                <Dialog.Trigger>
                  <Box>
                    <Button
                      variant="outline"
                      size="3"
                      disabled={
                        !isCheckedIn ||
                        checkoutCompleted
                      }
                      className="dark:bg-gray-700 dark:border-gray-600"
                    >
                      <Text className="text-gray-950 font-bold dark:text-gray-200">
                        {props.timer.isRunning
                          ? t("endBreak")
                          : t("startbreak")}
                      </Text>
                    </Button>
                  </Box>
                </Dialog.Trigger>
                <Dialog.Content className="dark:bg-gray-800 dark:border-gray-700">
                  <Flex justify="between">
                    <Dialog.Title className="dark:text-white">
                      {props.timer.isRunning
                        ? t("endBreak")
                        : t("startbreak")}
                    </Dialog.Title>
                    <Dialog.Close>
                      <RxCrossCircled
                        className="cursor-pointer dark:text-white"
                        size="1.2em"
                      />
                    </Dialog.Close>
                  </Flex>
                  <Dialog.Description className="dark:text-gray-300">
                    {props.timer.isRunning
                      ? t(
                          "TakechargeandresumeyourtasksbyclickingthebuttonbelowtoEndtheBreak"
                        )
                      : t(
                          "ClickbelowtoStartaRefreshingBreakandboostyourproductivity"
                        )}
                  </Dialog.Description>
                  <Flex
                    gap="3"
                    justify="end"
                    mt="4"
                  >
                    <Dialog.Close>
                      <Button
                        variant="soft"
                        color="red"
                        className="bg-red-500 dark:bg-red-700 dark:text-white"
                      >
                        <Text className="cursor-pointer">
                          {t("cancel")}
                        </Text>
                      </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                      <Button
                        className="hover:bg-blue-700 bg-blue-500 text-white cursor-pointer transition-colors duration-300 ease-out rounded px-4 py-1 item-center"
                        onClick={toggleBreak}
                      >
                        <Text className="cursor-pointer">
                          {props.timer.isRunning
                            ? t("endBreak")
                            : t("startbreak")}
                        </Text>
                      </Button>
                    </Dialog.Close>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
              {!props.timer.isRunning &&
                !props.timer.isPaused && (
                  <Dialog.Root>
                    <Dialog.Trigger>
                      <Box>
                        <Button
                          variant="outline"
                          size="3"
                          disabled={
                            checkoutCompleted ||
                            isOnLeave
                          }
                          className="dark:bg-gray-700 dark:border-gray-600"
                        >
                          <Text className="text-gray-950 font-bold dark:text-gray-200">
                            {isCheckedIn
                              ? t("checkOut")
                              : t("CheckIn")}
                          </Text>
                        </Button>
                      </Box>
                    </Dialog.Trigger>
                    <Dialog.Content className="dark:bg-gray-800 dark:border-gray-700">
                      <Flex justify="between">
                        <Dialog.Title className="dark:text-white">
                          {isCheckedIn
                            ? t("checkOut")
                            : t("CheckIn")}
                        </Dialog.Title>
                        <Dialog.Close>
                          <RxCrossCircled
                            className="cursor-pointer dark:text-white"
                            size="1.2em"
                          />
                        </Dialog.Close>
                      </Flex>
                      <Dialog.Description className="dark:text-gray-300">
                        {isOnLeave
                          ? t(
                              "You are on leave today. Check-in is not allowed."
                            )
                          : isCheckedIn
                            ? t(
                                "YouredoinggreatClickbelowtocheckoutandrecordyourprogress"
                              )
                            : t(
                                "WelcomeClickbelowtocheckinandstartyourproductiveday"
                              )}
                      </Dialog.Description>
                      <Flex
                        gap="3"
                        justify="end"
                        mt="4"
                      >
                        <Dialog.Close>
                          <Button
                            variant="soft"
                            color="red"
                            className="bg-red-500 dark:bg-red-700 dark:text-white"
                          >
                            <Text className="cursor-pointer">
                              {t("cancel")}
                            </Text>
                          </Button>
                        </Dialog.Close>
                        {!isOnLeave && (
                          <Dialog.Close>
                            <Button
                              className="hover:bg-blue-700 bg-blue-500 text-white cursor-pointer transition-colors duration-300 ease-out rounded px-4 py-1 item-center"
                              onClick={
                                handleCheckInOut
                              }
                            >
                              <Text className="cursor-pointer">
                                {isCheckedIn
                                  ? t("checkOut")
                                  : t("CheckIn")}
                              </Text>
                            </Button>
                          </Dialog.Close>
                        )}
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>
                )}
            </Flex>
          </Box>
        </Tabs.Content>
        <Tabs.Content value={t("thisWeek")}>
          <Box>
            <ThisWeek />
          </Box>
        </Tabs.Content>
        <Tabs.Content value={t("lastWeek")}>
          <Box>
            <LastWeek />
          </Box>
        </Tabs.Content>
        <Tabs.Content value={t("overAll")}>
          <Box>
            <OverAll />
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}

export default Timesheet
Timesheet.propTypes = {
  timer: PropTypes.object,
  setSwapCount: PropTypes.func,
}
