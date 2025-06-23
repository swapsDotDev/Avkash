import React, { useState, useEffect } from "react"
import {
  Table,
  Text,
  Flex,
  Box,
  Button,
} from "@radix-ui/themes"
import * as Dialog from "@radix-ui/react-dialog"
import TitleCard from "../../Cards/Titlepayslipcard"
import "./Billingpayslip.css"
import * as Form from "@radix-ui/react-form"
import { RxCrossCircled } from "react-icons/rx"
import axios from "axios"
import toast from "react-hot-toast"
import ModernPagination from "../../ModernPagination"
import SearchBox from "../../SearchBox"
import { useOrganizationContext } from "../../OrganizationContext"
import PropTypes from "prop-types"

const TopSideButtons = ({
  onRecentClick,
  onHistoryClick,
  showRecent,
  searchVal,
  handleSearchFilter,
}) => {
  return (
    <Box className="flex space-x-2 font-normal">
      <SearchBox
        placeholder="Search Employee"
        searchValue={searchVal}
        handleOnchange={handleSearchFilter}
      />
      <button
        className={`${
          showRecent
            ? "bg-gray-400 dark:gray-700 h-8 w-15 p-1 rounded-md font-medium text-base dark:text-black"
            : "bg-gray-200 dark:text-black h-8 w-15 p-1 rounded-md font-medium text-base"
        }`}
        onClick={onRecentClick}
      >
        Employee
      </button>
      <button
        className={`${
          showRecent
            ? "bg-gray-200 dark:gray-700 h-8 w-15 p-1 rounded-md font-medium text-base dark:text-black"
            : "bg-gray-400 dark:text-black h-8 w-15 p-1 rounded-md font-medium text-base"
        }`}
        onClick={onHistoryClick}
      >
        History
      </button>
    </Box>
  )
}
TopSideButtons.propTypes = {
  onRecentClick: PropTypes.func.isRequired,
  onHistoryClick: PropTypes.func.isRequired,
  showRecent: PropTypes.bool.isRequired,
  searchVal: PropTypes.string.isRequired,
  handleSearchFilter: PropTypes.func.isRequired,
}

const BillingPage = () => {
  const [selectedItem, setSelectedItem] =
    useState(null)
  const [paid_date, setPaidDate] = useState("")
  const [paid_month, setPaidMonth] = useState(
    getPreviousYearMonth()
  )
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [formData, setFormData] = useState([])
  const [openForm, setOpenForm] = useState(false)
  const [billingData, setBillingData] = useState(
    []
  )
  const [showRecent, setShowRecent] =
    useState(true)
  const [totaldayshours, setTotaldayshours] =
    useState([])
  const [paidDateError, setPaidDateError] =
    useState(false)
  const [paidMonthError] = useState(false)
  const [validdate, setValiddate] =
    useState(false)
  const [validmonth, setValidmonth] =
    useState(false)
  const [paidDays, setPaidDays] = useState([])
  const [count, setCount] = useState(0)
  const [currentPage, setCurrentPage] =
    useState(0)
  const formDataitemsPerPage = 9
  const billingDataitemsPerPage = 9
  const [searchVal, setSearchVal] = useState("")
  const [filteredformData, setFilteredformData] =
    useState([])
  const [
    filteredbillingData,
    setFilteredbillingData,
  ] = useState([])
  const totalPages = Math.ceil(
    showRecent
      ? filteredformData.length /
          formDataitemsPerPage
      : filteredbillingData.length /
          billingDataitemsPerPage
  )
  const { organizationName, org_slug, socket } =
    useOrganizationContext()
  function getPreviousYearMonth() {
    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth()
    if (month === 0) {
      month = 11
      year--
    } else {
      month--
    }
    month = (month + 1)
      .toString()
      .padStart(2, "0")
    return `${year}-${month}`
  }

  function getCurrentDate() {
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1)
      .toString()
      .padStart(2, "0")
    const day = today
      .getDate()
      .toString()
      .padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const fetchBillingAndUserPayslip = async () => {
    try {
      let billingDataArray = []
      try {
        const billing = await axios.get(
          `${BASE_URL}/payslip_billing`,
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          }
        )

        const Data =
          billing.data.payslip_data || []

        if (Array.isArray(Data)) {
          billingDataArray = Data
        } else if (
          typeof Data === "object" &&
          Data !== null
        ) {
          billingDataArray = [Data]
        }
      } catch (error) {
        // Silently handle 404 errors
      }

      setBillingData(billingDataArray)
      setFilteredbillingData(billingDataArray)

      const payslipSentMap = {}
      const previousMonth = getPreviousYearMonth()

      billingDataArray.forEach((payslip) => {
        if (
          payslip.user_id &&
          payslip.paid_month
        ) {
          const key = `${payslip.user_id}-${payslip.paid_month}`
          payslipSentMap[key] = true
        }
      })

      let backendWithPayslipSent = []
      try {
        const response = await axios.get(
          `${BASE_URL}/user_payslip`,
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          }
        )

        const backend =
          response.data.payslip_data || []

        backendWithPayslipSent = Array.isArray(
          backend
        )
          ? backend.map((item) => ({
              ...item,
              payslip_sent:
                payslipSentMap[
                  `${item.user_id}-${previousMonth}`
                ] || false,
            }))
          : []
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error(
            "Error fetching employee data"
          )
        }
      }

      setFormData(backendWithPayslipSent)
      setFilteredformData(backendWithPayslipSent)

      return {
        billingData: billingDataArray,
        userData: backendWithPayslipSent,
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status !== 404
      ) {
        toast.error("Error fetching payslip data")
      }
      return { billingData: [], userData: [] }
    }
  }

  const acceptedleaves = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/get_accepted_leave`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      const leaveRequests =
        response.data.leave_requests || []
      const countValue = response.data.count || 0
      setPaidDays(leaveRequests)
      setCount(countValue)
    } catch (error) {
      if (error.response) {
        setPaidDays([])
        setCount(0)
        toast.error(
          "Error fetching leave requests"
        )
      }
    }
  }

  const fetchTotalhours = async () => {
    try {
      const billinghours = await axios.get(
        `${BASE_URL}/billing_working_hours`,
        {
          params: {
            organization_name: organizationName,
            org_slug,
          },
        }
      )
      const backendbillinghours =
        billinghours.data.user_data || []
      setTotaldayshours(backendbillinghours)
    } catch (error) {
      if (error.response) {
        setTotaldayshours([])
        toast.error(
          "Error fetching check-in status"
        )
      }
    }
  }

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await fetchBillingAndUserPayslip()

        await Promise.all([
          fetchTotalhours(),
          acceptedleaves(),
        ])
      } catch (error) {
        toast.error("Failed to load data")
      }
    }

    fetchAllData()
  }, [BASE_URL, currentPage, showRecent])

  useEffect(() => {
    if (socket) {
      const handleMessage = async (event) => {
        if (event.data === "Submited") {
          await fetchBillingAndUserPayslip()
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
    }
  }, [socket])

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  const [Basic_Salary, setBasicSalary] = useState(
    selectedItem?.basicSalary || "0"
  )
  const [Prof_Tax, setProfTax] = useState(
    selectedItem?.profTax || "0"
  )
  const [Insurance, setInsurance] = useState(
    selectedItem?.insurances || "0"
  )
  const [Income_Tax, setIncomeTax] = useState(
    selectedItem?.incomeTax || "0"
  )

  const openModal = (item) => {
    setSelectedItem(item)
    setBasicSalary(item?.basicSalary || "0")
    setProfTax(item?.profTax || "0")
    setInsurance(item?.insurances || "0")
    setIncomeTax(item?.incomeTax || "0")
  }

  const handleSendPayslipClick = (item) => {
    if (item.payslip_sent) {
      toast.error(
        "Payslip already sent for this month"
      )
      return
    }

    if (!item.AccNumber) {
      toast.error(
        "Employee has not filled the details."
      )
      return
    }

    if (!item.ctc) {
      toast.error(
        "Please provide the required employee details."
      )
      return
    }

    openModal(item)
    setOpenForm(true)
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!paid_date) {
      setPaidDateError(true)
      toast.error("Paid Date is required")
      return
    }
    if (!selectedItem) {
      toast.error("No employee selected")
      setOpenForm(false)
      return
    }
    const joinedMonth =
      new Date(
        selectedItem.DateOfJoining
      ).getMonth() + 1
    const joinedYear = new Date(
      selectedItem.DateOfJoining
    ).getFullYear()
    const paidMonth =
      new Date(paid_month).getMonth() + 1
    const paidYear = new Date(
      paid_month
    ).getFullYear()
    if (paid_date < selectedItem.DateOfJoining) {
      setValiddate(true)
      toast.error(
        "Paid Date cannot be before Date of Joining"
      )
      return
    }

    if (
      paidYear < joinedYear ||
      (paidYear === joinedYear &&
        paidMonth < joinedMonth)
    ) {
      setValidmonth(true)
      return
    }

    const userId = selectedItem.user_id
    const userTotalHoursData = Array.isArray(
      totaldayshours
    )
      ? totaldayshours.find(
          (item) => item.user_id === userId
        )
      : null
    const usertotaldayshours = userTotalHoursData
      ? userTotalHoursData.total_worked_hours
      : 0
    const leave_balance = Array.isArray(paidDays)
      ? paidDays.find(
          (items) => items.user_id === userId
        )?.leave_remaining || 0
      : 0
    const totalSpan = Array.isArray(paidDays)
      ? paidDays
          .filter(
            (items) => items.user_id === userId
          )
          .reduce(
            (sum, items) => sum + items.span,
            0
          )
      : 0
    const totalLop =
      totalSpan - leave_balance >= 0
        ? totalSpan - leave_balance
        : 0

    try {
      const response = await axios.post(
        `${BASE_URL}/payslip`,
        {
          user_id: selectedItem.user_id,
          username: selectedItem.username,
          designation: selectedItem.designation,
          lop: totalLop,
          paiddays: count - totalLop,
          total_hours: usertotaldayshours,
          basic_salary: Basic_Salary,
          professional_tax: Prof_Tax,
          insurance: Insurance,
          income_tax: Income_Tax,
          paid_date: paid_date,
          paid_month: paid_month,
          organization_name: organizationName,
          org_slug: org_slug,
        },
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )

      if (
        response &&
        response.status === 200 &&
        response.data.message ===
          "Payslip Send successfully"
      ) {
        toast.success(response.data.message)
        if (
          socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          socket.send("Submited")
        }
        await fetchBillingAndUserPayslip()
      } else {
        toast.error(
          response.data.message ||
            "Failed to submit payslip"
        )
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 409
      ) {
        toast.error("Payslip already present.")
      } else {
        toast.error(
          "Error applying: " + error.message
        )
      }
    } finally {
      setOpenForm(false)
      setPaidDate("")
      setPaidMonth(getPreviousYearMonth())
      setPaidDateError(false)
      setValiddate(false)
      setValidmonth(false)
    }
  }

  const handleRecentClick = () => {
    setShowRecent(true)
    setCurrentPage(0)
  }

  const handleHistoryClick = () => {
    setShowRecent(false)
    setCurrentPage(0)
  }
  const offsetBilling =
    currentPage * billingDataitemsPerPage
  const paginatedBillingData =
    filteredbillingData.slice(
      offsetBilling,
      offsetBilling + billingDataitemsPerPage
    )
  const offsetForms =
    currentPage * formDataitemsPerPage
  const paginatedFormData =
    filteredformData.slice(
      offsetForms,
      offsetForms + formDataitemsPerPage
    )

  const getMonthName = (monthNumber) => {
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
    return months[monthNumber - 1]
  }
  const handleSearchFilter = (val) => {
    setSearchVal(val)
    const lowerCaseSearchVal = val.toLowerCase()
    if (
      totalPages <= currentPage &&
      totalPages > 0
    ) {
      setCurrentPage(totalPages - 1)
    }
    const previousMonth = getPreviousYearMonth()
    const previousMonthNumber = parseInt(
      previousMonth.split("-")[1],
      10
    )
    const previousYear =
      previousMonth.split("-")[0]
    const filtered = formData.filter((data) => {
      const month = getMonthName(
        previousMonthNumber
      )
      const year = previousYear
      return (
        (data.username &&
          data.username
            .toLowerCase()
            .includes(lowerCaseSearchVal)) ||
        (data.designation &&
          data.designation
            .toLowerCase()
            .includes(lowerCaseSearchVal)) ||
        month
          .toLowerCase()
          .includes(lowerCaseSearchVal) ||
        year
          .toLowerCase()
          .includes(lowerCaseSearchVal)
      )
    })
    setFilteredformData(filtered)
  }

  const handleSearchFilter2 = (val) => {
    setSearchVal(val)
    const lowerCaseSearchVal = val.toLowerCase()
    if (
      totalPages <= currentPage &&
      totalPages > 0
    ) {
      setCurrentPage(totalPages - 1)
    }
    const filtered = billingData.filter(
      (data) => {
        const paidMonthYear = `${getMonthName(
          new Date(data.paid_month).getMonth() + 1
        )} ${new Date(data.paid_month).getFullYear()}`.toLowerCase()
        const totalMoney = Math.floor(
          data.total_money
        ).toString()
        return (
          (data.username &&
            data.username
              .toLowerCase()
              .includes(lowerCaseSearchVal)) ||
          (data.email &&
            data.email
              .toLowerCase()
              .includes(lowerCaseSearchVal)) ||
          (data.designation &&
            data.designation
              .toLowerCase()
              .includes(lowerCaseSearchVal)) ||
          paidMonthYear.includes(
            lowerCaseSearchVal
          ) ||
          totalMoney.includes(lowerCaseSearchVal)
        )
      }
    )
    setFilteredbillingData(filtered)
  }

  return (
    <Box className="w-full h-full shadow-md">
      <TitleCard
        title="Transactions"
        topMargin="mt-2"
        TopSideButtons={
          <TopSideButtons
            onRecentClick={handleRecentClick}
            onHistoryClick={handleHistoryClick}
            showRecent={showRecent}
            searchVal={searchVal}
            handleSearchFilter={
              showRecent
                ? handleSearchFilter
                : handleSearchFilter2
            }
          />
        }
      >
        <Box className="overflow-hidden w-full min-h-[72vh]">
          <Table.Root className="h-full">
            <Table.Header className="bg-white dark:bg-gray-800 text-black dark:text-white">
              <Table.Row>
                <Table.ColumnHeaderCell className="w-56 text-center">
                  <Text className="font-semibold text-center text-base dark:text-white">
                    Name
                  </Text>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-56 text-center">
                  <Text className="font-semibold text-center text-base dark:text-white">
                    Email
                  </Text>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-56 text-center">
                  <Text className="font-semibold text-center text-base dark:text-white">
                    Designation
                  </Text>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-55 text-center">
                  <Text className="font-semibold text-center text-base dark:text-white">
                    {showRecent
                      ? "Month"
                      : "Status"}
                  </Text>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-55 text-center">
                  <Text className="font-semibold text-center text-base dark:text-white">
                    {showRecent
                      ? "Year"
                      : "Month"}
                  </Text>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-56 text-center">
                  <Text className="font-semibold text-center text-base ml-2 dark:text-white">
                    {showRecent
                      ? "Action"
                      : "Amount"}
                  </Text>
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {showRecent &&
                paginatedFormData.map(
                  (item, index) => (
                    <Table.Row
                      key={index}
                      className="bg-white dark:bg-gray-800"
                    >
                      <Table.RowHeaderCell className="text-center text-black dark:text-white">
                        {item.username}
                      </Table.RowHeaderCell>
                      <Table.Cell className="text-center text-black dark:text-white">
                        {item.email
                          ? item.email
                          : "---"}
                      </Table.Cell>
                      <Table.Cell className="text-center text-black dark:text-white">
                        {item.designation
                          ? item.designation
                          : "---"}
                      </Table.Cell>
                      <Table.Cell className="text-center text-black dark:text-white">
                        {getMonthName(
                          parseInt(
                            getPreviousYearMonth().split(
                              "-"
                            )[1],
                            10
                          )
                        )}
                      </Table.Cell>
                      <Table.Cell className="text-center text-black dark:text-white">
                        {
                          getPreviousYearMonth().split(
                            "-"
                          )[0]
                        }
                      </Table.Cell>
                      <Table.Cell className="text-center text-black dark:text-white">
                        <Button
                          size="1"
                          variant="soft"
                          className={`pt-1 pb-1 pl-1.5 pr-1.5 rounded-sm text-white dark:text-white ${
                            !item.AccNumber ||
                            !item.ctc
                              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                              : item.payslip_sent
                                ? "bg-gray-300 dark:bg-blue-700 cursor-pointer"
                                : "bg-blue-400 cursor-pointer"
                          }`}
                          title={
                            !item.AccNumber
                              ? "Employee has not filled the details"
                              : !item.ctc
                                ? "Please provide the required employee details"
                                : item.payslip_sent
                                  ? "Payslip already sent for this month"
                                  : "Send Payslip"
                          }
                          onClick={() =>
                            handleSendPayslipClick(
                              item
                            )
                          }
                          disabled={
                            !item.AccNumber ||
                            !item.ctc
                          }
                        >
                          {item.payslip_sent
                            ? "Payslip Sent"
                            : "Send Payslip"}
                        </Button>

                        {openForm &&
                          selectedItem?.user_id ===
                            item.user_id && (
                            <Dialog.Root
                              open={openForm}
                              onOpenChange={
                                setOpenForm
                              }
                            >
                              <Dialog.Portal>
                                <Dialog.Overlay className="DialogOverlay bg-black/50 dark:bg-black/70" />
                                <Dialog.Content className="DialogContent bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-md">
                                  <Dialog.Title className="DialogTitle text-black dark:text-white">
                                    Enter Payment
                                    Details
                                  </Dialog.Title>
                                  <Dialog.Description className="DialogDescription text-black dark:text-white">
                                    Please enter
                                    payment
                                    details for{" "}
                                    <Text className="font-bold text-black dark:text-white">
                                      {
                                        selectedItem?.username
                                      }
                                    </Text>
                                    .
                                  </Dialog.Description>
                                  <Form.Root className="w-full">
                                    <Form.Field name="Basic_Salary">
                                      <Flex className="mt-3">
                                        <Form.Label className="FormLabel">
                                          Basic
                                          Salary:
                                        </Form.Label>
                                        <Form.Control
                                          asChild
                                        >
                                          <input
                                            onChange={(
                                              e
                                            ) =>
                                              setBasicSalary(
                                                e
                                                  .target
                                                  .value
                                              )
                                            }
                                            readOnly
                                            value={
                                              Basic_Salary
                                            }
                                            id="Basic_Salary"
                                            name="Basic_Salary"
                                            className="Input ml-3 p-1 w-24 border border-gray-300 rounded-md"
                                            type="number"
                                            required
                                          />
                                        </Form.Control>
                                      </Flex>
                                    </Form.Field>
                                    <Form.Field name="Prof_Tax">
                                      <Flex className="mt-3">
                                        <Form.Label className="FormLabel">
                                          P.Tax:
                                        </Form.Label>
                                        <Form.Control
                                          asChild
                                        >
                                          <input
                                            readOnly
                                            onChange={(
                                              e
                                            ) =>
                                              setProfTax(
                                                e
                                                  .target
                                                  .value
                                              )
                                            }
                                            value={
                                              Prof_Tax
                                            }
                                            id="Prof_Tax"
                                            name="Prof_Tax"
                                            className="Input ml-[13.5%] p-1 w-24 border border-gray-300 rounded-md"
                                            type="number"
                                            required
                                          />
                                        </Form.Control>
                                      </Flex>
                                    </Form.Field>
                                    <Form.Field name="Insurance">
                                      <Flex className="mt-3">
                                        <Form.Label className="FormLabel">
                                          Insurance:
                                        </Form.Label>
                                        <Form.Control
                                          asChild
                                        >
                                          <input
                                            readOnly
                                            onChange={(
                                              e
                                            ) =>
                                              setInsurance(
                                                e
                                                  .target
                                                  .value
                                              )
                                            }
                                            value={
                                              Insurance
                                            }
                                            id="Insurance"
                                            name="Insurance"
                                            className="Input ml-5 p-1 w-24 border border-gray-300 rounded-md"
                                            type="number"
                                            required
                                          />
                                        </Form.Control>
                                      </Flex>
                                    </Form.Field>
                                    <Form.Field name="Income_Tax">
                                      <Flex className="mt-3">
                                        <Form.Label className="FormLabel">
                                          Income
                                          Tax:
                                        </Form.Label>
                                        <Form.Control
                                          asChild
                                        >
                                          <input
                                            readOnly
                                            onChange={(
                                              e
                                            ) =>
                                              setIncomeTax(
                                                e
                                                  .target
                                                  .value
                                              )
                                            }
                                            value={
                                              Income_Tax
                                            }
                                            id="Income_Tax"
                                            name="Income_Tax"
                                            className="Input ml-2.5 p-1 w-24 border border-gray-300 rounded-md"
                                            type="number"
                                            required
                                          />
                                        </Form.Control>
                                      </Flex>
                                    </Form.Field>
                                    <Form.Field
                                      className="grid mb-[10px]"
                                      name="startDate"
                                    >
                                      <Flex className="flex items-baseline justify-between">
                                        <Form.Label
                                          for="session-date"
                                          className="FormLabel"
                                        >
                                          Paid
                                          Date:
                                        </Form.Label>
                                        <Form.Control
                                          asChild
                                        >
                                          <input
                                            required
                                            type="date"
                                            id="session-date"
                                            name="session-date"
                                            max={getCurrentDate()}
                                            onChange={(
                                              e
                                            ) => {
                                              setPaidDate(
                                                e
                                                  .target
                                                  .value
                                              )
                                              setPaidDateError(
                                                false
                                              )
                                            }}
                                            value={
                                              paid_date
                                            }
                                            className={`Inputdate ml-5 mt-3 ${
                                              paidDateError
                                                ? "border-red-500"
                                                : ""
                                            }`}
                                          />
                                        </Form.Control>
                                      </Flex>
                                    </Form.Field>
                                    <Form.Field
                                      className="grid mb-[10px]"
                                      name="paid_month"
                                    >
                                      <Flex className="flex items-baseline justify-between">
                                        <Form.Label
                                          for="session-month"
                                          className="FormLabel"
                                        >
                                          Month
                                          Year:
                                        </Form.Label>
                                        <Form.Control
                                          asChild
                                        >
                                          <input
                                            readOnly
                                            required
                                            type="month"
                                            id="session-month"
                                            name="session-month"
                                            value={getPreviousYearMonth()}
                                            className="Inputdate ml-2 mt-1"
                                          />
                                        </Form.Control>
                                      </Flex>
                                      {paidDateError && (
                                        <Box className="ml-[25%] felx font-medium text-sm">
                                          <Text className="text-red-500">
                                            Paid
                                            Date
                                            is
                                            required
                                          </Text>
                                        </Box>
                                      )}
                                      {paidMonthError && (
                                        <Box className=" flex ml-[25%] font-medium text-sm ">
                                          <Text className="text-red-500">
                                            Paid
                                            Month
                                            is
                                            required
                                          </Text>
                                        </Box>
                                      )}
                                      {validdate && (
                                        <Box className="flex ml-[25%] font-medium text-sm">
                                          <Text className="text-red-500">
                                            Invalid
                                            Paid
                                            Date
                                          </Text>
                                        </Box>
                                      )}
                                      {validmonth && (
                                        <Box className="flex ml-[25%] font-medium text-sm">
                                          <Text className="text-red-500">
                                            Invalid
                                            Paid
                                            Month
                                          </Text>
                                        </Box>
                                      )}
                                    </Form.Field>

                                    <Dialog.Close
                                      asChild
                                    >
                                      <RxCrossCircled
                                        size="1.5em"
                                        className="crosscircleclose text-black dark:text-white"
                                      />
                                    </Dialog.Close>
                                    <Box className="flex justify-end mb-3 mt-6">
                                      <Dialog.Close>
                                        <Button
                                          variant="soft"
                                          color="red"
                                          style={{
                                            padding:
                                              "0.3rem 0.8rem",
                                            borderRadius:
                                              "0.375rem",
                                          }}
                                          className="text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-800 dark:text-white rounded-md px-5 py-2.5 font-medium text-sm transition-all duration-300"
                                        >
                                          Cancel
                                        </Button>
                                      </Dialog.Close>
                                      <Dialog.Close
                                        asChild
                                      >
                                        <Button
                                          variant="solid"
                                          color="indigo"
                                          type="submit"
                                          onClick={
                                            handleApply
                                          }
                                          style={{
                                            padding:
                                              "0.3rem 0.8rem",
                                            borderRadius:
                                              "0.375rem",
                                            marginLeft:
                                              "1rem",
                                          }}
                                        >
                                          Apply
                                        </Button>
                                      </Dialog.Close>
                                    </Box>
                                  </Form.Root>
                                </Dialog.Content>
                              </Dialog.Portal>
                            </Dialog.Root>
                          )}
                      </Table.Cell>
                    </Table.Row>
                  )
                )}
              {!showRecent &&
                paginatedBillingData.map(
                  (item, index) => (
                    <Table.Row
                      key={index}
                      className="text-center bg-white dark:bg-gray-800 text-black dark:text-white"
                    >
                      <Table.RowHeaderCell>
                        {item.username}
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        {item.email}
                      </Table.Cell>
                      <Table.Cell>
                        {item.designation}
                      </Table.Cell>
                      <Table.Cell>
                        <Text
                          className="badge badge-success text-sm font-medium"
                          style={{
                            color: "white",
                          }}
                        >
                          Sent
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        {getMonthName(
                          new Date(
                            item.paid_month
                          ).getMonth() + 1
                        )}{" "}
                        {new Date(
                          item.paid_month
                        ).getFullYear()}
                      </Table.Cell>
                      <Table.Cell>
                        {Math.floor(
                          item.total_money
                        )}
                      </Table.Cell>
                    </Table.Row>
                  )
                )}
              {!showRecent &&
                filteredbillingData.length ===
                  0 && (
                  <Table.Row>
                    <Table.Cell colSpan={6}>
                      <Text className="text-black dark:text-white text-center">
                        No historical data
                        available.
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )}
              {showRecent &&
                filteredformData.length === 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={6}>
                      <Text className="text-black dark:text-white text-center">
                        No employees found.
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )}
            </Table.Body>
          </Table.Root>
        </Box>

        {(showRecent
          ? filteredformData.length >
            formDataitemsPerPage
          : filteredbillingData.length >
            billingDataitemsPerPage) && (
          <Flex
            justify="center"
            className="absolute bottom-[1vh] left-1/2 transform -translate-x-1/2 z-10"
          >
            <ModernPagination
              total={
                showRecent
                  ? filteredformData.length
                  : filteredbillingData.length
              }
              pageSize={
                showRecent
                  ? formDataitemsPerPage
                  : billingDataitemsPerPage
              }
              currentPage={currentPage}
              onPageChange={handlePageChange}
              showEdges={true}
              siblingCount={1}
            />
          </Flex>
        )}
      </TitleCard>
    </Box>
  )
}

export default BillingPage
