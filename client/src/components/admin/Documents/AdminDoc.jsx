import React, {
  useState,
  useEffect,
  useMemo,
} from "react"
import {
  Box,
  Flex,
  Button,
  Dialog,
  Text,
  Table,
  Badge,
  Popover,
  Avatar,
} from "@radix-ui/themes"
import { IoClose } from "react-icons/io5"
import { BsFunnel } from "react-icons/bs"
import {
  FiDownload,
  FiEye,
  FiFile,
  FiFileText,
  FiImage,
  FiClock,
} from "react-icons/fi"
import { FadeLoader } from "react-spinners"
import SearchBox from "../../SearchBox"
import { useOrganizationContext } from "../../OrganizationContext"
import axios from "axios"
import toast from "react-hot-toast"
import * as Label from "@radix-ui/react-label"
import { format } from "date-fns"
import PropTypes from "prop-types"
import * as Tooltip from "@radix-ui/react-tooltip"
import {
  RxCheckCircled,
  RxCrossCircled,
} from "react-icons/rx"
import ModernPagination from "../../ModernPagination"

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

const DocumentDetail = ({
  documentData,
  onClose,
}) => {
  const { org_slug, socket } =
    useOrganizationContext()
  const [loadingDocuments, setLoadingDocuments] =
    useState({})
  const [adminComment, setAdminComment] =
    useState("")
  const [
    isAttachmentModalOpen,
    setIsAttachmentModalOpen,
  ] = useState(false)
  const [currentDocument, setCurrentDocument] =
    useState(documentData)

  const getFileTypeIcon = (filename) => {
    if (
      !filename ||
      typeof filename !== "string"
    ) {
      return (
        <FiFile className="h-10 w-10 text-gray-500 dark:text-gray-400" />
      )
    }

    const extension = filename
      .split(".")
      .pop()
      .toLowerCase()

    if (extension === "pdf") {
      return (
        <FiFileText className="h-10 w-10 text-red-500 dark:text-red-400" />
      )
    } else if (
      [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg",
      ].includes(extension)
    ) {
      return (
        <FiImage className="h-10 w-10 text-blue-500 dark:text-blue-400" />
      )
    } else if (
      ["doc", "docx"].includes(extension)
    ) {
      return (
        <FiFileText className="h-10 w-10 text-green-500 dark:text-green-400" />
      )
    } else {
      return (
        <FiFile className="h-10 w-10 text-gray-500 dark:text-gray-400" />
      )
    }
  }

  const updateDocumentStatus = async (
    docId,
    status
  ) => {
    setLoadingDocuments((prev) => ({
      ...prev,
      [docId]: true,
    }))

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/update_document_status_by_user/${currentDocument.user_id}`,
        {
          status: status.toLowerCase(),
          comment: adminComment || "",
          timestamp: new Date().toISOString(),
        },
        {
          params: {
            org_slug,
            document_id: currentDocument._id,
            organization_name:
              currentDocument.organization_name,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      toast.success(response.data.message)
      setCurrentDocument((prev) => ({
        ...prev,
        status: status.toLowerCase(),
      }))
      if (
        socket &&
        socket.readyState === WebSocket.OPEN
      ) {
        socket.send("submitted")
      }
    } catch (error) {
      toast.error(
        `Error updating status: ${error.response?.data?.detail || error.message}`
      )
    } finally {
      setLoadingDocuments((prev) => ({
        ...prev,
        [docId]: false,
      }))
    }
  }

  const getStatusBadgeColor = (status) => {
    if (!status)
      return { color: "yellow", text: "Pending" }
    if (status === "approved")
      return { color: "green", text: "Approved" }
    if (status === "rejected")
      return { color: "red", text: "Rejected" }
    if (status === "in_review")
      return { color: "blue", text: "In Review" }
    return { color: "yellow", text: "Pending" }
  }

  return (
    <Box className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl mx-auto shadow-sm dark:shadow-gray-700">
      <Flex
        justify="between"
        align="center"
        className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4"
      >
        <Text
          size="5"
          weight="bold"
          className="text-blue-900 dark:text-blue-300"
        >
          Document Details
        </Text>
      </Flex>

      <Box className="border border-gray-200 dark:border-gray-700 rounded-lg mb-6 shadow-sm dark:shadow-gray-700">
        <Flex className="flex-col md:flex-row p-6 gap-6">
          <Box className="w-full md:w-1/3 space-y-6">
            <Box>
              <Text
                size="2"
                weight="bold"
                className="text-black dark:text-white block mb-1 uppercase"
              >
                Document Type
              </Text>
              <Text
                size="2"
                weight="medium"
                className="text-gray-900 dark:text-gray-300"
              >
                {currentDocument.document_name ||
                  "Unavailable"}
              </Text>
            </Box>
          </Box>

          <Flex className="w-full md:w-2/3 flex-col gap-6">
            <Flex className="gap-6 w-full">
              <Box className="w-1/2">
                <Text
                  size="2"
                  weight="bold"
                  className="text-black dark:text-white mb-2 uppercase"
                >
                  Submitted By
                </Text>
                <Flex
                  align="center"
                  gap="2"
                  className="mb-1"
                >
                  <Avatar
                    src={
                      currentDocument.imageUrl ||
                      "/api/placeholder/40/40"
                    }
                    fallback={
                      currentDocument.username?.charAt(
                        0
                      ) || "U"
                    }
                    radius="full"
                    size="2"
                    className="bg-blue-500"
                  />
                  <Box>
                    <Text
                      weight="medium"
                      className="block text-gray-700 dark:text-gray-300"
                    >
                      {currentDocument.username ||
                        "Unavailable"}
                    </Text>
                    <Text
                      size="2"
                      className="text-gray-700 dark:text-gray-400"
                    >
                      {currentDocument.email ||
                        "Unavailable"}
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box className="w-1/2">
                <Text
                  size="2"
                  weight="bold"
                  className="text-black dark:text-white mb-2 uppercase block"
                >
                  Status
                </Text>
                <Box className="mt-1">
                  <Badge
                    color={
                      getStatusBadgeColor(
                        currentDocument.status
                      ).color
                    }
                    className="dark:text-white"
                  >
                    {
                      getStatusBadgeColor(
                        currentDocument.status
                      ).text
                    }
                  </Badge>
                </Box>
              </Box>
            </Flex>

            <Flex className="gap-6 w-full">
              <Box className="w-1/2">
                <Text
                  size="2"
                  weight="bold"
                  className="text-black dark:text-white mb-2 uppercase"
                >
                  Submitted On
                </Text>
                <Text
                  weight="medium"
                  className="block text-gray-700 dark:text-gray-300"
                >
                  {currentDocument.submitted_at
                    ? format(
                        new Date(
                          currentDocument.submitted_at
                        ),
                        "dd MMM yyyy"
                      )
                    : "Unavailable"}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      <Box className="mb-6">
        <Text
          size="2"
          weight="bold"
          className="text-black dark:text-white mb-2 uppercase"
        >
          Description
        </Text>
        <Box className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
          <Text className="dark:text-gray-300">
            {currentDocument.description ||
              "No description provided"}
          </Text>
        </Box>
      </Box>

      <Box className="mb-6">
        <Text
          size="2"
          weight="bold"
          className="text-black dark:text-white mb-2 uppercase"
        >
          Document Preview
        </Text>
        <Box className="bg-white dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
          <Flex
            align="center"
            gap="4"
            className="cursor-pointer hover:text-blue-700 dark:hover:text-blue-400 text-blue-500 dark:text-blue-400"
            onClick={() =>
              setIsAttachmentModalOpen(true)
            }
          >
            <FiFile className="w-4 h-4" />
            <span className="text-sm font-medium">
              View Document
            </span>
          </Flex>
        </Box>
      </Box>

      {(currentDocument.status === "pending" ||
        currentDocument.status ===
          "in_review") && (
        <Box className="mb-6">
          <Text
            size="2"
            weight="bold"
            className="text-black dark:text-white mb-2 uppercase"
          >
            Admin Comment
          </Text>
          <textarea
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            rows="3"
            placeholder="Add comment (required for rejection)"
            value={adminComment}
            onChange={(e) =>
              setAdminComment(e.target.value)
            }
          />
        </Box>
      )}

      <Flex
        gap="3"
        justify="end"
        className="pt-2"
      >
        {(currentDocument.status === "pending" ||
          currentDocument.status ===
            "in_review") && (
          <>
            {loadingDocuments[
              currentDocument._id
            ] ? (
              <Button
                variant="soft"
                disabled
              >
                Processing...
              </Button>
            ) : (
              <>
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Box
                        as="button"
                        onClick={() =>
                          updateDocumentStatus(
                            currentDocument._id,
                            "approved"
                          )
                        }
                        disabled={
                          loadingDocuments[
                            currentDocument._id
                          ]
                        }
                        aria-label="Approve document"
                        className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                      >
                        <RxCheckCircled className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </Box>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      side="top"
                      align="center"
                      className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-300 text-xs rounded px-2 py-1"
                    >
                      Approve
                    </Tooltip.Content>
                  </Tooltip.Root>

                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Box
                        as="button"
                        onClick={() => {
                          if (!adminComment) {
                            toast.error(
                              "Comment is required for rejection"
                            )
                            return
                          }
                          updateDocumentStatus(
                            currentDocument._id,
                            "rejected"
                          )
                        }}
                        disabled={
                          loadingDocuments[
                            currentDocument._id
                          ] || !adminComment
                        }
                        aria-label="Reject document"
                        className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                      >
                        <RxCrossCircled className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </Box>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      side="top"
                      align="center"
                      className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-300 text-xs rounded px-2 py-1"
                    >
                      Reject
                    </Tooltip.Content>
                  </Tooltip.Root>

                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Box
                        as="button"
                        onClick={() =>
                          updateDocumentStatus(
                            currentDocument._id,
                            "in_review"
                          )
                        }
                        disabled={
                          loadingDocuments[
                            currentDocument._id
                          ]
                        }
                        aria-label="Mark document for review"
                        className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                      >
                        <FiClock className="w-6 h-6 text-blue-600" />
                      </Box>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      side="top"
                      align="center"
                      className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-300 text-xs rounded px-2 py-1"
                    >
                      In Review
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </>
            )}
          </>
        )}
        <Button
          variant="soft"
          onClick={onClose}
          className="dark:text-white dark:bg-red-700 dark:hover:bg-red-800"
          style={{
            padding: "6px",
            borderRadius: 5,
          }}
        >
          Close
        </Button>
      </Flex>

      <Dialog.Root
        open={isAttachmentModalOpen}
        onOpenChange={setIsAttachmentModalOpen}
      >
        <Dialog.Content
          style={{ maxWidth: 700 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <Dialog.Title>
            <Flex
              justify="between"
              align="center"
              className="border-b border-gray-100 dark:border-gray-700 pb-2"
            >
              <Text
                size="4"
                weight="bold"
                className="text-blue-900 dark:text-blue-300"
              >
                Document Preview
              </Text>
              <Button
                variant="ghost"
                onClick={() =>
                  setIsAttachmentModalOpen(false)
                }
                className="focus:outline-none focus:ring-0 active:bg-transparent hover:bg-transparent" // ← Added this
              >
                <IoClose className="text-gray-500 dark:text-gray-400" />
              </Button>
            </Flex>
          </Dialog.Title>

          <div className="p-4">
            {currentDocument.attachments?.length >
            0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentDocument.attachments.map(
                  (file, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md dark:hover:shadow-gray-600 transition-shadow"
                    >
                      {getFileTypeIcon(
                        file.filename
                      )}
                      <p className="mt-2 text-sm text-center text-gray-700 px-2">
                        {file.filename ||
                          `Attachment ${index + 1}`}
                      </p>
                      <div className="flex gap-2 mt-3 w-full justify-center">
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => {
                            try {
                              const blob =
                                new Blob(
                                  [
                                    Uint8Array.from(
                                      atob(
                                        file.file_content
                                      ),
                                      (c) =>
                                        c.charCodeAt(
                                          0
                                        )
                                    ),
                                  ],
                                  {
                                    type: file.file_type,
                                  }
                                )
                              const url =
                                URL.createObjectURL(
                                  blob
                                )
                              const link =
                                document.createElement(
                                  "a"
                                )
                              link.href = url
                              link.download =
                                file.filename ||
                                "document"
                              document.body.appendChild(
                                link
                              )
                              link.click()
                              document.body.removeChild(
                                link
                              )
                              URL.revokeObjectURL(
                                url
                              )
                            } catch (err) {
                              toast.error(
                                "Failed to download the file"
                              )
                            }
                          }}
                        >
                          <FiDownload className="mr-1" />
                          Download
                        </Button>

                        {(file.file_type?.startsWith(
                          "image/"
                        ) ||
                          file.file_type ===
                            "application/pdf") && (
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() => {
                              try {
                                const blob =
                                  new Blob(
                                    [
                                      Uint8Array.from(
                                        atob(
                                          file.file_content
                                        ),
                                        (c) =>
                                          c.charCodeAt(
                                            0
                                          )
                                      ),
                                    ],
                                    {
                                      type: file.file_type,
                                    }
                                  )
                                const blobUrl =
                                  URL.createObjectURL(
                                    blob
                                  )
                                window.open(
                                  blobUrl,
                                  "_blank"
                                )
                                setTimeout(
                                  () =>
                                    URL.revokeObjectURL(
                                      blobUrl
                                    ),
                                  60000
                                )
                              } catch (err) {
                                toast.error(
                                  "Failed to view the file"
                                )
                              }
                            }}
                          >
                            <FiEye className="mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No attachments available.
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}

const AdminDocuments = () => {
  const { org_slug, socket, organizationName } =
    useOrganizationContext()

  const [documents, setDocuments] = useState([])
  const [statusFilter, setStatusFilter] =
    useState([])
  const [
    appliedStatusFilter,
    setAppliedStatusFilter,
  ] = useState([])
  const [selectedMonth, setSelectedMonth] =
    useState("")
  const [
    appliedMonthFilter,
    setAppliedMonthFilter,
  ] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] =
    useState(null)
  const [searchQuery, setSearchQuery] =
    useState("")

  const BASE_URL = process.env.REACT_APP_BASE_URL
  const months = Object.keys(monthTextToNumber)

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString()

  const fetchDocuments = async () => {
    try {
      const params = { org_slug }
      if (appliedStatusFilter.length)
        params.status =
          appliedStatusFilter.join(",")
      if (appliedMonthFilter)
        params.month =
          monthTextToNumber[appliedMonthFilter]

      const res = await axios.get(
        `${BASE_URL}/get_all_documents`,
        {
          params: {
            org_slug: org_slug,
            organization_name: organizationName,
          },
        }
      )
      setDocuments(res.data.documents)
      setIsLoading(false)
    } catch {
      toast.error("Failed to fetch documents")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [
    org_slug,
    appliedStatusFilter,
    appliedMonthFilter,
  ])
  useEffect(() => {
    const handleMessage = () => {
      fetchDocuments()
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
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (
          message.event === "document_submitted"
        ) {
          toast.success(
            `New document submitted: ${message.document_name}`
          )
          if (
            Notification.permission === "granted"
          ) {
            const username =
              message.username || "a user"
            new Notification(
              "New Document Submission",
              {
                body: `${message.document_name} submitted by ${username}`,
              }
            )
          }
          fetchDocuments()
        }
      } catch (err) {
        toast.error(
          "Error parsing WebSocket message:",
          err
        )
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
  }, [])
  const toggleStatus = (s) =>
    setStatusFilter((prev) =>
      prev.includes(s)
        ? prev.filter((x) => x !== s)
        : [...prev, s]
    )
  const applyFilter = () => {
    setAppliedStatusFilter(statusFilter)
    setAppliedMonthFilter(selectedMonth)
  }

  const clearFilter = () => {
    setStatusFilter([])
    setSelectedMonth("")
    setAppliedStatusFilter([])
    setAppliedMonthFilter(null)
  }

  const filterData = (data) => {
    let filtered = data

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (d) =>
          d.document_name
            .toLowerCase()
            .includes(q) ||
          d.username.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q)
      )
    }

    if (appliedMonthFilter) {
      filtered = filtered.filter(
        (d) =>
          new Date(d.submitted_at).getMonth() +
            1 ===
          monthTextToNumber[appliedMonthFilter]
      )
    }

    if (appliedStatusFilter.length) {
      filtered = filtered.filter((d) =>
        appliedStatusFilter.includes(d.status)
      )
    }

    return filtered
  }

  const sortedDocs = useMemo(() => {
    return [...documents].sort(
      (a, b) =>
        new Date(b.submitted_at) -
        new Date(a.submitted_at)
    )
  }, [documents])
  const filteredDocs = useMemo(() => {
    return filterData(sortedDocs)
  }, [
    sortedDocs,
    searchQuery,
    appliedMonthFilter,
    appliedStatusFilter,
  ])

  const [currentPage, setCurrentPage] =
    useState(0)
  const itemsPerPage = 9

  const paginatedData = useMemo(() => {
    const start = currentPage * itemsPerPage
    return filteredDocs.slice(
      start,
      start + itemsPerPage
    )
  }, [currentPage, filteredDocs])

  return (
    <Box className="dark:bg-gray-900 dark:text-white">
      <Box className="p-0 sm:p-1 md:p-1 lg:p-2 flex w-full box-border rounded-lg justify-between items-center">
        <SearchBox
          placeholder="Search Documents"
          searchValue={searchQuery}
          handleOnchange={setSearchQuery}
        />
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button className="flex items-center gap-2 mt-2 dark:bg-blue-700 dark:text-white bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-800">
              <BsFunnel className="w-4 h-4" />
              Filter
            </Button>
          </Popover.Trigger>
          <Popover.Content
            className="bg-white dark:bg-gray-800 rounded-lg p-4 w-80 shadow-lg dark:shadow-gray-700"
            sideOffset={5}
          >
            <Flex
              justify="between"
              align="center"
              className="mb-4"
            >
              <Text
                weight="bold"
                size="3"
                className="dark:text-white"
              >
                Apply Filters
              </Text>
              <Popover.Close asChild>
                <Button
                  variant="ghost"
                  size="1"
                  color="gray"
                  className="rounded-full dark:text-white"
                >
                  <IoClose className="w-4 h-4" />
                </Button>
              </Popover.Close>
            </Flex>
            <div className="space-y-4">
              <div>
                <Label.Root className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Month:
                </Label.Root>
                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(
                      e.target.value
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">
                    All Months
                  </option>
                  {months.map((month) => (
                    <option
                      key={month}
                      value={month}
                    >
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label.Root className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status:
                </Label.Root>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      onChange={() =>
                        toggleStatus("approved")
                      }
                      checked={statusFilter.includes(
                        "approved"
                      )}
                      className="rounded text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600"
                    />
                    <span className="text-sm text-green-600">
                      Approved
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      onChange={() =>
                        toggleStatus("pending")
                      }
                      checked={statusFilter.includes(
                        "pending"
                      )}
                      className="rounded text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600"
                    />
                    <span className="text-sm text-blue-600">
                      Pending
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      onChange={() =>
                        toggleStatus("rejected")
                      }
                      checked={statusFilter.includes(
                        "rejected"
                      )}
                      className="rounded text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600"
                    />
                    <span className="text-sm text-red-600">
                      Rejected
                    </span>
                  </label>
                </div>
              </div>
              <Flex
                gap="3"
                justify="end"
                className="pt-2"
              >
                <Button
                  variant="soft"
                  color="red"
                  onClick={clearFilter}
                  className="dark:text-white dark:bg-red-700 dark:hover:bg-red-800"
                  style={{
                    padding: "6px",
                    borderRadius: 5,
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="solid"
                  color="blue"
                  onClick={applyFilter}
                  className="dark:text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                  style={{
                    padding: "6px",
                    borderRadius: 5,
                  }}
                >
                  Apply
                </Button>
              </Flex>
            </div>
          </Popover.Content>
        </Popover.Root>
      </Box>

      <Box className="relative flex flex-col rounded-[0.4rem] bg-base-100 dark:bg-gray-800 shadow-xl mt-2 min-h-[82vh]">
        <Box className="ml-0 sm:ml-1 md:ml-1 lg:ml-2 px-0 sm:px-1 md:px-2 lg:px-4 lg:py-2 mr-0 sm:mr-0 md:mr-1 lg:mr-2">
          <Flex
            direction="column"
            gap="10px"
          >
            {isLoading ? (
              <Box className="flex justify-center items-center py-60">
                <FadeLoader color="#2563eb" />
              </Box>
            ) : documents.length === 0 ? (
              <Box className="text-center text-gray-600 dark:text-gray-400 mt-[20%] mb-[26%] text-3xl">
                No documents available.
              </Box>
            ) : filteredDocs.length === 0 ? (
              <Box className="text-center text-gray-600 dark:text-gray-400 mt-[20%] mb-[26%] text-3xl">
                No matching documents found.
              </Box>
            ) : (
              <Box className="h-[550px]">
                <Table.Root className="my-1 sm:my-1 md:my-3 lg:my-5 p-1 lg:p-4 md:p-3 sm:p-2 mx-0 sm:mx-1 md:mx-2 lg:mx-3 rounded-lg dark:bg-gray-800">
                  <Table.Header>
                    <Table.Row className="text-center font-semibold text-sm sm:text-sm md:text-base lg:text-base">
                      {[
                        "Document",
                        "Name",
                        "Email",
                        "Status",
                        "Submitted On",
                        "Actions",
                      ].map(
                        (columnHeader, index) => (
                          <Table.ColumnHeaderCell
                            key={index}
                            className="dark:text-white"
                          >
                            {columnHeader}
                          </Table.ColumnHeaderCell>
                        )
                      )}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedData.map(
                      (doc, index) => (
                        <Table.Row
                          key={index}
                          className="text-center font-medium text-xs sm:text-xs md:text-sm lg:text-sm dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <Table.Cell>
                            {doc.document_name ||
                              "Unavailable"}
                          </Table.Cell>
                          <Table.Cell>
                            {doc.username ||
                              "Unavailable"}
                          </Table.Cell>
                          <Table.Cell>
                            {doc.email ||
                              "Unavailable"}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              color={
                                doc.status ===
                                "approved"
                                  ? "green"
                                  : doc.status ===
                                      "rejected"
                                    ? "red"
                                    : doc.status ===
                                        "in_review"
                                      ? "blue"
                                      : "yellow"
                              }
                              className="dark:text-white"
                            >
                              {doc.status ===
                              "in_review"
                                ? "In review"
                                : doc.status
                                    .charAt(0)
                                    .toUpperCase() +
                                  doc.status.slice(
                                    1
                                  )}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            {doc.submitted_at
                              ? formatDate(
                                  doc.submitted_at
                                )
                              : "NA"}
                          </Table.Cell>
                          <Table.Cell>
                            <Flex
                              gap="2"
                              justify="center"
                            >
                              <Dialog.Root>
                                <Dialog.Trigger>
                                  <Button
                                    size="1"
                                    className="pt-1 pb-1 pl-1.5 pr-1.5 rounded-sm cursor-pointer"
                                    onClick={() =>
                                      setSelectedDocument(
                                        doc
                                      )
                                    }
                                  >
                                    <FiFileText className="mr-1 w-3 h-3" />
                                    View Details
                                  </Button>
                                </Dialog.Trigger>
                                {selectedDocument && (
                                  <Dialog.Content
                                    style={{
                                      maxWidth:
                                        "90vw",
                                      width:
                                        "1200px",
                                      maxHeight:
                                        "90vh",
                                      overflow:
                                        "auto",
                                    }}
                                    className="relative border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-6"
                                  >
                                    <Dialog.Close
                                      asChild
                                    >
                                      <button
                                        type="button"
                                        aria-label="Close"
                                        onClick={() =>
                                          setSelectedDocument(
                                            null
                                          )
                                        }
                                        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 z-10"
                                        style={{
                                          lineHeight: 1,
                                          background:
                                            "transparent",
                                        }}
                                      >
                                        <RxCrossCircled className="w-6 h-6" />
                                      </button>
                                    </Dialog.Close>
                                    <DocumentDetail
                                      documentData={
                                        selectedDocument
                                      }
                                      onClose={() => {
                                        setSelectedDocument(
                                          null
                                        )
                                        fetchDocuments()
                                      }}
                                    />
                                  </Dialog.Content>
                                )}
                              </Dialog.Root>
                            </Flex>
                          </Table.Cell>
                        </Table.Row>
                      )
                    )}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
            {!isLoading &&
              filteredDocs.length >
                itemsPerPage && (
                <Flex
                  justify="center"
                  className="absolute bottom-[2vh] right-1/2 translate-x-1/2"
                >
                  <ModernPagination
                    total={filteredDocs.length}
                    pageSize={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={({
                      selected,
                    }) =>
                      setCurrentPage(selected)
                    }
                    siblingCount={1}
                    showEdges={true}
                  />
                </Flex>
              )}
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}
DocumentDetail.propTypes = {
  documentData: PropTypes.shape({
    _id: PropTypes.string,
    file_type: PropTypes.string,
    file_content: PropTypes.string,
    document_name: PropTypes.string,
    imageUrl: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    status: PropTypes.string,
    submitted_at: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
}
export default AdminDocuments
