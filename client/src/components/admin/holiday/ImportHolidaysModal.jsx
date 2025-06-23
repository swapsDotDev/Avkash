import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { RxCrossCircled } from "react-icons/rx"
import * as Dialog from "@radix-ui/react-dialog"
import toast from "react-hot-toast"
import * as XLSX from "xlsx"

const ImportHolidaysModal = ({
  importModalOpen,
  setImportModalOpen,
  handleFileChange,
  handleImportHolidays,
  organizationName,
}) => {
  const [selectedFile, setSelectedFile] =
    useState(null)
  const [previewData, setPreviewData] = useState(
    []
  )
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] =
    useState([])
  const [errorMessage, setErrorMessage] =
    useState("")

  useEffect(() => {
    if (!importModalOpen) {
      resetForm()
    }
  }, [importModalOpen])

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewData([])
    setValidationErrors([])
    const fileInput = document.querySelector(
      'input[type="file"]'
    )
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const validateDate = (date) => {
    if (typeof date === "number") {
      return {
        isValid: false,
        message: "Invalid date format",
      }
    }

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return {
        isValid: false,
        message: "Invalid date format",
      }
    }

    return { isValid: true, value: date }
  }

  const onFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileChange(e)
      setSelectedFile(file)
      setValidationErrors([])
      setErrorMessage("")

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(
            event.target.result
          )
          const workbook = XLSX.read(data, {
            type: "array",
          })

          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const parsedData =
            XLSX.utils.sheet_to_json(sheet)

          const errors = []
          const preview = parsedData.map(
            (row, index) => {
              const rowIndex = index + 1
              const dateField =
                row["Date"] || row["date"]
              const name =
                row["Holiday Name"] ||
                row["summary"]
              const type =
                row["Holiday Type"] ||
                row["holiday_type"] ||
                ""

              const dateValidation =
                validateDate(dateField)
              if (!dateValidation.isValid) {
                errors.push(
                  `Row ${rowIndex}: ${dateValidation.message}`
                )
              }

              if (!name) {
                errors.push(
                  `Row ${rowIndex}: Missing holiday name`
                )
              }

              return {
                id: rowIndex,
                date: dateValidation.isValid
                  ? new Date(dateField)
                      .toISOString()
                      .split("T")[0]
                  : dateField,
                name: name || "",
                type: type,
                hasError:
                  !dateValidation.isValid ||
                  !name,
              }
            }
          )

          setPreviewData(preview)
          setValidationErrors(errors)

          if (errors.length > 0) {
            toast.error(
              `Found ${errors.length} validation issues. Please check the preview.`,
              { duration: 3000 }
            )
          } else {
            toast.success(
              "File uploaded successfully!",
              { duration: 2000 }
            )
          }
        } catch (error) {
          const errorMsg =
            typeof error === "object"
              ? error.message ||
                JSON.stringify(error)
              : String(error)
          toast.error(
            `Error parsing file: ${errorMsg}`,
            { duration: 3000 }
          )
        }
      }

      reader.onerror = (error) => {
        const errorMsg =
          typeof error === "object"
            ? error.message ||
              JSON.stringify(error)
            : String(error)
        toast.error(
          `Error reading file: ${errorMsg}`,
          { duration: 3000 }
        )
      }

      reader.readAsArrayBuffer(file)
    }

    handleFileChange(e)
  }

  const prepareImportData = () => {
    if (!selectedFile) return null

    const formData = new FormData()
    formData.append("file", selectedFile)
    return formData
  }

  const onImportClick = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select excel file!")
      return
    }

    if (validationErrors.length > 0) {
      toast.error(
        "Please fix the validation errors before importing",
        { duration: 3000 }
      )
      return
    }

    setErrorMessage("")
    setLoading(true)
    try {
      const importData = prepareImportData()
      const response = await handleImportHolidays(
        importData,
        organizationName
      )

      if (response && response.status) {
        if (response.status === "duplicate") {
          toast.error(
            "Same holidays already exist on the calender",
            {
              duration: 3000,
            }
          )
        } else if (
          response.status === "exist" ||
          response.status === "error"
        ) {
          toast.error(response.message, {
            duration: 2000,
          })
        } else if (
          response.status === "success" ||
          response.status === "updated" ||
          response.status === "mixed"
        ) {
          toast.success(response.message, {
            duration: 2000,
          })
          setImportModalOpen(false)
        }
      } else {
        toast.error(
          "Import failed: Invalid response from server",
          {
            duration: 3000,
          }
        )
      }
    } catch (err) {
      const errorMsg =
        typeof err === "object"
          ? err.message || JSON.stringify(err)
          : String(err)
      toast.error(`Import failed: ${errorMsg}`, {
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setImportModalOpen(false)
  }

  return (
    <Dialog.Root
      open={importModalOpen}
      onOpenChange={setImportModalOpen}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40 fixed inset-0" />
        <Dialog.Content className="bg-white dark:bg-gray-800 rounded-lg shadow-md fixed top-1/2 left-1/2 w-[95%] max-w-md p-3 sm:p-4 transform -translate-x-1/2 -translate-y-1/2 max-h-[100vh] overflow-hidden">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <Dialog.Title className="text-lg sm:text-xl font-medium text-blue-900 dark:text-blue-500">
              Add Holidays
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200"
                onClick={handleCloseModal}
              >
                <RxCrossCircled className="w-5 h-5 text-gray-700 dark:text-white" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mb-2 sm:mb-3 bg-blue-50 dark:bg-blue-10 border border-blue-200 rounded-lg p-2">
            <p className="text-blue-800 text-xs sm:text-sm">
              <strong>Note:</strong> Please ensure
              dates in your Excel file use{" "}
              <strong>YYYY-MM-DD</strong> format.
              The file should include the
              following column headings:
            </p>
            <ul className="text-blue-800 text-xs sm:text-sm list-disc pl-4">
              <li>
                <strong>Date</strong> (e.g.,
                2025-01-01)
              </li>
              <li>
                <strong>Holiday Name</strong>{" "}
                (e.g., New Year)
              </li>
              <li>
                <strong>Holiday Type</strong>{" "}
                (e.g.,
                Mandatory/Optional/Suggested)
              </li>
            </ul>
          </div>

          <div className="border-2 border-dashed border-gray-400 rounded-lg p-3 sm:p-4 text-center space-y-1 sm:space-y-2">
            <p className="text-gray-600 dark:text-white text-xs sm:text-sm">
              Drag & Drop your Excel file here
            </p>
            {errorMessage && (
              <div className="text-red-600 text-sm mt-2">
                {errorMessage}
              </div>
            )}
            <p className="text-gray-500">or</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              <label className="cursor-pointer">
                Browse Files
                <input
                  type="file"
                  onChange={onFileChange}
                  accept=".xlsx, .xls"
                  className="hidden"
                />
              </label>
            </button>
          </div>

          <div className="mt-2 sm:mt-3 bg-gray-100 dark:bg-gray-700 p-2 sm:p-3 rounded-lg relative overflow-hidden max-h-24 sm:max-h-48">
            <h3 className="text-sm sm:text-md font-medium text-gray-900 dark:text-white mb-1 text-center">
              Preview
            </h3>
            {previewData.length > 0 ? (
              <div className="relative max-h-16 sm:max-h-36 overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white">
                        <th className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          Date
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          Holiday Name
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          Holiday Type
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map(
                        (holiday) => (
                          <tr
                            key={holiday.id}
                            className={
                              holiday.hasError
                                ? "bg-red-50"
                                : ""
                            }
                          >
                            <td
                              className={`border border-gray-300 dark:border-gray-600 px-1 py-1 dark:text-white ${typeof holiday.date === "number" ? "text-red-600" : ""}`}
                            >
                              {typeof holiday.date ===
                              "number"
                                ? "Invalid date"
                                : String(
                                    holiday.date ||
                                      ""
                                  )}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-1 py-1 dark:text-white">
                              {String(
                                holiday.name || ""
                              )}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-1 py-1 dark:text-white">
                              {String(
                                holiday.type || ""
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-white text-center text-xs sm:text-sm">
                No file selected
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-3 sm:mt-4">
            <button
              className="text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-800 dark:text-white rounded-md px-5 py-2.5 font-medium text-sm transition-all duration-200"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              className={`bg-blue-500 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-800 text-white px-5 py-2.5 rounded text-xs sm:text-sm ${loading || validationErrors.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={onImportClick}
              disabled={
                loading ||
                validationErrors.length > 0
              }
            >
              {loading
                ? "Importing..."
                : "Import"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
ImportHolidaysModal.propTypes = {
  importModalOpen: PropTypes.bool.isRequired,
  setImportModalOpen: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  handleImportHolidays: PropTypes.func.isRequired,
  organizationName: PropTypes.string.isRequired,
}
export default ImportHolidaysModal
