import React, {
  useState,
  useEffect,
  useCallback,
} from "react"
import {
  Box,
  Flex,
  Text,
  Button,
  Avatar,
  Table,
  Badge,
  Dialog,
  Popover,
  Grid,
} from "@radix-ui/themes"
import {
  FiPaperclip,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiXCircle,
  FiEye,
  FiDownload,
  FiFileText,
  FiImage,
  FiFile,
} from "react-icons/fi"
import {
  RxCheckCircled,
  RxCrossCircled,
} from "react-icons/rx"
import { IoClose } from "react-icons/io5"
import * as Label from "@radix-ui/react-label"
import PropTypes from "prop-types"
import axios from "axios"
import toast from "react-hot-toast"
import { format } from "date-fns"
import { useOrganizationContext } from "../../OrganizationContext"
import ModernPagination from "../../ModernPagination"
import * as Tooltip from "@radix-ui/react-tooltip"
import { FadeLoader } from "react-spinners"
import SearchBox from "../../SearchBox"
import { BsClockHistory } from "react-icons/bs"

const BASE_URL = process.env.REACT_APP_BASE_URL

const Spinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
      ></div>
    </div>
  )
}

Spinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
}

const SummaryCards = ({ filteredExpenses }) => {
  const getStatusCount = (statusCheck) => {
    return filteredExpenses.filter((e) => {
      const status = e.status
        ? e.status.toLowerCase()
        : "pending"

      if (
        status === "approved" &&
        statusCheck === "approved"
      )
        return true
      if (
        status === "rejected" &&
        statusCheck === "rejected"
      )
        return true
      if (
        status === "pending" &&
        statusCheck === "pending"
      )
        return true
      if (
        status === "in_review" &&
        statusCheck === "in_review"
      )
        return true

      if (status.startsWith("approved ")) {
        const [, fraction] = status.split(" ")
        const [approved, total] = fraction
          .split("/")
          .map(Number)

        if (
          statusCheck === "approved" &&
          approved === total
        )
          return true
        if (
          statusCheck === "rejected" &&
          approved === 0
        )
          return true
        if (
          statusCheck === "partial" &&
          approved < total &&
          approved > 0
        )
          return true
        return false
      }

      if (status.startsWith("in_review ")) {
        const [, fraction] = status.split(" ")
        const [inReview, total] = fraction
          .split("/")
          .map(Number)

        if (
          statusCheck === "in_review" &&
          inReview === total
        )
          return true
        if (
          statusCheck === "partial" &&
          inReview < total &&
          inReview > 0
        )
          return true
      }

      return false
    }).length
  }

  return (
    <div className="px-1 sm:px-3 lg:px-4 py-1 sm:py-3 bg-gray border-b border-gray-200 w-full overflow-x-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-3">
        <Box className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-300 dark:border-gray-600 transform hover:-translate-y-1">
          <Flex
            align="center"
            gap="2"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
              <FiTrendingUp className="w-5 h-5 text-blue-600 dark:text-white" />
            </div>
            <Box>
              <Text
                size="3"
                weight="bold"
                className="text-black dark:text-white"
              >
                Total Expenses
              </Text>
              <Text
                size="3"
                weight="bold"
                className="text-gray-900 dark:text-white"
              >
                : {filteredExpenses.length}
              </Text>
            </Box>
          </Flex>
        </Box>

        <Box className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-300 dark:border-gray-600 transform hover:-translate-y-1">
          <Flex
            align="center"
            gap="2"
          >
            <div className="p-2 bg-yellow-100 dark:bg-yellow-700 rounded-full">
              <FiClock className="w-5 h-5 text-yellow-600 dark:text-white" />
            </div>
            <Box>
              <Text
                size="3"
                weight="bold"
                className="text-black dark:text-white"
              >
                Pending
              </Text>
              <Text
                size="3"
                weight="bold"
                className="text-gray-900 dark:text-white"
              >
                : {getStatusCount("pending")}
              </Text>
            </Box>
          </Flex>
        </Box>

        <Box className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-300 dark:border-gray-600 transform hover:-translate-y-1">
          <Flex
            align="center"
            gap="2"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-700 rounded-full">
              <FiClock className="w-5 h-5 text-blue-600 dark:text-white" />
            </div>
            <Box>
              <Text
                size="3"
                weight="bold"
                className="text-black dark:text-white"
              >
                In Review
              </Text>
              <Text
                size="3"
                weight="bold"
                className="text-gray-900 dark:text-white"
              >
                : {getStatusCount("in_review")}
              </Text>
            </Box>
          </Flex>
        </Box>

        <Box className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-300 dark:border-gray-600 transform hover:-translate-y-1">
          <Flex
            align="center"
            gap="2"
          >
            <div className="p-2 bg-green-100 dark:bg-green-700 rounded-full">
              <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-white" />
            </div>
            <Box>
              <Text
                size="3"
                weight="bold"
                className="text-black dark:text-white"
              >
                Approved
              </Text>
              <Text
                size="3"
                weight="bold"
                className="text-gray-900 dark:text-white"
              >
                : {getStatusCount("approved")}
              </Text>
            </Box>
          </Flex>
        </Box>

        <Box className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-300 dark:border-gray-600 transform hover:-translate-y-1">
          <Flex
            align="center"
            gap="2"
          >
            <div className="p-2 bg-red-100 dark:bg-red-700 rounded-full">
              <FiXCircle className="w-5 h-5 text-red-600 dark:text-white" />
            </div>
            <Box>
              <Text
                size="3"
                weight="bold"
                className="text-black dark:text-white"
              >
                Rejected
              </Text>
              <Text
                size="3"
                weight="bold"
                className="text-gray-900 dark:text-white"
              >
                : {getStatusCount("rejected")}
              </Text>
            </Box>
          </Flex>
        </Box>

        <Box className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-300 dark:border-gray-600 transform hover:-translate-y-1">
          <Flex
            align="center"
            gap="2"
          >
            <div className="p-2 bg-orange-100 dark:bg-orange-700 rounded-full">
              <BsClockHistory className="w-5 h-5 text-orange-600 dark:text-white" />
            </div>
            <Box>
              <Text
                size="3"
                weight="bold"
                className="text-black dark:text-white"
              >
                Partial Approval
              </Text>
              <Text
                size="3"
                weight="bold"
                className="text-gray-900 dark:text-white"
              >
                : {getStatusCount("partial")}
              </Text>
            </Box>
          </Flex>
        </Box>
      </div>
    </div>
  )
}

SummaryCards.propTypes = {
  filteredExpenses: PropTypes.arrayOf(
    PropTypes.shape({
      totalAmount: PropTypes.number,
      status: PropTypes.string,
    })
  ).isRequired,
}

const ExpenseVoucherDetail = ({
  voucherData,
  getStatusBadgeColor,
  onClose,
}) => {
  const { organizationName, socket } =
    useOrganizationContext()
  const [loading, setLoading] = useState(false)
  const [loadingExpenses, setLoadingExpenses] =
    useState({})
  const [
    isAttachmentModalOpen,
    setIsAttachmentModalOpen,
  ] = useState(false)
  const [
    selectedAttachments,
    setSelectedAttachments,
  ] = useState(null)
  const [expenses, setExpenses] = useState(
    voucherData.expenses || []
  )

  const updateReimbursementStatus = async (
    status
  ) => {
    if (!canUpdateAllExpenses) {
      toast.error(
        "All expenses are already finalized."
      )
      return
    }

    const backendStatus = status.toLowerCase()
    setLoading(true)
    try {
      const response = await axios.put(
        `${BASE_URL}/update_reimbursement_status/${voucherData.reimbursement_id}`,
        {
          status: backendStatus,
          timestamp: new Date().toISOString(),
        },
        {
          params: {
            organization_name: organizationName,
            org_slug: organizationName,
          },
        }
      )

      toast.success(response.data.message)

      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) => ({
          ...expense,
          status: backendStatus,
        }))
      )

      voucherData.status = backendStatus
      await refreshReimbursementStatus()

      if (
        socket &&
        socket.readyState === WebSocket.OPEN
      ) {
        socket.send(
          JSON.stringify({
            type: "reimbursement_update",
            action: "bulk_status_update",
            status: backendStatus,
            needsDesktopNotification: true,
            userId:
              voucherData.userId ||
              voucherData.user_id ||
              "",
          })
        )
      }

      onClose()
    } catch (error) {
      toast.error(
        `Error updating status: ${error.response?.data?.detail || error.message}`
      )
    } finally {
      setLoading(false)
    }
  }

  const updateExpenseStatus = async (
    expenseId,
    status
  ) => {
    const backendStatus = status.toLowerCase()
    setLoadingExpenses((prev) => ({
      ...prev,
      [expenseId]: true,
    }))

    try {
      await axios.put(
        `${BASE_URL}/update_expense_status/${expenseId}`,
        {
          status: backendStatus,
          timestamp: new Date().toISOString(),
        },
        {
          params: {
            organization_name: organizationName,
            org_slug: organizationName,
          },
        }
      )

      toast.success(
        `Expense ${status} successfully`
      )

      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense.expense_id === expenseId
            ? {
                ...expense,
                status: backendStatus,
              }
            : expense
        )
      )

      await refreshReimbursementStatus()

      if (
        socket &&
        socket.readyState === WebSocket.OPEN
      ) {
        socket.send(
          JSON.stringify({
            type: "reimbursement_update",
            action: "status_update",
            status: backendStatus,
            needsDesktopNotification: true,
            userId:
              voucherData.userId ||
              voucherData.user_id ||
              "",
          })
        )
      }
    } catch (error) {
      toast.error(
        `Error updating expense status: ${error.response?.data?.detail || error.message}`
      )
    } finally {
      setLoadingExpenses((prev) => ({
        ...prev,
        [expenseId]: false,
      }))
    }
  }

  const refreshReimbursementStatus = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/get_all_reimbursement_requests`,
        {
          params: {
            organization_name: organizationName,
          },
        }
      )

      const updatedRequest =
        response.data.reimbursement_requests.find(
          (req) =>
            req.reimbursement_id ===
            voucherData.reimbursement_id
        )

      if (updatedRequest) {
        voucherData.status = updatedRequest.status
        if (
          updatedRequest.expenses &&
          Array.isArray(updatedRequest.expenses)
        ) {
          setExpenses(updatedRequest.expenses)
        }
      }
    } catch (error) {
      toast.error(
        `Error refreshing status: ${error.response?.data?.detail || error.message}`
      )
    }
  }

  const getFileTypeIcon = (filename) => {
    if (
      !filename ||
      typeof filename !== "string"
    ) {
      return (
        <FiFile className="h-10 w-10 text-gray-500" />
      )
    }

    const extension = filename
      .split(".")
      .pop()
      .toLowerCase()

    if (extension === "pdf") {
      return (
        <FiFileText className="h-10 w-10 text-red-500" />
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
        <FiImage className="h-10 w-10 text-blue-500" />
      )
    } else if (
      ["doc", "docx"].includes(extension)
    ) {
      return (
        <FiFileText className="h-10 w-10 text-green-500" />
      )
    } else {
      return (
        <FiFile className="h-10 w-10 text-gray-500" />
      )
    }
  }

  const handleDownloadAttachment = (
    attachment
  ) => {
    try {
      if (attachment.content) {
        const filename =
          attachment.filename || "download"
        const extension = filename
          .split(".")
          .pop()
          .toLowerCase()
        const isImage = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "webp",
          "svg",
        ].includes(extension)
        const isPdf = extension === "pdf"

        const mimeType = isPdf
          ? "application/pdf"
          : isImage
            ? `image/${extension === "jpg" ? "jpeg" : extension}`
            : attachment.content_type ||
              "application/octet-stream"

        const byteCharacters = atob(
          attachment.content
        )
        const byteNumbers = new Array(
          byteCharacters.length
        )
        for (
          let i = 0;
          i < byteCharacters.length;
          i++
        ) {
          byteNumbers[i] =
            byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(
          byteNumbers
        )
        const blob = new Blob([byteArray], {
          type: mimeType,
        })

        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = blobUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(blobUrl)
      } else {
        toast.error(
          "No file content available for download"
        )
      }
    } catch (error) {
      toast.error(
        "Failed to download the file: " +
          error.message
      )
    }
  }

  const handleViewAttachment = (attachment) => {
    try {
      if (attachment.content) {
        const filename = attachment.filename || ""
        const extension = filename
          .split(".")
          .pop()
          .toLowerCase()
        const isImage = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "webp",
          "svg",
        ].includes(extension)
        const isPdf = extension === "pdf"

        const mimeType = isPdf
          ? "application/pdf"
          : isImage
            ? `image/${extension === "jpg" ? "jpeg" : extension}`
            : attachment.content_type ||
              "application/octet-stream"

        const byteCharacters = atob(
          attachment.content
        )
        const byteNumbers = new Array(
          byteCharacters.length
        )
        for (
          let i = 0;
          i < byteCharacters.length;
          i++
        ) {
          byteNumbers[i] =
            byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(
          byteNumbers
        )
        const blob = new Blob([byteArray], {
          type: mimeType,
        })

        const blobUrl = URL.createObjectURL(blob)
        window.open(blobUrl)

        setTimeout(() => {
          URL.revokeObjectURL(blobUrl)
        }, 60000)
      } else {
        toast.error(
          "No file content available for viewing"
        )
      }
    } catch (error) {
      toast.error(
        "Failed to view the file: " +
          error.message
      )
    }
  }

  const openAttachmentModal = (attachments) => {
    setSelectedAttachments(
      Array.isArray(attachments)
        ? attachments
        : []
    )
    setIsAttachmentModalOpen(true)
  }

  const canUpdateAllExpenses = expenses.some(
    (expense) =>
      !expense.status ||
      !["approved", "rejected"].includes(
        expense.status
      )
  )

  const isExpenseFinalized = (expense) =>
    expense.status === "approved" ||
    expense.status === "rejected"

  return (
    <Box className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl mx-auto shadow-sm">
      <Flex
        justify="between"
        align="center"
        className="mb-6 border-b border-gray-300 dark:border-gray-600 pb-4"
      >
        <Text
          size="5"
          weight="bold"
          className="text-blue-900 dark:text-blue-500"
        >
          Reimbursement Details
        </Text>
      </Flex>
      <Box className="border border-gray-300 dark:border-gray-600 rounded-lg mb-6 shadow-sm">
        <Flex className="flex-col md:flex-row p-6 gap-6">
          <Box className="w-full md:w-1/3 space-y-6">
            <Box>
              <Text
                size="2"
                weight="bold"
                className="text-black dark:text-white block mb-1 uppercase"
              >
                Category
              </Text>
              <Text
                size="2"
                weight="medium"
                className="text-gray-900 dark:text-white"
              >
                {voucherData.reimbursement_type ||
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
                      voucherData.imageUrl ||
                      "/api/placeholder/40/40"
                    }
                    fallback={
                      voucherData.employeeName?.charAt(
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
                      className="block text-gray-700 dark:text-white"
                    >
                      {voucherData.employeeName ||
                        "Unavailable"}
                    </Text>
                    <Text
                      size="2"
                      className="text-gray-700 dark:text-white"
                    >
                      {voucherData.organization_name ||
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
                  Amount To Be Reimbursed
                </Text>
                <Text
                  weight="bold"
                  size="5"
                  className="text-blue-900 dark:text-blue-500"
                >
                  ₹{" "}
                  {voucherData.totalAmount ||
                    "Unavailable"}
                </Text>
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
                  className="block text-gray-700 dark:text-white"
                >
                  {voucherData.created_at
                    ? format(
                        new Date(
                          voucherData.created_at
                        ),
                        "dd MMM yyyy"
                      )
                    : "Unavailable"}
                </Text>
              </Box>

              <Box className="w-1/2">
                <Text
                  size="2"
                  weight="bold"
                  className="text-black dark:text-white mb-2 uppercase"
                >
                  Status ({expenses.length || 0}{" "}
                  Expenses)
                </Text>
                <Box className="mt-1">
                  <Badge
                    color={
                      getStatusBadgeColor(
                        voucherData.status
                      ).color
                    }
                    className="dark:text-white"
                  >
                    {
                      getStatusBadgeColor(
                        voucherData.status
                      ).text
                    }
                  </Badge>
                </Box>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      <Box className="mb-6 overflow-x-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row className="bg-gray-50 dark:bg-gray-700 text-black dark:text-white">
              <Table.ColumnHeaderCell className="text-medium font-bold text-black dark:text-white text-center">
                EXPENSE DATE
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="text-medium font-bold text-black dark:text-white text-center">
                CATEGORY
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="text-medium font-bold text-black dark:text-white text-center">
                DESCRIPTION
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="text-medium font-bold text-black dark:text-white text-center">
                AMOUNT
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="text-medium font-bold text-black dark:text-white text-center">
                RECEIPT
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="text-medium font-bold text-black dark:text-white text-center">
                ACTIONS
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {expenses.map((expense, index) => (
              <Table.Row
                key={index}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Table.Cell className="text-center dark:text-white">
                  <Text weight="medium">
                    {expense.date ||
                      "Unavailable"}
                  </Text>
                </Table.Cell>
                <Table.Cell className="text-center dark:text-white">
                  <Text weight="medium">
                    {expense.categories?.join(
                      ", "
                    ) || "Unavailable"}
                  </Text>
                </Table.Cell>
                <Table.Cell className="text-center dark:text-white">
                  <Text weight="medium">
                    {expense.description}
                  </Text>
                </Table.Cell>
                <Table.Cell className="text-center dark:text-white">
                  <Text weight="medium">
                    ₹{" "}
                    {expense.amount ||
                      "Unavailable"}
                  </Text>
                </Table.Cell>
                <Table.Cell className="text-center dark:text-white">
                  <Flex
                    align="center"
                    justify="center"
                    className="gap-2 cursor-pointer hover:text-blue-700 text-blue-500"
                    onClick={() =>
                      openAttachmentModal(
                        expense.attachments ||
                          voucherData.attachments ||
                          []
                      )
                    }
                  >
                    <FiPaperclip className="w-4 h-4" />
                    <span className="text-sm font-medium text-center">
                      View Receipts
                    </span>
                  </Flex>
                </Table.Cell>

                <Table.Cell>
                  <Flex
                    gap="3"
                    justify="center"
                  >
                    {!isExpenseFinalized(
                      expense
                    ) ? (
                      <>
                        {loadingExpenses[
                          expense.expense_id
                        ] ? (
                          <Spinner size="3" />
                        ) : (
                          <Tooltip.Provider>
                            <Tooltip.Root>
                              <Tooltip.Trigger
                                asChild
                              >
                                <Box
                                  as="button"
                                  onClick={() =>
                                    updateExpenseStatus(
                                      expense.expense_id,
                                      "approved"
                                    )
                                  }
                                  disabled={
                                    loadingExpenses[
                                      expense
                                        .expense_id
                                    ]
                                  }
                                  aria-label="Approve expense"
                                  className="p-1 rounded-full hover:bg-green-100 transition-colors"
                                >
                                  <RxCheckCircled className="w-6 h-6 text-green-600" />
                                </Box>
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="top"
                                align="center"
                                className="bg-gray-800 text-white text-xs rounded px-2 py-1"
                              >
                                Approve
                              </Tooltip.Content>
                            </Tooltip.Root>

                            <Tooltip.Root>
                              <Tooltip.Trigger
                                asChild
                              >
                                <Box
                                  as="button"
                                  onClick={() =>
                                    updateExpenseStatus(
                                      expense.expense_id,
                                      "rejected"
                                    )
                                  }
                                  disabled={
                                    loadingExpenses[
                                      expense
                                        .expense_id
                                    ]
                                  }
                                  aria-label="Reject expense"
                                  className="p-1 rounded-full hover:bg-red-100 transition-colors"
                                >
                                  <RxCrossCircled className="w-6 h-6 text-red-600" />
                                </Box>
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="top"
                                align="center"
                                className="bg-gray-800 text-white text-xs rounded px-2 py-1"
                              >
                                Reject
                              </Tooltip.Content>
                            </Tooltip.Root>

                            <Tooltip.Root>
                              <Tooltip.Trigger
                                asChild
                              >
                                <Box
                                  as="button"
                                  onClick={() =>
                                    updateExpenseStatus(
                                      expense.expense_id,
                                      "in_review"
                                    )
                                  }
                                  disabled={
                                    loadingExpenses[
                                      expense
                                        .expense_id
                                    ]
                                  }
                                  aria-label="Mark expense for review"
                                  className="p-1 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                  <FiClock className="w-6 h-6 text-blue-600" />
                                </Box>
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="top"
                                align="center"
                                className="bg-gray-800 text-white text-xs rounded px-2 py-1"
                              >
                                In Review
                              </Tooltip.Content>
                            </Tooltip.Root>
                          </Tooltip.Provider>
                        )}
                      </>
                    ) : (
                      <Badge
                        color={
                          expense.status ===
                          "approved"
                            ? "green"
                            : expense.status ===
                                "rejected"
                              ? "red"
                              : expense.status ===
                                  "in_review"
                                ? "blue"
                                : "yellow"
                        }
                        variant="soft"
                        className="dark:text-white"
                      >
                        {expense.status ===
                        "approved" ? (
                          <Flex
                            gap="1"
                            align="center"
                          >
                            <RxCheckCircled className="w-3 h-3" />
                            <Text size="1">
                              Approved
                            </Text>
                          </Flex>
                        ) : expense.status ===
                          "rejected" ? (
                          <Flex
                            gap="1"
                            align="center"
                          >
                            <RxCrossCircled className="w-3 h-3" />
                            <Text size="1">
                              Rejected
                            </Text>
                          </Flex>
                        ) : expense.status ===
                          "in_review" ? (
                          <Flex
                            gap="1"
                            align="center"
                          >
                            <FiClock className="w-3 h-3" />
                            <Text size="1">
                              In Review
                            </Text>
                          </Flex>
                        ) : (
                          <Flex
                            gap="1"
                            align="center"
                          >
                            <FiClock className="w-3 h-3" />
                            <Text size="1">
                              Pending
                            </Text>
                          </Flex>
                        )}
                      </Badge>
                    )}
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {expenses.length > 1 && (
        <Box className="mb-4">
          <Flex
            gap="2"
            className="mb-4"
          >
            <Button
              size="2"
              variant="soft"
              color="green"
              onClick={() =>
                updateReimbursementStatus(
                  "approved"
                )
              }
              disabled={
                loading || !canUpdateAllExpenses
              }
              className="mr-2 bg-green-500 dark:text-white"
            >
              {loading &&
              voucherData.status ===
                "approved" ? (
                <Spinner size="3" />
              ) : (
                "Approve All"
              )}
            </Button>
            <Button
              size="2"
              variant="soft"
              color="red"
              onClick={() =>
                updateReimbursementStatus(
                  "rejected"
                )
              }
              disabled={
                loading || !canUpdateAllExpenses
              }
              className="mr-2 bg-red-500 dark:text-white"
            >
              {loading &&
              voucherData.status ===
                "rejected" ? (
                <Spinner size="3" />
              ) : (
                "Reject All"
              )}
            </Button>
            <Button
              size="2"
              variant="soft"
              color="blue"
              onClick={() =>
                updateReimbursementStatus(
                  "in_review"
                )
              }
              disabled={
                loading || !canUpdateAllExpenses
              }
              className="mr-2 bg-blue-500 dark:text-white"
            >
              {loading &&
              voucherData.status ===
                "in_review" ? (
                <Spinner size="3" />
              ) : (
                "Mark All For Review"
              )}
            </Button>
          </Flex>
        </Box>
      )}

      <Flex
        gap="6"
        className="flex-col md:flex-row"
      >
        <Box className="w-full md:w-1/2">
          <Box className="bg-gray-50 dark:bg-gray-800 p-5 rounded-md shadow-sm border border-gray-300 dark:border-gray-600">
            <Box className="space-y-4">
              <Box className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-2">
                <Flex justify="between">
                  <Text
                    size="4"
                    weight="bold"
                    className="text-black dark:text-white"
                  >
                    TOTAL REIMBURSABLE
                  </Text>
                  <Text
                    size="4"
                    weight="bold"
                    className="text-blue-900 dark:text-blue-500"
                  >
                    ₹{" "}
                    {voucherData.totalAmount ||
                      "Unavailable"}
                  </Text>
                </Flex>
              </Box>
            </Box>
          </Box>
        </Box>
      </Flex>

      <Dialog.Root
        open={isAttachmentModalOpen}
        onOpenChange={setIsAttachmentModalOpen}
      >
        <Dialog.Content
          style={{ maxWidth: 700 }}
          className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-md"
        >
          <Dialog.Title>
            <Flex
              justify="between"
              align="center"
              className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 pb-2"
            >
              <Text
                size="4"
                weight="bold"
                className="text-blue-900 dark:text-blue-500"
              >
                Attachments
              </Text>
              <Button
                variant="ghost"
                onClick={() =>
                  setIsAttachmentModalOpen(false)
                }
                className="text-black dark:text-white"
              >
                <IoClose />
              </Button>
            </Flex>
          </Dialog.Title>

          <div className="p-4">
            {selectedAttachments &&
            selectedAttachments.length > 0 ? (
              <Grid
                columns={{
                  initial: "1",
                  sm: "2",
                  md: "3",
                }}
                gap="4"
              >
                {selectedAttachments.map(
                  (attachment, index) => (
                    <Box
                      key={`attachment-${index}`}
                      className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                    >
                      {getFileTypeIcon(
                        attachment.filename ||
                          "unknown"
                      )}
                      <Text
                        size="2"
                        className="mt-2 text-center text-gray-700 dark:text-white break-words max-w-full"
                      >
                        {attachment.filename ||
                          "Unnamed File"}
                      </Text>
                      <Flex
                        gap="2"
                        className="mt-2"
                      >
                        <Button
                          size="1"
                          variant="soft"
                          className="cursor-pointer text-black dark:text-white"
                          onClick={() =>
                            handleDownloadAttachment(
                              attachment
                            )
                          }
                          disabled={
                            !attachment.content
                          }
                        >
                          <FiDownload className="mr-1" />
                          Download
                        </Button>
                        {(attachment.filename
                          ?.toLowerCase()
                          .endsWith(".pdf") ||
                          (attachment.content_type &&
                            attachment.content_type.startsWith(
                              "image/"
                            ))) && (
                          <Button
                            size="1"
                            variant="soft"
                            className="cursor-pointer text-black dark:text-white"
                            onClick={() =>
                              handleViewAttachment(
                                attachment
                              )
                            }
                            disabled={
                              !attachment.content
                            }
                          >
                            <FiEye className="mr-1" />
                            View
                          </Button>
                        )}
                      </Flex>
                    </Box>
                  )
                )}
              </Grid>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No attachments available.
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}

ExpenseVoucherDetail.propTypes = {
  voucherData: PropTypes.shape({
    reimbursement_id: PropTypes.string,
    reimbursement_type: PropTypes.string,
    created_at: PropTypes.string,
    employeeName: PropTypes.string,
    organization_name: PropTypes.string,
    totalAmount: PropTypes.number,
    status: PropTypes.string,
    imageUrl: PropTypes.string,
    userId: PropTypes.string,
    user_id: PropTypes.string,
    expenses: PropTypes.arrayOf(
      PropTypes.shape({
        expense_id: PropTypes.string,
        date: PropTypes.string,
        categories: PropTypes.arrayOf(
          PropTypes.string
        ),
        amount: PropTypes.number,
        description: PropTypes.string,
        status: PropTypes.string,
        attachments: PropTypes.arrayOf(
          PropTypes.shape({
            filename: PropTypes.string,
            content_type: PropTypes.string,
            content: PropTypes.string,
            size: PropTypes.string,
            date: PropTypes.string,
          })
        ),
      })
    ),
    attachments: PropTypes.array,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  getStatusBadgeColor: PropTypes.func.isRequired,
}

function ReimbursementAdminDashboard() {
  const { organizationName, org_slug, socket } =
    useOrganizationContext()
  const [searchVal, setSearchVal] = useState("")
  const [selectedExpense, setSelectedExpense] =
    useState(null)
  const [, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filteredExpenses, setFilteredExpenses] =
    useState([])
  const [allExpenses, setAllExpenses] = useState(
    []
  )
  const [selectedMonth, setSelectedMonth] =
    useState("")
  const [statusFilter, setStatusFilter] =
    useState([])
  const [
    expenseTypeFilter,
    setExpenseTypeFilter,
  ] = useState("")
  const [userImages, setUserImages] = useState({})
  const [currentPage, setCurrentPage] =
    useState(0)
  const itemsPerPage = 6

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const formatDate = (dateString) => {
    try {
      return format(
        new Date(dateString),
        "yyyy-MM-dd"
      )
    } catch (e) {
      return "Invalid Date"
    }
  }

  const fetchUserImage = useCallback(
    async (employeeId) => {
      if (!org_slug || !employeeId) {
        return "/api/placeholder/40/40"
      }
      try {
        const response = await axios.get(
          `${BASE_URL}/user_image`,
          {
            params: {
              employee_id: employeeId,
              org_slug,
              organization_name: organizationName,
            },
          }
        )
        return (
          response.data.imageUrl ||
          "/api/placeholder/40/40"
        )
      } catch (error) {
        return "/api/placeholder/40/40"
      }
    },
    [org_slug]
  )

  const fetchReimbursementRequests =
    useCallback(async () => {
      if (!organizationName) {
        setLoading(false)
        toast.error("Missing Organization name")
        return
      }

      const effectiveOrgSlug =
        org_slug ||
        organizationName
          .toLowerCase()
          .replace(/\s+/g, "-")
      const url = `${BASE_URL}/get_all_reimbursement_requests`

      setLoading(true)
      try {
        const response = await axios.get(url, {
          params: {
            organization_name: organizationName,
            org_slug: effectiveOrgSlug,
          },
        })

        const formattedData =
          response.data.reimbursement_requests
            .map((item) => ({
              ...item,
              reimbursement_type:
                item.reimbursement_type ||
                item.expenses?.[0]
                  ?.categories?.[0] ||
                "Unknown",
              created_at: formatDate(
                item.created_at
              ),
              originalDate: item.created_at,
            }))
            .sort(
              (a, b) =>
                new Date(b.originalDate) -
                new Date(a.originalDate)
            )

        setAllExpenses(formattedData)
        setFilteredExpenses(formattedData)

        const uniqueEmployeeIds = [
          ...new Set(
            formattedData
              .map(
                (expense) => expense.employeeId
              )
              .filter(Boolean)
          ),
        ]
        const imagePromises =
          uniqueEmployeeIds.map(
            async (employeeId) => {
              const imageUrl =
                await fetchUserImage(employeeId)
              return { [employeeId]: imageUrl }
            }
          )
        const images = await Promise.all(
          imagePromises
        )
        const imageMap = Object.assign(
          {},
          ...images
        )
        setUserImages(imageMap)

        setLoading(false)
      } catch (error) {
        setLoading(false)
        toast.error(
          `Error fetching reimbursement requests: ${error.message}`
        )
      }
    }, [
      organizationName,
      org_slug,
      fetchUserImage,
    ])

  useEffect(() => {
    fetchReimbursementRequests()
  }, [fetchReimbursementRequests])

  useEffect(() => {
    const handleMessage = (event) => {
      const message = JSON.parse(event.data)
      if (
        message.type === "reimbursement_update" ||
        message.type === "new_request"
      ) {
        fetchReimbursementRequests()
      }
    }

    if (socket) {
      socket.addEventListener(
        "message",
        handleMessage
      )
    }

    return () => {
      if (socket) {
        socket.removeEventListener(
          "message",
          handleMessage
        )
      }
    }
  }, [socket, fetchReimbursementRequests])

  const handleExpenseClick = (expense) => {
    setSelectedExpense(expense)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    fetchReimbursementRequests()
  }

  const handleSearchFilter = (val) => {
    setSearchVal(val)
    const lowerCaseSearchVal = val.toLowerCase()

    const filtered = allExpenses
      .filter((reimbursement) => {
        const normalizedStatus = (
          reimbursement.status || ""
        )
          .toLowerCase()
          .replace(/_/g, " ")
          .trim()

        return (
          (reimbursement.reimbursement_type &&
            reimbursement.reimbursement_type
              .toLowerCase()
              .includes(lowerCaseSearchVal)) ||
          (reimbursement.status &&
            reimbursement.status
              .toLowerCase()
              .includes(lowerCaseSearchVal)) ||
          normalizedStatus.includes(
            lowerCaseSearchVal
          ) ||
          (reimbursement.created_at &&
            reimbursement.created_at
              .toLowerCase()
              .includes(lowerCaseSearchVal)) ||
          (reimbursement.employeeName &&
            reimbursement.employeeName
              .toLowerCase()
              .includes(lowerCaseSearchVal)) ||
          (reimbursement.department &&
            reimbursement.department
              .toLowerCase()
              .includes(lowerCaseSearchVal)) ||
          (reimbursement.expenses &&
            reimbursement.expenses.some((exp) =>
              exp.description
                .toLowerCase()
                .includes(lowerCaseSearchVal)
            )) ||
          (reimbursement.totalAmount &&
            reimbursement.totalAmount
              .toString()
              .includes(lowerCaseSearchVal)) ||
          (reimbursement.employeeId &&
            reimbursement.employeeId
              .toString()
              .includes(lowerCaseSearchVal))
        )
      })
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )

    setFilteredExpenses(filtered)
    setCurrentPage(0)
  }

  const toggleStatusFilter = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  const getStatusBadgeColor = (status) => {
    if (!status)
      return { color: "yellow", text: "Pending" }

    if (status === "approved")
      return { color: "green", text: "Approved" }
    if (status === "rejected")
      return { color: "red", text: "Rejected" }
    if (status === "pending")
      return { color: "yellow", text: "Pending" }
    if (status === "in_review")
      return { color: "blue", text: "In Review" }

    if (status.startsWith("approved ")) {
      const [, fraction] = status.split(" ")
      const [approved, total] = fraction
        .split("/")
        .map(Number)

      if (approved === total)
        return {
          color: "green",
          text: "Approved",
        }
      if (approved === 0)
        return { color: "red", text: "Rejected" }
      return {
        color: "orange",
        text: `Approved ${approved}/${total}`,
      }
    }

    if (status.startsWith("in_review ")) {
      const [, fraction] = status.split(" ")
      const [inReview, total] = fraction
        .split("/")
        .map(Number)

      if (inReview === total)
        return {
          color: "blue",
          text: "In Review",
        }
      if (inReview < total && inReview > 0) {
        return {
          color: "blue",
          text: `In Review ${inReview}/${total}`,
        }
      }
    }

    return { color: "yellow", text: "Pending" }
  }

  const applyFilterLogic = (data) => {
    let filtered = [...data]

    if (selectedMonth) {
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(
          expense.originalDate
        )
        const expenseMonth =
          expenseDate.toLocaleString("default", {
            month: "long",
          })
        return expenseMonth === selectedMonth
      })
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter((expense) => {
        const status = expense.status || "pending"
        return statusFilter.some((filter) => {
          if (filter === "accepted") {
            return (
              status === "approved" ||
              (status.startsWith("approved ") &&
                status.endsWith(
                  `/${expense.expenses.length}`
                ))
            )
          }
          if (filter === "in_review") {
            return (
              status === "in_review" ||
              (status.startsWith("approved ") &&
                !status.endsWith(
                  `/${expense.expenses.length}`
                ) &&
                !status.startsWith("approved 0/"))
            )
          }
          if (filter === "rejected") {
            return (
              status === "rejected" ||
              status ===
                `approved 0/${expense.expenses.length}`
            )
          }
          return false
        })
      })
    }

    if (expenseTypeFilter) {
      filtered = filtered.filter((expense) =>
        (expense.reimbursement_type || "")
          .toLowerCase()
          .includes(
            expenseTypeFilter.toLowerCase()
          )
      )
    }

    return filtered
  }

  const applyFilter = () => {
    let filtered = applyFilterLogic(allExpenses)

    filtered.sort(
      (a, b) =>
        new Date(b.originalDate) -
        new Date(a.originalDate)
    )
    setFilteredExpenses(filtered)
    setCurrentPage(0)
  }

  const clearFilters = () => {
    setSelectedMonth("")
    setStatusFilter([])
    setExpenseTypeFilter("")
    setSearchVal("")
    const sortedAllExpenses = [
      ...allExpenses,
    ].sort(
      (a, b) =>
        new Date(b.originalDate) -
        new Date(a.originalDate)
    )
    setFilteredExpenses(sortedAllExpenses)
    setCurrentPage(0)
  }

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  const offset = currentPage * itemsPerPage
  const paginatedExpenses =
    filteredExpenses.slice(
      offset,
      offset + itemsPerPage
    )

  return (
    <Box>
      <Box className="flex w-full box-border rounded-lg justify-between items-center mb-2">
        <SearchBox
          placeholder="Search Reimbursement"
          searchValue={searchVal}
          handleOnchange={handleSearchFilter}
        />
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button className="flex items-center gap-2 mt-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter
            </Button>
          </Popover.Trigger>
          <Popover.Content
            className="bg-white dark:bg-gray-800 rounded-lg p-4 w-80 shadow-md border border-gray-300 dark:border-gray-600"
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
                className="text-blue-700 dark:text-blue-500 font-normal text-2xl mb-5"
              >
                Apply Filters
              </Text>
              <Popover.Close asChild>
                <Button
                  variant="ghost"
                  size="1"
                  color="gray"
                  className="rounded-full"
                >
                  <IoClose className="w-4 h-4 text:black dark:text-white" />
                </Button>
              </Popover.Close>
            </Flex>
            <div className="space-y-4">
              <div>
                <Label.Root className="block mb-1 text-sm font-medium text-black dark:text-white">
                  Month:
                </Label.Root>
                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(
                      e.target.value
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-black dark:text-white"
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
                <Label.Root className="block mb-1 text-sm font-medium text-black dark:text-white">
                  Expense Type:
                </Label.Root>
                <select
                  value={expenseTypeFilter}
                  onChange={(e) =>
                    setExpenseTypeFilter(
                      e.target.value
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-black dark:text-white"
                >
                  <option value="">
                    All Types
                  </option>
                  <option value="Conveyance">
                    Conveyance
                  </option>
                  <option value="Computer">
                    Computer
                  </option>
                  <option value="Meals">
                    Meals
                  </option>
                  <option value="Travel">
                    Travel
                  </option>
                  <option value="Office">
                    Office Expenses
                  </option>
                </select>
              </div>
              <div>
                <Label.Root className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                  Status:
                </Label.Root>
                <div className="flex flex-wrap gap-3 dark:text-white">
                  <label className="flex items-center gap-1.5 dark:text-white">
                    <input
                      type="checkbox"
                      onChange={() =>
                        toggleStatusFilter(
                          "accepted"
                        )
                      }
                      checked={statusFilter.includes(
                        "accepted"
                      )}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-green-600">
                      Approved
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      onChange={() =>
                        toggleStatusFilter(
                          "in_review"
                        )
                      }
                      checked={statusFilter.includes(
                        "in_review"
                      )}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-blue-600">
                      In Review
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      onChange={() =>
                        toggleStatusFilter(
                          "rejected"
                        )
                      }
                      checked={statusFilter.includes(
                        "rejected"
                      )}
                      className="rounded text-blue-500 focus:ring-blue-500"
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
                  className="dark:text-white dark:bg-red-700 dark:hover:bg-red-800"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
                <Button
                  variant="solid"
                  color="blue"
                  onClick={applyFilter}
                >
                  Apply
                </Button>
              </Flex>
            </div>
          </Popover.Content>
        </Popover.Root>
      </Box>

      <Box className="min-h-[81vh] relative flex flex-col rounded-[0.4rem] bg-base-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 shadow-md mt-3">
        <Box className="ml-0 sm:ml-1 md:ml-1 lg:ml-2 px-0 sm:px-1 md:px-2 lg:px-4 lg:py-2 mr-0 sm:mr-0 md:mr-1 lg:mr-2">
          <Flex
            direction="column"
            gap="10px"
          >
            <SummaryCards
              filteredExpenses={filteredExpenses}
            />
            {loading ? (
              <Box className="h-[52vh]">
                <Box className="flex justify-center items-center h-full">
                  <FadeLoader color="#2563eb" />
                </Box>
              </Box>
            ) : allExpenses.length === 0 ? (
              <Box className="h-[52vh]">
                <Box className="flex items-center justify-center h-full">
                  <Box className="text-center text-gray-600 dark:text-white text-lg">
                    Currently there are no
                    Reimbursement Requests.
                  </Box>
                </Box>
              </Box>
            ) : filteredExpenses.length === 0 ? (
              <Box className="h-[52vh] flex items-center justify-center">
                <Box className="text-center text-gray-600 dark:text-white text-lg">
                  No matching reimbursement
                  requests found.
                </Box>
              </Box>
            ) : (
              <Box className="h-[52vh]">
                <Table.Root className="my-1 sm:my-1 md:my-3 lg:my-4 p-1 lg:p-3 md:p-3 sm:p-1 mx-0 sm:mx-1 md:mx-2 lg:mx-2 rounded-lg">
                  <Table.Header>
                    <Table.Row className="text-center font-semibold text-sm sm:text-sm md:text-base lg:text-base text-black dark:text-white">
                      {[
                        "Employee ID",
                        "Employee Name",
                        "Reimbursement Type",
                        "Request Date",
                        "Amount",
                        "Status",
                        "Actions",
                      ].map(
                        (columnHeader, index) => (
                          <Table.ColumnHeaderCell
                            key={index}
                          >
                            {columnHeader}
                          </Table.ColumnHeaderCell>
                        )
                      )}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedExpenses.map(
                      (expense, index) => (
                        <Table.Row
                          key={index}
                          className="text-center dark:text-white font-medium text-xs sm:text-xs md:text-sm lg:text-sm transition-colors duration-200"
                        >
                          <Table.Cell>
                            {expense.employeeId ||
                              "Unavailable"}
                          </Table.Cell>
                          <Table.RowHeaderCell>
                            {expense.employeeName ||
                              "Unavailable"}
                          </Table.RowHeaderCell>
                          <Table.Cell>
                            {expense.reimbursement_type ||
                              "Unavailable"}
                          </Table.Cell>
                          <Table.Cell>
                            {expense.created_at ||
                              "NA"}
                          </Table.Cell>
                          <Table.Cell>
                            ₹{" "}
                            {expense.totalAmount ||
                              "Unavailable"}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              color={
                                getStatusBadgeColor(
                                  expense.status
                                ).color
                              }
                              className="dark:text-white"
                            >
                              {
                                getStatusBadgeColor(
                                  expense.status
                                ).text
                              }
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex
                              gap="2"
                              justify="center"
                            >
                              <Dialog.Root
                                onOpenChange={
                                  setDialogOpen
                                }
                              >
                                <Dialog.Trigger>
                                  <Button
                                    size="1"
                                    className="pt-1 pb-1 pl-1.5 pr-1.5 rounded-sm cursor-pointer"
                                    onClick={() =>
                                      handleExpenseClick(
                                        expense
                                      )
                                    }
                                  >
                                    View Details
                                  </Button>
                                </Dialog.Trigger>
                                <Dialog.Content
                                  className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 shadow-lg"
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
                                >
                                  <Dialog.Close
                                    asChild
                                  >
                                    <Button
                                      variant="ghost"
                                      color="gray"
                                      className="absolute top-4 right-4 p-1 rounded-full"
                                      onClick={
                                        handleDialogClose
                                      }
                                    >
                                      <IoClose className="w-5 h-5" />
                                    </Button>
                                  </Dialog.Close>
                                  {selectedExpense && (
                                    <ExpenseVoucherDetail
                                      voucherData={{
                                        ...selectedExpense,
                                        imageUrl:
                                          userImages[
                                            selectedExpense
                                              .employeeId
                                          ],
                                      }}
                                      onClose={
                                        handleDialogClose
                                      }
                                      getStatusBadgeColor={
                                        getStatusBadgeColor
                                      }
                                    />
                                  )}
                                </Dialog.Content>
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
            {!loading &&
              filteredExpenses.length >
                itemsPerPage && (
                <Flex
                  justify="center"
                  className="absolute bottom-[2vh] right-1/2 translate-x-1/2"
                >
                  <ModernPagination
                    total={
                      filteredExpenses.length
                    }
                    pageSize={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={
                      handlePageChange
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

ReimbursementAdminDashboard.propTypes = {
  organizationName: PropTypes.string,
  orgSlug: PropTypes.string,
}

export default ReimbursementAdminDashboard
