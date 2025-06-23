import React from "react"
import {
  Box,
  Text,
  Flex,
  ScrollArea,
  Button,
} from "@radix-ui/themes"
import { useUser } from "@clerk/clerk-react"
import "./Payslip.css"
import numberToWords from "number-to-words"
import { useTranslation } from "react-i18next"
import PropTypes from "prop-types"

const Payslipcard = (props) => {
  const { user } = useUser()
  const { t } = useTranslation()
  const handleCancel = () => {
    props.onCancel()
  }

  const maskAccNumber = (number) => {
    const numberStr = String(number)
    return (
      "*".repeat(numberStr.length - 4) +
      numberStr.slice(-4)
    )
  }

  const maskPanNumber = (number) => {
    const numberStr = String(number)
    return (
      "*".repeat(numberStr.length - 4) +
      numberStr.slice(-2)
    )
  }

  const getAmountColor = (amount) => {
    return amount >= 0
      ? "rgb(159, 250, 150)"
      : "rgb(254, 100, 100)"
  }

  const amountToWords = (amount) => {
    return numberToWords.toWords(amount)
  }

  let totaldeducation = props.taxInsurance
  let grossearning = props.grossEarning
  let netpay = props.netpay

  const handleGenerate = () => {
    const style = document.createElement("style")
    style.innerHTML = `
      @media print {
        @page {
          size: landscape;
          margin: 0;
          padding: 0;
        }
        body, html {
          margin: 0;
          padding: 0;
          background: #FFFFFF !important;
        }
        .removeButton {
          display: none;
        }
        .popup-inner {
          background: #FFFFFF !important;
          color: #000000 !important;
          border: 1px solid #000000 !important;
        }
        .text-gray-700 {
          color: #000000 !important;
        }
      }
    `
    document.head.appendChild(style)
    window.print()
    setTimeout(() => {
      document.head.removeChild(style)
    }, 1000)
  }

  return (
    <div>
      <Box className="bg-white dark:bg-gray-800 transition-colors duration-200">
        <ScrollArea
          className="overflow-x-hidden pl-7 pr-7 pt-4"
          style={{ height: "92vh" }}
        >
          <Box
            pl="7"
            pr="7"
            mt="4"
            className="overflow-auto"
            id="payslipContent"
          >
            <Flex
              className="border-b border-black dark:border-gray-600"
              justify="space-between"
            >
              <Flex
                direction="column"
                className="ml-2 mb-1"
              >
                <Box>
                  {props.companyData ? (
                    <img
                      src={
                        props.companyData ===
                        "No record"
                          ? ""
                          : props.companyData
                      }
                      className="w-20"
                      alt="Organization Image"
                    />
                  ) : (
                    <span className="text-black dark:text-white">
                      {props.companyName}
                    </span>
                  )}
                </Box>
                <Text className="text-black  dark:text-white">
                  {props.address}
                </Text>
              </Flex>
              <Flex direction="column">
                <Text className="text-black  dark:text-white">
                  {t("payslipForTheMonth")}
                </Text>
                <Text className="text-lg font-bold text-black  dark:text-white">
                  {props.month} {props.year}
                </Text>
              </Flex>
            </Flex>
            <Flex className="mt-3">
              <Box className="w-1/2 ml-1">
                <Text className="font-bold text-black dark:text-white">
                  {t("employeeSummary")}
                </Text>
                <Flex direction="column">
                  <Flex>
                    <Text className="w-5/12 text-black dark:text-white">
                      Employee ID
                    </Text>
                    <Text className="w-7/12 text-black dark:text-white">
                      : {props.employee_id}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text className="w-5/12 text-black dark:text-white">
                      {t("name")}
                    </Text>
                    <Text className="w-7/12 text-black dark:text-white">
                      : {user.fullName}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text className="w-5/12 text-black dark:text-white">
                      {t("designation")}
                    </Text>
                    <Text className="w-7/12 text-black dark:text-white">
                      : {props.designation}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text className="w-5/12 text-black dark:text-white">
                      {t("joiningDate")}
                    </Text>
                    <Text className="w-7/12 text-black dark:text-white">
                      : {props.joiningdate}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text className="w-5/12 text-black dark:text-white">
                      {t("payPeriod")}
                    </Text>
                    <Text
                      align="end"
                      className="w-7/12 text-black dark:text-white"
                    >
                      : {props.payPeriod}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text className="w-5/12 text-black dark:text-white">
                      {t("payDate")}
                    </Text>
                    <Text
                      align="end"
                      className="w-7/12 text-black dark:text-white"
                    >
                      : {props.payDate}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text className="w-5/12 text-black dark:text-white">
                      {t("bankName")}
                    </Text>
                    <Text
                      align="end"
                      className="w-7/12 text-black dark:text-white"
                    >
                      : {props.bankName}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text className="w-5/12 text-black dark:text-white">
                      {t("accountNo")}
                    </Text>
                    <Text
                      align="end"
                      className="w-7/12 text-black dark:text-white"
                    >
                      :{" "}
                      {maskAccNumber(
                        props.accountNo
                      )}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text className="w-5/12 text-black dark:text-white">
                      {t("panCard")}
                    </Text>
                    <Text
                      align="end"
                      className="w-7/12 text-black dark:text-white"
                    >
                      : {maskPanNumber(props.pan)}
                    </Text>
                  </Flex>
                </Flex>
              </Box>
              <Box
                className="border border-black dark:border-gray-300 rounded-2xl ml-6"
                height="50%"
                mt="1"
                ml={"auto"}
              >
                <Flex
                  direction="column"
                  className="w-48 h-32"
                >
                  <Box
                    className="rounded-t-2xl border-b border-black dark:border-gray-300"
                    style={{
                      backgroundColor:
                        getAmountColor(
                          props.netpay
                        ),
                    }}
                  >
                    <Flex
                      direction="column"
                      className="ml-3 mt-2 mb-1.5 mr-5"
                    >
                      <Flex direction="column">
                        <Text className="font-bold ml-3 text-xl text-black dark:text-white">
                          ₹{props.netpay}
                        </Text>
                        <Text className="text-black dark:text-white">
                          {t("employeeNetPay")}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                  <Box className="ml-2 p-1">
                    <Flex>
                      <Text className="w-8/12 text-black dark:text-white">
                        {t("paidDays")}
                      </Text>
                      <Text className="w-4/12 text-black dark:text-white">
                        : {props.paidDays}
                      </Text>
                    </Flex>
                    <Flex>
                      <Text className="w-8/12 text-black dark:text-white">
                        {t("lopDays")}
                      </Text>
                      <Text className="w-4/12 text-black dark:text-white">
                        : {props.lopDays}
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              </Box>
            </Flex>
            <Box className="border border-black dark:border-gray-300 rounded-2xl mt-3">
              <Flex className="w-full">
                <Box className="w-1/2">
                  <Flex className="border-b border-black dark:border-gray-300 mt-1">
                    <Text className="w-8/12 mb-1 pl-3 font-bold text-black dark:text-white">
                      {t("earning")}
                    </Text>
                    <Text className="w-4/12 ml-3 font-bold text-black dark:text-white">
                      {t("amount")}
                    </Text>
                  </Flex>
                  <Flex className="pt-2 pb-2">
                    <Text className="w-8/12 pl-3 text-black dark:text-white">
                      {t("basicSalary")}
                    </Text>
                    <Text className="w-4/12 ml-1 font-bold text-black dark:text-white">
                      ₹{props.basic}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text className="w-8/12 pl-3 text-black dark:text-white">
                      {t("overtime")}
                    </Text>
                    <Text className="w-4/12 ml-3 font-bold text-black dark:text-white">
                      ₹{props.overtime}
                    </Text>
                  </Flex>
                </Box>
                <div className="border-center dark:border-gray-300"></div>
                <Box className="w-1/2">
                  <Flex className="border-b border-gray-700 dark:border-gray-300 mt-1 mb-1">
                    <Text className="w-8/12 mb-1 pl-3 font-bold text-black dark:text-white">
                      {t("deduction")}
                    </Text>
                    <Text className="w-4/12 ml-4 font-bold text-black dark:text-white">
                      {t("amount")}
                    </Text>
                  </Flex>
                  <Flex className="pb-2 pt-1 pl-3">
                    <Text className="w-8/12 ml-3 text-black dark:text-white">
                      {t("incomeTax")}
                    </Text>
                    <Text className="w-4/12 font-bold text-black dark:text-white">
                      ₹{props.incomeTax}
                    </Text>
                  </Flex>
                  <Flex className="pt-1 pb-2">
                    <Text className="w-8/12 pl-3 text-black dark:text-white">
                      {t("insurance")}
                    </Text>
                    <Text className="w-4/12 ml-4 font-bold text-black dark:text-white">
                      ₹{props.insurance}
                    </Text>
                  </Flex>
                  <Flex className="pt-1 pb-2">
                    <Text className="w-8/12 pl-3 text-black dark:text-white">
                      {t("professionalTax")}
                    </Text>
                    <Text className="w-4/12 ml-4 font-bold text-black dark:text-white">
                      ₹{props.professionalTax}
                    </Text>
                  </Flex>
                  <Flex className="pt-1 pb-2">
                    <Text className="w-8/12 pl-3 text-black dark:text-white">
                      {t("lopCost")}
                    </Text>
                    <Text className="w-4/12 ml-4 font-bold text-black dark:text-white">
                      ₹{props.lopCost}
                    </Text>
                  </Flex>
                </Box>
              </Flex>
              <Flex className="border-t border-gray-700 dark:border-gray-300 w-full">
                <Flex className="w-1/2 p-1">
                  <Text className="w-8/12 pl-3 text-black dark:text-white">
                    {t("grossEarning")}
                  </Text>
                  <Text className="w-4/12 ml-3 font-bold text-black dark:text-white">
                    ₹{grossearning}
                  </Text>
                </Flex>
                <div className="border-center text-black dark:text-white dark:border-gray-300"></div>
                <Flex className="w-1/2 p-1">
                  <Text className="w-8/12 pl-2 text-black dark:text-white">
                    {t("totalDeduction")}
                  </Text>
                  <Text className="w-4/12 ml-5 font-bold text-black dark:text-white">
                    ₹{totaldeducation}
                  </Text>
                </Flex>
              </Flex>
            </Box>
            <Flex className="border border-black dark:border-gray-300 rounded-2xl w-full mt-5">
              <Box className="w-8/12">
                <Flex direction="column p-0.5 ml-2">
                  <Text className="font-bold text-black dark:text-white">
                    {t("totalNetPayable")}
                  </Text>
                  <Text className="text-black dark:text-white">
                    {t("grossEarning")} -{" "}
                    {t("totalDeduction")}
                  </Text>
                </Flex>
              </Box>
              <Text
                className="w-4/12 pt-2 font-bold text-2xl rounded-r-2xl text-black dark:text-white"
                align="center"
                style={{
                  backgroundColor: getAmountColor(
                    props.netpay
                  ),
                }}
              >
                ₹{props.netpay}
              </Text>
            </Flex>
            <Flex className="border-b border-black dark:border-gray-300 p-2 mt-4 pb-1 w-full">
              <Flex className="mr-3 ml-auto">
                <Text className="text-black dark:text-white">
                  {t("amountInWords")} :&thinsp;
                </Text>
                <Text className="capitalize ... font-bold text-black dark:text-white">
                  {amountToWords(netpay)}
                </Text>
              </Flex>
            </Flex>
          </Box>
          <Flex
            align="center"
            justify="center"
            className="mb-4 mt-4 removeButton"
          >
            <Button
              variant="solid"
              color="indigo"
              className="bg-indigo-600 dark:bg-indigo-700 text-white dark:text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200"
              style={{
                padding: "0.3rem 0.8rem",
                borderRadius: "0.375rem",
              }}
              onClick={handleGenerate}
            >
              {t("generate")}
            </Button>
            <Button
              variant="soft"
              color="red"
              className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-white hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200"
              style={{
                padding: "0.3rem 0.8rem",
                borderRadius: "0.375rem",
                marginLeft: "1rem",
              }}
              onClick={handleCancel}
            >
              {t("cancel")}
            </Button>
          </Flex>
        </ScrollArea>
      </Box>
    </div>
  )
}

export default Payslipcard

Payslipcard.propTypes = {
  employee_id: PropTypes.string,
  companyData: PropTypes.string,
  companyName: PropTypes.string,
  address: PropTypes.string,
  month: PropTypes.string,
  year: PropTypes.string,
  designation: PropTypes.string,
  joiningdate: PropTypes.string,
  payPeriod: PropTypes.string,
  payDate: PropTypes.string,
  bankName: PropTypes.string,
  accountNo: PropTypes.string,
  pan: PropTypes.string,
  netpay: PropTypes.number,
  paidDays: PropTypes.number,
  lopDays: PropTypes.number,
  basic: PropTypes.number,
  overtime: PropTypes.number,
  incomeTax: PropTypes.number,
  insurance: PropTypes.number,
  professionalTax: PropTypes.number,
  grossEarning: PropTypes.number,
  taxInsurance: PropTypes.number,
  lopCost: PropTypes.number,
  handleCancel: PropTypes.func,
  onCancel: PropTypes.func,
}
