import { themeChange } from "theme-change"
import React, { useEffect, useState } from "react"
import {
  Box,
  Flex,
  Button,
  Text,
} from "@radix-ui/themes"
import {
  MdArrowBackIos,
  MdClear,
} from "react-icons/md"
import { IoCheckmarkDoneSharp } from "react-icons/io5"
import { BsFunnel } from "react-icons/bs"
import BellIcon from "@heroicons/react/24/outline/BellIcon"
import { useUser } from "@clerk/clerk-react"
import { useTranslation } from "react-i18next"
import axios from "axios"
import { useOrganizationContext } from "../OrganizationContext"
import toast from "react-hot-toast"
import * as Popover from "@radix-ui/react-popover"

const AdminNotifications = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [notificationList, setNotificationList] =
    useState([])
  const [
    cachedNotifications,
    setCachedNotifications,
  ] = useState({ true: [], false: [] })
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { user } = useUser()
  const [isChecked, setIsChecked] =
    useState(false)
  const {
    organizationName,
    organizationImage,
    socket,
    org_slug,
  } = useOrganizationContext()
  const [
    desktopNotifications,
    setDesktopNotifications,
  ] = useState([])
  const [
    notificationTypeFilter,
    setNotificationTypeFilter,
  ] = useState("")
  const [filterOpen, setFilterOpen] =
    useState(false)
  const [
    totalUnreadNotificationsCount,
    setTotalUnreadNotificationsCount,
  ] = useState(0)

  const showDesktopNotification = (message) => {
    axios
      .get(
        `${BASE_URL}/desktop_notfication_status/${user.id}`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then((response) => {
        if (response.data.desktop_notification) {
          if (!("Notification" in window)) {
            toast.error(
              "This browser does not support desktop notification"
            )
          } else if (
            Notification.permission === "granted"
          ) {
            const notification = new Notification(
              organizationName,
              {
                body: message,
                icon: organizationImage,
              }
            )
            notification.onclick = function () {
              window.focus()
              openNotification()
              notification.close()
            }
          } else if (
            Notification.permission !== "denied"
          ) {
            Notification.requestPermission().then(
              (permission) => {
                if (permission === "granted") {
                  const notification =
                    new Notification(
                      organizationName,
                      {
                        body: message,
                        icon: organizationImage,
                      }
                    )
                  notification.onclick =
                    function () {
                      window.focus()
                      openNotification()
                      notification.close()
                    }
                }
              }
            )
          }
        }
      })
  }

  useEffect(() => {
    Notification.requestPermission().then(
      (permission) => {
        if (permission !== "granted") {
          toast.error(
            "Permission denied for notifications"
          )
        }
      }
    )
  }, [])

  useEffect(() => {
    if (desktopNotifications.length > 0) {
      let index = 0
      desktopNotifications.forEach(
        (notification) => {
          showDesktopNotification(
            notification.message
          )
        }
      )
      desktopNotifications.forEach(
        (notification) => {
          removeDesktopNotification(
            notification._id,
            index++,
            notification.collectionName
          )
        }
      )
      setDesktopNotifications([])
    }
  }, [desktopNotifications])

  const fetchNotifications = () => {
    axios
      .get(
        `${BASE_URL}/send_admin_notifications`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
            user_id: user.id,
          },
        }
      )
      .then((response) => {
        const {
          notifications_true,
          notifications_false,
        } = response.data
        setCachedNotifications({
          true: notifications_true,
          false: notifications_false,
        })

        setTotalUnreadNotificationsCount(
          notifications_true.length
        )

        let filteredNotifications = isChecked
          ? notifications_false
          : notifications_true

        if (notificationTypeFilter) {
          filteredNotifications =
            filteredNotifications.filter(
              (notification) => {
                if (
                  notificationTypeFilter ===
                  "leave request"
                ) {
                  return (
                    notification.type ===
                      "leave request" ||
                    notification.message
                      .toLowerCase()
                      .includes("leave")
                  )
                }
                if (
                  notificationTypeFilter ===
                  "feedback"
                ) {
                  return (
                    notification.type ===
                      "feedback" ||
                    notification.message
                      .toLowerCase()
                      .includes("feedback")
                  )
                }
                if (
                  notificationTypeFilter ===
                  "reimbursement"
                ) {
                  return (
                    notification.type ===
                      "reimbursement" ||
                    notification.message
                      .toLowerCase()
                      .includes("reimbursement")
                  )
                }
                if (
                  notificationTypeFilter ===
                  "document"
                ) {
                  const message =
                    notification.message.toLowerCase()
                  return (
                    notification.type ===
                      "document" ||
                    message.includes(
                      "document"
                    ) ||
                    message.includes("submitted")
                  )
                }
                return (
                  notification.type ===
                  notificationTypeFilter
                )
              }
            )
        }

        setNotificationList(
          filteredNotifications.sort(
            (a, b) =>
              new Date(b.timestamp) -
              new Date(a.timestamp)
          )
        )
      })
      .catch(() => {
        toast.error(
          "Error fetching notifications"
        )
      })
      .finally(() => {})
  }

  const fetchDesktopNotifications = () => {
    axios
      .get(
        `${BASE_URL}/send_admin_desktop_notifications`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
            user_id: user.id,
          },
        }
      )
      .then((response) => {
        const { notifications } = response.data

        const reimbursementNotifications =
          notifications.filter(
            (n) => n.type === "reimbursement"
          )

        if (
          reimbursementNotifications.length > 0
        ) {
          const promises =
            reimbursementNotifications.map(
              (notification) =>
                axios.put(
                  `${BASE_URL}/update_admin_desktop_notification/${notification._id}`,
                  {},
                  {
                    params: {
                      organization_name:
                        organizationName,
                      collection_name:
                        notification.collectionName,
                      org_slug: org_slug,
                    },
                  }
                )
            )

          Promise.all(promises).catch(() => {})
        }

        setDesktopNotifications(notifications)
      })
      .catch(() => {
        toast.error(
          "Error fetching desktop notifications"
        )
      })
  }

  const removeNotification = (
    notificationId,
    index,
    collectionName
  ) => {
    axios
      .put(
        `${BASE_URL}/update_admin_notification/${notificationId}/`,
        {},
        {
          params: {
            org_slug: org_slug,
            collection_name: collectionName,
            organization_name: organizationName,
          },
        }
      )
      .then(() => {
        const notification =
          notificationList[index]
        setNotificationList((prev) =>
          prev.filter((_, i) => i !== index)
        )
        setCachedNotifications((prev) => ({
          true: prev.true.filter(
            (n) => n._id !== notificationId
          ),
          false: [...prev.false, notification],
        }))

        setTotalUnreadNotificationsCount((prev) =>
          Math.max(0, prev - 1)
        )

        toast.success(
          "Notification marked as read"
        )
      })
      .catch(() => {
        toast.error(
          "Error marking notification as read"
        )
      })
  }

  const removeDesktopNotification = (
    notificationId,
    index,
    collectionName
  ) => {
    axios
      .put(
        `${BASE_URL}/update_admin_desktop_notification/${notificationId}`,
        {},
        {
          params: {
            organization_name: organizationName,
            collection_name: collectionName,
          },
        }
      )
      .then(() => {})
      .catch(() => {
        toast.error("Error removing notification")
      })
  }

  const clearNotification = (
    notificationId,
    index,
    collectionName
  ) => {
    axios
      .put(
        `${BASE_URL}/update_admin_notification_clear/${notificationId}/`,
        {},
        {
          params: {
            organization_name: organizationName,
            collection_name: collectionName,
            org_slug: org_slug,
          },
        }
      )
      .then(() => {
        const updatedList =
          notificationList.filter(
            (_, i) => i !== index
          )
        setNotificationList(updatedList)
        setCachedNotifications((prev) => ({
          true: prev.true.filter(
            (n) => n._id !== notificationId
          ),
          false: prev.false.filter(
            (n) => n._id !== notificationId
          ),
        }))

        if (!isChecked) {
          setTotalUnreadNotificationsCount(
            (prev) => Math.max(0, prev - 1)
          )
        }

        toast.success("Notification cleared")
      })
      .catch(() => {
        toast.error("Error clearing notification")
      })
  }

  const clearAllNotifications = () => {
    axios
      .put(
        `${BASE_URL}/clear_admin_notifications`,
        null,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
            user_id: user.id,
          },
        }
      )
      .then(() => {
        setNotificationList([])
        setCachedNotifications({
          true: [],
          false: [],
        })
        setTotalUnreadNotificationsCount(0)
        toast.success("All notifications cleared")
      })
      .catch(() => {
        toast.error(
          "Error clearing notifications"
        )
      })
  }

  const markAllAsRead = () => {
    if (
      isChecked ||
      notificationList.length === 0
    )
      return
    const notificationToMoveToRead = [
      ...notificationList,
    ]

    const updatePromises = notificationList.map(
      (notification) =>
        axios.put(
          `${BASE_URL}/update_admin_notification/${notification._id}?collection_name=${notification.collectionName}`,
          {},
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
              collection_name:
                notification.collectionName,
            },
          }
        )
    )

    window.Promise.all(updatePromises)
      .then(() => {
        setCachedNotifications((prev) => ({
          true: [],
          false: [
            ...prev.false,
            ...notificationToMoveToRead,
          ],
        }))
        setNotificationList([])
        setTotalUnreadNotificationsCount(0)
        toast.success(
          "All notifications marked as read"
        )
      })
      .catch(() => {
        toast.error(
          "Error marking notifications as read"
        )
        fetchNotifications()
      })
  }

  const applyFilter = (newFilter) => {
    setNotificationTypeFilter(newFilter)
    setFilterOpen(false)

    const filteredNotifications = (
      isChecked
        ? cachedNotifications.false
        : cachedNotifications.true
    )
      .filter((notification) => {
        if (!newFilter) return true
        if (newFilter === "leave request") {
          return (
            notification.type ===
              "leave request" ||
            notification.message
              .toLowerCase()
              .includes("leave")
          )
        }
        if (newFilter === "feedback") {
          return (
            notification.type === "feedback" ||
            notification.message
              .toLowerCase()
              .includes("feedback")
          )
        }
        if (newFilter === "reimbursement") {
          return (
            notification.type ===
              "reimbursement" ||
            notification.message
              .toLowerCase()
              .includes("reimbursement")
          )
        }
        if (newFilter === "document") {
          const message =
            notification.message.toLowerCase()
          return (
            notification.type === "document" ||
            message.includes("document") ||
            message.includes("submitted")
          )
        }
        return notification.type === newFilter
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp) -
          new Date(a.timestamp)
      )
    setNotificationList(filteredNotifications)
  }

  const clearFilters = () => {
    setNotificationTypeFilter("")
    setFilterOpen(false)

    const filteredNotifications = isChecked
      ? cachedNotifications.false
      : cachedNotifications.true

    setNotificationList(
      filteredNotifications.sort(
        (a, b) =>
          new Date(b.timestamp) -
          new Date(a.timestamp)
      )
    )
  }

  const handleTabSwitch = (checked) => {
    setIsChecked(checked)

    const filteredNotifications = (
      checked
        ? cachedNotifications.false
        : cachedNotifications.true
    )
      .filter((notification) => {
        if (!notificationTypeFilter) return true
        if (
          notificationTypeFilter ===
          "leave request"
        ) {
          return (
            notification.type ===
              "leave request" ||
            notification.message
              .toLowerCase()
              .includes("leave")
          )
        }
        if (
          notificationTypeFilter === "feedback"
        ) {
          return (
            notification.type === "feedback" ||
            notification.message
              .toLowerCase()
              .includes("feedback")
          )
        }
        if (
          notificationTypeFilter ===
          "reimbursement"
        ) {
          return (
            notification.type ===
              "reimbursement" ||
            notification.message
              .toLowerCase()
              .includes("reimbursement")
          )
        }
        if (
          notificationTypeFilter === "document"
        ) {
          return (
            notification.type === "document" ||
            notification.message
              .toLowerCase()
              .includes("document") ||
            notification.message
              .toLowerCase()
              .includes("submitted")
          )
        }
        return (
          notification.type ===
          notificationTypeFilter
        )
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp) -
          new Date(a.timestamp)
      )

    setNotificationList(filteredNotifications)
  }

  const [currentTheme, setCurrentTheme] =
    useState(localStorage.getItem("theme"))
  useEffect(() => {
    themeChange(false)
    if (currentTheme === null) {
      if (
        window.matchMedia &&
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
      ) {
        setCurrentTheme("dark")
      } else {
        setCurrentTheme("light")
      }
    }
  }, [])

  const openNotification = () => {
    setOpen(true)
    setIsChecked(false)
  }

  const closeSidebar = () => {
    setOpen(false)
    setNotificationTypeFilter("")

    const filteredNotifications = isChecked
      ? cachedNotifications.false
      : cachedNotifications.true

    setNotificationList(
      filteredNotifications.sort(
        (a, b) =>
          new Date(b.timestamp) -
          new Date(a.timestamp)
      )
    )
  }
  useEffect(() => {
    fetchDesktopNotifications()
    fetchNotifications()
  }, [user, organizationName, org_slug])

  useEffect(() => {
    if (
      cachedNotifications.true.length > 0 ||
      cachedNotifications.false.length > 0
    ) {
      const filteredNotifications = isChecked
        ? cachedNotifications.false
        : cachedNotifications.true
      setNotificationList(
        filteredNotifications
          .filter((notification) => {
            if (!notificationTypeFilter)
              return true
            if (
              notificationTypeFilter ===
              "leave request"
            ) {
              return (
                notification.type ===
                  "leave request" ||
                notification.message
                  .toLowerCase()
                  .includes("leave")
              )
            }
            if (
              notificationTypeFilter ===
              "feedback"
            ) {
              return (
                notification.type ===
                  "feedback" ||
                notification.message
                  .toLowerCase()
                  .includes("feedback")
              )
            }
            if (
              notificationTypeFilter ===
              "reimbursement"
            ) {
              return (
                notification.type ===
                  "reimbursement" ||
                notification.message
                  .toLowerCase()
                  .includes("reimbursement")
              )
            }
            if (
              notificationTypeFilter ===
              "document"
            ) {
              return (
                notification.type ===
                  "document" ||
                notification.message
                  .toLowerCase()
                  .includes("document") ||
                notification.message
                  .toLowerCase()
                  .includes("submitted")
              )
            }
            return (
              notification.type ===
              notificationTypeFilter
            )
          })
          .sort(
            (a, b) =>
              new Date(b.timestamp) -
              new Date(a.timestamp)
          )
      )
    }
  }, [
    isChecked,
    notificationTypeFilter,
    cachedNotifications,
  ])

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return `${date.toDateString()} ${date.toLocaleTimeString()}`
  }

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (
          data.type === "reimbursement_update" &&
          data.needsDesktopNotification
        ) {
          fetchDesktopNotifications()
        }

        fetchNotifications()
      } catch (e) {
        fetchNotifications()
        fetchDesktopNotifications()
      }
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
  }, [socket])

  return (
    <Box className="navbar sticky top-0 bottom-0 bg-base-100 dark:bg-gray-900 dark:text-white z-10">
      <Flex className="flex-none">
        <Button
          variant="ghost"
          radius="full"
          color="gray"
          className="ml-4 p-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          highContrast
          onClick={openNotification}
          aria-label="Open notifications"
        >
          <Box className="indicator relative">
            <BellIcon className="h-6 w-6 text-black dark:text-white" />
            {totalUnreadNotificationsCount >
              0 && (
              <Text
                as="span"
                className="indicator-item badge badge-secondary badge-sm  absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 dark:bg-indigo-500 dark:text-white"
              >
                {totalUnreadNotificationsCount}
              </Text>
            )}
          </Box>
        </Button>
        <Box
          className={`fixed overflow-hidden z-50 bg-gray-900 bg-opacity-25 dark:bg-opacity-50 inset-0 transform ease-in-out ${
            open
              ? "opacity-100 translate-x-0 duration-500"
              : "opacity-0 translate-x-full delay-500"
          }`}
        >
          <Box
            className={`w-80 md:w-96 right-0 absolute bg-white dark:bg-gray-800 shadow-xl h-full transition-all duration-500 ${
              open
                ? "translate-x-0"
                : "translate-x-full"
            }`}
          >
            <Flex className="relative flex flex-col h-full">
              <Box className="px-4 py-3 flex flex-col space-y-3 border-b border-gray-200">
                <Flex className="flex items-center justify-between">
                  <Flex className="flex items-center">
                    <MdArrowBackIos
                      className="h-4 w-4 cursor-pointer"
                      onClick={closeSidebar}
                    />
                    <Text
                      as="span"
                      className="font-semibold text-lg ml-2 dark:text-white"
                    >
                      Notifications
                    </Text>
                  </Flex>
                  <Flex className="ml-auto">
                    {!isChecked &&
                      notificationList.length >
                        0 && (
                        <Text
                          as="span"
                          className="text-indigo-500 dark:text-indigo-300 text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-800 transition-colors"
                          onClick={markAllAsRead}
                        >
                          Mark All As Read
                        </Text>
                      )}
                  </Flex>
                </Flex>
                <Flex className="flex items-center justify-between">
                  <Box className="w-full max-w-lg">
                    <Box className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-full w-full relative">
                      <Box
                        className={`absolute top-1 left-1 bottom-1 w-[49%] rounded-full bg-indigo-500 dark:bg-blue-900 transition-all duration-300 ${
                          isChecked
                            ? "translate-x-full"
                            : "translate-x-0"
                        }`}
                      ></Box>
                      <button
                        className={`w-1/2 text-center py-2 text-sm font-medium rounded-full relative z-10 transition-all ${
                          !isChecked
                            ? "text-white"
                            : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-400"
                        }`}
                        onClick={() =>
                          handleTabSwitch(false)
                        }
                      >
                        <Box
                          className="absolute inset-0"
                          onClick={() =>
                            handleTabSwitch(false)
                          }
                        ></Box>
                        Unread
                      </button>
                      <button
                        className={`w-1/2 text-center py-2 text-sm font-medium rounded-full relative z-10 transition-all ${
                          isChecked
                            ? "text-white"
                            : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-400"
                        }`}
                        onClick={() =>
                          handleTabSwitch(true)
                        }
                      >
                        <Box
                          className="absolute inset-0"
                          onClick={() =>
                            handleTabSwitch(true)
                          }
                        ></Box>
                        Read
                      </button>
                    </Box>
                  </Box>
                  <Flex className="ml-3 justify-end items-center">
                    <Popover.Root
                      open={filterOpen}
                      onOpenChange={(open) => {
                        setFilterOpen(open)
                        if (
                          !open &&
                          notificationTypeFilter ===
                            ""
                        ) {
                          clearFilters()
                        }
                      }}
                    >
                      <Popover.Trigger asChild>
                        <div className="relative group">
                          <Button
                            variant="ghost"
                            size="2"
                            className="p-2 rounded-full dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 ml-2"
                          >
                            <BsFunnel
                              color="black dark:text-white"
                              className="w-5 h-5"
                            />
                          </Button>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black dark:bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                            Filter
                          </span>
                        </div>
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
                            color: #000 !important;
                          }
                        `}
                        </style>
                        <div
                          className="filter-container"
                          style={{
                            maxWidth:
                              "fit-content",
                            display: "flex",
                            flexDirection:
                              "column",
                            gap: "10px",
                          }}
                        >
                          <div
                            className={`filter-button ${
                              notificationTypeFilter ===
                              ""
                                ? "active"
                                : ""
                            } bg-white dark:bg-[#424242] text-black dark:text-white`}
                            style={{
                              padding: "8px 16px",
                              borderRadius:
                                "12px",
                              cursor: "pointer",
                              transition:
                                "background-color 0.2s",
                            }}
                            onClick={() =>
                              applyFilter("")
                            }
                          >
                            All Types
                          </div>
                          <div
                            className={`filter-button ${
                              notificationTypeFilter ===
                              "leave request"
                                ? "active"
                                : ""
                            } bg-white dark:bg-[#424242] text-black dark:text-white`}
                            style={{
                              padding: "8px 16px",
                              borderRadius:
                                "12px",
                              cursor: "pointer",
                              transition:
                                "background-color 0.2s",
                            }}
                            onClick={() =>
                              applyFilter(
                                "leave request"
                              )
                            }
                          >
                            Leave Request
                          </div>
                          <div
                            className={`filter-button ${
                              notificationTypeFilter ===
                              "feedback"
                                ? "active"
                                : ""
                            } bg-white dark:bg-[#424242] text-black dark:text-white`}
                            style={{
                              padding: "8px 16px",
                              borderRadius:
                                "12px",
                              cursor: "pointer",
                              transition:
                                "background-color 0.2s",
                            }}
                            onClick={() =>
                              applyFilter(
                                "feedback"
                              )
                            }
                          >
                            Feedback
                          </div>
                          <div
                            className={`filter-button ${
                              notificationTypeFilter ===
                              "reimbursement"
                                ? "active"
                                : ""
                            } bg-white dark:bg-[#424242] text-black dark:text-white`}
                            style={{
                              padding: "8px 16px",
                              borderRadius:
                                "12px",
                              cursor: "pointer",
                              transition:
                                "background-color 0.2s",
                            }}
                            onClick={() =>
                              applyFilter(
                                "reimbursement"
                              )
                            }
                          >
                            Reimbursement
                          </div>
                          <div
                            className={`filter-button ${
                              notificationTypeFilter ===
                              "referral"
                                ? "active"
                                : ""
                            } bg-white dark:bg-[#424242] text-black dark:text-white`}
                            style={{
                              padding: "8px 16px",
                              borderRadius:
                                "12px",
                              cursor: "pointer",
                              transition:
                                "background-color 0.2s",
                            }}
                            onClick={() =>
                              applyFilter(
                                "referral"
                              )
                            }
                          >
                            Referral
                          </div>
                          <div
                            className={`filter-button ${
                              notificationTypeFilter ===
                              "document"
                                ? "active"
                                : ""
                            } bg-white dark:bg-[#424242] text-black dark:text-white`}
                            style={{
                              padding: "8px 16px",
                              borderRadius:
                                "12px",
                              cursor: "pointer",
                              transition:
                                "background-color 0.2s",
                            }}
                            onClick={() =>
                              applyFilter(
                                "document"
                              )
                            }
                          >
                            Document
                          </div>
                        </div>
                        <Popover.Arrow className="fill-white" />
                      </Popover.Content>
                    </Popover.Root>
                  </Flex>
                </Flex>
              </Box>
              <Box className="overflow-y-auto h-full">
                {notificationList?.length > 0 ? (
                  notificationList.map(
                    (notification, i) => (
                      <Box
                        key={notification._id}
                        className={`py-1 px-1 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          notification.hasError
                            ? "bg-red-50 dark:bg-red-900"
                            : "bg-white dark:bg-gray-800"
                        }`}
                      >
                        <Box className="w-full text-right">
                          <Text
                            as="span"
                            className="text-xs text-gray-500 dark:text-gray-400"
                          >
                            {formatTimestamp(
                              notification.timestamp
                            )}
                          </Text>
                        </Box>
                        {!isChecked ? (
                          <Flex className="items-center justify-between w-full">
                            <Box className="flex items-center justify-center min-w-[32px] mb-0">
                              <IoCheckmarkDoneSharp
                                title="Mark as Read"
                                className="text-indigo-300 dark:text-indigo-400 cursor-pointer h-5 w-5 hover:text-indigo-800 dark:hover:text-indigo-500"
                                onClick={() => {
                                  removeNotification(
                                    notification._id,
                                    i,
                                    notification.collectionName
                                  )
                                }}
                              />
                            </Box>
                            <Box
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mx-2 break-words flex-1"
                              style={{
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              <Text
                                as="p"
                                className="text-sm dark:text-gray-300"
                              >
                                {
                                  notification.message
                                }
                              </Text>
                            </Box>
                            <Box className="flex items-center justify-center min-w-[32px]">
                              <MdClear
                                title="Clear"
                                className="text-gray-600 dark:text-gray-400 cursor-pointer h-5 w-5 hover:text-gray-800 dark:hover:text-white"
                                onClick={() => {
                                  clearNotification(
                                    notification._id,
                                    i,
                                    notification.collectionName
                                  )
                                }}
                              />
                            </Box>
                          </Flex>
                        ) : (
                          <Flex className="items-center justify-between w-full">
                            <Box
                              className={`rounded-lg p-3 break-words flex-1 ml-4 ${
                                isChecked
                                  ? "bg-blue-100 dark:bg-blue-900"
                                  : "bg-gray-50"
                              }`}
                              style={{
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              <Text
                                as="p"
                                className="text-sm"
                              >
                                {
                                  notification.message
                                }
                              </Text>
                            </Box>
                            <Box className="flex items-center justify-center min-w-[32px]">
                              <MdClear
                                title="Clear"
                                className="text-gray-600 dark:text-gray-400 cursor-pointer h-5 w-5 hover:text-gray-800 dark:hover:text-white"
                                onClick={() =>
                                  clearNotification(
                                    notification._id,
                                    i,
                                    notification.collectionName
                                  )
                                }
                              />
                            </Box>
                          </Flex>
                        )}
                      </Box>
                    )
                  )
                ) : (
                  <Box className="flex justify-center items-center h-full">
                    <Text
                      as="span"
                      className="dark:text-gray-300"
                    >
                      {" "}
                      {t("noNotificationsToShow")}
                    </Text>
                  </Box>
                )}
              </Box>
              {notificationList.length > 0 && (
                <Box className="text-semibold text-gray mt-2 mb-2 flex justify-center cursor-pointer">
                  <Text
                    as="span"
                    onClick={
                      clearAllNotifications
                    }
                    className="font-bold hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    {t("clearAll")}
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>
          <Box
            className="w-screen h-full cursor-pointer"
            onClick={closeSidebar}
          ></Box>
        </Box>
      </Flex>
    </Box>
  )
}
export default AdminNotifications
