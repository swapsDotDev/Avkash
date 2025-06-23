import {
  Flex,
  Table,
  Dialog,
  Button,
  Badge,
  Box,
  Text,
  ScrollArea,
  Tabs,
} from "@radix-ui/themes"
import React, { useState, useEffect } from "react"
import { RxCrossCircled } from "react-icons/rx"
import {
  FiFileText,
  FiDollarSign,
  FiEye,
  FiDownload,
  FiInfo,
  FiPaperclip,
  FiImage,
} from "react-icons/fi"
import axios from "axios"
import toast from "react-hot-toast"
import { useUser } from "@clerk/clerk-react"
import { useTranslation } from "react-i18next"
import ModernPagination from "../../ModernPagination"
import { FadeLoader } from "react-spinners"
import SearchBox from "../../SearchBox"
import { useOrganizationContext } from "../../OrganizationContext"
import PropTypes from "prop-types"
import { format } from "date-fns"

const ReimbursementHistory = (props) => {
  const { t } = useTranslation()
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [
    reimbursementHistory,
    setReimbursementHistory,
  ] = useState([])
  const [
    filteredReimbursementHistory,
    setFilteredReimbursementHistory,
  ] = useState([])
  const [currentPage, setCurrentPage] =
    useState(0)
  const [searchVal, setSearchVal] = useState("")
  const [
    selectedReimbursement,
    setSelectedReimbursement,
  ] = useState(null)
  const itemsPerPage = 2
  const [totalItems, setTotalItems] = useState(0)
  const { organizationName, socket, org_slug } =
    useOrganizationContext()
  const [
    paginatedReimbursementHistory,
    setPaginatedReimbursementHistory,
  ] = useState([])

  const categoryMap = {
    Meals: t("meals"),
    Travel: t("Travel"),
    Conveyance: t("conveyance"),
    Computer: t("computer"),
    "Office Expense": t("office expense"),
    Other: t("other"),
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

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

  const translateReimbursementType = (
    reimbursementType
  ) => {
    if (!reimbursementType) return "multiple"
    if (Array.isArray(reimbursementType)) {
      return reimbursementType.length > 1
        ? "Multiple Categories"
        : categoryMap[reimbursementType[0]] ||
            reimbursementType[0]
    }
    return (
      categoryMap[reimbursementType] ||
      reimbursementType
    )
  }

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
    const offset = selected * itemsPerPage
    setPaginatedReimbursementHistory(
      filteredReimbursementHistory.slice(
        offset,
        offset + itemsPerPage
      )
    )
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
    if (status === "pending")
      return { color: "yellow", text: "Pending" }

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

  const fetchReimbursementHistory = () => {
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

    setLoading(true)
    axios
      .get(
        `${BASE_URL}/get_reimbursement_requests/${user.id}`,
        {
          params: {
            organization_name: organizationName,
            org_slug: effectiveOrgSlug,
          },
        }
      )
      .then((response) => {
        const formattedData =
          response.data.reimbursement_requests
            .map((item) => {
              let mainCategory =
                item.reimbursement_type ||
                "multiple"
              let totalAmount =
                item.totalAmount || 0
              let requestDate =
                item.request_date ||
                item.created_at

              if (
                item.expenses &&
                item.expenses.length > 0
              ) {
                const firstExpense =
                  item.expenses[0]
                if (firstExpense.categories) {
                  mainCategory =
                    firstExpense.categories
                      .length === 1
                      ? firstExpense.categories[0]
                      : firstExpense.categories
                }
                if (firstExpense.date) {
                  requestDate = firstExpense.date
                }
              }

              return {
                ...item,
                reimbursement_type: mainCategory,
                amount: totalAmount,
                request_date:
                  formatDate(requestDate),
                originalDate: requestDate,
                employeeId: item.employeeId || "",
              }
            })
            .sort(
              (a, b) =>
                new Date(b.created_at) -
                new Date(a.created_at)
            )

        setReimbursementHistory(formattedData)
        setFilteredReimbursementHistory(
          formattedData
        )
        setTotalItems(formattedData.length)
        setPaginatedReimbursementHistory(
          formattedData.slice(0, itemsPerPage)
        )
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        toast.error(
          "Error fetching reimbursement history"
        )
      })
  }

  useEffect(() => {
    if (searchVal === "" && organizationName) {
      fetchReimbursementHistory()
    }
  }, [
    props.refresh,
    user.id,
    organizationName,
    org_slug,
  ])

  useEffect(() => {
    const handleMessage = (event) => {
      const message = JSON.parse(event.data)
      if (
        message.type === "reimbursement_update"
      ) {
        fetchReimbursementHistory()
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
  }, [socket])

  useEffect(() => {
    setTotalItems(
      filteredReimbursementHistory.length
    )

    const maxPage =
      Math.ceil(
        filteredReimbursementHistory.length /
          itemsPerPage
      ) - 1
    if (currentPage > maxPage && maxPage >= 0) {
      setCurrentPage(maxPage)
    }

    const newOffset = currentPage * itemsPerPage
    setPaginatedReimbursementHistory(
      filteredReimbursementHistory.slice(
        newOffset,
        newOffset + itemsPerPage
      )
    )
  }, [filteredReimbursementHistory, currentPage])

  const handleDialogClose = () => {
    setCurrentPage(0)
    setSelectedReimbursement(null)
  }

  const handleSearchFilter = (val) => {
    setSearchVal(val)
    const lowerCaseSearchVal = val.toLowerCase()
    const filtered = reimbursementHistory
      .filter((reimbursement) => {
        return (
          (reimbursement.reimbursement_type &&
            (typeof reimbursement.reimbursement_type ===
            "string"
              ? reimbursement.reimbursement_type
                  .toLowerCase()
                  .includes(lowerCaseSearchVal)
              : reimbursement.reimbursement_type.some(
                  (cat) =>
                    cat
                      .toLowerCase()
                      .includes(
                        lowerCaseSearchVal
                      )
                ))) ||
          (reimbursement.status &&
            reimbursement.status
              .toLowerCase()
              .includes(lowerCaseSearchVal)) ||
          (reimbursement.request_date &&
            reimbursement.request_date
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
            reimbursement.expenses.some(
              (exp) =>
                exp.description &&
                exp.description
                  .toLowerCase()
                  .includes(lowerCaseSearchVal)
            )) ||
          (reimbursement.amount &&
            reimbursement.amount
              .toString()
              .includes(lowerCaseSearchVal))
        )
      })
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )

    setFilteredReimbursementHistory(filtered)
    setCurrentPage(0)
  }

  const openDetailsModal = (reimbursement) => {
    setSelectedReimbursement(reimbursement)
  }

  const getFileTypeIcon = (filename) => {
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
        <FiFileText className="h-10 w-10 text-blue-700" />
      )
    } else if (
      ["xls", "xlsx", "csv"].includes(extension)
    ) {
      return (
        <FiFileText className="h-10 w-10 text-green-600" />
      )
    } else {
      return (
        <FiFileText className="h-10 w-10 text-gray-500" />
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

  const ReimbursementDetails = ({
    reimbursement,
  }) => {
    return (
      <Button
        size="1"
        onClick={() =>
          openDetailsModal(reimbursement)
        }
        className="cursor-pointer"
      >
        <FiFileText /> {"view details"}
      </Button>
    )
  }

  ReimbursementDetails.propTypes = {
    reimbursement: PropTypes.shape({
      reimbursement_type: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
      ]),
      status: PropTypes.string,
      request_date: PropTypes.string,
      employeeName: PropTypes.string,
      department: PropTypes.string,
      expenses: PropTypes.arrayOf(
        PropTypes.shape({
          description: PropTypes.string,
          amount: PropTypes.number,
        })
      ),
    }).isRequired,
  }

  return (
    <Box
      className="relative flex flex-col rounded-[0.4rem] w-full p-6 py-3 shadow-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
      style={{ height: "260px" }}
    >
      <Box className="pb-1 bg-white dark:bg-gray-800 rounded-t-[0.4rem] border-b border-gray-200 dark:border-gray-700">
        <Text
          size="5"
          className="text-lg font-semibold dark:text-white"
        >
          Reimbursement History
        </Text>
      </Box>
      <div className="border-b border-gray-200 dark:border-gray-600 mb-2"></div>

      <Box className="flex w-full justify-between items-center">
        <SearchBox
          placeholder="Search Reimbursement.."
          searchValue={searchVal}
          handleOnchange={handleSearchFilter}
          style={{
            height: "24px",
          }}
        />
      </Box>

      <Box className="flex-1 px-3 pb-2 flex flex-col dark:bg-gray-800">
        {loading ? (
          <Box className="flex justify-center items-center h-full">
            <FadeLoader color="#2563eb" />
          </Box>
        ) : filteredReimbursementHistory.length ===
          0 ? (
          <Box className="flex items-center justify-center text-gray-600 dark:text-gray-300 text-lg h-full">
            {searchVal
              ? "No results found for your search"
              : "There is no reimbursement history"}
          </Box>
        ) : (
          <Box className="flex flex-col bg-white dark:bg-gray-800">
            <Table.Root className="w-full border-collapse">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell className="py-1 px-3 text-sm font-semibold text-center dark:text-white">
                    Date
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="py-1 px-3 text-sm font-semibold text-center dark:text-white">
                    Category
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="py-1 px-3 text-sm font-semibold text-center dark:text-white">
                    Amount
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="py-1 px-3 text-sm font-semibold text-center dark:text-white">
                    Status
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="py-1 px-3 text-sm font-semibold text-center dark:text-white">
                    Details
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {paginatedReimbursementHistory.map(
                  (reimbursement, k) => (
                    <Table.Row key={k}>
                      <Table.Cell className="py-1 px-3 text-sm text-center dark:text-gray-300">
                        {reimbursement.created_at
                          ? formatDate(
                              reimbursement.created_at
                            )
                          : "NA"}
                      </Table.Cell>
                      <Table.Cell className="py-1 px-3 text-sm text-center dark:text-gray-300">
                        {translateReimbursementType(
                          reimbursement.reimbursement_type
                        )}
                      </Table.Cell>
                      <Table.Cell className="py-1 px-3 text-sm text-center dark:text-gray-300">
                        {formatCurrency(
                          reimbursement.amount
                        )}
                      </Table.Cell>
                      <Table.Cell className="py-1 px-3 text-sm text-center dark:text-gray-300">
                        <Badge
                          color={
                            getStatusBadgeColor(
                              reimbursement.status
                            ).color
                          }
                          className="dark:text-white"
                        >
                          {
                            getStatusBadgeColor(
                              reimbursement.status
                            ).text
                          }
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="py-1 px-3 text-sm text-center dark:text-gray-300">
                        <ReimbursementDetails
                          reimbursement={
                            reimbursement
                          }
                        />
                      </Table.Cell>
                    </Table.Row>
                  )
                )}
              </Table.Body>
            </Table.Root>

            {filteredReimbursementHistory.length >
              2 && (
              <Box className="absolute bottom-[1vh] left-1/2 transform -translate-x-1/2 mt-1">
                <ModernPagination
                  total={totalItems}
                  pageSize={itemsPerPage}
                  siblingCount={1}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  showEdges={true}
                  style={{ height: "24px" }}
                />
              </Box>
            )}
          </Box>
        )}

        {selectedReimbursement && (
          <Dialog.Root
            open={!!selectedReimbursement}
            onOpenChange={handleDialogClose}
          >
            <Dialog.Content className="w-full max-w-4xl mx-auto h-[83vh] overflow-hidden p-4 bg-white dark:bg-gray-800 text-black dark:text-white">
              <Flex
                justify="between"
                align="center"
                className="mb-4"
              >
                <Dialog.Title className="text-xl font-bold dark:text-white">
                  Reimbursement Details
                </Dialog.Title>
                <Dialog.Close asChild>
                  <RxCrossCircled
                    size="1.5em"
                    className="cursor-pointer"
                    color="#808080"
                  />
                </Dialog.Close>
              </Flex>
              <div className="mb-4 border-b pb-4 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-4">
                  <div className="flex flex-col gap-3 sm:w-2/3">
                    <div className="flex items-center">
                      <span className="text-gray-900 dark:text-gray-300 font-bold mr-2">
                        Submitted by:
                      </span>
                      <span className="text-gray-800 dark:text-gray-400">
                        {selectedReimbursement.employeeName ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-900 dark:text-gray-300 font-bold mr-2">
                        Submitted on:
                      </span>
                      <span className="text-gray-800 dark:text-gray-400">
                        {formatDate(
                          selectedReimbursement.created_at
                        )}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-900 dark:text-gray-300 font-bold mr-2">
                        Status:
                      </span>
                      <Badge
                        color={
                          getStatusBadgeColor(
                            selectedReimbursement.status
                          ).color
                        }
                        className="dark:text-white"
                      >
                        {
                          getStatusBadgeColor(
                            selectedReimbursement.status
                          ).text
                        }
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:w-1/3 items-start sm:items-end pr-2">
                    <div className="flex items-center font-bold text-lg text-gray-800 dark:text-gray-400">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-2">
                        <FiDollarSign
                          className="text-green-600 dark:text-green-400"
                          aria-label="Amount Icon"
                        />
                      </div>
                      <span className="text-gray-800 dark:text-gray-400 font-medium">
                        {formatCurrency(
                          selectedReimbursement.totalAmount
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Tabs.Root
                defaultValue="details"
                className="w-full"
              >
                <Tabs.List
                  className="flex border-b mb-4 dark:border-gray-700"
                  aria-label="Reimbursement information"
                >
                  <Tabs.Trigger
                    value="details"
                    className="flex-1 px-4 py-2 text-center text-gray-800 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
                  >
                    <div className="flex items-center justify-center">
                      <FiInfo className="mr-2" />
                      Details
                    </div>
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="expenses"
                    className="flex-1 px-4 py-2 text-center text-gray-800 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
                  >
                    <div className="flex items-center justify-center">
                      <FiDollarSign className="mr-2" />
                      Expenses
                    </div>
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="attachments"
                    className="flex-1 px-4 py-2 text-center text-gray-800 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
                  >
                    <div className="flex items-center justify-center">
                      <FiPaperclip className="mr-2" />
                      Attachments
                    </div>
                  </Tabs.Trigger>
                </Tabs.List>

                <ScrollArea className="h-[60vh]">
                  <Tabs.Content
                    value="details"
                    className="p-1"
                  >
                    <div className="grid grid-cols-1 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-600">
                        <div className="bg-indigo-50 dark:bg-indigo-900 px-4 py-3 border-b border-indigo-100 dark:border-indigo-700">
                          <div className="flex items-center">
                            <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full mr-3">
                              <FiInfo
                                className="text-indigo-600 dark:text-indigo-400"
                                aria-label="Information Icon"
                              />
                            </div>
                            <h3 className="font-semibold text-indigo-500 dark:text-indigo-300">
                              Request Information
                            </h3>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-y-3 ml-4">
                            <div>
                              <span className="text-medium text-gray-800 dark:text-gray-300 font-bold">
                                Employee Name:
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-400 ml-4">
                                {
                                  selectedReimbursement.employeeName
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-medium text-gray-800 dark:text-gray-300 font-bold">
                                Employee ID:
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-400 ml-4">
                                {
                                  selectedReimbursement.employeeId
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-medium text-gray-800 dark:text-gray-300 font-bold">
                                Department:
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-400 ml-4">
                                {
                                  selectedReimbursement.department
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-medium text-gray-800 dark:text-gray-300 font-bold">
                                Manager:
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-400 ml-4">
                                {
                                  selectedReimbursement.manager
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-medium text-gray-800 dark:text-gray-300 font-bold">
                                Organization:
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-400 ml-4">
                                {
                                  selectedReimbursement.organization_name
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-medium text-gray-800 dark:text-gray-300 font-bold">
                                Submission Date:
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-400 ml-4">
                                {formatDate(
                                  selectedReimbursement.created_at
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-medium text-gray-800 dark:text-gray-300 font-bold">
                                Total Amount:
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-400 ml-4">
                                {formatCurrency(
                                  selectedReimbursement.totalAmount
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content
                    value="expenses"
                    className="p-1"
                  >
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-600">
                      <div className="bg-indigo-50 dark:bg-indigo-900 px-4 py-3 border-b border-indigo-100 dark:border-indigo-700">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full mr-3">
                            <FiDollarSign
                              className="text-indigo-600 dark:text-indigo-400"
                              aria-label="Expenses Icon"
                            />
                          </div>
                          <h3 className="font-semibold text-indigo-500 dark:text-indigo-300">
                            Expense Items
                          </h3>
                        </div>
                      </div>
                      <div className="p-4">
                        {selectedReimbursement.expenses &&
                        selectedReimbursement
                          .expenses.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200 dark:divide-gray-600">
                              <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-bold text-black dark:text-gray-300 uppercase tracking-wider"
                                  >
                                    Description
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-bold text-black dark:text-gray-300 uppercase tracking-wider"
                                  >
                                    Category
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-bold text-black dark:text-gray-300 uppercase tracking-wider"
                                  >
                                    Date
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-4 py-3 text-right text-xs font-bold text-black dark:text-gray-300 uppercase tracking-wider"
                                  >
                                    Amount
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-4 py-3 text-center text-xs font-bold text-black dark:text-gray-300 uppercase tracking-wider"
                                  >
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {selectedReimbursement.expenses.map(
                                  (
                                    expense,
                                    index
                                  ) => {
                                    const category =
                                      expense
                                        .categories
                                        ?.length
                                        ? expense.categories.join(
                                            ", "
                                          )
                                        : expense.otherCategory ||
                                          "NA"
                                    const expenseStatus =
                                      expense.status ||
                                      "pending"

                                    return (
                                      <tr
                                        key={`expense-${index}`}
                                      >
                                        <td className="px-4 py-3 text-sm max-w-[200px] break-words whitespace-normal dark:text-gray-300">
                                          {expense.description ||
                                            "NA"}
                                        </td>
                                        <td className="px-4 py-3 text-sm dark:text-gray-300">
                                          {
                                            category
                                          }
                                        </td>
                                        <td className="px-4 py-3 text-sm dark:text-gray-300">
                                          {formatDate(
                                            expense.date
                                          ) ||
                                            "NA"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right dark:text-gray-300">
                                          {formatCurrency(
                                            expense.amount
                                          ) ||
                                            "NA"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center dark:text-gray-300">
                                          <Badge
                                            color={
                                              getStatusBadgeColor(
                                                expenseStatus
                                              )
                                                .color
                                            }
                                            className="dark:text-white"
                                          >
                                            {
                                              getStatusBadgeColor(
                                                expenseStatus
                                              )
                                                .text
                                            }
                                          </Badge>
                                        </td>
                                      </tr>
                                    )
                                  }
                                )}
                              </tbody>
                              <tfoot className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                  <td
                                    colSpan="4"
                                    className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 text-right"
                                  >
                                    Total
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">
                                    {formatCurrency(
                                      selectedReimbursement.totalAmount
                                    )}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-300">
                            No expenses available.
                          </p>
                        )}
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content
                    value="attachments"
                    className="p-1"
                  >
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-600">
                      <div className="bg-indigo-50 dark:bg-indigo-900 px-4 py-3 border-b border-indigo-100 dark:border-indigo-700">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full mr-3">
                            <FiPaperclip
                              className="text-indigo-600 dark:text-indigo-400"
                              aria-label="Attachments Icon"
                            />
                          </div>
                          <h3 className="font-semibold text-indigo-500 dark:text-indigo-300">
                            Attachments
                          </h3>
                        </div>
                      </div>
                      <div className="p-6">
                        {selectedReimbursement.expenses &&
                        selectedReimbursement.expenses.some(
                          (exp) =>
                            exp.attachments &&
                            exp.attachments
                              .length > 0
                        ) ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedReimbursement.expenses.flatMap(
                              (
                                expense,
                                expIndex
                              ) =>
                                expense.attachments.map(
                                  (
                                    attachment,
                                    attIndex
                                  ) => (
                                    <div
                                      key={`attachment-${expIndex}-${attIndex}`}
                                      className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                                    >
                                      {getFileTypeIcon(
                                        attachment.filename ||
                                          "unknown"
                                      )}
                                      <div className="mt-2 text-center text-gray-700 dark:text-gray-300 w-full">
                                        <p className="text-sm truncate max-w-full px-2">
                                          {attachment.filename ||
                                            "Unnamed File"}
                                        </p>
                                      </div>
                                      <div className="flex gap-2 mt-3 w-full justify-center">
                                        <button
                                          className="px-2 py-1 bg-indigo-50 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded text-xs flex items-center hover:bg-indigo-100 dark:hover:bg-indigo-700 transition-colors"
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
                                        </button>
                                        {(attachment.filename
                                          ?.toLowerCase()
                                          .endsWith(
                                            ".pdf"
                                          ) ||
                                          (attachment.content_type &&
                                            attachment.content_type.startsWith(
                                              "image/"
                                            ))) && (
                                          <button
                                            className="px-2 py-1 bg-indigo-50 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded text-xs flex items-center hover:bg-indigo-100 dark:hover:bg-indigo-700 transition-colors"
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
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-300 text-center py-8">
                            No attachments
                            available.
                          </p>
                        )}
                      </div>
                    </div>
                  </Tabs.Content>
                </ScrollArea>
              </Tabs.Root>
            </Dialog.Content>
          </Dialog.Root>
        )}
      </Box>
    </Box>
  )
}

ReimbursementHistory.propTypes = {
  refresh: PropTypes.bool,
  organizationName: PropTypes.string,
  org_slug: PropTypes.string,
  socket: PropTypes.object,
}

ReimbursementHistory.defaultProps = {
  refresh: false,
}

export default ReimbursementHistory
