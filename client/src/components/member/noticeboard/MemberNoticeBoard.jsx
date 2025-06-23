import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react"
import { Box, Flex } from "@radix-ui/themes"
import {
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import SearchBox from "../../SearchBox"
import { useOrganizationContext } from "../../OrganizationContext"
import {
  FadeLoader,
  ClipLoader,
} from "react-spinners"
import ModernPagination from "../../ModernPagination"

const categoryColors = {
  announcement: "border-blue-500",
  reminder:
    "border-yellow-500 dark:border-yellow-400",
  policy:
    "border-purple-500 dark:border-purple-400",
  event: "border-green-500 dark:border-green-400",
}

const priorityIcons = {
  high: "🔴",
  medium: "🟠",
  low: "🟢",
}

function MemberNoticeBoard() {
  const { org_slug, organizationName, socket } =
    useOrganizationContext()
  const [pinnedNotices, setPinnedNotices] =
    useState([])
  const [notices, setNotices] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] =
    useState("all")
  const [expandedNotices, setExpandedNotices] =
    useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const BASE_URL =
    process.env.REACT_APP_BASE_URL ||
    "http://localhost:8000"
  const [
    loadingAttachments,
    setLoadingAttachments,
  ] = useState({})
  const contentRefs = useRef({})
  const [
    truncatableNotices,
    setTruncatableNotices,
  ] = useState({})
  const pageSize =
    pinnedNotices.length > 0 ? 4 : 6
  const [currentTheme, setCurrentTheme] =
    useState(
      localStorage.getItem("theme") || "light"
    )

  useEffect(() => {
    const handleThemeChange = () => {
      setCurrentTheme(
        localStorage.getItem("theme") || "light"
      )
    }
    window.addEventListener(
      "storage",
      handleThemeChange
    )
    return () =>
      window.removeEventListener(
        "storage",
        handleThemeChange
      )
  }, [])

  useEffect(() => {
    if (!socket || !org_slug || !organizationName)
      return

    const normalizedOrgName = organizationName
      ? organizationName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
      : ""

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
          if (
            data.event === "new_notice" &&
            !notice.archived
          ) {
            if (notice.pinned) {
              setPinnedNotices((prev) => [
                notice,
                ...prev.filter(
                  (n) => n.id !== notice.id
                ),
              ])
            } else {
              setNotices((prev) => [
                notice,
                ...prev.filter(
                  (n) => n.id !== notice.id
                ),
              ])
            }
          } else if (
            data.event === "update_notice"
          ) {
            if (notice.archived) {
              setPinnedNotices((prev) =>
                prev.filter(
                  (n) => n.id !== notice.id
                )
              )
              setNotices((prev) =>
                prev.filter(
                  (n) => n.id !== notice.id
                )
              )
            } else if (notice.pinned) {
              setPinnedNotices((prev) => {
                const exists = prev.some(
                  (n) => n.id === notice.id
                )
                if (exists) {
                  return prev.map((n) =>
                    n.id === notice.id
                      ? notice
                      : n
                  )
                } else {
                  return [notice, ...prev]
                }
              })
              setNotices((prev) =>
                prev.filter(
                  (n) => n.id !== notice.id
                )
              )
            } else {
              setNotices((prev) => {
                const exists = prev.some(
                  (n) => n.id === notice.id
                )
                if (exists) {
                  return prev.map((n) =>
                    n.id === notice.id
                      ? notice
                      : n
                  )
                } else {
                  return [notice, ...prev]
                }
              })
              setPinnedNotices((prev) =>
                prev.filter(
                  (n) => n.id !== notice.id
                )
              )
            }
          }
        }
      } catch (error) {
        // silently catch errors
      }
    }

    socket.addEventListener(
      "message",
      handleMessage
    )
    socket.addEventListener("error", () =>
      toast.error("Real-time updates unavailable")
    )
    return () => {
      socket.removeEventListener(
        "message",
        handleMessage
      )
    }
  }, [socket, org_slug, organizationName])

  useEffect(() => {
    if (!org_slug || !organizationName) return

    const fetchNotices = async () => {
      setLoading(true)
      try {
        const [pinnedResponse, noticesResponse] =
          await Promise.all([
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

        setPinnedNotices(
          pinnedResponse.data.notices
        )
        setNotices(noticesResponse.data.notices)
        setTotalCount(
          noticesResponse.data.total_count
        )
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
    page,
    BASE_URL,
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
  }, [pinnedNotices, notices])

  const handleSearchFilter = (value) => {
    setSearchTerm(value)
  }

  const filteredPinnedNotices = useMemo(() => {
    return pinnedNotices
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
  }, [pinnedNotices, searchTerm, activeFilter])

  const filteredNotices = useMemo(() => {
    return notices
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
  }, [notices, searchTerm, activeFilter])

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
        className={`relative p-4 rounded-lg border shadow-sm transition-all duration-300 
          ${categoryColors[notice.category]} ${notice.pinned ? "shadow-md" : ""} 
          bg-white dark:bg-gray-700`}
        style={{
          borderLeftWidth: "4px",
          minHeight: "150px",
        }}
      >
        <Flex
          justify="between"
          align="start"
          className="mb-1"
        >
          <h3 className="font-bold text-base pr-6 text-gray-800 dark:text-white">
            {notice.title}
          </h3>
        </Flex>

        <Flex
          align="center"
          gap="3"
          className="text-xs text-gray-500 dark:text-gray-300 mb-2"
        >
          <span className="flex items-center gap-1">
            {priorityIcons[notice.priority]}
          </span>
          <span className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
            <Clock
              size={12}
              className="text-gray-700 dark:text-gray-200"
            />
            <span>
              Posted on:{" "}
              {new Date(
                notice.timestamp
              ).toLocaleTimeString()}
            </span>
          </span>
          {notice.expiry && (
            <span className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
              <Clock
                size={12}
                className="text-gray-700 dark:text-gray-200"
              />
              <span>
                Expires:{" "}
                {new Date(
                  notice.expiry
                ).toLocaleDateString()}
              </span>
            </span>
          )}
        </Flex>

        <div
          ref={(el) =>
            (contentRefs.current[noticeId] = el)
          }
          className="text-gray-700 dark:text-gray-200 text-sm mb-3"
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
            className="text-blue-500 dark:text-blue-400 text-xs flex items-center mt-1 hover:text-blue-700 dark:hover:text-blue-300"
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
                        color={
                          currentTheme === "dark"
                            ? "#60A5FA"
                            : "#2563EB"
                        }
                      />
                    ) : (
                      <>
                        <Download
                          size={12}
                          className="mr-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
                          onClick={() =>
                            downloadAttachment(
                              noticeId,
                              index
                            )
                          }
                        />
                        <span
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
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
      <Box className="mb-2 p-1 flex box-border rounded-lg justify-between items-center">
        <SearchBox
          placeholder="Search Notices"
          searchValue={searchTerm}
          handleOnchange={handleSearchFilter}
        />
      </Box>

      <Box className="flex flex-col h-[82vh] rounded-lg shadow-md border border-gray-300">
        <Box
          className="flex-grow p-4 bg-white dark:bg-gray-800 rounded-lg overflow-y-auto scrollbar-hide border border-gray-200 dark:border-gray-600"
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
              <p className="text-gray-700 dark:text-gray-200">
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
                    className={`px-3 py-1 rounded-md cursor-pointer transition-colors duration-200 ${
                      activeFilter === filter
                        ? {
                            all: "bg-gray-800 text-white",
                            announcement:
                              "bg-blue-500 text-white",
                            reminder:
                              "bg-yellow-500 dark:bg-yellow-600 text-white",
                            policy:
                              "bg-purple-500 dark:bg-purple-600 text-white",
                            event:
                              "bg-green-500 dark:bg-green-600 text-white",
                          }[filter]
                        : {
                            all: "bg-gray-300",
                            announcement:
                              "bg-blue-200",
                            reminder:
                              "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200",
                            policy:
                              "bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200",
                            event:
                              "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200",
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
                  {filteredPinnedNotices.length >
                    0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-black dark:text-white mt-2 mb-2">
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

                  {filteredNotices.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-black dark:text-white mt-2 mb-2">
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

                  {filteredPinnedNotices.length ===
                    0 &&
                    filteredNotices.length ===
                      0 && (
                      <Box className="text-center py-12 text-gray-500 dark:text-gray-300 text-lg min-h-[600px] flex items-center justify-center">
                        There is no notice
                        available at the moment.
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
              filteredNotices.length > 0 && (
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
      </Box>
    </Box>
  )
}

export default MemberNoticeBoard
