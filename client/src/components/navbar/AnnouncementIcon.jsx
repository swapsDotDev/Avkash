import React, {
  useState,
  useEffect,
  useRef,
} from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Text,
  Tooltip,
} from "@radix-ui/themes"
import axios from "axios"
import { useOrganizationContext } from "../OrganizationContext"
import {
  motion,
  AnimatePresence,
} from "framer-motion"
import { GrAnnounce } from "react-icons/gr"
import { AlertCircle } from "lucide-react"
import {
  useUser,
  useOrganization,
} from "@clerk/clerk-react"

const parseNoticeDate = (timestamp) => {
  try {
    const regex =
      /^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2}\s[AP]M)$/
    const match = timestamp.match(regex)
    if (match) {
      const datePart = match[1]
      const timePart = match[2]
      const date = new Date(
        `${datePart} ${timePart}`
      )
      if (!isNaN(date)) {
        return date.toISOString().split("T")[0]
      }
    }
    const date = new Date(timestamp)
    if (!isNaN(date)) {
      return date.toISOString().split("T")[0]
    }

    return null
  } catch (error) {
    // silently handle error
    return null
  }
}

const AnnouncementIcon = () => {
  const [
    highPriorityNotices,
    setHighPriorityNotices,
  ] = useState([])
  const [loading, setLoading] = useState(false)
  const [popoverOpen, setPopoverOpen] =
    useState(false)
  const { org_slug, organizationName, socket } =
    useOrganizationContext()
  const { user } = useUser()
  const { organization } = useOrganization()
  const navigate = useNavigate()
  const popoverRef = useRef(null)
  const buttonRef = useRef(null)
  const BASE_URL =
    process.env.REACT_APP_BASE_URL ||
    "http://localhost:8000"

  const normalizedOrgName = organizationName
    ? organizationName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
    : ""

  const userRole =
    user && organization
      ? user.organizationMemberships?.find(
          (m) =>
            m.organization.id === organization.id
        )?.role || "member"
      : "member"

  useEffect(() => {
    if (!org_slug || !normalizedOrgName) return

    const fetchHighPriorityNotices = async () => {
      setLoading(true)
      try {
        const response = await axios.get(
          `${BASE_URL}/get_high_priority_notices`,
          {
            params: {
              org_slug,
              organization_name:
                normalizedOrgName,
            },
          }
        )

        const today = new Date()
          .toISOString()
          .split("T")[0]
        const todaysNotices =
          response.data.notices
            .filter((notice) => {
              const noticeDate = parseNoticeDate(
                notice.timestamp
              )
              return (
                noticeDate === today &&
                notice.priority === "high" &&
                !notice.archived
              )
            })
            .map((notice) => ({
              ...notice,
              id: notice.id || notice._id,
              pinned: Boolean(notice.pinned),
              archived: Boolean(notice.archived),
            }))

        setHighPriorityNotices(todaysNotices)
      } catch (error) {
        // silently handle error
      } finally {
        setLoading(false)
      }
    }

    fetchHighPriorityNotices()
  }, [org_slug, normalizedOrgName, BASE_URL])

  useEffect(() => {
    if (
      !socket ||
      !org_slug ||
      !normalizedOrgName
    )
      return

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const receivedOrgName =
          data.organization_name
            ? data.organization_name
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
            : ""

        if (
          data.org_slug === org_slug &&
          receivedOrgName === normalizedOrgName
        ) {
          const notice = {
            ...data.notice,
            id: data.notice.id || data.notice._id,
            pinned: Boolean(data.notice.pinned),
            archived: Boolean(
              data.notice.archived
            ),
          }

          const today = new Date()
            .toISOString()
            .split("T")[0]
          const noticeDate = parseNoticeDate(
            notice.timestamp
          )
          if (
            data.event === "update_notice" &&
            notice.priority !== "high"
          ) {
            setHighPriorityNotices((prev) =>
              prev.filter(
                (n) => n.id !== notice.id
              )
            )
            return
          }

          if (
            noticeDate === today &&
            notice.priority === "high" &&
            !notice.archived
          ) {
            if (data.event === "new_notice") {
              setHighPriorityNotices((prev) => [
                notice,
                ...prev.filter(
                  (n) => n.id !== notice.id
                ),
              ])
            } else if (
              data.event === "update_notice"
            ) {
              setHighPriorityNotices((prev) => {
                const exists = prev.some(
                  (n) => n.id === notice.id
                )
                return exists
                  ? prev.map((n) =>
                      n.id === notice.id
                        ? notice
                        : n
                    )
                  : [notice, ...prev]
              })
            }
          } else if (
            data.event === "update_notice" &&
            notice.archived
          ) {
            setHighPriorityNotices((prev) =>
              prev.filter(
                (n) => n.id !== notice.id
              )
            )
          }
        }
      } catch (error) {
        // silently handle error
      }
    }

    socket.addEventListener(
      "message",
      handleMessage
    )

    return () => {
      socket.removeEventListener(
        "message",
        handleMessage
      )
    }
  }, [socket, org_slug, normalizedOrgName])

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(
          event.target
        ) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setPopoverOpen(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
  }, [])

  const handleClick = () => {
    setPopoverOpen(!popoverOpen)
  }

  const handleNoticeClick = (noticeId) => {
    setPopoverOpen(false)
    const normalizedRole = userRole
      .toLowerCase()
      .replace(/^org:/, "")
    if (
      normalizedRole === "admin" ||
      normalizedRole === "superadmin"
    ) {
      navigate(`/noticeboard?notice=${noticeId}`)
    } else {
      navigate(
        `/membernoticeboard?notice=${noticeId}`
      )
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="relative">
      <Tooltip
        content={
          highPriorityNotices.length > 0
            ? `${highPriorityNotices.length} high priority announcement${highPriorityNotices.length > 1 ? "s" : ""}`
            : "No urgent announcements"
        }
        style={{
          marginLeft: "8px",
          marginRight: "8px",
        }}
      >
        <Button
          ref={buttonRef}
          variant="ghost"
          radius="full"
          color="gray"
          className="ml-0 p-4 rounded-full dark:text-white hover:bg-transparent focus:bg-transparent active:bg-transparent dark:text-white hover:bg-transparent focus:bg-transparent active:bg-transparent"
          highContrast
          onClick={handleClick}
          aria-label={`${highPriorityNotices.length} high priority announcements`}
        >
          <Box className="indicator flex items-center w-7 relative mr-2">
            <GrAnnounce
              size={22}
              className={
                highPriorityNotices.length > 0
                  ? "text-black dark:text-gray-300"
                  : "text-black dark:text-gray-500"
              }
            />
            {highPriorityNotices.length > 0 && (
              <Text
                as="span"
                className="indicator-item badge badge-secondary badge-sm dark:bg-indigo-500 dark:text-white"
                style={{
                  position: "absolute",
                  top: "0%",
                  left: "70%",
                  transform:
                    "translate(-40%, -50%)",
                  fontSize: "12px",
                }}
              >
                {highPriorityNotices.length > 9
                  ? "9+"
                  : highPriorityNotices.length}
              </Text>
            )}
          </Box>
        </Button>
      </Tooltip>

      {popoverOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          style={{
            top: "100%",
            right: "0",
            padding: "8px",
          }}
        >
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-700 text-blue-700 dark:text-blue-300 dark:text-blue-300 p-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-600 mb-1 dark:border-gray-600">
            <div className="text-sm font-semibold flex items-center">
              <AlertCircle
                size={16}
                className="mr-2 dark:text-blue-300"
              />
              High Priority Announcements
            </div>
          </div>

          <Box className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
              </div>
            ) : highPriorityNotices.length > 0 ? (
              <AnimatePresence>
                {highPriorityNotices
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp) -
                      new Date(a.timestamp)
                  )
                  .map((notice, index) => (
                    <motion.div
                      key={notice.id}
                      initial={{
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all dark:bg-gray-700"
                      onClick={() =>
                        handleNoticeClick(
                          notice.id
                        )
                      }
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-300">
                          {notice.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(
                            notice.timestamp
                          )}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-400 text-xs">
                        {notice.content.length >
                        100
                          ? `${notice.content.substring(0, 100)}...`
                          : notice.content}
                      </p>
                    </motion.div>
                  ))}
              </AnimatePresence>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <GrAnnounce
                  size={24}
                  className="mx-auto mb-2 opacity-50 dark:text-gray-500"
                />
                <p className="text-xs">
                  No high priority announcements
                  today.
                </p>
              </div>
            )}
          </Box>
        </div>
      )}
    </div>
  )
}

export default AnnouncementIcon
