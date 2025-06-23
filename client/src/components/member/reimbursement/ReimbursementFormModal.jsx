import React, {
  useState,
  useEffect,
  useRef,
} from "react"
import axios from "axios"
import { Button, Text } from "@radix-ui/themes"
import {
  Cross2Icon,
  PlusIcon,
} from "@radix-ui/react-icons"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { useOrganizationContext } from "../../OrganizationContext"
import * as Dialog from "@radix-ui/react-dialog"
import PropTypes from "prop-types"
import { RxCrossCircled } from "react-icons/rx"
import { useUser } from "@clerk/clerk-react"
import { ClipLoader } from "react-spinners"

const ExpenseCategories = [
  {
    value: "Meals",
    label: "Meals",
    description: "Food and beverage expenses",
  },
  {
    value: "Conveyance",
    label: "Conveyance (Within City)",
    description: "Local transportation costs",
  },
  {
    value: "Computer",
    label: "Computer",
    description: "Hardware/software expenses",
  },
  {
    value: "Office",
    label: "Office Expenses",
    description: "General office supplies",
  },
  {
    value: "Travel",
    label: "Travel",
    description: "Out-of-city travel expenses",
  },
  {
    value: "Other",
    label: "Other",
    description: "Miscellaneous expenses",
  },
]

const initialFormState = {
  employeeName: "",
  employeeId: "",
  department: "",
  manager: "",
  expenses: [
    {
      date: "",
      description: "",
      categoryExpenses: [],
      uploadedFiles: [],
    },
  ],
}

const getInitialExpense = () => ({
  date: "",
  description: "",
  categoryExpenses: [],
  uploadedFiles: [],
})

const ReimbursementFormModal = ({
  isOpen,
  onClose,
}) => {
  const { organizationName, org_slug, socket } =
    useOrganizationContext()
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { user } = useUser()

  const [isModalOpen, setIsModalOpen] = useState(
    isOpen || false
  )
  const [formData, setFormData] = useState(
    initialFormState
  )
  const [isSubmitting, setIsSubmitting] =
    useState(false)
  const [errors, setErrors] = useState({})
  const [totalAmount, setTotalAmount] =
    useState(0)
  const [
    categoryCollapseState,
    setCategoryCollapseState,
  ] = useState({})
  const employeeDetailsFetched = useRef(false)
  const [applyDisable, setApplyDisable] =
    useState(true)
  const [
    fixedEmployeeDetails,
    setFixedEmployeeDetails,
  ] = useState({
    employeeName: "",
    employeeId: "",
    department: "",
    manager: "",
  })

  const validationPatterns = {
    alphabetOnly: /^[A-Za-z\s]+$/,
    numberOnly: /^\d+(\.\d+)?$/,
    alphanumericWithUnderscore: /^[A-Za-z0-9_]+$/,
  }

  useEffect(() => {
    const total = formData.expenses.reduce(
      (sum, expense) => {
        const expenseTotal =
          expense.categoryExpenses.reduce(
            (catSum, cat) =>
              catSum +
              (parseFloat(cat.amount) || 0),
            0
          )
        return sum + expenseTotal
      },
      0
    )
    setTotalAmount(total)
  }, [formData.expenses])

  useEffect(() => {
    if (isOpen !== undefined)
      setIsModalOpen(isOpen)
  }, [isOpen])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          `${BASE_URL}/user/${user.id}`,
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          }
        )

        if (
          userResponse.data &&
          userResponse.data.user_data.length > 0
        ) {
          const userData =
            userResponse.data.user_data[0]
          const departmentResponse =
            await axios.get(
              `${BASE_URL}/departmentinfo`,
              {
                params: {
                  organization_name:
                    organizationName,
                  org_slug: org_slug,
                },
              }
            )

          let departmentName = "NA"
          let managerName = "NA"
          if (
            departmentResponse.data &&
            departmentResponse.data
              .department_data.length > 0 &&
            userData.department
          ) {
            const department =
              departmentResponse.data.department_data.find(
                (dept) =>
                  dept.department_name.toLowerCase() ===
                  userData.department.toLowerCase()
              )
            if (department) {
              departmentName =
                department.department_name || "NA"
              managerName =
                department.manager || "NA"
            }
          }

          const employeeDetails = {
            employeeName: userData.username || "",
            employeeId:
              userData.employee_id || "",
            department: departmentName,
            manager: managerName,
          }

          setFixedEmployeeDetails(employeeDetails)
          setFormData((prevData) => ({
            ...prevData,
            ...employeeDetails,
          }))
          employeeDetailsFetched.current = true
        } else {
          const employeeDetails = {
            employeeName: user.fullName || "NA",
            employeeId: user.employee_id || "NA",
            department: "NA",
            manager: "NA",
          }
          setFixedEmployeeDetails(employeeDetails)
          setFormData((prevData) => ({
            ...prevData,
            ...employeeDetails,
          }))
        }
      } catch (error) {
        toast.error(
          "Please wait until you are assigned to respective department."
        )
      }
    }

    if (!employeeDetailsFetched.current)
      fetchUserData()
  }, [user.id, organizationName, org_slug])

  const handleOpenChange = (open) => {
    setIsModalOpen(open)
    if (!open) {
      setFormData((prevData) => ({
        ...prevData,
        expenses: [getInitialExpense()],
      }))
      setErrors({})
      setTotalAmount(0)
      setCategoryCollapseState({})
      if (onClose) onClose()
    }
  }

  const handleExpenseChange = (
    index,
    field,
    value
  ) => {
    const updatedExpenses = [...formData.expenses]
    updatedExpenses[index][field] = value
    setFormData({
      ...formData,
      expenses: updatedExpenses,
    })

    const isAlphabetField = [
      "description",
    ].includes(field)
    setErrors((prevErrors) => ({
      ...prevErrors,
      [`expense${index}`]: {
        ...prevErrors[`expense${index}`],
        [field]:
          (field === "date" && !value.trim()) ||
          (isAlphabetField &&
            !validationPatterns.alphabetOnly.test(
              value.trim()
            )),
      },
    }))
  }

  const handleCategoryChange = (
    expenseIndex,
    category,
    checked
  ) => {
    setFormData((prevData) => {
      const updatedExpenses = [
        ...prevData.expenses,
      ]
      const expense =
        updatedExpenses[expenseIndex]

      if (checked) {
        expense.categoryExpenses.push({
          category,
          amount: 0,
          otherCategory:
            category === "Other" ? "" : undefined,
        })
        setCategoryCollapseState((prev) => ({
          ...prev,
          [`${expenseIndex}-${category}`]: true,
        }))
      } else {
        expense.categoryExpenses =
          expense.categoryExpenses.filter(
            (item) => item.category !== category
          )
        setCategoryCollapseState((prev) => {
          const newState = { ...prev }
          delete newState[
            `${expenseIndex}-${category}`
          ]
          return newState
        })
      }

      return {
        ...prevData,
        expenses: updatedExpenses,
      }
    })

    setErrors((prevErrors) => ({
      ...prevErrors,
      [`expense${expenseIndex}`]: {
        ...prevErrors[`expense${expenseIndex}`],
        categoryExpenses: false,
      },
    }))
  }

  const handleCategoryAmountChange = (
    expenseIndex,
    categoryIndex,
    amount
  ) => {
    setFormData((prevData) => {
      const updatedExpenses = [
        ...prevData.expenses,
      ]
      updatedExpenses[
        expenseIndex
      ].categoryExpenses[categoryIndex].amount =
        amount
      return {
        ...prevData,
        expenses: updatedExpenses,
      }
    })

    setErrors((prevErrors) => ({
      ...prevErrors,
      [`expense${expenseIndex}`]: {
        ...prevErrors[`expense${expenseIndex}`],
        [`categoryAmount${categoryIndex}`]: false,
      },
    }))
  }

  const handleOtherCategoryChange = (
    expenseIndex,
    categoryIndex,
    value
  ) => {
    setFormData((prevData) => {
      const updatedExpenses = [
        ...prevData.expenses,
      ]
      updatedExpenses[
        expenseIndex
      ].categoryExpenses[
        categoryIndex
      ].otherCategory = value
      return {
        ...prevData,
        expenses: updatedExpenses,
      }
    })

    setErrors((prevErrors) => ({
      ...prevErrors,
      [`expense${expenseIndex}`]: {
        ...prevErrors[`expense${expenseIndex}`],
        [`otherCategory${categoryIndex}`]: false,
      },
    }))
  }

  const toggleCategoryCollapse = (
    expenseIndex,
    category
  ) => {
    setCategoryCollapseState((prev) => ({
      ...prev,
      [`${expenseIndex}-${category}`]:
        !prev[`${expenseIndex}-${category}`],
    }))
  }

  const handleAddExpense = () => {
    setFormData({
      ...formData,
      expenses: [
        ...formData.expenses,
        getInitialExpense(),
      ],
    })
  }

  const handleRemoveExpense = (index) => {
    const updatedExpenses = [...formData.expenses]
    updatedExpenses.splice(index, 1)
    setFormData({
      ...formData,
      expenses: updatedExpenses,
    })

    const updatedErrors = { ...errors }
    delete updatedErrors[`expense${index}`]
    setErrors(updatedErrors)

    setCategoryCollapseState((prev) => {
      const newState = { ...prev }
      Object.keys(newState).forEach((key) => {
        if (key.startsWith(`${index}-`))
          delete newState[key]
      })
      return newState
    })
  }

  const handleFileChange = (
    expenseIndex,
    event
  ) => {
    const files = Array.from(event.target.files)
    const newFiles = files.map((file) => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} Mb`,
      date: format(new Date(), "dd/MM/yyyy"),
      file: file,
    }))

    setFormData((prevData) => {
      const updatedExpenses = [
        ...prevData.expenses,
      ]
      updatedExpenses[
        expenseIndex
      ].uploadedFiles = [
        ...updatedExpenses[expenseIndex]
          .uploadedFiles,
        ...newFiles,
      ]
      return {
        ...prevData,
        expenses: updatedExpenses,
      }
    })
  }

  const handleRemoveFile = (
    expenseIndex,
    fileIndex
  ) => {
    setFormData((prevData) => {
      const updatedExpenses = [
        ...prevData.expenses,
      ]
      updatedExpenses[
        expenseIndex
      ].uploadedFiles.splice(fileIndex, 1)
      return {
        ...prevData,
        expenses: updatedExpenses,
      }
    })
  }

  const validateForm = () => {
    const newErrors = {}
    const {
      employeeName,
      employeeId,
      department,
      manager,
      expenses,
    } = formData
    const {
      alphabetOnly,
      numberOnly,
      alphanumericWithUnderscore,
    } = validationPatterns

    newErrors.employeeName =
      !employeeName.trim() ||
      !alphabetOnly.test(employeeName.trim())
    newErrors.employeeId =
      !employeeId.trim() ||
      !alphanumericWithUnderscore.test(
        employeeId.trim()
      )
    newErrors.department =
      !department.trim() ||
      !alphabetOnly.test(department.trim())
    newErrors.manager =
      !manager.trim() ||
      !alphabetOnly.test(manager.trim())

    expenses.forEach((expense, index) => {
      const expenseErrors = {
        date: !expense.date.trim(),
        description:
          !expense.description.trim() ||
          !alphabetOnly.test(
            expense.description.trim()
          ) ||
          expense.description.length > 200,
        categoryExpenses:
          expense.categoryExpenses.length === 0,
        uploadedFiles:
          expense.categoryExpenses.length > 0 &&
          expense.uploadedFiles.length === 0,
      }

      expense.categoryExpenses.forEach(
        (catExpense, catIndex) => {
          expenseErrors[
            `categoryAmount${catIndex}`
          ] =
            catExpense.amount <= 0 ||
            !numberOnly.test(
              String(catExpense.amount)
            )
          if (catExpense.category === "Other") {
            expenseErrors[
              `otherCategory${catIndex}`
            ] = !catExpense.otherCategory.trim()
          }
        }
      )

      newErrors[`expense${index}`] = expenseErrors
    })

    setErrors(newErrors)

    return (
      !newErrors.employeeName &&
      !newErrors.employeeId &&
      !newErrors.department &&
      !newErrors.manager &&
      expenses.every((_, index) => {
        const expErrors =
          newErrors[`expense${index}`]
        return !Object.values(expErrors).some(
          Boolean
        )
      })
    )
  }

  const checkAllFieldsFilled = () => {
    const {
      employeeName,
      employeeId,
      department,
      manager,
      expenses,
    } = formData

    if (
      !employeeName.trim() ||
      !employeeId.trim() ||
      !department.trim() ||
      !manager.trim()
    ) {
      return false
    }

    for (const expense of expenses) {
      if (
        !expense.date?.trim() ||
        !expense.description?.trim() ||
        expense.categoryExpenses?.length === 0 ||
        (expense.categoryExpenses.length > 0 &&
          expense.uploadedFiles.length === 0)
      ) {
        return false
      }

      for (const categoryExpense of expense.categoryExpenses) {
        if (
          !categoryExpense.amount ||
          (categoryExpense.category === "Other" &&
            !categoryExpense.otherCategory?.trim())
        ) {
          return false
        }
      }
    }

    return true
  }

  useEffect(() => {
    setApplyDisable(!checkAllFieldsFilled())
  }, [formData])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const fileFormData = new FormData()
      formData.expenses.forEach(
        (expense, expenseIndex) => {
          expense.uploadedFiles.forEach(
            (fileObj, fileIndex) => {
              const key = `attachments_${expenseIndex}_${fileIndex}`
              fileFormData.append(
                key,
                fileObj.file
              )
            }
          )
        }
      )

      const transformedExpenses =
        formData.expenses.map((expense) => {
          const categories =
            expense.categoryExpenses.map(
              (ce) => ce.category
            )
          const otherCategory =
            expense.categoryExpenses.find(
              (ce) => ce.category === "Other"
            )?.otherCategory || ""
          const amount =
            expense.categoryExpenses.reduce(
              (sum, catExp) =>
                sum +
                parseFloat(catExp.amount || 0),
              0
            )
          const categoryBreakdown =
            expense.categoryExpenses.map(
              (ce) => ({
                category:
                  ce.category === "Other"
                    ? `Other (${ce.otherCategory})`
                    : ce.category,
                amount: parseFloat(
                  ce.amount || 0
                ),
              })
            )
          const attachments =
            expense.uploadedFiles.map((file) => ({
              filename: file.name,
              size: file.size,
              date: file.date,
            }))

          return {
            date: expense.date,
            description: expense.description,
            categories,
            otherCategory,
            amount,
            categoryBreakdown,
            attachments,
          }
        })

      const reimbursementData = {
        ...formData,
        expenses: transformedExpenses,
        totalAmount,
        createdAt: new Date().toISOString(),
      }

      fileFormData.append(
        "reimbursementData",
        JSON.stringify(reimbursementData)
      )
      fileFormData.append("user_id", user.id)

      const response = await axios.post(
        `${BASE_URL}/submit_reimbursement_request`,
        fileFormData,
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

      if (response?.status === 200) {
        toast.success(
          "Reimbursement submitted successfully!"
        )

        if (
          socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          socket.send(
            JSON.stringify({
              type: "reimbursement_update",
              action: "new_request",
              needsDesktopNotification: true,
            })
          )
        }

        setFormData({
          ...initialFormState,
          ...fixedEmployeeDetails,
          expenses: [getInitialExpense()],
        })
        setErrors({})
        setTotalAmount(0)
        setCategoryCollapseState({})
        handleOpenChange(false)
      } else {
        toast.error(
          "Failed to submit reimbursement request"
        )
      }
    } catch (error) {
      toast.error(
        "Failed to submit the form. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <Dialog.Root
      open={isModalOpen}
      onOpenChange={handleOpenChange}
    >
      <Dialog.Trigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded mb-2">
          Apply for Reimbursement
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={handleOverlayClick}
        >
          <Dialog.Content
            className="relative w-11/12 max-w-6xl max-h-[90vh] rounded-lg overflow-y-auto bg-white dark:bg-gray-800 text-black dark:text-white p-4 shadow-lg"
            onPointerDownOutside={
              handleOverlayClick
            }
            onInteractOutside={handleOverlayClick}
          >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h1 className="rt-Text text-xl font-bold text-blue-700 dark:text-blue-400">
                Reimbursement Request
              </h1>
              <Dialog.Close asChild>
                <RxCrossCircled
                  size="1.5em"
                  className="cursor-pointer"
                  color="#808080"
                />
              </Dialog.Close>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto"
            >
              <div className="grid grid-cols-1 gap-4 p-4">
                <div className="mb-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold dark:text-white">
                        Employee Name
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md outline-none ${
                          errors.employeeName
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } focus:border-gray-500 focus:ring focus:ring-gray-200 dark:focus:ring-gray-600 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-black dark:text-white`}
                        placeholder="Enter your name"
                        value={
                          formData.employeeName
                        }
                        readOnly
                        required
                      />
                      {errors.employeeName && (
                        <Text className="text-xs text-red-700 mt-1">
                          Enter a valid name
                          containing only letters
                          and spaces
                        </Text>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold dark:text-white">
                        Employee ID
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md outline-none ${
                          errors.employeeId
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } focus:border-gray-500 focus:ring focus:ring-gray-200 dark:focus:ring-gray-600 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-black dark:text-white`}
                        placeholder="Enter your ID"
                        value={
                          formData.employeeId
                        }
                        readOnly
                        required
                      />
                      {errors.employeeId && (
                        <Text className="text-xs text-red-700 mt-1">
                          Enter a valid ID
                          containing only numbers
                        </Text>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold dark:text-white">
                        Department
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md outline-none ${
                          errors.department
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } focus:border-gray-500 focus:ring focus:ring-gray-200 dark:focus:ring-gray-600 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-black dark:text-white`}
                        placeholder="Enter your department"
                        value={
                          formData.department
                        }
                        readOnly
                        required
                      />
                      {errors.department && (
                        <Text className="text-xs text-red-700 mt-1">
                          Enter a valid department
                          name containing only
                          letters and spaces
                        </Text>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold dark:text-white">
                        Manager
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md outline-none ${
                          errors.manager
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } focus:border-gray-500 focus:ring focus:ring-gray-200 dark:focus:ring-gray-600 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-black dark:text-white`}
                        placeholder="Enter name of manager"
                        value={formData.manager}
                        readOnly
                        required
                      />
                      {errors.manager && (
                        <Text className="text-xs text-red-700 mt-1">
                          Enter a valid name
                          containing only letters
                          and spaces
                        </Text>
                      )}
                    </div>
                  </div>
                </div>

                {formData.expenses.map(
                  (expense, expenseIndex) => (
                    <div
                      key={expenseIndex}
                      className="mb-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-700 relative"
                    >
                      {formData.expenses.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveExpense(
                              expenseIndex
                            )
                          }
                          className="absolute right-2 top-2 text-gray-50 dark:bg-gray-700 hover:text-red-700"
                        >
                          <Cross2Icon className="w-4 h-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-bold dark:text-white">
                              Date
                              <span className="ml-1 text-red-500">
                                *
                              </span>
                            </label>
                            <input
                              type="date"
                              className={`w-full px-3 py-2 border rounded-md outline-none ${
                                errors[
                                  `expense${expenseIndex}`
                                ]?.date
                                  ? "border-red-500"
                                  : "border-gray-300 dark:border-gray-600"
                              } focus:border-gray-500 focus:ring focus:ring-gray-200 dark:focus:ring-gray-600 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-black dark:text-white`}
                              value={expense.date}
                              onChange={(e) =>
                                handleExpenseChange(
                                  expenseIndex,
                                  "date",
                                  e.target.value
                                )
                              }
                              max={
                                new Date()
                                  .toISOString()
                                  .split("T")[0]
                              }
                              required
                            />
                            {errors[
                              `expense${expenseIndex}`
                            ]?.date && (
                              <Text className="text-xs text-red-700 mt-1">
                                This field is
                                required and must
                                not be a future
                                date.
                              </Text>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-bold dark:text-white">
                              Description
                              <span className="ml-1 text-red-500">
                                *
                              </span>
                            </label>
                            <input
                              type="text"
                              className={`w-full px-3 py-2 border rounded-md outline-none ${
                                errors[
                                  `expense${expenseIndex}`
                                ]?.description
                                  ? "border-red-500"
                                  : "border-gray-300 dark:border-gray-600"
                              } focus:border-gray-500 focus:ring focus:ring-gray-200 dark:focus:ring-gray-600 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-black dark:text-white`}
                              placeholder="Enter expense description (max 200 characters)"
                              value={
                                expense.description
                              }
                              onChange={(e) =>
                                handleExpenseChange(
                                  expenseIndex,
                                  "description",
                                  e.target.value
                                )
                              }
                              required
                            />
                            {errors[
                              `expense${expenseIndex}`
                            ]?.description && (
                              <Text className="text-xs text-red-700 mt-1">
                                Description must
                                be alphabet-only
                                and up to 200
                                characters.
                              </Text>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="block text-sm font-bold dark:text-white">
                            Expense Categories
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>
                          <div className="grid grid-cols-1 gap-4">
                            {ExpenseCategories.map(
                              (category) => {
                                const isChecked =
                                  expense.categoryExpenses.some(
                                    (ce) =>
                                      ce.category ===
                                      category.value
                                  )
                                const categoryExpenseIndex =
                                  expense.categoryExpenses.findIndex(
                                    (ce) =>
                                      ce.category ===
                                      category.value
                                  )
                                const isOpen =
                                  categoryCollapseState[
                                    `${expenseIndex}-${category.value}`
                                  ] ?? isChecked

                                return (
                                  <div
                                    key={
                                      category.value
                                    }
                                    className="rounded-lg border border-gray-200 p-3"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center group relative">
                                        <input
                                          type="checkbox"
                                          id={`${category.value}-${expenseIndex}`}
                                          checked={
                                            isChecked
                                          }
                                          onChange={(
                                            e
                                          ) =>
                                            handleCategoryChange(
                                              expenseIndex,
                                              category.value,
                                              e
                                                .target
                                                .checked
                                            )
                                          }
                                          className="w-4 h-4 border rounded-sm accent-indigo-500"
                                        />
                                        <label
                                          htmlFor={`${category.value}-${expenseIndex}`}
                                          className="ml-2 text-sm font-medium"
                                        >
                                          {
                                            category.label
                                          }
                                        </label>
                                        <span className="absolute left-0 top-6 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
                                          {
                                            category.description
                                          }
                                        </span>
                                      </div>
                                      {isChecked && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleCategoryCollapse(
                                              expenseIndex,
                                              category.value
                                            )
                                          }
                                          className="text-gray-500 hover:text-gray-700 text-sm"
                                        >
                                          {isOpen
                                            ? "Collapse"
                                            : "Expand"}
                                        </button>
                                      )}
                                    </div>
                                    {isChecked &&
                                      isOpen && (
                                        <div className="mt-3 ml-6 grid grid-cols-1 gap-2">
                                          <div className="flex flex-col">
                                            <label className="text-xs text-gray-600 mb-1 dark:text-white">
                                              Amount:
                                            </label>
                                            <input
                                              type="number"
                                              step="1"
                                              min="0"
                                              value={
                                                expense
                                                  .categoryExpenses[
                                                  categoryExpenseIndex
                                                ]
                                                  .amount
                                              }
                                              onChange={(
                                                e
                                              ) =>
                                                handleCategoryAmountChange(
                                                  expenseIndex,
                                                  categoryExpenseIndex,
                                                  parseFloat(
                                                    e
                                                      .target
                                                      .value
                                                  )
                                                )
                                              }
                                              className={`w-full px-3 py-2 border rounded-md outline-none ${
                                                errors[
                                                  `expense${expenseIndex}`
                                                ]?.[
                                                  `categoryAmount${categoryExpenseIndex}`
                                                ]
                                                  ? "border-red-500"
                                                  : "border-gray-300 dark:border-gray-600"
                                              } focus:border-gray-500 focus:ring focus:ring-gray-200 dark:focus:ring-gray-600 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-black dark:text-white`}
                                              placeholder="0.00"
                                              required
                                            />
                                            {errors[
                                              `expense${expenseIndex}`
                                            ]?.[
                                              `categoryAmount${categoryExpenseIndex}`
                                            ] && (
                                              <span className="text-xs text-red-700 mt-1">
                                                Valid
                                                amount
                                                is
                                                required
                                              </span>
                                            )}
                                          </div>
                                          {category.value ===
                                            "Other" && (
                                            <div className="flex flex-col">
                                              <label className="text-xs text-gray-600 mb-1 dark:text-white">
                                                Specify:
                                              </label>
                                              <input
                                                type="text"
                                                value={
                                                  expense
                                                    .categoryExpenses[
                                                    categoryExpenseIndex
                                                  ]
                                                    .otherCategory ||
                                                  ""
                                                }
                                                onChange={(
                                                  e
                                                ) =>
                                                  handleOtherCategoryChange(
                                                    expenseIndex,
                                                    categoryExpenseIndex,
                                                    e
                                                      .target
                                                      .value
                                                  )
                                                }
                                                placeholder="Please specify"
                                                className={`w-full px-3 py-2 border rounded-md ${
                                                  errors[
                                                    `expense${expenseIndex}`
                                                  ]?.[
                                                    `otherCategory${categoryExpenseIndex}`
                                                  ]
                                                    ? "border-red-500"
                                                    : "border-gray-300 dark:border-gray-600"
                                                }`}
                                                required
                                              />
                                              {errors[
                                                `expense${expenseIndex}`
                                              ]?.[
                                                `otherCategory${categoryExpenseIndex}`
                                              ] && (
                                                <span className="text-xs text-red-700 mt-1">
                                                  Please
                                                  specify
                                                  other
                                                  category
                                                </span>
                                              )}
                                            </div>
                                          )}
                                          <div className="text-sm text-gray-700 dark:text-white bg">
                                            <span>
                                              Subtotal:
                                            </span>
                                            <span className="font-medium ml-1">
                                              {parseFloat(
                                                expense
                                                  .categoryExpenses[
                                                  categoryExpenseIndex
                                                ]
                                                  ?.amount ||
                                                  0
                                              ).toFixed(
                                                2
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                )
                              }
                            )}
                          </div>
                          {errors[
                            `expense${expenseIndex}`
                          ]?.categoryExpenses && (
                            <Text className="text-xs text-red-700 mt-1">
                              At least one
                              category is required
                            </Text>
                          )}
                        </div>

                        {expense.categoryExpenses
                          .length > 0 && (
                          <div className="space-y-4">
                            <h3 className="font-medium">
                              {`Bill Receipts/Invoice for ${expense.date}:`}
                              <span className="ml-1 text-red-500">
                                *
                              </span>
                            </h3>
                            <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 mx-auto text-gray-400 mb-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <p className="text-sm text-gray-500 mb-1">
                                You can upload
                                JPG, PNG, or PDF
                                files
                              </p>
                              <p className="text-sm font-medium mb-2">
                                Drag & Drop your
                                file here or
                              </p>
                              <label className="bg-blue-700 hover:bg-blue-800 text-white text-sm py-2 px-4 rounded-md cursor-pointer">
                                Choose File
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileChange(
                                      expenseIndex,
                                      e
                                    )
                                  }
                                />
                              </label>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {expense.uploadedFiles.map(
                                (
                                  file,
                                  fileIndex
                                ) => (
                                  <div
                                    key={
                                      fileIndex
                                    }
                                    className="flex items-center p-2 border rounded-md bg-gray-50 dark:bg-gray-700"
                                  >
                                    <div className="bg-gray-100 rounded p-2 mr-3">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400 dark:text-black"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={
                                            1
                                          }
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">
                                        {
                                          file.name
                                        }
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-300">
                                        {
                                          file.size
                                        }
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="text-xs text-gray-500 dark:text-gray-300">
                                        {
                                          file.date
                                        }
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveFile(
                                            expenseIndex,
                                            fileIndex
                                          )
                                        }
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Cross2Icon className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            {errors[
                              `expense${expenseIndex}`
                            ]?.uploadedFiles && (
                              <Text className="text-xs text-red-700 mt-1">
                                At least one file
                                is required for
                                this expense
                              </Text>
                            )}
                          </div>
                        )}

                        {expense.categoryExpenses
                          .length > 0 && (
                          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium dark:text-white">
                                Subtotal:
                              </span>
                              <span className="font-medium">
                                {expense.categoryExpenses
                                  .reduce(
                                    (
                                      sum,
                                      catExp
                                    ) =>
                                      sum +
                                      parseFloat(
                                        catExp.amount ||
                                          0
                                      ),
                                    0
                                  )
                                  .toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={handleAddExpense}
                  className="flex items-center justify-center gap-1 text-blue-900 dark:text-blue-500 py-2 px-4 border border-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-200 transition-colors duration-200"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="font-bold">
                    Add Expense
                  </span>
                </button>

                <div className="mt-6 p-4 border rounded-md bg-gray-100 dark:bg-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-lg dark:text-white">
                      Total Amount:
                    </span>
                    <span className="font-medium text-xl text-blue-700">
                      {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-4 p-6 border-t border-gray-200">
                <div className="flex-1">
                  {Object.values(errors).some(
                    (error) => error
                  ) && (
                    <div className="text-sm">
                      {errors.employeeName && (
                        <p className="text-red-500 mb-1">
                          • Employee name should
                          only contain letters.
                        </p>
                      )}
                      {errors.employeeId && (
                        <p className="text-red-500 mb-1">
                          • Employee ID should
                          only contain numbers.
                        </p>
                      )}
                      {errors.department && (
                        <p className="text-red-500 mb-1">
                          • Department should only
                          contain letters.
                        </p>
                      )}
                      {errors.manager && (
                        <p className="text-red-500 mb-1">
                          • Manager name should
                          only contain letters.
                        </p>
                      )}
                      {formData.expenses.map(
                        (expense, index) => {
                          const expenseErrors =
                            errors[
                              `expense${index}`
                            ]
                          if (!expenseErrors)
                            return null

                          return (
                            <div key={index}>
                              {expenseErrors.date && (
                                <p className="text-red-500 mb-1">
                                  • Expense{" "}
                                  <span className="font-bold">
                                    {index + 1}
                                  </span>
                                  : Please select
                                  a valid date.
                                </p>
                              )}
                              {expenseErrors.description && (
                                <p className="text-red-500 mb-1">
                                  • Expense{" "}
                                  <span className="font-bold">
                                    {index + 1}
                                  </span>
                                  : Description
                                  should only
                                  contain letters
                                  and be less than
                                  200 characters.
                                </p>
                              )}
                              {expenseErrors.categoryExpenses && (
                                <p className="text-red-500 mb-1">
                                  • Expense{" "}
                                  <span className="font-bold">
                                    {index + 1}
                                  </span>
                                  : Please add at
                                  least one
                                  expense
                                  category.
                                </p>
                              )}
                              {expenseErrors.uploadedFiles && (
                                <p className="text-red-500 mb-1">
                                  • Expense{" "}
                                  <span className="font-bold">
                                    {index + 1}
                                  </span>
                                  : Please upload
                                  at least one
                                  file.
                                </p>
                              )}
                              {expense.categoryExpenses.map(
                                (_, catIndex) => (
                                  <div
                                    key={catIndex}
                                  >
                                    {expenseErrors[
                                      `categoryAmount${catIndex}`
                                    ] && (
                                      <p className="text-red-500 mb-1">
                                        • Expense{" "}
                                        <span className="font-bold">
                                          {index +
                                            1}
                                        </span>
                                        , Category{" "}
                                        <span className="font-bold">
                                          {catIndex +
                                            1}
                                        </span>
                                        : Please
                                        enter a
                                        valid
                                        amount.
                                      </p>
                                    )}
                                    {expenseErrors[
                                      `otherCategory${catIndex}`
                                    ] && (
                                      <p className="text-red-500 mb-1">
                                        • Expense{" "}
                                        <span className="font-bold">
                                          {index +
                                            1}
                                        </span>
                                        , Category{" "}
                                        <span className="font-bold">
                                          {catIndex +
                                            1}
                                        </span>
                                        : Please
                                        specify
                                        the Other
                                        category.
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )
                        }
                      )}
                    </div>
                  )}
                </div>

                <Dialog.Close>
                  <button
                    type="button"
                    className="text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-800 dark:text-white rounded-md px-5 py-2.5 font-medium text-sm transition-all duration-300"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </Dialog.Close>

                <button
                  type="submit"
                  className={`transition-colors duration-300 ease-out rounded-md px-5 py-2.5 font-medium text-sm flex items-center justify-center gap-2 ${
                    applyDisable || isSubmitting
                      ? "bg-gray-200 text-gray-500 hover:text-gray-500 hover:bg-blue-800 darkLhover:bg-blue-600 opacity-70 cursor-not-allowed"
                      : "bg-blue-500 dark:bg-blue-700 text-white hover:bg-blue-800 dark:hover:bg-blue-600 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  }`}
                  disabled={
                    applyDisable || isSubmitting
                  }
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <ClipLoader
                        size={16}
                        color={"#ffffff"}
                        loading={true}
                      />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ReimbursementFormModal

ReimbursementFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
