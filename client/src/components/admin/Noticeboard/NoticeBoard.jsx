import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react"
import {
  Box,
  Flex,
  Button,
  Switch,
} from "@radix-ui/themes"
import {
  Pin,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import SearchBox from "../../SearchBox"
import AddNoticeModal from "./AddNoticeModal"
import { useOrganizationContext } from "../../OrganizationContext"
import { FadeLoader } from "react-spinners"
import { MdModeEditOutline } from "react-icons/md"
import { ClipLoader } from "react-spinners"
import { ArchiveIcon } from "@radix-ui/react-icons"
import ModernPagination from "../../ModernPagination"

const categoryColors = {
  announcement: "border-blue-500",
  reminder: "border-yellow-500",
  policy: "border-purple-500",
  event: "border-green-500",
}

const priorityIcons = {
  high: "🔴",
  medium: "🟠",
  low: "🟢",
}

function NoticeBoard() {
  const { org_slug, organizationName, socket } =
    useOrganizationContext()
  const [noticeState, setNoticeState] = useState({
    pinnedNotices: [],
    notices: [],
    archivedNotices: [],
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] =
    useState("all")
  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false)
  const [expandedNotices, setExpandedNotices] =
    useState({})
  const [showArchived, setShowArchived] =
    useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [editingNotice, setEditingNotice] =
    useState(null)
  const [
    lastUpdateTimestamp,
    setLastUpdateTimestamp,
  ] = useState(Date.now())
  const contentRefs = useRef({})
  const [
    truncatableNotices,
    setTruncatableNotices,
  ] = useState({})
  const recentlyUpdated = useRef(new Set())
  const BASE_URL =
    process.env.REACT_APP_BASE_URL ||
    "http://localhost:8000"
  const [
    loadingAttachments,
    setLoadingAttachments,
  ] = useState({})

  const pageSize = showArchived
    ? 6
    : noticeState.pinnedNotices.length > 0
      ? 4
      : 6

  useEffect(() => {
    if (!socket) return

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (
          data.org_slug !== org_slug ||
          data.organization_name !==
            organizationName
        )
          return

        const notice = {
          ...data.notice,
          id: data.notice.id || data.notice._id,
          pinned: Boolean(data.notice.pinned),
          archived: Boolean(data.notice.archived),
        }

        if (
          recentlyUpdated.current.has(notice.id)
        )
          return

        setNoticeState((prev) => {
          const updatedNotices =
            prev.notices.filter(
              (n) => (n.id || n._id) !== notice.id
            )
          const updatedPinned =
            prev.pinnedNotices.filter(
              (n) => (n.id || n._id) !== notice.id
            )
          const updatedArchived =
            prev.archivedNotices.filter(
              (n) => (n.id || n._id) !== notice.id
            )

          let newState
          if (
            data.event === "new_notice" ||
            data.event === "update_notice" ||
            data.event === "update_pin_status"
          ) {
            if (
              data.event === "update_notice" &&
              data.previous_priority !==
                undefined &&
              data.previous_priority !==
                notice.priority
            ) {
              if (notice.priority === "high") {
                toast.info(
                  `Notice "${notice.title}" has been upgraded to high priority`
                )
              } else if (
                data.previous_priority === "high"
              ) {
                toast.info(
                  `Notice "${notice.title}" is no longer high priority`
                )
              }
            }
            if (notice.archived) {
              newState = {
                ...prev,
                notices: updatedNotices,
                pinnedNotices: updatedPinned,
                archivedNotices: [
                  notice,
                  ...updatedArchived,
                ],
              }
              if (
                data.event === "update_notice" &&
                notice.archived
              ) {
                toast.success(
                  `Notice "${notice.title}" archived due to expiry`
                )
              }
            } else if (notice.pinned) {
              newState = {
                ...prev,
                notices: updatedNotices,
                pinnedNotices: [
                  notice,
                  ...updatedPinned,
                ],
                archivedNotices: updatedArchived,
              }
            } else {
              newState = {
                ...prev,
                notices: [
                  notice,
                  ...updatedNotices,
                ],
                pinnedNotices: updatedPinned,
                archivedNotices: updatedArchived,
              }
            }
          } else {
            newState = {
              ...prev,
              notices: updatedNotices,
              pinnedNotices: updatedPinned,
              archivedNotices: updatedArchived,
            }
          }

          return newState
        })

        if (
          data.event === "update_notice" ||
          data.event === "update_pin_status"
        ) {
          recentlyUpdated.current.add(notice.id)
          setTimeout(
            () =>
              recentlyUpdated.current.delete(
                notice.id
              ),
            2000
          )
        }
      } catch (error) {
        // silently ignore errors
      }
    }

    const handleError = () =>
      toast.error("Real-time updates unavailable")

    socket.addEventListener(
      "message",
      handleMessage
    )
    socket.addEventListener("error", handleError)

    return () => {
      if (socket) {
        socket.removeEventListener(
          "message",
          handleMessage
        )
        socket.removeEventListener(
          "error",
          handleError
        )
      }
    }
  }, [socket, org_slug, organizationName])

  useEffect(() => {
    if (!org_slug || !organizationName) return

    const fetchNotices = async () => {
      setLoading(true)
      try {
        if (showArchived) {
          const response = await axios.get(
            `${BASE_URL}/get_archived_notices`,
            {
              params: {
                org_slug,
                organization_name:
                  organizationName,
                page,
                page_size: pageSize,
              },
            }
          )
          setNoticeState({
            notices: [],
            pinnedNotices: [],
            archivedNotices:
              response.data.notices,
          })
          setTotalCount(response.data.total_count)
        } else {
          const [
            pinnedResponse,
            noticesResponse,
          ] = await Promise.all([
            axios.get(
              `${BASE_URL}/get_pinned_notices`,
              {
                params: {
                  org_slug,
                  organization_name:
                    organizationName,
                  page: 1,
                  page_size: 10,
                },
              }
            ),
            axios.get(
              `${BASE_URL}/get_non_archived_notices`,
              {
                params: {
                  org_slug,
                  organization_name:
                    organizationName,
                  page,
                  page_size: pageSize,
                },
              }
            ),
          ])
          setNoticeState({
            notices: noticesResponse.data.notices,
            pinnedNotices:
              pinnedResponse.data.notices,
            archivedNotices: [],
          })
          setTotalCount(
            noticesResponse.data.total_count
          )
        }
      } catch (error) {
        toast.error(
          error.response?.data?.detail ||
            "Failed to load notices"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
  }, [
    org_slug,
    organizationName,
    showArchived,
    page,
    BASE_URL,
    lastUpdateTimestamp,
    pageSize,
  ])

  useEffect(() => {
    const lineHeight = 20
    const maxLines = 2
    const newTruncatable = {}

    Object.keys(contentRefs.current).forEach(
      (id) => {
        const el = contentRefs.current[id]
        if (el) {
          const contentHeight = el.scrollHeight
          const maxAllowedHeight =
            lineHeight * maxLines
          newTruncatable[id] =
            contentHeight > maxAllowedHeight
        }
      }
    )

    setTruncatableNotices(newTruncatable)
  }, [noticeState])

  const handleEditNotice = (notice) => {
    setEditingNotice(notice)
    setIsAddModalOpen(true)
  }

  const handleNoticeUpdate = () => {
    setEditingNotice(null)
    setIsAddModalOpen(false)
    toast.success("Notice updated successfully!")
    setLastUpdateTimestamp(Date.now())
  }

  const handleSearchFilter = (value) => {
    setSearchTerm(value)
  }

  const handleAddNotice = (newNotice) => {
    setNoticeState((prev) => {
      if (newNotice.archived) {
        return {
          ...prev,
          archivedNotices: [
            newNotice,
            ...prev.archivedNotices,
          ],
        }
      } else if (newNotice.pinned) {
        return {
          ...prev,
          pinnedNotices: [
            newNotice,
            ...prev.pinnedNotices,
          ],
        }
      } else {
        return {
          ...prev,
          notices: [newNotice, ...prev.notices],
        }
      }
    })
    setLastUpdateTimestamp(Date.now())
  }

  const filteredPinnedNotices = useMemo(() => {
    return noticeState.pinnedNotices
      .filter(
        (notice) =>
          (notice.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            notice.content
              .toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              )) &&
          (activeFilter === "all" ||
            notice.category === activeFilter)
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp) -
          new Date(a.timestamp)
      )
  }, [
    noticeState.pinnedNotices,
    searchTerm,
    activeFilter,
  ])

  const filteredNotices = useMemo(() => {
    return noticeState.notices
      .filter(
        (notice) =>
          (notice.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            notice.content
              .toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              )) &&
          (activeFilter === "all" ||
            notice.category === activeFilter)
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp) -
          new Date(a.timestamp)
      )
  }, [
    noticeState.notices,
    searchTerm,
    activeFilter,
  ])

  const filteredArchivedNotices = useMemo(() => {
    return noticeState.archivedNotices
      .filter(
        (notice) =>
          (notice.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            notice.content
              .toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              )) &&
          (activeFilter === "all" ||
            notice.category === activeFilter)
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp) -
          new Date(a.timestamp)
      )
  }, [
    noticeState.archivedNotices,
    searchTerm,
    activeFilter,
  ])

  const togglePin = async (id) => {
    try {
      const notice = [
        ...noticeState.pinnedNotices,
        ...noticeState.notices,
        ...noticeState.archivedNotices,
      ].find((n) => (n.id || n._id) === id)

      if (!notice) {
        throw new Error("Notice not found")
      }

      const response = await axios.put(
        `${BASE_URL}/update_notice_pin_status/${id}`,
        {},
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )

      const { pinned: updatedPinned } =
        response.data

      setNoticeState((prev) => {
        const updatedNotices = prev.notices.map(
          (n) =>
            (n.id || n._id) === id
              ? { ...n, pinned: updatedPinned }
              : n
        )
        const updatedPinnedNotices = updatedPinned
          ? [
              { ...notice, pinned: true },
              ...prev.pinnedNotices.filter(
                (n) => (n.id || n._id) !== id
              ),
            ]
          : prev.pinnedNotices.filter(
              (n) => (n.id || n._id) !== id
            )

        return {
          ...prev,
          notices: updatedNotices,
          pinnedNotices: updatedPinnedNotices,
        }
      })

      toast.success(
        `Notice ${updatedPinned ? "pinned" : "unpinned"} successfully!`
      )
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to update pin status"
      toast.error(errorMessage)
    }
  }

  const toggleExpanded = (id) => {
    setExpandedNotices((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const viewAttachment = async (
    noticeId,
    attachmentIndex
  ) => {
    const key = `${noticeId}_${attachmentIndex}`

    try {
      setLoadingAttachments((prev) => ({
        ...prev,
        [key]: true,
      }))

      const response = await axios.get(
        `${BASE_URL}/get_notice_attachment/${noticeId}/${attachmentIndex}`,
        {
          responseType: "blob",
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )

      const contentType =
        response.headers["content-type"] ||
        "application/octet-stream"
      const mimeTypeMap = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
      }

      const contentDisposition =
        response.headers["content-disposition"]
      let filename = `${noticeId}_attachment_${attachmentIndex}`
      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename="(.+)"/
        )
        if (match && match[1]) filename = match[1]
      }

      const fileExtension = filename
        .split(".")
        .pop()
        ?.toLowerCase()
      const mimeType =
        mimeTypeMap[fileExtension] || contentType

      const blob = new Blob([response.data], {
        type: mimeType,
      })
      const url = window.URL.createObjectURL(blob)

      const viewableTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
      ]
      if (viewableTypes.includes(mimeType)) {
        window.open(url, "_blank")
      } else {
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success(
          "Attachment downloaded as it cannot be viewed in the browser!"
        )
      }
    } catch (error) {
      toast.error(
        error.response?.status === 404
          ? "Notice or attachment not found"
          : error.response?.data?.detail ||
              "Failed to view attachment"
      )
    } finally {
      setLoadingAttachments((prev) => ({
        ...prev,
        [key]: false,
      }))
    }
  }

  const downloadAttachment = async (
    noticeId,
    attachmentIndex
  ) => {
    const key = `${noticeId}_${attachmentIndex}`
    try {
      setLoadingAttachments((prev) => ({
        ...prev,
        [key]: true,
      }))
      const response = await axios.get(
        `${BASE_URL}/get_notice_attachment/${noticeId}/${attachmentIndex}`,
        {
          responseType: "blob",
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )

      const contentType =
        response.headers["content-type"] ||
        "application/octet-stream"
      const mimeTypeMap = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
      }

      const contentDisposition =
        response.headers["content-disposition"]
      let filename = `notice_${noticeId}_attachment_${attachmentIndex}`
      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename="(.+)"/
        )
        if (match && match[1]) filename = match[1]
      }

      const fileExtension = filename
        .split(".")
        .pop()
        ?.toLowerCase()
      const mimeType =
        mimeTypeMap[fileExtension] || contentType

      const blob = new Blob([response.data], {
        type: mimeType,
      })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(
        "Attachment downloaded successfully!"
      )
    } catch (error) {
      toast.error(
        error.response?.status === 404
          ? "Notice or attachment not found"
          : error.response?.data?.detail ||
              "Failed to download attachment"
      )
    } finally {
      setLoadingAttachments((prev) => ({
        ...prev,
        [key]: false,
      }))
    }
  }

  const renderNoticeCard = (notice) => {
    const noticeId = notice.id || notice._id
    const isExpanded =
      expandedNotices[noticeId] || false
    const shouldTruncate =
      truncatableNotices[noticeId]

    return (
      <Box
        key={noticeId}
        className={`relative p-2 rounded-lg bg-white dark:bg-gray-700 border shadow-sm transition-all duration-200 
          ${categoryColors[notice.category]}
          ${notice.pinned && !notice.archived ? "shadow-md" : ""}
          ${notice.archived ? "bg-white text-black" : "bg-white"}`}
        style={{
          borderLeftWidth: "4px",
          position: "relative",
          minHeight: "150px",
        }}
      >
        <Flex
          justify="between"
          align="start"
        >
          <h3 className="font-bold text-base pr-6 text-gray-800 dark:text-white">
            {notice.title}
          </h3>

          {!notice.archived && (
            <Flex
              justify="end"
              align="center"
              gap="2"
            >
              <MdModeEditOutline
                className="text-gray-700 dark:text-white hover:text-black cursor-pointer"
                size={16}
                onClick={() =>
                  handleEditNotice(notice)
                }
              />
              <button
                onClick={() =>
                  togglePin(noticeId)
                }
                className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  notice.pinned
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-white"
                }`}
              >
                <Pin size={16} />
              </button>
            </Flex>
          )}
        </Flex>

        <Flex
          align="center"
          gap="3"
          className={`text-xs p-2 rounded-md ${
            notice.archived
              ? "bg-red-50 text-red-600"
              : "text-gray-500"
          }`}
        >
          <span className="flex items-center gap-1">
            <span
              title={`Priority: ${notice.priority}`}
            >
              {priorityIcons[notice.priority]}
            </span>
          </span>

          {notice.timestamp && (
            <span
              className={`flex items-center gap-1 ${
                notice.archived
                  ? "text-black"
                  : "text-black dark:text-white"
              }`}
            >
              <Clock
                size={12}
                className={
                  notice.archived
                    ? "text-black"
                    : "text-black dark:text-white"
                }
              />
              <span
                className={
                  notice.archived
                    ? "text-black"
                    : "text-black dark:text-white"
                }
              >
                Posted at{" "}
                {new Date(
                  notice.timestamp
                ).toLocaleTimeString()}{" "}
                {new Date(
                  notice.timestamp
                ).toLocaleDateString()}
              </span>
            </span>
          )}

          {notice.expiry && (
            <span
              className={`flex items-center gap-1 ${
                notice.archived
                  ? "text-black"
                  : "text-black dark:text-white"
              }`}
            >
              <Clock
                size={12}
                className={
                  notice.archived
                    ? "text-black"
                    : "text-black dark:text-white"
                }
              />
              <span
                className={
                  notice.archived
                    ? "text-black"
                    : "text-black dark:text-white"
                }
              >
                {notice.archived
                  ? "Expired:"
                  : "Expires:"}{" "}
                {new Date(
                  notice.expiry
                ).toLocaleDateString()}
              </span>
            </span>
          )}

          {notice.archived && (
            <span className="ml-auto text-red-500 flex items-center gap-1">
              <ArchiveIcon size={12} />
              Archived
            </span>
          )}
        </Flex>

        <div
          ref={(el) =>
            (contentRefs.current[noticeId] = el)
          }
          className="text-black dark:text-white text-sm mb-3"
          style={{
            maxHeight: isExpanded
              ? "300px"
              : "40px",
            overflow: "hidden",
          }}
        >
          <p>{notice.content}</p>
        </div>

        {shouldTruncate && (
          <button
            onClick={() =>
              toggleExpanded(noticeId)
            }
            className="text-blue-500 text-xs flex items-center mt-1 hover:text-blue-700"
          >
            {isExpanded ? (
              <>
                Show less{" "}
                <ChevronUp
                  size={14}
                  className="ml-1"
                />
              </>
            ) : (
              <>
                Show more{" "}
                <ChevronDown
                  size={14}
                  className="ml-1"
                />
              </>
            )}
          </button>
        )}

        {notice.attachments &&
          notice.attachments.length > 0 && (
            <Box className="mb-3">
              {notice.attachments.map(
                (file, index) => (
                  <Flex
                    key={index}
                    align="center"
                    className="text-xs"
                  >
                    {loadingAttachments[
                      `${noticeId}_${index}`
                    ] ? (
                      <ClipLoader
                        size={16}
                        color="#2563eb"
                      />
                    ) : (
                      <>
                        <Download
                          size={12}
                          className="mr-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() =>
                            downloadAttachment(
                              noticeId,
                              index
                            )
                          }
                        />
                        <span
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() =>
                            viewAttachment(
                              noticeId,
                              index
                            )
                          }
                        >
                          {file}
                        </span>
                      </>
                    )}
                  </Flex>
                )
              )}
            </Box>
          )}
      </Box>
    )
  }

  const handlePageChange = ({ selected }) => {
    setPage(selected + 1)
  }

  const totalPages = Math.ceil(
    totalCount / pageSize
  )

  return (
    <Box>
      <Box className="mb-3 flex box-border rounded-lg justify-between items-center">
        <SearchBox
          placeholder="Search Notices"
          searchValue={searchTerm}
          handleOnchange={handleSearchFilter}
        />
        <Flex
          gap="3"
          align="center"
        >
          <Flex
            align="center"
            gap="2"
          >
            <Switch
              checked={showArchived}
              onCheckedChange={setShowArchived}
              id="show-archived"
              className="bg-gray-300 dark:bg-gray-600 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
            <label
              htmlFor="show-archived"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Show Archived
            </label>
          </Flex>
          <Button
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={() =>
              setIsAddModalOpen(true)
            }
          >
            <span>Add New Notice</span>
          </Button>
        </Flex>
      </Box>
      <Box className="flex flex-col h-[82vh] rounded-lg shadow-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
        <Box
          className="flex-grow p-4 bg-white dark:bg-gray-800 rounded-lg overflow-y-auto scrollbar-hide"
          style={{
            maxHeight: "84vh",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style>
            {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          `}
          </style>
          <Box className="max-w-7xl flex flex-col ml-2 mr-2">
            <header className="mb-3">
              <p className="text-gray-700 dark:text-white">
                Stay updated with the latest
                announcements
              </p>
              <Flex
                gap="2"
                wrap="wrap"
                className="mt-4"
              >
                {[
                  "all",
                  "announcement",
                  "reminder",
                  "policy",
                  "event",
                ].map((filter) => (
                  <button
                    key={filter}
                    className={`px-3 py-1 rounded-md cursor-pointer ${
                      activeFilter === filter
                        ? {
                            all: "bg-gray-800 text-white",
                            announcement:
                              "bg-blue-500 text-white",
                            reminder:
                              "bg-yellow-500 text-white",
                            policy:
                              "bg-purple-500 text-white",
                            event:
                              "bg-green-500 text-white",
                          }[filter]
                        : {
                            all: "bg-gray-300",
                            announcement:
                              "bg-blue-200",
                            reminder:
                              "bg-yellow-200",
                            policy:
                              "bg-purple-200",
                            event: "bg-green-200",
                          }[filter]
                    }`}
                    onClick={() =>
                      setActiveFilter(filter)
                    }
                  >
                    {filter
                      .charAt(0)
                      .toUpperCase() +
                      filter.slice(1)}
                  </button>
                ))}
              </Flex>
            </header>

            <Box className="flex-grow">
              {loading ? (
                <Box className="flex justify-center min-h-[570px] items-center py-80">
                  <FadeLoader color="#2563eb" />
                </Box>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {showArchived &&
                    filteredArchivedNotices.length >
                      0 && (
                      <div>
                        <h2 className="text-lg mt-2 mb-2 font-semibold text-black dark:text-white">
                          Archived Notices
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start mb-3">
                          {filteredArchivedNotices.map(
                            (notice) =>
                              renderNoticeCard(
                                notice
                              )
                          )}
                        </div>
                      </div>
                    )}

                  {!showArchived &&
                    filteredPinnedNotices.length >
                      0 && (
                      <div>
                        <h2 className="text-lg mt-2 mb-2 font-semibold text-black dark:text-white">
                          Pinned
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                          {filteredPinnedNotices.map(
                            (notice) =>
                              renderNoticeCard(
                                notice
                              )
                          )}
                        </div>
                      </div>
                    )}

                  {!showArchived &&
                    filteredNotices.length >
                      0 && (
                      <div>
                        <h2 className="text-lg mt-2 mb-2 font-semibold text-black dark:text-white">
                          All Notices
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                          {filteredNotices.map(
                            (notice) =>
                              renderNoticeCard(
                                notice
                              )
                          )}
                        </div>
                      </div>
                    )}

                  {(showArchived
                    ? filteredArchivedNotices.length ===
                      0
                    : filteredPinnedNotices.length ===
                        0 &&
                      filteredNotices.length ===
                        0) && (
                    <Box className="text-center py-12 text-gray-500 dark:text-white min-h-[600px] flex items-center justify-center">
                      There is no notice available
                      at the moment
                    </Box>
                  )}
                </div>
              )}
            </Box>
          </Box>
        </Box>

        <Box className="bg-white dark:bg-gray-800 rounded-b-lg rounded-tr-none rounded-tl-none py-1 min-h-[50px] border-t border-gray-300 dark:border-gray-600">
          <Flex
            justify="center"
            className="sticky bottom-0 mt-2"
          >
            {!loading &&
              totalPages > 1 &&
              (filteredNotices.length > 0 ||
                filteredArchivedNotices.length >
                  0) && (
                <ModernPagination
                  total={totalCount}
                  pageSize={pageSize}
                  siblingCount={1}
                  currentPage={page - 1}
                  onPageChange={handlePageChange}
                  showEdges={true}
                />
              )}
          </Flex>
        </Box>

        <AddNoticeModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            setEditingNotice(null)
          }}
          onAddNotice={handleAddNotice}
          onUpdateNotice={handleNoticeUpdate}
          editingNotice={editingNotice}
        />
      </Box>
    </Box>
  )
}

export default NoticeBoard
