import React, { useState, useEffect } from "react"
import {
  Dialog,
  Text,
  Separator,
  Button,
  Flex,
  Box,
  Table,
} from "@radix-ui/themes"
import { RxCrossCircled } from "react-icons/rx"
import * as Form from "@radix-ui/react-form"
import toast from "react-hot-toast"
import * as Select from "@radix-ui/react-select"
import classnames from "classnames"
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons"
import { useUser } from "@clerk/clerk-react"
import axios from "axios"
import { useTranslation } from "react-i18next"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useOrganizationContext } from "../../OrganizationContext"
import DateOptions from "./DateForm"
import PropTypes from "prop-types"

function LeaveForm(props) {
  const { t } = useTranslation()
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { user } = useUser()
  const [takenLeavesCount, setTakenLeavesCount] =
    useState(0)
  const defaultJoinMonth =
    new Date().getMonth() >= 7 ? 7 : 0
  const [joinDate, setJoinDate] = useState(
    new Date(
      new Date().getFullYear(),
      defaultJoinMonth,
      1
    )
  )
  const [selectLeave, setSelectLeave] = useState(
    t("casualLeave")
  )
  const [swapCount, setSwapCount] = useState(0)
  const [usedSwaps, setUsedSwaps] = useState(0)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] =
    useState("")
  const [file, setFile] = useState("")
  const [openForm, setOpenForm] = useState(false)
  const [holidays, setHolidays] = useState([])
  const { organizationName, socket, org_slug } =
    useOrganizationContext()
  const [allDates, setAllDates] = useState({})
  const [applyDisable, setApplyDisable] =
    useState(true)
  const [selectedValue, setSelectedValue] =
    useState("")
  const [checked, setChecked] = useState("")
  const [change, setChange] = useState(false)
  const [leaveMode, setLeaveMode] =
    useState("planned")
  const fetchHolidays = () => {
    axios
      .get(`${BASE_URL}/mandatory_holidays`, {
        params: {
          org_slug: org_slug,
          organization_name: organizationName,
        },
      })
      .then((response) => {
        setHolidays(response.data.data)
      })
      .catch(() => {
        toast.error("Error fetching holidays")
      })
  }

  const filterDates = (date) => {
    const isHoliday = holidays.some((holiday) =>
      isSameDay(new Date(holiday.date), date)
    )
    return (
      date.getDay() !== 0 &&
      date.getDay() !== 6 &&
      !isHoliday
    )
  }

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() ===
        date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = (
      "0" +
      (date.getMonth() + 1)
    ).slice(-2)
    const day = ("0" + date.getDate()).slice(-2)
    return `${year}-${month}-${day}`
  }

  const handleApply = (e) => {
    e.preventDefault()
    if (startDate === "") {
      toast.error(
        <p className="text-red-500">
          Please fill Start Date
        </p>
      )
      return
    }
    if (
      leaveMode === "planned" &&
      endDate === ""
    ) {
      toast.error(
        <p className="text-red-500">
          Please fill End Date
        </p>
      )
      return
    }
    if (
      leaveMode === "unplanned" &&
      description === ""
    ) {
      toast.error(
        <p className="text-red-500">
          Please provide a reason
        </p>
      )
      return
    }

    const formData = new FormData()
    formData.append("user_id", user.id)
    formData.append(
      "email",
      user.primaryEmailAddress.emailAddress
    )

    if (leaveMode === "unplanned") {
      formData.append(
        "leave_type",
        "Emergency Leave"
      )
      formData.append(
        "leave_type_original",
        t("emergencyLeave")
      )
      formData.append("is_unplanned", true)
    } else {
      const leaveTypesMapping = {
        "Casual Leave": "Casual Leave",
        "Medical Leave": "Medical Leave",
        "Other Leaves": "Other Leaves",
        "आकस्मिक अवकाश": "Casual Leave",
        "चिकित्सा अवकाश": "Medical Leave",
        "अन्य छुट्टियां": "Other Leaves",
        "मर्यादीत रजा": "Casual Leave",
        "औषधी रजा": "Medical Leave",
        "इतर रजा": "Other Leaves",
      }
      const translatedLeaveType =
        leaveTypesMapping[selectLeave] ||
        "Casual Leave"
      formData.append(
        "leave_type",
        translatedLeaveType
      )
      formData.append(
        "leave_type_original",
        selectLeave
      )
    }
    const formattedStartDate =
      formatDate(startDate)
    const formattedEndDate =
      leaveMode === "unplanned"
        ? formattedStartDate
        : formatDate(endDate)

    formData.append(
      "start_date",
      formattedStartDate
    )
    formData.append("end_date", formattedEndDate)
    formData.append("description", description)
    formData.append("username", user.fullName)
    formData.append("imageurl", user.imageUrl)
    formData.append("leave_available", remain)

    if (file) {
      formData.append("attachment", file)
    }
    let leaveDatesObj = {}
    if (Object.keys(allDates).length > 0) {
      leaveDatesObj = allDates
    } else {
      const currentDate = new Date(startDate)
      const endDateObj = new Date(
        endDate || startDate
      )

      while (currentDate <= endDateObj) {
        const dateKey = formatDate(currentDate)
        if (selectedValue === "firstHalf") {
          leaveDatesObj[dateKey] = {
            fullLeave: false,
            firstHalf: true,
            secondHalf: false,
            wfh: false,
            useSwap: false,
          }
        } else if (
          selectedValue === "secondHalf"
        ) {
          leaveDatesObj[dateKey] = {
            fullLeave: false,
            firstHalf: false,
            secondHalf: true,
            wfh: false,
            useSwap: false,
          }
        } else {
          leaveDatesObj[dateKey] = {
            fullLeave: true,
            firstHalf: false,
            secondHalf: false,
            wfh: false,
            useSwap: false,
          }
        }
        currentDate.setDate(
          currentDate.getDate() + 1
        )
      }
    }

    formData.append(
      "leavedates",
      JSON.stringify(leaveDatesObj)
    )

    setSelectLeave(t("casualLeave"))
    setStartDate("")
    setEndDate("")
    setDescription("")
    setFile("")
    setSelectedValue("")
    setLeaveMode("planned")
    setAllDates({})

    axios
      .post(
        `${BASE_URL}/submit_leave_request`,
        formData,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        if (
          socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          socket.send("submited")
        }
        if (response.data.auto_approved) {
          toast.success(
            `Leave request is approved ${response.data.auto_approval_reason}`
          )
          props.setRefresh(!props.refresh)
        } else if (
          response.data.auto_approved === false &&
          response.status === 200
        ) {
          toast.success(
            "Leave request submitted successfully"
          )
        }
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data.detail ===
            "Leave request for this period already exists"
        ) {
          toast.error(
            t(
              "You have already applied for leave on same day"
            )
          )
        } else {
          toast.error(
            error.response?.data?.detail ||
              "Error submitting leave request"
          )
        }
      })

    setOpenForm(false)
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    const allowedTypes = ["application/pdf"]
    if (
      selectedFile &&
      allowedTypes.includes(selectedFile.type)
    ) {
      setFile(selectedFile)
    } else {
      e.target.value = null
      toast.error(
        "Please select a PDF file only."
      )
    }
  }

  const handleLeaveTypeChange = (e) => {
    setSelectLeave(e)
  }

  const handleOptionChange = (
    date,
    optionType,
    value
  ) => {
    const updatedDates = { ...allDates }
    let newUsedSwaps = 0
    Object.values(updatedDates).forEach(
      (dateOptions) => {
        if (dateOptions.useSwap) {
          if (dateOptions.fullLeave) {
            newUsedSwaps += 1
          } else if (
            dateOptions.firstHalf ||
            dateOptions.secondHalf
          ) {
            newUsedSwaps += 0.5
          }
        }
      }
    )
    if (optionType === "useSwap" && value) {
      if (updatedDates[date]?.fullLeave) {
        newUsedSwaps += 1
      } else if (
        updatedDates[date]?.firstHalf ||
        updatedDates[date]?.secondHalf
      ) {
        newUsedSwaps += 0.5
      }
    }
    setUsedSwaps(newUsedSwaps)

    const mutuallyExclusiveOptions = [
      "fullLeave",
      "firstHalf",
      "secondHalf",
      "wfh",
      "useSwap",
    ]

    const applyOption = (d) => {
      const dateKey = d.toLocaleDateString()
      if (!updatedDates[dateKey]) {
        updatedDates[dateKey] = {}
      }

      updatedDates[dateKey][optionType] = value
      if (
        optionType === "wfh" &&
        value === true
      ) {
        updatedDates[dateKey]["useSwap"] = false
      }

      mutuallyExclusiveOptions.forEach((opt) => {
        if (opt !== optionType) {
          if (
            optionType === "wfh" &&
            value === true
          ) {
            updatedDates[dateKey][opt] = false
          } else if (
            [
              "fullLeave",
              "firstHalf",
              "secondHalf",
            ].includes(optionType)
          ) {
            updatedDates[dateKey]["wfh"] = false
            updatedDates[dateKey][opt] = false
          }
        }
      })
    }

    if (date == "all") {
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        if (filterDates(currentDate)) {
          applyOption(currentDate)
        }
        currentDate.setDate(
          currentDate.getDate() + 1
        )
      }
    } else {
      if (!updatedDates[date]) {
        updatedDates[date] = {}
      }
      if (optionType === "fullLeave") {
        updatedDates[date][optionType] = value
        updatedDates[date]["firstHalf"] = false
        updatedDates[date]["secondHalf"] = false
        updatedDates[date]["wfh"] = false
      } else if (optionType === "secondHalf") {
        updatedDates[date][optionType] = value
        updatedDates[date]["firstHalf"] = false
        updatedDates[date]["fullLeave"] = false
      } else if (optionType === "firstHalf") {
        updatedDates[date][optionType] = value
        updatedDates[date]["fullLeave"] = false
        updatedDates[date]["secondHalf"] = false
      } else if (optionType === "wfh") {
        updatedDates[date][optionType] = value
        if (value === true) {
          updatedDates[date]["fullLeave"] = false
          updatedDates[date]["useSwap"] = false
        }
      } else if (optionType === "useSwap") {
        updatedDates[date][optionType] = value
      }
      checkAllFieldSame(updatedDates)
    }
    setApplyDisable(
      checkAllFieldTrue(updatedDates)
    )
    setAllDates(updatedDates)
  }

  const checkAllFieldTrue = (datesObject) => {
    if (!startDate || !endDate) return true
    let totalSwapUsed = 0
    Object.values(datesObject).forEach(
      (dateOptions) => {
        if (dateOptions.useSwap) {
          if (dateOptions.fullLeave) {
            totalSwapUsed += 1
          } else if (
            dateOptions.firstHalf ||
            dateOptions.secondHalf
          ) {
            totalSwapUsed += 0.5
          }
        }
      }
    )
    if (totalSwapUsed > swapCount) {
      toast.error(
        "Not sufficient swap count for selected leaves"
      )
      return true
    }
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const isDisabledDate =
        filterDates(currentDate)

      if (isDisabledDate) {
        if (
          Object.prototype.hasOwnProperty.call(
            datesObject,
            currentDate.toLocaleDateString()
          )
        ) {
          const dateInfo =
            datesObject[
              currentDate.toLocaleDateString()
            ]
          if (
            dateInfo === null ||
            (dateInfo.firstHalf !== true &&
              dateInfo.fullLeave !== true &&
              dateInfo.secondHalf !== true &&
              dateInfo.wfh !== true)
          ) {
            return true
          }
        } else {
          return true
        }
      }

      currentDate.setDate(
        currentDate.getDate() + 1
      )
    }
    return false
  }

  const checkAllFieldSame = (datesObject) => {
    if (!startDate || !endDate) return
    const currentDate = new Date(startDate)
    const current = leaveMapping[checked] || ""
    if (current) {
      while (currentDate <= endDate) {
        const isDisabledDate =
          filterDates(currentDate)

        if (isDisabledDate) {
          const dateInfo =
            datesObject[
              currentDate.toLocaleDateString()
            ]
          if (dateInfo[current] === false) {
            setChecked("")
            return
          }
        }
        currentDate.setDate(
          currentDate.getDate() + 1
        )
      }
    }
  }

  const leaveMapping = {
    "Full Leave": "fullLeave",
    "First Half": "firstHalf",
    "Second Half": "secondHalf",
    WFH: "wfh",
    "Use Swap": "useSwap",
  }

  const generateSpecification = (
    defaultValue
  ) => {
    if (!startDate || !endDate) return ""

    const dates = []
    const currentDate = new Date(startDate)
    const shortValue =
      leaveMapping[defaultValue] || ""
    while (currentDate <= endDate) {
      const isDisabledDate =
        filterDates(currentDate)

      if (isDisabledDate) {
        dates.push(
          <DateOptions
            key={currentDate.toLocaleDateString()}
            date={currentDate.toLocaleDateString()}
            onChange={handleOptionChange}
            defaultValue={shortValue}
            change={change}
            swapCount={swapCount}
            usedSwaps={usedSwaps}
          />
        )
      }

      currentDate.setDate(
        currentDate.getDate() + 1
      )
    }

    return (
      <Box className="relative overflow-auto bg-white dark:bg-gray-800 text-black dark:text-white">
        <Table.Root
          size="1"
          className="dark:bg-gray-800"
        >
          <Table.Header className="sticky top-0 bg-gray-200 dark:bg-gray-700">
            <Table.Row className="text-center text-xs dark:text-white">
              <Table.ColumnHeaderCell className="w-[19%] !font-medium dark:text-white">
                {t("Date")}
              </Table.ColumnHeaderCell>
              {[
                {
                  label: "FirstHalf",
                  value: "First Half",
                  width: "w-[19%]",
                },
                {
                  label: "SecondHalf",
                  value: "Second Half",
                  width: "w-[24%]",
                },
                {
                  label: "FullLeave",
                  value: "Full Leave",
                  width: "w-[19%]",
                },
                {
                  label: "WFH",
                  value: "WFH",
                  width: "w-[19%]",
                },
                {
                  label: "Use Swap",
                  value: "useSwap",
                  width: "w-[19%]",
                },
              ].map(({ label, value, width }) => (
                <Table.ColumnHeaderCell
                  className={`${width} !font-medium`}
                  key={value}
                >
                  <Box className="flex items-center gap-0.5 justify-center">
                    <input
                      type="checkbox"
                      className="mr-1"
                      onChange={() =>
                        handleChange(value)
                      }
                      checked={checked === value}
                    />
                    {t(label)}
                  </Box>
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body className="relative dark:bg-gray-800">
            {dates}
          </Table.Body>
        </Table.Root>
      </Box>
    )
  }

  const handleCancel = () => {
    setStartDate("")
    setEndDate("")
    setDescription("")
    setAllDates({})
    setApplyDisable(true)
    setSelectedValue("")
    setLeaveMode("planned")
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/user/${user.id}`,
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          }
        )
        const userData =
          response.data.user_data[0]
        if (userData.swap_count !== undefined) {
          setSwapCount(userData.swap_count)
        }
        if (userData.DateOfJoining) {
          const joiningDate = new Date(
            userData.DateOfJoining
          )
          const JoinMonth =
            joiningDate.getMonth() >= 7 ? 7 : 0
          if (
            joiningDate.getFullYear() ===
              new Date().getFullYear() &&
            JoinMonth === defaultJoinMonth
          ) {
            setJoinDate(joiningDate)
          } else {
            const currentDate = new Date()
            setJoinDate(
              new Date(
                currentDate.getFullYear(),
                defaultJoinMonth,
                1
              )
            )
          }
        }
      } catch {
        toast.error("Error fetching user data")
      }
    }
    fetchHolidays()
    fetchUserData()
  }, [user.id])

  useEffect(() => {
    const fetchLeaveRequestDetails = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/get_leave_requests/${user.id}`,
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          }
        )
        const leaveRequests =
          response.data.leave_requests
        let totalAcceptedDays = 0

        leaveRequests.forEach((request) => {
          if (request.status === "accepted") {
            const startDate = new Date(
              request.start_date
            )
            const endDate = new Date(
              request.end_date
            )
            const JoinMonth =
              startDate.getMonth() >= 7 ? 7 : 0
            if (JoinMonth === defaultJoinMonth) {
              let totalDays = 0
              for (
                let date = new Date(startDate);
                date <= endDate;
                date.setDate(date.getDate() + 1)
              ) {
                const isHoliday = holidays.some(
                  (holiday) =>
                    isSameDay(
                      new Date(holiday.date),
                      date
                    )
                )
                if (
                  date.getDay() !== 0 &&
                  date.getDay() !== 6 &&
                  !isHoliday
                ) {
                  totalDays++
                }
              }
              totalAcceptedDays += totalDays
            }
          }
        })

        setTakenLeavesCount(totalAcceptedDays)
      } catch {
        toast.error(
          "Error fetching leave request details"
        )
      }
    }
    fetchLeaveRequestDetails()
    const handleMessage = () => {
      fetchLeaveRequestDetails()
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
  }, [joinDate, user.id, holidays])

  const getTotalLeavesForJoinDate = (
    joinDate
  ) => {
    const currentDate = new Date()
    const diffMonths =
      (currentDate.getFullYear() -
        joinDate.getFullYear()) *
        12 +
      (currentDate.getMonth() -
        joinDate.getMonth()) +
      1
    return diffMonths * 1.5
  }

  const totalDays =
    getTotalLeavesForJoinDate(joinDate)
  const remain = totalDays - takenLeavesCount

  const handleChange = (value) => {
    const shortValue = leaveMapping[value]
    if (checked === value) {
      setChecked("")
      setSelectedValue("")
      setAllDates({})
      setChange(!change)
      setApplyDisable(true)
      return
    }
    setChecked(value)
    setChange(!change)
    setSelectedValue(value)
    handleOptionChange("all", shortValue, true)
  }

  useEffect(() => {
    if (!openForm) {
      setSelectedValue("")
      setStartDate("")
      setEndDate("")
      setChecked("")
      setLeaveMode("planned")
    }
  }, [openForm])

  function onChangeHandler(value) {
    if (endDate != "" && startDate != "") {
      setAllDates({})
    }
    setSelectedValue("")
    setChecked("")
    setApplyDisable(true)
    setStartDate(value[0])
    setEndDate(
      leaveMode === "unplanned"
        ? value[0]
        : value[1]
    )
  }

  const CustomInput = React.forwardRef(
    ({ value, onClick, placeholder }, ref) => (
      <input
        ref={ref}
        onClick={onClick}
        value={value}
        placeholder={placeholder}
        readOnly
        className="w-full p-2 dark:text-white dark:bg-gray-800 border rounded border-gray-300 dark:border-gray-600 text-left text-sm outline-none placeholder:text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
      />
    )
  )
  CustomInput.displayName = "CustomInput"
  CustomInput.propTypes = {
    value: PropTypes.string,
    onClick: PropTypes.func,
    placeholder: PropTypes.string,
  }

  return (
    <>
      {remain <= 0 ? (
        <>
          <Box>
            <Box
              className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-2 flex items-start inline-flex xs:mr-[20vw] sm:mr-[28vw] md:mr-[36vw] lg:mr-[40vw] xl:mr-[46vw] 2xl:mr-[57vw] overflow-auto"
              role="alert"
            >
              <span className="font-bold text-xs sm:text-xs md:text-sm lg:text-base">
                {t("alert")}{" "}
              </span>
              <span className="text-xs sm:text-xs md:text-sm lg:text-base">
                {t("lowLeaveBalance")}
              </span>
            </Box>
          </Box>
          <Dialog.Root
            open={openForm}
            onOpenChange={setOpenForm}
            className="justify-end"
          >
            <Dialog.Trigger
              asChild
              className="justify-center"
            >
              <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded">
                {t("applyForLeaveButton")}
              </Button>
            </Dialog.Trigger>
            <Dialog.Content
              className={`data-[state=open]:animate-contentShow max-h-[90vh] w-[90vw] max-w-[400px] sm:w-[90vw] sm:max-w-[600px] rounded-[6px] bg-white dark:bg-gray-800 text-black dark:text-white p-[25px] shadow-[hsl(206_22%7%/35%)_0px_10px_38px-10px,hsl(206_22%_7%/20%)_0px_10px_20px-15px] focus:outline-none position: relative
    ${leaveMode === "unplanned" ? "min-h-[500px]" : ""}
  `}
            >
              {" "}
              <Dialog.Title className="text-mauve12 m-0 text-[17px]">
                <Text
                  as="div"
                  className="mb-2 items-center ml-10 text-blue-700"
                >
                  {t("leaveApplicationText")}
                </Text>
              </Dialog.Title>
              <Flex className="flex justify-center">
                <Box
                  as="div"
                  className="justify-center mt-1 w-full max-h-[80vh]"
                >
                  <Box className="max-h-full overflow-y-auto">
                    <Form.Root className="w-full">
                      <Form.Field
                        className="grid mb-[10px]"
                        name="leaveMode"
                      >
                        <Flex className="flex items-baseline justify-between">
                          <Form.Label className="mb-1 font-medium text-sm">
                            Leave Mode
                            <span className="text-red-500">
                              *
                            </span>
                          </Form.Label>
                        </Flex>
                        <Select.Root
                          value={leaveMode}
                          onValueChange={(
                            value
                          ) => {
                            setLeaveMode(value)
                            setStartDate("")
                            setEndDate("")
                            setAllDates({})
                            setSelectedValue("")
                            setChecked("")
                            setApplyDisable(true)
                          }}
                        >
                          <Select.Trigger
                            className="inline-flex items-center justify-between rounded px-[15px] text-[13px] leading-none h-[40px] gap-[5px] hover:bg-mauve3 data-[placeholder]:text-violet9 outline-none w-full border border-gray-300 rounded mt-1 focus:outline-none focus:border-gray-300"
                            aria-label="Leave Mode"
                          >
                            <Select.Value
                              placeholder={t(
                                "planned"
                              )}
                            />
                            <Select.Icon>
                              <ChevronDownIcon />
                            </Select.Icon>
                          </Select.Trigger>
                          <Select.Portal>
                            <Select.Content
                              className="overflow-hidden w-full bg-white rounded-md"
                              position="popper"
                            >
                              <Select.Viewport className="p-[5px] border">
                                <Select.Group>
                                  <SelectItem value="planned">
                                    Planned
                                  </SelectItem>
                                  <Separator size="8" />
                                  <SelectItem value="unplanned">
                                    Unplanned
                                  </SelectItem>
                                </Select.Group>
                              </Select.Viewport>
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>
                      </Form.Field>

                      {leaveMode ===
                        "planned" && (
                        <>
                          <Form.Field
                            className="grid mb-[10px]"
                            name="leaveType"
                          >
                            <Flex className="flex items-baseline justify-between">
                              <Form.Label className="mb-1 font-medium text-sm">
                                {t(
                                  "leaveTypeLabel"
                                )}
                                <span className="text-red-500">
                                  *
                                </span>
                              </Form.Label>
                            </Flex>
                            <Form.Control asChild>
                              <SelectDemo
                                handleLeaveTypeChange={
                                  handleLeaveTypeChange
                                }
                              />
                            </Form.Control>
                          </Form.Field>
                          <Form.Field
                            className="grid mb-[10px]"
                            name="startDate"
                          >
                            <Box className="w-full">
                              <Box>
                                <Flex className="flex items-baseline justify-between">
                                  <Form.Label className="block mb-1 font-medium text-sm">
                                    {t(
                                      "Leave Duration"
                                    )}
                                    <span className="text-red-500">
                                      *
                                    </span>
                                  </Form.Label>
                                </Flex>
                                <Form.Message
                                  className="text-[13px] text-red-500 opacity-[0.8]"
                                  match="valueMissing"
                                >
                                  {t(
                                    "startDateErrorMessage"
                                  )}
                                </Form.Message>
                              </Box>
                              <Box className="w-full mt-1 dark:bg-gray-800">
                                <DatePicker
                                  selectsRange={
                                    true
                                  }
                                  startDate={
                                    startDate
                                  }
                                  endDate={
                                    endDate
                                  }
                                  onChange={
                                    onChangeHandler
                                  }
                                  dateFormat="yyyy/MM/dd"
                                  filterDate={
                                    filterDates
                                  }
                                  minDate={
                                    new Date()
                                  }
                                  wrapperClassName="w-full dark:bg-gray-800 dark:text-white"
                                  placeholderText="Select leave duration"
                                  customInput={
                                    <CustomInput />
                                  }
                                />
                              </Box>
                            </Box>
                          </Form.Field>
                          <Form.Field
                            className="grid mb-[10px]"
                            name="specify"
                          >
                            <Form.Label className="block mb-1 font-medium text-sm">
                              {t("specification")}
                              <span className="text-red-500">
                                *
                              </span>
                            </Form.Label>
                            <Form.Message
                              className="text-[13px] text-red-500 opacity-[0.8]"
                              match="valueMissing"
                            >
                              Please Specify the
                              details
                            </Form.Message>
                            <Box className="w-full h-36 p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:border-gray-300 overflow-auto">
                              {generateSpecification(
                                selectedValue
                              )}
                            </Box>
                          </Form.Field>
                        </>
                      )}

                      {leaveMode ===
                        "unplanned" && (
                        <Form.Field
                          className="grid mb-[10px]"
                          name="startDate"
                        >
                          <Box className="w-full">
                            <Box>
                              <Flex className="flex items-baseline justify-between">
                                <Form.Label className="block mb-1 font-medium text-sm">
                                  {t(
                                    "Leave Date"
                                  )}
                                  <span className="text-red-500">
                                    *
                                  </span>
                                </Form.Label>
                              </Flex>
                              <Form.Message
                                className="text-[13px] text-red-500 opacity-[0.8]"
                                match="valueMissing"
                              >
                                {t(
                                  "startDateErrorMessage"
                                )}
                              </Form.Message>
                            </Box>
                            <Box className="w-full mt-1 dark:bg-gray-800">
                              <DatePicker
                                selected={
                                  startDate
                                }
                                onChange={(
                                  date
                                ) => {
                                  setStartDate(
                                    date
                                  )
                                  setEndDate(date)
                                }}
                                dateFormat="yyyy/MM/dd"
                                filterDate={
                                  filterDates
                                }
                                minDate={
                                  new Date()
                                }
                                wrapperClassName="w-full dark:bg-gray-800 dark:text-white"
                                placeholderText="Select leave date"
                                customInput={
                                  <CustomInput />
                                }
                              />
                            </Box>
                          </Box>
                        </Form.Field>
                      )}

                      <Form.Field
                        className="grid mb-[10px]"
                        name="description"
                      >
                        <Box>
                          <Form.Label className="block mb-1 font-medium text-sm">
                            {t(
                              "descriptionLabel"
                            )}
                            {leaveMode ===
                              "unplanned" && (
                              <span className="text-red-500">
                                *
                              </span>
                            )}
                          </Form.Label>
                          <Form.Message
                            className="text-[13px] text-red-500 opacity-[0.8]"
                            match="valueMissing"
                          >
                            Please enter a Reason
                            or description
                          </Form.Message>
                        </Box>
                        <Form.Control asChild>
                          <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={(e) =>
                              setDescription(
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
                            rows={
                              leaveMode ===
                              "unplanned"
                                ? "4"
                                : "2"
                            }
                            required={
                              leaveMode ===
                              "unplanned"
                            }
                          />
                        </Form.Control>
                      </Form.Field>

                      {leaveMode ===
                        "planned" && (
                        <Form.Field
                          className="grid mb-[10px]"
                          name="attachment"
                        >
                          <Box>
                            <Form.Label className="block mb-1 font-medium text-sm">
                              {t(
                                "attachmentLabel"
                              )}
                            </Form.Label>
                          </Box>
                          <Form.Control asChild>
                            <input
                              id="file"
                              type="file"
                              accept="application/pdf"
                              onChange={
                                handleFileChange
                              }
                              className="w-full p-2 border border-gray-300 rounded mt-1 text-sm"
                            />
                          </Form.Control>
                        </Form.Field>
                      )}

                      <Dialog.Close asChild>
                        <RxCrossCircled
                          size="1.5em"
                          className="crosscircleclose"
                          color="#727171"
                          onClick={handleCancel}
                        />
                      </Dialog.Close>
                      <Box className="flex justify-end mb-3 mt-6">
                        <Flex gap="3">
                          <Dialog.Close>
                            <Button
                              color="red"
                              variant="soft"
                              className="text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-800 dark:text-white rounded-md px-5 py-2.5 font-medium text-sm transition-all duration-200"
                              onClick={
                                handleCancel
                              }
                            >
                              {t("cancel")}
                            </Button>
                          </Dialog.Close>
                          <Button
                            className="hover:bg-blue-700 bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer transition-colors duration-300 ease-out rounded px-4 py-1 item-center"
                            type="submit"
                            onClick={handleApply}
                            disabled={
                              leaveMode ===
                              "unplanned"
                                ? !startDate ||
                                  !description
                                : applyDisable
                            }
                          >
                            {t("apply")}
                          </Button>
                        </Flex>
                      </Box>
                    </Form.Root>
                  </Box>
                </Box>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        </>
      ) : (
        <Dialog.Root
          open={openForm}
          onOpenChange={setOpenForm}
          className="justify-end"
        >
          <Dialog.Trigger
            asChild
            className="justify-center"
          >
            <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded">
              {t("applyForLeaveButton")}
            </Button>
          </Dialog.Trigger>
          <Dialog.Content className="data-[state=open]:animate-contentShow  max-h-[90vh] w-[90vw] max-w-[400px] sm:w-[90vw] sm:max-w-[600px] rounded-[6px] bg-white  dark:bg-gray-800 text-black dark:text-white p-[25px] shadow-[hsl(206_22%7%/35%)_0px_10px_38px-10px,hsl(206_22%_7%/20%)_0px_10px_20px-15px] focus:outline-none position: relative">
            <Dialog.Title className="text-mauve12 m-0 text-[17px] text-black dark:text-white">
              <Text
                as="div"
                className="mb-2 items-center ml-10 text-blue-900 dark:text-blue-500"
              >
                {t("leaveApplicationText")}
              </Text>
            </Dialog.Title>
            <Flex className="flex justify-center">
              <Box
                as="div"
                className="justify-center mt-1 w-full max-h-[80vh] bg-white dark:bg-gray-800 text-black dark:text-white"
              >
                <Box className="max-h-full overflow-y-auto">
                  <Form.Root className="w-full">
                    <Form.Field
                      className="grid mb-[10px]"
                      name="leaveMode"
                    >
                      <Flex className="flex items-baseline justify-between">
                        <Form.Label className="mb-1 font-medium text-sm">
                          Leave Mode
                          <span className="text-red-500">
                            *
                          </span>
                        </Form.Label>
                      </Flex>
                      <Select.Root
                        value={leaveMode}
                        onValueChange={(
                          value
                        ) => {
                          setLeaveMode(value)
                          setStartDate("")
                          setEndDate("")
                          setAllDates({})
                          setSelectedValue("")
                          setChecked("")
                          setApplyDisable(true)
                        }}
                      >
                        <Select.Trigger
                          className="inline-flex items-center justify-between rounded px-[15px] text-[13px] leading-none h-[40px] gap-[5px] hover:bg-mauve3 data-[placeholder]:text-violet9 outline-none w-full border border-gray-300 rounded mt-1 focus:outline-none focus:border-gray-300"
                          aria-label="Leave Mode"
                        >
                          <Select.Value
                            placeholder={t(
                              "Planned"
                            )}
                          />
                          <Select.Icon>
                            <ChevronDownIcon />
                          </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content
                            className="overflow-hidden w-full bg-white dark:bg-gray-800 rounded-md"
                            position="popper"
                          >
                            <Select.Viewport className="p-[5px] border dark:border-gray-600 dark:text-white dark:bg-gray-800">
                              <Select.Group>
                                <SelectItem value="planned">
                                  Planned
                                </SelectItem>
                                <Separator size="8" />
                                <SelectItem value="unplanned">
                                  Unplanned
                                </SelectItem>
                              </Select.Group>
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    </Form.Field>

                    {leaveMode === "planned" && (
                      <>
                        <Form.Field
                          className="grid mb-[10px]"
                          name="leaveType"
                        >
                          <Flex className="flex items-baseline justify-between">
                            <Form.Label className="mb-1 font-medium text-sm">
                              {t(
                                "leaveTypeLabel"
                              )}
                              <span className="text-red-500">
                                *
                              </span>
                            </Form.Label>
                          </Flex>
                          <Form.Control asChild>
                            <SelectDemo
                              handleLeaveTypeChange={
                                handleLeaveTypeChange
                              }
                            />
                          </Form.Control>
                        </Form.Field>
                        <Form.Field
                          className="grid mb-[10px]"
                          name="startDate"
                        >
                          <Box className="w-full">
                            <Box>
                              <Flex className="flex items-baseline justify-between">
                                <Form.Label className="block mb-1 font-medium text-sm">
                                  {t(
                                    "Leave Duration"
                                  )}
                                  <span className="text-red-500">
                                    *
                                  </span>
                                </Form.Label>
                              </Flex>
                              <Form.Message
                                className="text-[13px] text-red-500 opacity-[0.8]"
                                match="valueMissing"
                              >
                                {t(
                                  "startDateErrorMessage"
                                )}
                              </Form.Message>
                            </Box>
                            <Box className="w-full mt-1 dark:bg-gray-800">
                              <DatePicker
                                selectsRange={
                                  true
                                }
                                startDate={
                                  startDate
                                }
                                endDate={endDate}
                                onChange={
                                  onChangeHandler
                                }
                                dateFormat="yyyy/MM/dd"
                                filterDate={
                                  filterDates
                                }
                                minDate={
                                  new Date()
                                }
                                wrapperClassName="w-full dark:bg-gray-800 dark:text-white"
                                placeholderText="Select leave duration"
                                customInput={
                                  <CustomInput />
                                }
                                calendarClassName="bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
                              />
                            </Box>
                          </Box>
                        </Form.Field>
                        <Form.Field
                          className="grid mb-[10px]"
                          name="specify"
                        >
                          <Form.Label className="block mb-1 font-medium text-sm">
                            {t("specification")}
                            <span className="text-red-500">
                              *
                            </span>
                          </Form.Label>
                          <Form.Message
                            className="text-[13px] text-red-500 opacity-[0.8]"
                            match="valueMissing"
                          >
                            Please Specify the
                            details
                          </Form.Message>
                          <Box className="w-full h-36 p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:border-gray-300 overflow-auto">
                            {generateSpecification(
                              selectedValue
                            )}
                          </Box>
                        </Form.Field>
                      </>
                    )}

                    {leaveMode ===
                      "unplanned" && (
                      <Form.Field
                        className="grid mb-[10px]"
                        name="startDate"
                      >
                        <Box className="w-full">
                          <Box>
                            <Flex className="flex items-baseline justify-between">
                              <Form.Label className="block mb-1 font-medium text-sm text-black dark:text-white">
                                {t("Leave Date")}
                                <span className="text-red-500">
                                  *
                                </span>
                              </Form.Label>
                            </Flex>
                            <Form.Message
                              className="text-[13px] text-red-500 opacity-[0.8]"
                              match="valueMissing"
                            >
                              {t(
                                "startDateErrorMessage"
                              )}
                            </Form.Message>
                          </Box>
                          <Box className="w-full mt-1 dark:bg-gray-800">
                            <DatePicker
                              selected={startDate}
                              onChange={(
                                date
                              ) => {
                                setStartDate(date)
                                setEndDate(date)
                              }}
                              dateFormat="yyyy/MM/dd"
                              filterDate={
                                filterDates
                              }
                              minDate={new Date()}
                              wrapperClassName="w-full"
                              placeholderText="Select leave date"
                              customInput={
                                <CustomInput />
                              }
                              calendarClassName="bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
                            />
                          </Box>
                        </Box>
                      </Form.Field>
                    )}

                    <Form.Field
                      className="grid mb-[10px]"
                      name="description"
                    >
                      <Box>
                        <Form.Label className="block mb-1 font-medium text-sm">
                          {t("descriptionLabel")}
                          {leaveMode ===
                            "unplanned" && (
                            <span className="text-red-500">
                              *
                            </span>
                          )}
                        </Form.Label>
                        <Form.Message
                          className="text-[13px] text-red-500 opacity-[0.8]"
                          match="valueMissing"
                        >
                          Please enter a Reason or
                          description
                        </Form.Message>
                      </Box>
                      <Form.Control asChild>
                        <textarea
                          id="description"
                          name="description"
                          value={description}
                          onChange={(e) =>
                            setDescription(
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 focus:outline-none text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-black dark:text-white"
                          rows={
                            leaveMode ===
                            "unplanned"
                              ? "4"
                              : "2"
                          }
                          required={
                            leaveMode ===
                            "unplanned"
                          }
                        />
                      </Form.Control>
                    </Form.Field>

                    {leaveMode === "planned" && (
                      <Form.Field
                        className="grid mb-[10px]"
                        name="attachment"
                      >
                        <Box>
                          <Form.Label className="block mb-1 font-medium text-sm text-black dark:text-white">
                            {t("attachmentLabel")}
                          </Form.Label>
                        </Box>
                        <Form.Control asChild>
                          <input
                            id="file"
                            type="file"
                            accept="application/pdf"
                            onChange={
                              handleFileChange
                            }
                            className="w-full p-2 border border-gray-300 rounded mt-1 text-sm dark:border-gray-600"
                          />
                        </Form.Control>
                      </Form.Field>
                    )}

                    <Dialog.Close asChild>
                      <RxCrossCircled
                        size="1.5em"
                        className="crosscircleclose"
                        color="#727171"
                        onClick={handleCancel}
                      />
                    </Dialog.Close>
                    <Box className="flex justify-end mb-3 mt-6">
                      <Flex gap="3">
                        <Dialog.Close>
                          <Button
                            color="crimson"
                            variant="soft"
                            className="text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-800 dark:text-white rounded-md px-5 py-2.5 font-medium text-sm transition-all duration-200"
                            onClick={handleCancel}
                          >
                            {t("cancel")}
                          </Button>
                        </Dialog.Close>
                        <Button
                          className="hover:bg-blue-700 bg-blue-500 text-white cursor-pointer transition-colors duration-300 ease-out rounded px-4 py-1 item-center"
                          type="submit"
                          onClick={handleApply}
                          disabled={
                            leaveMode ===
                            "unplanned"
                              ? !startDate ||
                                !description
                              : applyDisable
                          }
                        >
                          {t("apply")}
                        </Button>
                      </Flex>
                    </Box>
                  </Form.Root>
                </Box>
              </Box>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  )
}

const SelectDemo = ({
  handleLeaveTypeChange,
}) => {
  const { t } = useTranslation()
  return (
    <Select.Root
      onValueChange={handleLeaveTypeChange}
    >
      <Select.Trigger
        className="inline-flex items-center justify-between rounded px-[15px] text-[13px] leading-none h-[40px] gap-[5px] hover:bg-mauve3 data-[placeholder]:text-violet9 outline-none w-full border border-gray-300 rounded mt-1 focus:outline-none focus:border-gray-300"
        aria-label="Leave Type"
      >
        <Select.Value
          defaultValue={t("casualLeave")}
          placeholder={t("casualLeave")}
          className="text-xl"
        />
        <Select.Icon>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="overflow-hidden w-full bg-white rounded-md dark:bg-gray-700 text-black dark:text-white shadow-lg border border-gray-300 dark:border-gray-600"
          position="popper"
        >
          <Select.ScrollUpButton>
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-[5px] border">
            <Select.Group>
              <SelectItem
                value={t("Casual Leave")}
              >
                {t("casualLeave")}
              </SelectItem>
              <Separator size="8" />
              <SelectItem
                value={t("Medical Leave")}
              >
                {t("medicalLeave")}
              </SelectItem>
              <Separator size="8" />
              <SelectItem
                value={t("Other Leaves")}
              >
                {t("otherLeaves")}
              </SelectItem>
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

SelectDemo.propTypes = {
  handleLeaveTypeChange: PropTypes.func,
}

const SelectItem = React.forwardRef(
  function SelectItem(
    { children, className, ...props },
    forwardedRef
  ) {
    return (
      <Select.Item
        className={classnames(
          "text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1",
          className
        )}
        {...props}
        style={{ width: "522px" }}
        ref={forwardedRef}
      >
        <Select.ItemText>
          {children}
        </Select.ItemText>
      </Select.Item>
    )
  }
)
SelectItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}
export default LeaveForm
LeaveForm.propTypes = {
  refresh: PropTypes.bool,
  setRefresh: PropTypes.func,
  onClose: PropTypes.func.isRequired,
}
