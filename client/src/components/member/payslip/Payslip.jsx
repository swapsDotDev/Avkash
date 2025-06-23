import React, { useState, useEffect } from "react"
import Payslipcard from "./Payslipcard"
import { useTranslation } from "react-i18next"
import "./Payslip.css"
import { CiFilter } from "react-icons/ci"
import toast from "react-hot-toast"
import Titlepayslipcard from "../../Cards/Titlepayslipcard"
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon"
import {
  Text,
  Table,
  Box,
  Flex,
  Button,
} from "@radix-ui/themes"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import axios from "axios"
import { useUser } from "@clerk/clerk-react"
import ModernPagination from "../../ModernPagination"
import { useOrganizationContext } from "../../OrganizationContext"
import PropTypes from "prop-types"

const Payslip = () => {
  const { t } = useTranslation()
  const defaultYear = new Date().getFullYear()
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [selectedMonth, setSelectedMonth] =
    useState(null)
  const [selectedYear, setSelectedYear] =
    useState(defaultYear)
  const [formData, setFormData] = useState([])
  const [payslipData, setPayslipData] = useState(
    []
  )
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [completedYears, setCompletedYears] =
    useState([])
  const [currentPage, setCurrentPage] =
    useState(0)
  const itemsPerPage = 9
  const dateOfJoining = new Date(
    formData.DateOfJoining
  )
  const joiningYear = dateOfJoining.getFullYear()
  const currentYear = new Date().getFullYear()
  const {
    organizationName,
    organizationImage,
    org_slug,
    socket,
  } = useOrganizationContext()
  const [, setCurrentTheme] = useState(
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

  const calculateGrossSalary = (payslip) => {
    return payslip.basic
  }

  const calculateNetPay = (payslip) => {
    return payslip.netpay
  }

  const handleCardClick = (payslip) => {
    setSelectedMonth(payslip)
  }

  const commanData = {
    companyData:
      organizationImage ===
      "https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yZE9IR3A1a2MxM3BSMVNYWUtwRnJBbmJQQWMiLCJyaWQiOiJvcmdfMmZ0Y1RiWUsxR3Bhc0ZGekhxT3ZNM2tOdjdmIiwiaW5pdGlhbHMiOiJHIn0"
        ? ""
        : organizationImage,
    companyName: organizationName,
    address: t("address"),
  }

  const handleCancel = () => {
    setSelectedMonth(null)
  }

  const getuserdata = () => {
    axios
      .get(`${BASE_URL}/user/${user.id}`, {
        params: {
          organization_name: organizationName,
          org_slug: org_slug,
        },
      })
      .then((response) => {
        const backend = response.data.user_data[0]
        setFormData(backend)
      })
      .catch(() => {
        toast.error("Error fetching user data")
      })
  }
  const getpayslipdata = () => {
    axios
      .get(
        `${BASE_URL}/payslip_data/${user.id}`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then((responsedata) => {
        const backenddata =
          responsedata.data.user_data
        if (Array.isArray(backenddata)) {
          setPayslipData(backenddata)
        } else if (
          typeof backenddata === "object"
        ) {
          setPayslipData([backenddata])
        }
      })
      .catch(() => {
        toast.error("Error fetching payslip data")
      })
  }
  useEffect(() => {
    setFormData({
      user_id: user.id,
    })
    getuserdata()
    getpayslipdata()
    const yearsSinceJoining = Array.from(
      { length: currentYear - joiningYear + 1 },
      (_, index) => joiningYear + index
    )
    setCompletedYears(
      yearsSinceJoining.filter(
        (year) => year < currentYear
      )
    )

    const handleMessage = () => {
      getpayslipdata()
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

  const TopSideButtons = () => {
    const availableYears = [
      ...completedYears,
      defaultYear,
    ]

    return (
      <Box className="w-1/12 mr-12">
        <Box>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex font-medium text-lg rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-blue-700 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            <CiFilter className="h-5 w-5 text-white dark:text-gray-200" />
            {t("Filter")}
          </Button>
        </Box>
        {isOpen && (
          <Box className="absolute z-10 right-14 pb-1 border top-14 w-28 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-gray-200 dark:border-gray-600">
            <Box className="flex justify-between items-center mt-1 px-4">
              <Text className="text-lg font-medium text-black dark:text-white">
                {t("Years")}
              </Text>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </Box>
            <Box className="pl-2.5 mt-0.5 pr-2.5">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    handleSelect(year)
                  }}
                  className={`flex px-7 py-1 text-base font-semibold w-full ${
                    selectedYear === year
                      ? "text-white bg-blue-500 rounded-lg"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  } transition-colors duration-200`}
                >
                  {year}
                </button>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    )
  }

  const handleSelect = (year) => {
    setSelectedYear(year)
    setSelectedMonth(null)
  }

  const getMonthName = (monthNumber) => {
    const months = [
      t("January"),
      t("February"),
      t("March"),
      t("April"),
      t("May"),
      t("June"),
      t("July"),
      t("August"),
      t("September"),
      t("October"),
      t("November"),
      t("December"),
    ]
    return months[monthNumber - 1]
  }

  const displayedPayslips = payslipData
    .filter(
      (payslip) =>
        new Date(
          payslip.paid_month
        ).getFullYear() === selectedYear
    )
    .map((payslip) => {
      const dateObj = new Date(payslip.paid_month)
      const year = dateObj.getFullYear()
      const month = dateObj.getMonth() + 1

      return {
        employee_id: formData.employee_id,
        month: getMonthName(month),
        year: year,
        designation: formData.designation,
        payPeriod: `${getMonthName(month)} ${year}`,
        payDate: payslip.paid_date,
        joiningdate: formData.DateOfJoining,
        bankName: formData.BankName,
        accountNo: formData.AccNumber,
        pan: formData.PanNumber,
        basic: payslip.basic_salary.toFixed(2),
        overtime:
          payslip.overtimeMoney.toFixed(2),
        incomeTax: payslip.income_tax.toFixed(2),
        insurance: payslip.insurance.toFixed(2),
        professionalTax:
          payslip.professional_tax.toFixed(2),
        paidDays: payslip.paiddays,
        lopCost: payslip.lopCost.toFixed(2),
        lopDays: payslip.lop,
        netpay: payslip.total_money.toFixed(2),
        taxInsurance:
          payslip.taxInsurance.toFixed(2),
        grossEarning:
          payslip.grossEarning.toFixed(2),
      }
    })

  const sortedPayslipData = displayedPayslips
    .slice()
    .sort((a, b) => {
      const months = [
        t("January"),
        t("February"),
        t("March"),
        t("April"),
        t("May"),
        t("June"),
        t("July"),
        t("August"),
        t("September"),
        t("October"),
        t("November"),
        t("December"),
      ]
      return (
        months.indexOf(a.month) -
        months.indexOf(b.month)
      )
    })

  const offsetForms = currentPage * itemsPerPage
  const paginatedFormData =
    sortedPayslipData.slice(
      offsetForms,
      offsetForms + itemsPerPage
    )
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  return (
    <Box className="transition-colors duration-200">
      {sortedPayslipData.length === 0 ? (
        <Box className="text-center text-gray-600 dark:text-gray-300 mt-[20%] mb-[26%] text-lg">
          {t("noPayslipInformation")}
        </Box>
      ) : (
        <Titlepayslipcard
          title={t("RecentTransactions")}
          topMargin="mt-2"
          TopSideButtons={<TopSideButtons />}
        >
          <Box className="w-full h-[74vh] bg-white dark:bg-gray-800 rounded-lg dark:border-gray-600">
            <Table.Root size="3">
              <Table.Header>
                <Table.Row>
                  <Table.Cell>
                    <Text className="font-semibold text-center text-base text-black dark:text-white">
                      {t("SrNo")}
                    </Text>
                  </Table.Cell>
                  <Table.ColumnHeaderCell>
                    <Text className="font-semibold text-center text-base text-black dark:text-white">
                      {t("Months")}
                    </Text>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Text className="font-semibold text-center text-base text-black dark:text-white">
                      {t("GrossSalary")}
                    </Text>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Text className="font-semibold text-center text-base text-black dark:text-white">
                      {t("NetPay")}
                    </Text>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Text className="font-semibold text-center text-base text-black dark:text-white">
                      {t("SlipDetails")}
                    </Text>
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {paginatedFormData.map(
                  (payslip, pagesrno) => (
                    <Table.Row
                      key={pagesrno}
                      className="border-b"
                    >
                      <Table.Cell>
                        <Text className="font-medium text-sm text-black dark:text-white">
                          {pagesrno +
                            1 +
                            currentPage *
                              itemsPerPage}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="font-medium text-sm text-black dark:text-white">
                          {payslip.month}{" "}
                          {payslip.year}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="font-medium text-sm text-black dark:text-white">
                          ₹
                          {calculateGrossSalary(
                            payslip
                          )}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="font-medium text-sm text-black dark:text-white">
                          ₹
                          {calculateNetPay(
                            payslip
                          )}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="text-xs">
                          <AlertDialog.Root>
                            <AlertDialog.Trigger>
                              <Button
                                size="1"
                                onClick={() =>
                                  handleCardClick(
                                    payslip
                                  )
                                }
                              >
                                {t("viewDetails")}
                              </Button>
                            </AlertDialog.Trigger>
                            <AlertDialog.Portal>
                              {selectedMonth && (
                                <PayslipcardPopup
                                  payslip={
                                    selectedMonth
                                  }
                                  companyData={
                                    commanData.companyData
                                  }
                                  companyName={
                                    commanData.companyName
                                  }
                                  address={
                                    commanData.address
                                  }
                                  onCancel={
                                    handleCancel
                                  }
                                />
                              )}
                            </AlertDialog.Portal>
                          </AlertDialog.Root>
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  )
                )}
              </Table.Body>
            </Table.Root>
            <Box className="mt-2">
              {sortedPayslipData.length >
                itemsPerPage && (
                <Flex className="absolute bottom-[1vh] left-1/2 transform -translate-x-1/2">
                  <ModernPagination
                    total={
                      sortedPayslipData.length
                    }
                    pageSize={itemsPerPage}
                    onPageChange={
                      handlePageChange
                    }
                    currentPage={currentPage}
                    showEdges={true}
                  />
                </Flex>
              )}
            </Box>
          </Box>
        </Titlepayslipcard>
      )}
    </Box>
  )
}

const PayslipcardPopup = ({
  payslip,
  companyData,
  companyName,
  address,
  onCancel,
}) => {
  return (
    <Box className="popup dark:bg-gray-900/70">
      <Box className="popup-inner">
        <Box
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50"
          onClick={onCancel}
        >
          <Box
            className="popup-inner bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <Box className="content">
              <Payslipcard
                companyData={companyData}
                employee_id={payslip.employee_id}
                companyName={companyName}
                address={address}
                {...payslip}
                onCancel={onCancel}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
PayslipcardPopup.propTypes = {
  payslip: PropTypes.object,
  companyData: PropTypes.object,
  companyName: PropTypes.string,
  address: PropTypes.string,
  onCancel: PropTypes.func,
}
export default Payslip
