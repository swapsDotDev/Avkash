import React, { useState, useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Upload, X } from "lucide-react"
import { RxCrossCircled } from "react-icons/rx"
import toast from "react-hot-toast"
import axios from "axios"
import PropTypes from "prop-types"
import { useOrganizationContext } from "../../OrganizationContext"
import { useUser } from "@clerk/clerk-react"
import { Loader } from "lucide-react"

const priorityIcons = {
  high: "🔴",
  medium: "🟠",
  low: "🟢",
}

function AddNoticeModal({
  isOpen,
  onClose,
  onAddNotice,
  onUpdateNotice,
  editingNotice,
}) {
  const { org_slug, organizationName } =
    useOrganizationContext()
  const [submitting, setSubmitting] =
    useState(false)
  const { user } = useUser()
  const BASE_URL =
    process.env.REACT_APP_BASE_URL ||
    "http://localhost:8000"

  const initialNoticeState = {
    title: "",
    content: "",
    category: "announcement",
    priority: "medium",
    attachments: [],
    expiry: "",
    pinned: false,
    archived: false,
    timestamp: new Date()
      .toISOString()
      .split("T")[0],
    ...editingNotice,
  }

  const [newNotice, setNewNotice] = useState(
    initialNoticeState
  )
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [sizeError, setSizeError] =
    useState(false)
  const [fileTypeError, setFileTypeError] =
    useState(false)

  useEffect(() => {
    if (editingNotice) {
      setNewNotice({
        ...initialNoticeState,
        ...editingNotice,
        id: editingNotice.id || editingNotice._id,
      })
      setFiles(
        editingNotice.attachments.map(
          (attachment) => ({
            name: attachment,
          })
        )
      )
    } else {
      setNewNotice(initialNoticeState)
      setFiles([])
    }
  }, [editingNotice])

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target
    setNewNotice({
      ...newNotice,
      [name]:
        type === "checkbox" ? checked : value,
    })
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleFileChange = (e) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ]
    const maxSize = 10 * 1024 * 1024
    const selectedFiles = Array.from(
      e.target.files
    )
    let hasLargeFile = false
    let hasInvalidType = false

    const validFiles = selectedFiles.filter(
      (file) => {
        if (!allowedTypes.includes(file.type)) {
          hasInvalidType = true
          return false
        }
        if (file.size > maxSize) {
          hasLargeFile = true
          return false
        }
        return true
      }
    )

    setSizeError(hasLargeFile)
    setFileTypeError(hasInvalidType)
    setFiles((prevFiles) => [
      ...prevFiles,
      ...validFiles,
    ])
  }

  const removeFile = (index) => {
    const updatedFiles = [...files]
    updatedFiles.splice(index, 1)
    setFiles(updatedFiles)

    const updatedAttachments = [
      ...newNotice.attachments,
    ]
    updatedAttachments.splice(index, 1)
    setNewNotice({
      ...newNotice,
      attachments: updatedAttachments,
    })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!newNotice.title.trim()) {
      newErrors.title = "Title is required"
    }
    if (!newNotice.content.trim()) {
      newErrors.content = "Content is required"
    }
    if (!user) {
      newErrors.user = "User not authenticated"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append("user_id", user.id)
    formData.append("title", newNotice.title)
    formData.append("content", newNotice.content)
    formData.append(
      "category",
      newNotice.category
    )
    formData.append(
      "priority",
      newNotice.priority
    )
    if (newNotice.expiry) {
      const expiryDate = new Date(
        newNotice.expiry
      )
      expiryDate.setHours(23, 59, 59, 999)
      formData.append(
        "expiry",
        expiryDate.toISOString()
      )
    } else {
      formData.append("expiry", "")
    }
    formData.append(
      "pinned",
      newNotice.pinned.toString()
    )
    formData.append(
      "archived",
      newNotice.archived.toString()
    )
    const existingAttachments = files
      .filter((file) => !(file instanceof File))
      .map((file) => file.name)
    const newAttachments = files.filter(
      (file) => file instanceof File
    )
    formData.append(
      "attachments",
      JSON.stringify(existingAttachments)
    )
    newAttachments.forEach((file) => {
      formData.append("attachment_files", file)
    })

    try {
      const response = editingNotice
        ? await axios.put(
            `${BASE_URL}/update_notice/${editingNotice.id || editingNotice._id}`,
            formData,
            {
              params: {
                org_slug: org_slug,
                organization_name:
                  organizationName,
              },
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          )
        : await axios.post(
            `${BASE_URL}/submit_notice`,
            formData,
            {
              params: {
                org_slug: org_slug,
                organization_name:
                  organizationName,
              },
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          )

      const updatedNotice = response.data
        .updated_notice || {
        ...newNotice,
        id:
          response.data.notice_id ||
          editingNotice?.id ||
          editingNotice?._id,
      }

      if (editingNotice) {
        onUpdateNotice(updatedNotice)
      } else {
        onAddNotice(updatedNotice)
      }

      onClose()
      setNewNotice(initialNoticeState)
      setFiles([])
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to submit notice"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={onClose}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-xl w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-2 text-blue-900 dark:text-blue-500">
            {editingNotice
              ? "Edit Notice"
              : "Add New Notice"}
          </Dialog.Title>
          <Dialog.Description className="text-gray-500 dark:text-white text-sm mb-3">
            {editingNotice
              ? "Update the notice details below."
              : "Create a new notice for the HR pinboard."}
          </Dialog.Description>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-bold mb-1 dark:text-white"
                >
                  Title
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newNotice.title}
                  onChange={handleChange}
                  className={`w-full px-2 py-1 border rounded-md outline-none text-sm ${
                    errors.title
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } text-black dark:text-white placeholder-gray-400 dark:placeholder-white focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50`}
                  placeholder="Enter notice title"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-bold mb-1 dark:text-white"
                >
                  Content
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={newNotice.content}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-2 py-1 border rounded-md outline-none text-sm ${
                    errors.content
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } text-black dark:text-white placeholder-gray-400 dark:placeholder-white focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50`}
                  placeholder="Enter notice content"
                />
                {errors.content && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.content}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-bold mb-1 dark:text-white"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={newNotice.category}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md outline-none text-sm dark:text-white"
                  >
                    <option value="announcement">
                      Announcement
                    </option>
                    <option value="reminder">
                      Reminder
                    </option>
                    <option value="policy">
                      Policy
                    </option>
                    <option value="event">
                      Event
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-bold mb-1 dark:text-white"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={newNotice.priority}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:text-white outline-none"
                  >
                    <option value="low">
                      Low {priorityIcons.low}
                    </option>
                    <option value="medium">
                      Medium{" "}
                      {priorityIcons.medium}
                    </option>
                    <option value="high">
                      High {priorityIcons.high}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="expiry"
                  className="block text-sm font-bold mb-1 dark:text-white"
                >
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  id="expiry"
                  name="expiry"
                  value={newNotice.expiry}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-gray-600 rounded-md outline-none text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 dark:text-white bg-white dark:bg-gray-800">
                  Attachments (optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="flex flex-col items-center justify-center pt-3 pb-4">
                      <Upload className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PDF, JPG, JPEG, PNG (MAX.
                        10MB)
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      multiple
                      accept=".pdf, .jpg, .jpeg, .png"
                      className="hidden mb-2"
                      onChange={handleFileChange}
                    />
                    {sizeError && (
                      <p className="mt-1 text-sm text-red-600 font-medium dark:text-red-500">
                        File should be less than
                        10MB
                      </p>
                    )}
                    {fileTypeError && (
                      <p className="mt-1 text-sm text-red-600 font-medium dark:text-red-500">
                        Invalid file type. Only
                        PDF, JPG, JPEG, and PNG
                        are allowed.
                      </p>
                    )}
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-bold text-gray-700 dark:text-white">
                      Selected files:
                    </p>
                    <ul className="mt-1 space-y-1">
                      {files.map(
                        (file, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between p-1 text-sm bg-gray-50 dark:bg-gray-800 rounded-md"
                          >
                            <span className="truncate flex-grow text-black dark:text-white">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                removeFile(index)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={14} />
                            </button>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pinned"
                  name="pinned"
                  checked={newNotice.pinned}
                  onChange={handleChange}
                  className="h-3 w-3 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="pinned"
                  className="ml-2 block text-sm text-gray-700 dark:text-white"
                >
                  Pin this notice
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                className="text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-800 dark:text-white rounded-md px-5 py-2.5 font-medium text-sm transition-all duration-300"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`bg-blue-700 text-white hover:bg-blue-800 rounded-md px-5 py-2.5 font-medium text-sm transition-all duration-300 flex items-center justify-center ${
                  submitting
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader
                      className="animate-spin mr-2"
                      size={16}
                    />
                    Submitting...
                  </>
                ) : editingNotice ? (
                  "Update"
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-white">
              <RxCrossCircled
                size="1.5em"
                className="crosscircleclose text-gray-700 dark:text-white"
              />{" "}
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

AddNoticeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddNotice: PropTypes.func.isRequired,
  onUpdateNotice: PropTypes.func.isRequired,
  editingNotice: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    _id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    category: PropTypes.string,
    priority: PropTypes.string,
    attachments: PropTypes.arrayOf(
      PropTypes.string
    ),
    expiry: PropTypes.string,
    pinned: PropTypes.bool,
    archived: PropTypes.bool,
    timestamp: PropTypes.string,
  }),
}

export default AddNoticeModal
