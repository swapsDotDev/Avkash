import React, { useEffect, useState } from "react"
import * as Form from "@radix-ui/react-form"
import classnames from "classnames"
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons"
import * as Select from "@radix-ui/react-select"
import {
  Box,
  Grid,
  Flex,
  Button,
} from "@radix-ui/themes"
import { useUser } from "@clerk/clerk-react"
import axios from "axios"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { useOrganizationContext } from "../OrganizationContext"
import PropTypes from "prop-types"

function CustomProfilePage({ setOpenForm }) {
  const { user } = useUser()
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [userData, setUserData] = useState(null)
  const [accmsg, setAccmsg] = useState("")
  const [panmsg, setPanmsg] = useState("")
  const [countrymsg, setCountrymsg] = useState("")
  const [contactmsg, setContactmsg] = useState("")
  const [formData, setFormData] = useState({
    AccNumber: "",
    username: "",
    BankName: "",
    CountryCode: "",
    DateOfBirth: "",
    DateOfJoining: "",
    Gender: "",
    PanNumber: "",
    user_id: "",
    ContactNo: "",
  })
  const [showAccNumber, setShowAccNumber] =
    useState(false)
  const { t } = useTranslation()
  const [showPanNumber, setShowPanNumber] =
    useState(false)
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

  const storeData = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }
  const { organizationName, org_slug } =
    useOrganizationContext()
  useEffect(() => {
    const userData = {
      user_id: user.id,
      username: user.fullName,
      emailAddress:
        user.primaryEmailAddress.emailAddress,
    }
    setUserData(userData)
    setFormData({
      user_id: user.id,
      username: user.fullName,
    })
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
        toast.error("Error fetching data")
      })
  }, [user, BASE_URL, organizationName, org_slug])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (
      !/^[6-9]\d{9}$/.test(formData.ContactNo)
    ) {
      toast.error(
        "Invalid contact number. Must be a 10-digit number."
      )
      return
    }
    if (!isValidAccNumber(formData.AccNumber)) {
      toast.error(
        "Invalid account number. Must be a numeric value between 9 and 18 digits."
      )
      return
    }
    if (!isValidPanNumber(formData.PanNumber)) {
      toast.error(
        "Invalid PAN number. Must be in the format: ABCDE1234F"
      )
      return
    }
    if (
      !isValidCountryCode(formData.CountryCode)
    ) {
      toast.error(
        "Invalid country code. Must be in the format: +XX (where XX is numeric)."
      )
      return
    }
    const url = `${BASE_URL}/userinfo`
    const bankNameToSubmit =
      formData.BankName === "Other"
        ? formData.OtherBankName
        : formData.BankName
    axios
      .post(
        url,
        {
          ...formData,
          BankName: bankNameToSubmit,
          organization_name: organizationName,
        },
        {
          params: {
            org_slug: org_slug,
            organization_name: organizationName,
          },
        }
      )
      .then(() => {
        toast.success(
          "User details sent successfully"
        )
      })
      .catch(() => {
        toast.error("Error sending user details")
      })
    handleCancel(event)
  }

  const handleCancel = (e) => {
    e.preventDefault()
    window.Clerk.closeUserProfile()
    if (setOpenForm) {
      setOpenForm(false)
    }
  }

  const handleRadioChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
    storeData(e)
  }
  const handlePanNumberChange = (event) => {
    const inputValue = event.target.value
    setFormData({
      ...formData,
      PanNumber: inputValue,
    })
    const containsLowerCaseOrSpecialChars =
      /[a-z!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
        inputValue
      )
    if (containsLowerCaseOrSpecialChars) {
      setPanmsg(
        "Please provide the combination of uppercase letters and digits only."
      )
    } else {
      setPanmsg(
        "Invalid PAN number. (Format: ex.ABCDE2873D)"
      )
    }
  }

  const isValidPanNumber = (panNumber) => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
      panNumber
    )
  }
  const handleAccNumberChange = (event) => {
    const inputValue = event.target.value
    setFormData({
      ...formData,
      AccNumber: inputValue,
    })
    const isNotDigit = /[^\d]/.test(inputValue)
    if (isNotDigit) {
      setAccmsg("Please enter digits only")
    } else if (
      inputValue.length < 9 ||
      inputValue.length > 18
    ) {
      setAccmsg(
        "Invalid Account number, please enter digits only (9 to 18 digits)."
      )
    } else {
      setAccmsg("")
    }
  }

  const isValidAccNumber = (accNumber) => {
    return /^[0-9]{9,18}$/.test(accNumber)
  }
  const handleCountryCodeChange = (event) => {
    const inputValue = event.target.value
    setFormData({
      ...formData,
      CountryCode: inputValue,
    })
    const containsInvalidChars = /[^\d+?]/.test(
      inputValue
    )
    if (containsInvalidChars) {
      setCountrymsg(
        "Enter digits only. (format: +91 or +916)"
      )
    } else {
      setCountrymsg(
        "Invalid country code. (format: +91 or +916)"
      )
    }
  }

  const isValidCountryCode = (countrycode) => {
    return /^\+[0-9]{2}$/.test(countrycode)
  }
  const handleContactnoChange = (event) => {
    const inputValue = event.target.value
    setFormData({
      ...formData,
      ContactNo: inputValue,
    })
    const isNotDigit = /[^\d]/.test(inputValue)
    if (isNotDigit) {
      setContactmsg("please enter digits only")
    } else if (inputValue[0] < 6) {
      setContactmsg("Please enter correct number")
    } else if (inputValue.length !== 10) {
      setContactmsg(
        "please enter 10 digit number"
      )
    } else {
      setContactmsg("")
    }
  }

  const isValidPhoneNumber = (phoneNumber) => {
    const phoneNumberPattern = /^[6-9][0-9]{9}$/
    return phoneNumberPattern.test(phoneNumber)
  }

  return (
    <Grid className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 transition-colors duration-200">
      <Form.Root
        className="FormRoot"
        onSubmit={handleSubmit}
      >
        <Box>
          <h1 className="mb-4 text-4xl font-semibold leading-none tracking-tight text-gray-800 dark:text-white md:text-5xl lg:text-3xl">
            {t("UserInfo")}
          </h1>
          <Form.Field
            className="grid mb-[8px]"
            name="name"
          >
            <Box>
              <Form.Label className="font-semibold text-black dark:text-gray-200">
                {t("Name")}
              </Form.Label>
            </Box>
            <Form.Control asChild>
              <input
                type="text"
                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-black dark:text-gray-200 bg-white dark:bg-gray-700"
                value={formData.username}
                onChange={storeData}
                readOnly
              />
            </Form.Control>
          </Form.Field>
        </Box>
        <Box>
          <Form.Field
            className="grid mb-[8px]"
            name="email"
          >
            <Box>
              <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                {t("Email")}
              </Form.Label>
            </Box>
            <Form.Control asChild>
              <input
                type="text"
                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-black dark:text-gray-200 bg-white dark:bg-gray-700"
                value={
                  userData
                    ? userData.emailAddress
                    : ""
                }
                readOnly
              />
            </Form.Control>
          </Form.Field>
        </Box>
        <Box>
          <Form.Field
            className="FormField"
            name="Gender"
          >
            <Box className="flex items-baseline justify-between">
              <Form.Label className="mb-2 font-semibold text-black dark:text-gray-200">
                {t("Gender")}
              </Form.Label>
            </Box>
            <Box>
              <Flex
                align="center"
                gap="2"
                className="mb-3"
              >
                <input
                  id="male"
                  type="radio"
                  value="male"
                  name="Gender"
                  checked={
                    formData.Gender === "male"
                  }
                  className="global-input accent-blue-600 dark:accent-blue-400"
                  onChange={handleRadioChange}
                />
                <Form.Label
                  htmlFor="male"
                  className="text-sm font-medium text-gray-900 dark:text-gray-200 ml-1 pr-7"
                >
                  {t("Male")}
                </Form.Label>

                <input
                  id="female"
                  type="radio"
                  value="female"
                  name="Gender"
                  checked={
                    formData.Gender === "female"
                  }
                  className="global-input accent-blue-600 dark:accent-blue-400"
                  onChange={handleRadioChange}
                />
                <Form.Label
                  htmlFor="female"
                  className="text-sm font-medium text-gray-900 dark:text-gray-200 ml-1 pr-7 mb-1"
                >
                  {t("Female")}
                </Form.Label>

                <input
                  id="other"
                  type="radio"
                  value="other"
                  name="Gender"
                  checked={
                    formData.Gender === "other"
                  }
                  className="global-input accent-blue-600 dark:accent-blue-400"
                  onChange={handleRadioChange}
                />
                <Form.Label
                  htmlFor="other"
                  className="text-sm font-medium text-gray-900 dark:text-gray-200 ml-1 pr-7 mb-1"
                >
                  {t("Other")}
                </Form.Label>
              </Flex>
            </Box>
            <Box>
              <Form.Field
                className="grid mb-[8px]"
                name="DateOfBirth"
              >
                <Box>
                  <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                    {t("DateofBirth")}
                  </Form.Label>
                </Box>
                <Box>
                  <Form.Control asChild>
                    <input
                      type="date"
                      className="w-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded mt-1 text-sm text-black dark:text-gray-200 bg-white dark:bg-gray-700"
                      onChange={storeData}
                      value={formData.DateOfBirth}
                      max={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                    />
                  </Form.Control>
                </Box>
              </Form.Field>
            </Box>
          </Form.Field>
        </Box>
        <Box>
          {formData.role && (
            <Form.Field
              className="grid mb-[8px]"
              name="roletype"
            >
              <Box>
                <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                  {t("Role")}
                </Form.Label>
              </Box>
              <Box>
                <Form.Control asChild>
                  <input
                    type="text"
                    className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-black dark:text-gray-200 bg-white dark:bg-gray-700"
                    value={formData.role}
                    readOnly
                  />
                </Form.Control>
              </Box>
            </Form.Field>
          )}
        </Box>
        <Box>
          {formData.department && (
            <Form.Field
              className="grid mb-[8px]"
              name="department"
            >
              <Box>
                <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                  {t("Department")}
                </Form.Label>
              </Box>
              <Box>
                <Form.Control asChild>
                  <input
                    type="text"
                    className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-black dark:text-gray-200 bg-white dark:bg-gray-700"
                    value={formData.department}
                    readOnly
                  />
                </Form.Control>
              </Box>
            </Form.Field>
          )}
        </Box>
        <Box>
          <Form.Field
            className="grid mb-[8px]"
            name="DateOfJoining"
          >
            <Box>
              <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                {t("DateofJoining")}
              </Form.Label>
            </Box>
            <Box>
              <Form.Control asChild>
                <input
                  type="date"
                  className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-black dark:text-gray-200 bg-white dark:bg-gray-700"
                  onChange={storeData}
                  value={formData.DateOfJoining}
                  max={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </Form.Control>
            </Box>
          </Form.Field>
        </Box>
        <Box>
          {formData.designation && (
            <Form.Field
              className="grid mb-[8px]"
              name="designation"
            >
              <Box>
                <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                  {t("Designation")}
                </Form.Label>
              </Box>
              <Box>
                <Form.Control asChild>
                  <input
                    type="text"
                    className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-black dark:text-gray-200 bg-white dark:bg-gray-700"
                    value={formData.designation}
                    readOnly
                  />
                </Form.Control>
              </Box>
            </Form.Field>
          )}
        </Box>
        <Box>
          <Form.Field
            className="grid mb-[4px]"
            name="AccNumber"
          >
            <div className="relative">
              <Box>
                <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                  {t("Accountnumber")}
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type={
                      showAccNumber
                        ? "text"
                        : "password"
                    }
                    className={`w-full p-1 border rounded mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-black dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${
                      formData.AccNumber &&
                      !isValidAccNumber(
                        formData.AccNumber
                      )
                        ? "border-red-500 dark:border-red-400"
                        : ""
                    } ${
                      formData.AccNumber &&
                      isValidAccNumber(
                        formData.AccNumber
                      )
                        ? "border-green-500 dark:border-green-400"
                        : ""
                    }`}
                    onChange={
                      handleAccNumberChange
                    }
                    value={formData.AccNumber}
                  />
                </Form.Control>
                {formData.AccNumber &&
                  !/^[0-9]{9,18}$/.test(
                    formData.AccNumber
                  ) && (
                    <div className="text-red-500 dark:text-red-400 text-sm">
                      {accmsg}
                    </div>
                  )}
              </Box>
              {formData.AccNumber &&
                !isValidAccNumber(
                  formData.AccNumber
                ) && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 top-1/2 transform -translate-y-1/2">
                    <div className="lg-ui-icon-selector-0000 leafygreen-ui-uy5fvv">
                      <svg
                        className="leafygreen-ui-j02duz"
                        height="18"
                        width="25"
                        role="presentation"
                        aria-hidden="true"
                        alt=""
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3 3.05029L12.9497 13C13.2626 13.3129 13.7374 13.3129 14.0503 13L13 14.0503C12.7374 14.3129 12.2626 14.3129 12 14.0503L2.05025 4.10056C1.73736 3.78767 1.73736 3.31288 2.05025 3L3 3.05029Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#F87171"
                              : "red"
                          }
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13 3.05029L3.05025 13C2.73736 13.3129 2.26257 13.3129 1.94968 13L2.99999 13.9497C3.26257 14.2123 3.73736 14.2123 4.05025 13.9497L13 4.10055C13.2626 3.78766 13.2626 3.31288 13 3.05029Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#F87171"
                              : "red"
                          }
                        />
                      </svg>
                    </div>
                  </div>
                )}
              {formData.AccNumber &&
                isValidAccNumber(
                  formData.AccNumber
                ) && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 top-3/4 transform -translate-y-1/2">
                    <div className="lg-ui-icon-selector-0000 leafygreen-ui-uy5fvv">
                      <svg
                        className="leafygreen-ui-j02duz"
                        height="18"
                        width="20"
                        role="presentation"
                        aria-hidden="true"
                        alt=""
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M6.30583 9.05037L11.7611 3.59509C12.1516 3.20457 12.7848 3.20457 13.1753 3.59509L13.8824 4.3022C14.273 4.69273 14.273 5.32589 13.8824 5.71642L6.81525 12.7836C6.38819 13.2106 5.68292 13.1646 5.31505 12.6856L2.26638 8.71605C1.92998 8.27804 2.01235 7.65025 2.45036 7.31385L3.04518 6.85702C3.59269 6.43652 4.37742 6.53949 4.79792 7.087L6.30583 9.05037Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#4ADE80"
                              : "green"
                          }
                        />
                      </svg>
                    </div>
                  </div>
                )}

              <Box
                justify="between"
                className="mb-1 absolute inset-y-10 right-10 flex items-center"
              >
                {showAccNumber ? (
                  <button
                    type="button"
                    onClick={() =>
                      setShowAccNumber(false)
                    }
                  >
                    <img
                      src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5 ${
                        currentTheme === "dark"
                          ? "text-gray-300"
                          : "text-red-600"
                      }' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'/%3E%3C/svg%3E`}
                      alt="View"
                      className="h-5 w-5 inline-block align-middle"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setShowAccNumber(true)
                    }
                  >
                    <img
                      src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5 ${
                        currentTheme === "dark"
                          ? "text-gray-300"
                          : "text-red-600"
                      }' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/%3E%3C/svg%3E`}
                      alt="Hide"
                      className="h-5 w-5 inline-block align-middle"
                    />
                  </button>
                )}
              </Box>
            </div>
          </Form.Field>
        </Box>
        <Box>
          <Form.Field
            className="grid mb-[4px]"
            name="PanNumber"
          >
            <div className="relative">
              <Box>
                <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                  {t("PANnumber")}
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type={
                      showPanNumber
                        ? "text"
                        : "password"
                    }
                    className={`w-full p-1 border rounded mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-black dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${
                      formData.PanNumber &&
                      !isValidPanNumber(
                        formData.PanNumber
                      )
                        ? "border-red-500 dark:border-red-400"
                        : ""
                    } ${
                      formData.PanNumber &&
                      isValidPanNumber(
                        formData.PanNumber
                      )
                        ? "border-green-500 dark:border-green-400"
                        : ""
                    }`}
                    onChange={
                      handlePanNumberChange
                    }
                    value={formData.PanNumber}
                  />
                </Form.Control>
                {formData.PanNumber &&
                  !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
                    formData.PanNumber
                  ) && (
                    <div className="text-red-500 dark:text-red-400 text-sm">
                      {panmsg}
                    </div>
                  )}
              </Box>
              {formData.PanNumber &&
                !isValidPanNumber(
                  formData.PanNumber
                ) && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 top-1/2 transform -translate-y-1/2">
                    <div className="lg-ui-icon-selector-0000 leafygreen-ui-uy5fvv">
                      <svg
                        className="leafygreen-ui-j02duz"
                        height="18"
                        width="25"
                        role="presentation"
                        aria-hidden="true"
                        alt=""
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3 3.05029L12.9497 13C13.2626 13.3129 13.7374 13.3129 14.0503 13L13 14.0503C12.7374 14.3129 12.2626 14.3129 12 14.0503L2.05025 4.10056C1.73736 3.78767 1.73736 3.31288 2.05025 3L3 3.05029Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#F87171"
                              : "red"
                          }
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13 3.05029L3.05025 13C2.73736 13.3129 2.26257 13.3129 1.94968 13L2.99999 13.9497C3.26257 14.2123 3.73736 14.2123 4.05025 13.9497L13 4.10055C13.2626 3.78766 13.2626 3.31288 13 3.05029Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#F87171"
                              : "red"
                          }
                        />
                      </svg>
                    </div>
                  </div>
                )}
              {formData.PanNumber &&
                isValidPanNumber(
                  formData.PanNumber
                ) && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 top-3/4 transform -translate-y-1/2">
                    <div className="lg-ui-icon-selector-0000 leafygreen-ui-uy5fvv">
                      <svg
                        className="leafygreen-ui-j02duz"
                        height="18"
                        width="20"
                        role="presentation"
                        aria-hidden="true"
                        alt=""
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M6.30583 9.05037L11.7611 3.59509C12.1516 3.20457 12.7848 3.20457 13.1753 3.59509L13.8824 4.3022C14.273 4.69273 14.273 5.32589 13.8824 5.71642L6.81525 12.7836C6.38819 13.2106 5.68292 13.1646 5.31505 12.6856L2.26638 8.71605C1.92998 8.27804 2.01235 7.65025 2.45036 7.31385L3.04518 6.85702C3.59269 6.43652 4.37742 6.53949 4.79792 7.087L6.30583 9.05037Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#4ADE80"
                              : "green"
                          }
                        />
                      </svg>
                    </div>
                  </div>
                )}

              <Box
                justify="between"
                className="mb-1 absolute inset-y-10 right-10 flex items-center"
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowPanNumber(
                      !showPanNumber
                    )
                  }
                >
                  {showPanNumber ? (
                    <img
                      src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5 ${
                        currentTheme === "dark"
                          ? "text-gray-300"
                          : "text-red-600"
                      }' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'/%3E%3C/svg%3E`}
                      alt="View"
                      className="h-5 w-5 inline-block align-middle"
                    />
                  ) : (
                    <img
                      src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5 ${
                        currentTheme === "dark"
                          ? "text-gray-300"
                          : "text-red-600"
                      }' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/%3E%3C/svg%3E`}
                      alt="Hide"
                      className="h-5 w-5 inline-block align-middle"
                    />
                  )}
                </button>
              </Box>
            </div>
          </Form.Field>
        </Box>
        <Box>
          <Form.Field
            className="grid mb-[8px]"
            onChange={storeData}
          >
            <Box name="BankName">
              <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                {t("BankName")}
              </Form.Label>
            </Box>
            <Box>
              <Form.Control asChild>
                <Banknamelist
                  BankName={formData.BankName}
                />
              </Form.Control>
            </Box>
          </Form.Field>
          {formData.BankName === "Other" && (
            <Form.Field className="grid mb-[8px]">
              <Box>
                <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                  Please enter bank name
                </Form.Label>
              </Box>
              <Box>
                <Form.Control asChild>
                  <input
                    type="text"
                    className="w-full hover:bg-gray-100 dark:hover:bg-gray-700 p-1 text-sm border border-gray-300 dark:border-gray-600 rounded mt-1 text-black dark:text-gray-200 bg-white dark:bg-gray-700"
                    name="OtherBankName"
                    onChange={storeData}
                    value={formData.OtherBankName}
                  />
                </Form.Control>
              </Box>
            </Form.Field>
          )}
        </Box>
        <Box>
          <Form.Field
            className="grid mb-[8px]"
            name="CountryCode"
          >
            <div className="relative">
              <Box>
                <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                  {t("Countrycode")}
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    className={`w-full p-1 border rounded mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-black dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${
                      formData.CountryCode &&
                      !isValidCountryCode(
                        formData.CountryCode
                      )
                        ? "border-red-500 dark:border-red-400"
                        : ""
                    } ${
                      formData.CountryCode &&
                      isValidCountryCode(
                        formData.CountryCode
                      )
                        ? "border-green-500 dark:border-green-400"
                        : ""
                    }`}
                    onChange={
                      handleCountryCodeChange
                    }
                    value={formData.CountryCode}
                  />
                </Form.Control>
                {formData.CountryCode &&
                  !/^\+[0-9]{2}$/.test(
                    formData.CountryCode
                  ) && (
                    <div className="text-red-500 dark:text-red-400 text-sm">
                      {countrymsg}
                    </div>
                  )}
              </Box>
              {formData.CountryCode &&
                !isValidCountryCode(
                  formData.CountryCode
                ) && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 top-2/4 transform -translate-y-1/2">
                    <div className="lg-ui-icon-selector-0000 leafygreen-ui-uy5fvv">
                      <svg
                        className="leafygreen-ui-j02duz"
                        height="18"
                        width="25"
                        role="presentation"
                        aria-hidden="true"
                        alt=""
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3 3.05029L12.9497 13C13.2626 13.3129 13.7374 13.3129 14.0503 13L13 14.0503C12.7374 14.3129 12.2626 14.3129 12 14.0503L2.05025 4.10056C1.73736 3.78767 1.73736 3.31288 2.05025 3L3 3.05029Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#F87171"
                              : "red"
                          }
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13 3.05029L3.05025 13C2.73736 13.3129 2.26257 13.3129 1.94968 13L2.99999 13.9497C3.26257 14.2123 3.73736 14.2123 4.05025 13.9497L13 4.10055C13.2626 3.78766 13.2626 3.31288 13 3.05029Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#F87171"
                              : "red"
                          }
                        />
                      </svg>
                    </div>
                  </div>
                )}
              {formData.CountryCode &&
                isValidCountryCode(
                  formData.CountryCode
                ) && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 top-3/4 transform -translate-y-1/2">
                    <div className="lg-ui-icon-selector-0000 leafygreen-ui-uy5fvv">
                      <svg
                        className="leafygreen-ui-j02duz"
                        height="18"
                        width="20"
                        role="presentation"
                        aria-hidden="true"
                        alt=""
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M6.30583 9.05037L11.7611 3.59509C12.1516 3.20457 12.7848 3.20457 13.1753 3.59509L13.8824 4.3022C14.273 4.69273 14.273 5.32589 13.8824 5.71642L6.81525 12.7836C6.38819 13.2106 5.68292 13.1646 5.31505 12.6856L2.26638 8.71605C1.92998 8.27804 2.01235 7.65025 2.45036 7.31385L3.04518 6.85702C3.59269 6.43652 4.37742 6.53949 4.79792 7.087L6.30583 9.05037Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#4ADE80"
                              : "green"
                          }
                        />
                      </svg>
                    </div>
                  </div>
                )}
            </div>
          </Form.Field>
        </Box>
        <Box>
          <Form.Field
            className="grid mb-[8px]"
            name="ContactNo"
          >
            <div className="relative">
              <Box>
                <Form.Label className="mb-1 font-semibold text-black dark:text-gray-200">
                  {t("ContactNumber")}
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    className={`w-full p-1 border rounded mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-black dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${
                      formData.ContactNo &&
                      !isValidPhoneNumber(
                        formData.ContactNo
                      )
                        ? "border-red-500 dark:border-red-400"
                        : ""
                    } ${
                      formData.ContactNo &&
                      isValidPhoneNumber(
                        formData.ContactNo
                      )
                        ? "border-green-500 dark:border-green-400"
                        : ""
                    }`}
                    onChange={
                      handleContactnoChange
                    }
                    value={formData.ContactNo}
                  />
                </Form.Control>
                {formData.ContactNo &&
                  !/^[6-9][0-9]{9}$/.test(
                    formData.ContactNo
                  ) && (
                    <div className="text-red-500 dark:text-red-400 text-sm">
                      {contactmsg}
                    </div>
                  )}
              </Box>
              {formData.ContactNo &&
                !isValidPhoneNumber(
                  formData.ContactNo
                ) && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 top-1/2 transform -translate-y-1/2">
                    <div className="lg-ui-icon-selector-0000 leafygreen-ui-uy5fvv">
                      <svg
                        className="leafygreen-ui-j02duz"
                        height="18"
                        width="25"
                        role="presentation"
                        aria-hidden="true"
                        alt=""
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3 3.05029L12.9497 13C13.2626 13.3129 13.7374 13.3129 14.0503 13L13 14.0503C12.7374 14.3129 12.2626 14.3129 12 14.0503L2.05025 4.10056C1.73736 3.78767 1.73736 3.31288 2.05025 3L3 3.05029Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#F87171"
                              : "red"
                          }
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13 3.05029L3.05025 13C2.73736 13.3129 2.26257 13.3129 1.94968 13L2.99999 13.9497C3.26257 14.2123 3.73736 14.2123 4.05025 13.9497L13 4.10055C13.2626 3.78766 13.2626 3.31288 13 3.05029Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#F87171"
                              : "red"
                          }
                        />
                      </svg>
                    </div>
                  </div>
                )}
              {formData.ContactNo &&
                isValidPhoneNumber(
                  formData.ContactNo
                ) && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 top-3/4 transform -translate-y-1/2">
                    <div className="lg-ui-icon-selector-0000 leafygreen-ui-uy5fvv">
                      <svg
                        className="leafygreen-ui-j02duz"
                        height="18"
                        width="20"
                        role="presentation"
                        aria-hidden="true"
                        alt=""
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M6.30583 9.05037L11.7611 3.59509C12.1516 3.20457 12.7848 3.20457 13.1753 3.59509L13.8824 4.3022C14.273 4.69273 14.273 5.32589 13.8824 5.71642L6.81525 12.7836C6.38819 13.2106 5.68292 13.1646 5.31505 12.6856L2.26638 8.71605C1.92998 8.27804 2.01235 7.65025 2.45036 7.31385L3.04518 6.85702C3.59269 6.43652 4.37742 6.53949 4.79792 7.087L6.30583 9.05037Z"
                          fill={
                            currentTheme ===
                            "dark"
                              ? "#4ADE80"
                              : "green"
                          }
                        />
                      </svg>
                    </div>
                  </div>
                )}
            </div>
          </Form.Field>
        </Box>
        <Flex
          direction="row-reverse"
          gap="3"
        >
          <Box>
            <Form.Submit asChild>
              <Button
                variant="solid"
                className="!bg-blue-800 dark:!bg-blue-700 !text-white !border-2 !border-blue-800 dark:!border-blue-700 rounded-md hover:bg-blue-900 dark:hover:bg-blue-600 hover:border-blue-900 dark:hover:border-blue-600 transition-colors duration-200"
                style={{
                  padding: "0.3rem 0.8rem",
                  borderRadius: "0.375rem",
                  marginTop: "1rem",
                  marginLeft: "1rem",
                }}
              >
                {t("Submit")}
              </Button>
            </Form.Submit>
          </Box>
          <Box>
            <Form.Submit asChild>
              <Button
                variant="soft"
                className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-white hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200"
                style={{
                  padding: "0.3rem 0.8rem",
                  borderRadius: "0.375rem",
                  marginTop: "1rem",
                }}
                onClick={handleCancel}
              >
                {t("Cancel")}
              </Button>
            </Form.Submit>
          </Box>
        </Flex>
      </Form.Root>
    </Grid>
  )
}

CustomProfilePage.propTypes = {
  setOpenForm: PropTypes.func,
}

const Banknamelist = ({ BankName }) => (
  <Select.Root name="BankName">
    <Select.Trigger
      className="inline-flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 justify-between rounded px-[10px] text-[13px] leading-none h-[33px] gap-[1px] text-black dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none w-full mt-1 transition-colors duration-200"
      aria-label="Bank Names"
    >
      <Select.Value
        defaultValue={BankName}
        placeholder={BankName}
        className="text-xl"
      />
      <Select.Icon>
        <ChevronDownIcon className="text-gray-500 dark:text-gray-300" />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content
        className="overflow-hidden bg-white dark:bg-gray-700 rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
        style={{ zIndex: 10000 }}
      >
        <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-default">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className="p-[5px]">
          <Select.Group>
            <SelectItem
              className="hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-gray-200"
              value="SBI"
            >
              SBI
            </SelectItem>
            <SelectItem
              className="hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-gray-200"
              value="BOI"
            >
              BOI
            </SelectItem>
            <SelectItem
              className="hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-gray-200"
              value="Axis Bank"
            >
              Axis Bank
            </SelectItem>
            <SelectItem
              className="hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-gray-200"
              value="HDFC Bank"
            >
              HDFC Bank
            </SelectItem>
            <SelectItem
              className="hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-gray-200"
              value="Other"
            >
              Other
            </SelectItem>
          </Select.Group>
        </Select.Viewport>
        <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-default">
          <ChevronDownIcon />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
)
Banknamelist.propTypes = {
  BankName: PropTypes.string,
}

const SelectItem = React.forwardRef(
  function SelectItem(
    { children, className, ...props },
    forwardedRef
  ) {
    return (
      <Select.Item
        className={classnames(
          "text-[13px] leading-none rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-blue-100 dark:data-[highlighted]:bg-blue-600 data-[highlighted]:text-black dark:data-[highlighted]:text-gray-200",
          className
        )}
        {...props}
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
  children: PropTypes.string,
  className: PropTypes.string,
}

export default CustomProfilePage
