import React, { useState, useEffect } from "react"
import Calendar from "react-calendar"
import {
  Dialog,
  Text,
  TextField,
  Button,
  Flex,
  DropdownMenu,
  Badge,
  Box,
} from "@radix-ui/themes"
import "./Holidays.css"
import axios from "axios"
import { SlArrowDown } from "react-icons/sl"
import * as Label from "@radix-ui/react-label"
import { FadeLoader } from "react-spinners"
import toast from "react-hot-toast"
import { useOrganizationContext } from "../../OrganizationContext"
import ImportHolidaysModal from "./ImportHolidaysModal"

const Holidays = () => {
  const [holidays, setHolidays] = useState([])
  const [errors, setErrors] = useState({
    summary: false,
    holiday_type: false,
  })
  const holidayTypes = [
    "Mandatory",
    "Suggested",
    "Optional",
  ]
  const [date, setDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [selectedHoliday, setSelectedHoliday] =
    useState(null)
  const [
    selectedTypeLabel,
    setSelectedTypeLabel,
  ] = useState("Select Type")
  const [importModalOpen, setImportModalOpen] =
    useState(false)
  const [summarySize, setSummarySize] =
    useState(0)

  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { organizationName, org_slug } =
    useOrganizationContext()
  const fetchHolidays = () => {
    axios
      .get(`${BASE_URL}/holidays`, {
        params: {
          org_slug: org_slug,
          organization_name: organizationName,
        },
      })
      .then((response) => {
        setHolidays(response.data.data)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Error fetching holidays")
        setLoading(false)
      })
  }

  const handleSaveNewEvent = () => {
    if (summarySize < 2) {
      toast.error(
        "Holiday name should be at least 2 characters long"
      )
      return
    }
    const currentDate = new Date()
    const currentYearDate = new Date(
      currentDate.getFullYear(),
      0,
      1
    )
    const result = holidays.find(
      (holiday) =>
        holiday.summary.toLowerCase() ===
          selectedHoliday.summary.toLowerCase() &&
        new Date(holiday.date) >= currentYearDate
    )
    if (result) {
      toast.error(
        `Holiday already exists on date ${result.date}`
      )
      return
    }

    const newEventData = {
      date: selectedHoliday.date,
      summary: selectedHoliday.summary,
      holiday_type: selectedHoliday.holiday_type,
      org_slug: org_slug,
    }
    axios
      .post(
        `${BASE_URL}/add_holidays`,
        newEventData,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then(() => {
        toast.success(
          "Holiday Added Successfully!"
        )
        fetchHolidays()
      })
      .catch(() => {
        toast.error("Error creating event")
      })

    closeDialog()
  }

  useEffect(() => {
    fetchHolidays()
  }, [])

  const formatDate = (date) => {
    const offsetMinutes = date.getTimezoneOffset()
    const adjustedDate = new Date(
      date.getTime() - offsetMinutes * 60000
    )
    return adjustedDate
      .toISOString()
      .split("T")[0]
  }

  const openDialog = (holiday) => {
    setSelectedHoliday(
      holiday || {
        date: "",
        summary: "",
        holiday_type: "",
      }
    )
    setSelectedTypeLabel(
      holiday
        ? holiday.holiday_type || "Select Type"
        : "Select Type"
    )
  }

  const closeDialog = () => {
    setSelectedHoliday(null)
    setSelectedTypeLabel("Select Type")
    setErrors({
      summary: false,
      holiday_type: false,
    })
  }
  useEffect(() => {
    if (selectedHoliday) {
      setSelectedTypeLabel(
        selectedHoliday.holiday_type ||
          "Select Type"
      )
    }
  }, [selectedHoliday])

  const handleChangeHolidayType = (
    selectedType
  ) => {
    setSelectedHoliday((prev) => ({
      ...prev,
      holiday_type: selectedType.target.value,
    }))
    setSelectedTypeLabel(
      selectedType.target.value
    )
    setErrors((prevErrors) => ({
      ...prevErrors,
      holiday_type: "",
    }))
  }

  const handleSaveHoliday = () => {
    if (selectedHoliday.summary.length < 2) {
      toast.error(
        "Holiday name should be at least 2 characters long"
      )
      return
    }
    const currentDate = new Date()
    const currentYearDate = new Date(
      currentDate.getFullYear(),
      0,
      1
    )
    const result = holidays.find(
      (holiday) =>
        holiday._id !== selectedHoliday._id &&
        holiday.summary.toLowerCase() ===
          selectedHoliday.summary.toLowerCase() &&
        new Date(holiday.date) >= currentYearDate
    )
    if (result) {
      toast.error(
        `Holiday already exists on date ${result.date}`
      )
      return
    }

    if (
      !selectedHoliday.summary.trim() ||
      !selectedHoliday.holiday_type.trim()
    ) {
      setErrors({
        summary: !selectedHoliday.summary.trim(),
        holiday_type:
          !selectedHoliday.holiday_type.trim(),
      })
      return
    }
    const holiday_id = selectedHoliday._id
    const updatedHolidays = holidays.map(
      (holiday) => {
        return holiday.date ===
          selectedHoliday.date
          ? {
              ...holiday,
              holiday_type:
                selectedHoliday.holiday_type,
              summary: selectedHoliday.summary,
            }
          : holiday
      }
    )
    setHolidays(updatedHolidays)

    axios
      .put(
        `${BASE_URL}/update_holiday/${holiday_id}`,
        {
          holiday_type:
            selectedHoliday.holiday_type,
          summary: selectedHoliday.summary,
        },
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then(() => {
        toast.success(
          "Holiday updated successfully"
        )
        fetchHolidays()
      })
      .catch(() => {
        toast.error("Error updating holiday type")
      })
    closeDialog()
  }

  const getHolidayTypeBadge = (type) => {
    const badgeColors = {
      Mandatory: "green",
      Optional: "blue",
      Suggested: "purple",
    }

    const color = badgeColors[type]

    return color ? (
      <Badge
        color={color}
        className="dark:text-white"
      >
        {type}
      </Badge>
    ) : null
  }

  const tileContent = ({ date, view }) => {
    if (
      view === "month" &&
      Array.isArray(holidays)
    ) {
      const formattedDate = formatDate(date)
      const holiday = holidays.find(
        (h) => h.date === formattedDate
      )
      if (holiday) {
        return (
          <Box
            className={`${holiday.color || ""} text-sm sm:text-xs md:text-xs lg:text-sm overflow-x-auto overflow-y-auto`}
            onClick={() => openDialog(holiday)}
          >
            <p className="text-sm sm:text-xs md:text-xs lg:text-sm flex flex-col sm:flex-row md:flex-row">
              {holiday.summary}
            </p>
            <p className="text-xs sm:text-xs md:text-xs lg:text-sm">
              {getHolidayTypeBadge(
                holiday.holiday_type
              )}
            </p>
          </Box>
        )
      }
    }
  }

  const onDateClick = (value) => {
    const formattedDate = formatDate(value)
    const holiday = holidays.find(
      (h) => h.date === formattedDate
    )
    if (holiday) {
      openDialog(holiday)
    } else {
      openDialog({
        date: formattedDate,
      })
    }
  }

  const tileClassName = ({ date }) => {
    const formattedDate = formatDate(date)
    const holiday = holidays.find(
      (h) => h.date === formattedDate
    )
    return holiday ? "holiday-date" : null
  }

  if (loading) {
    return (
      <Box className="flex justify-center h-full items-center py-80">
        <FadeLoader color="#2563eb" />
      </Box>
    )
  }

  const handleSave = () => {
    const newErrors = {
      summary: !selectedHoliday.summary,
      holiday_type: !selectedHoliday.holiday_type,
    }
    setErrors(newErrors)
    if (
      newErrors.summary ||
      newErrors.holiday_type
    )
      return
    selectedHoliday._id
      ? handleSaveHoliday()
      : handleSaveNewEvent()
    setErrors({
      summary: false,
      holiday_type: false,
    })
  }

  const deleteHoliday = () => {
    const holiday_id = selectedHoliday._id
    axios
      .delete(
        `${BASE_URL}/delete_holiday/${holiday_id}`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then(() => {
        toast.success(
          "Holiday deleted successfully"
        )
        fetchHolidays()
      })
      .catch(() => {
        toast.error("Error deleting holiday")
      })
    closeDialog()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.name.match(/\.(xls|xlsx)$/)) {
      toast.error(
        "Invalid file format. Please upload an excel file",
        { autoClose: 3000 }
      )
      return
    }
  }

  const importHolidays = async (formData) => {
    if (!organizationName) {
      toast.error(
        "Organization Name is required!",
        { autoClose: 2000 }
      )
      return null
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/import_holidays`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      fetchHolidays()
      return response.data
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to import holidays"
      toast.error(
        typeof errorMessage === "object"
          ? JSON.stringify(errorMessage)
          : errorMessage,
        { autoClose: 3000 }
      )
      return null
    }
  }

  return (
    <Box>
      <div className="flex justify-end mt-2 mb-2 mr-1">
        <Button
          size="2"
          variant="solid"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded h-10"
          onClick={() => setImportModalOpen(true)}
        >
          Add Holidays
        </Button>
      </div>

      <Calendar
        onChange={setDate}
        value={date}
        tileContent={tileContent}
        onClickDay={onDateClick}
        tileClassName={tileClassName}
        className="calendar bg-white rounded-lg shadow-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-black dark:text-white"
      />

      {selectedHoliday && (
        <Dialog.Root open={true}>
          <Dialog.Content
            style={{ maxWidth: 320 }}
            onInteractOutside={closeDialog}
            onEscapeKeyDown={closeDialog}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
          >
            <Dialog.Title className="text-black dark:text-white">
              Holiday Info
            </Dialog.Title>
            <Flex
              direction="column"
              gap="3"
            >
              <Label.Root>
                <Text
                  as="Box"
                  size="2"
                  mb="1"
                  weight="bold"
                  className="text-black dark:text-white"
                >
                  Holiday Name
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </Text>
                <TextField.Input
                  value={
                    selectedHoliday?.summary || ""
                  }
                  placeholder="Enter holiday name"
                  onKeyDown={(e) => {
                    if (/\d/.test(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  onChange={(e) => {
                    setSelectedHoliday(
                      (prev) => ({
                        ...prev,
                        summary: e.target.value,
                      })
                    )
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      summary: false,
                    }))
                    setSummarySize(
                      e.target.value.length
                    )
                  }}
                  className={`border ${
                    errors.summary
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-white`}
                />
                {errors.summary && (
                  <Text className="text-xs text-red-700 mt-1">
                    This field is required
                  </Text>
                )}
              </Label.Root>
              <Label.Root>
                <Text
                  as="Box"
                  size="2"
                  mb="1"
                  weight="bold"
                  className="text-black dark:text-white"
                >
                  Date
                </Text>
                <input
                  type="text"
                  className="w-full px-2 py-1 text-sm border rounded-md outline-none rounded bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-white"
                  value={selectedHoliday.date}
                  readOnly
                  required
                />
              </Label.Root>

              <Box>
                <Label.Root className="font-bold text-sm text-black dark:text-white">
                  Holiday Type
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </Label.Root>
                <br />
                <Box>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Box className="box-border border-2 border-gray-300 dark:border-gray-600 w-32 mt-3 py-1 px-1 text-sm inline-flex bg-white dark:bg-gray-800 text-black dark:text-white rounded">
                        <span className="mr-3">
                          {selectedTypeLabel}
                        </span>
                        <SlArrowDown className="mt-1" />
                      </Box>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded shadow-md">
                      {holidayTypes.map(
                        (type) => (
                          <DropdownMenu.Item
                            key={type}
                            onSelect={() =>
                              handleChangeHolidayType(
                                {
                                  target: {
                                    value: type,
                                  },
                                }
                              )
                            }
                            className="hover:bg-gray-100 hover:text-black dark:hover:bg-gray-700 px-2 py-1 rounded"
                          >
                            {type}
                          </DropdownMenu.Item>
                        )
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                  <br />
                  {errors.holiday_type && (
                    <Text
                      disabled
                      className="text-xs text-red-700"
                    >
                      This field is required
                    </Text>
                  )}
                </Box>
              </Box>
            </Flex>
            <Flex
              justify="between"
              className="flex w-full"
            >
              <Box>
                {selectedHoliday._id && (
                  <Dialog.Close>
                    <Button
                      variant="soft"
                      color="red"
                      mt="2"
                      onClick={deleteHoliday}
                      className="bg-red-500 dark:bg-red-700 text-white dark:text-white hover:bg-red-100"
                    >
                      Delete
                    </Button>
                  </Dialog.Close>
                )}
              </Box>
              <Flex
                gap="3"
                mt="2"
                justify="end"
              >
                <Dialog.Close>
                  <Button
                    variant="soft"
                    color="red"
                    onClick={closeDialog}
                    className="px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md text-red-600 dark:text-white dark:bg-red-700"
                  >
                    Cancel
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button
                    onClick={handleSave}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Save
                  </Button>
                </Dialog.Close>
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}
      <ImportHolidaysModal
        importModalOpen={importModalOpen}
        setImportModalOpen={setImportModalOpen}
        handleFileChange={handleFileChange}
        handleImportHolidays={importHolidays}
        organizationName={organizationName}
      />
    </Box>
  )
}

export default Holidays
