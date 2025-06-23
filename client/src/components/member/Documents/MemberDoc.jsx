import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react"
import axios from "axios"
import { useOrganizationContext } from "../../OrganizationContext"
import { toast } from "react-hot-toast"
import {
  Box,
  Flex,
  Button,
  Table,
  Badge,
  Text,
  Dialog,
  Tabs,
  ScrollArea,
} from "@radix-ui/themes"
import { RxCrossCircled } from "react-icons/rx"
import { FadeLoader } from "react-spinners"
import { DocumentTextIcon } from "@heroicons/react/24/outline"
import { useUser } from "@clerk/clerk-react"
import SearchBox from "../../SearchBox"
import ModernPagination from "../../ModernPagination"
import { FiRepeat } from "react-icons/fi"
import {
  FiEye,
  FiDownload,
  FiFileText,
  FiInfo,
  FiPaperclip,
  FiEdit,
  FiTrash2,
} from "react-icons/fi"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { ChevronDown } from "lucide-react"

const Documents = () => {
  const { org_slug, socket, organizationName } =
    useOrganizationContext()
  const { user } = useUser()

  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] =
    useState(false)
  const [editingDocument, setEditingDocument] =
    useState(null)

  const [newDocument, setNewDocument] = useState({
    document_name: "",
    description: "",
    files: [],
  })
  const [searchQuery, setSearchQuery] =
    useState("")
  const [currentPage, setCurrentPage] =
    useState(0)
  const [isSubmitting, setIsSubmitting] =
    useState(false)
  const [fileError, setFileError] = useState("")
  const [docNameError, setDocNameError] =
    useState("")
  const [fileTypeError, setFileTypeError] =
    useState("")
  const [selectedDocument, setSelectedDocument] =
    useState(null)
  const [
    deleteConfirmOpen,
    setDeleteConfirmOpen,
  ] = useState(false)
  const [docToDelete, setDocToDelete] =
    useState(null)
  const [
    selectedDocumentName,
    setSelectedDocumentName,
  ] = useState("Select Document")
  const [validationerror, setvalidationError] =
    useState("")

  const itemsPerPage = 9
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const modalRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(
          event.target
        ) &&
        !event.target.closest(
          "[data-radix-dialog-trigger]"
        )
      ) {
        setNewDocument({
          document_name: "",
          description: "",
          files: [],
        })
        setSelectedDocumentName("Select Document")
        setFileError("")
        setvalidationError("")
        setDocNameError("")
        setEditingDocument(null)
        setShowUploadModal(false)
      }
    }

    if (showUploadModal) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      )
    }
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [showUploadModal])

  useEffect(() => {
    fetchDocuments()
  }, [org_slug, user?.id])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      const res = await axios.get(
        `${BASE_URL}/get_user_documents/${user.id}`,
        { params: { org_slug } }
      )
      setDocuments(res.data.documents || [])
    } catch (err) {
      toast.error("Failed to fetch documents")
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(
      e.target.files
    )
    if (!selectedFiles.length) return

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "text/plain",
    ]

    const validFiles = []
    let hasError = false

    selectedFiles.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        setFileError(
          "Invalid file type. Please upload only PDF, Word, JPEG, PNG, or text files."
        )
        hasError = true
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setFileError(
          "One or more files exceed 10 MB limit"
        )
        hasError = true
        return
      }
      validFiles.push(file)
    })

    if (hasError) return

    setFileError("")
    setvalidationError("")
    setNewDocument((prev) => ({
      ...prev,
      files: [...prev.files, ...validFiles],
    }))
  }

  const handleRemoveFile = (index) => {
    const updatedFiles = [...newDocument.files]
    updatedFiles.splice(index, 1)
    setNewDocument({
      ...newDocument,
      files: updatedFiles,
    })
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (
      selectedDocumentName ===
        "Select Document" &&
      !editingDocument
    ) {
      setFileTypeError("Please select a document")
      return
    }
    setFileTypeError("")
    if (
      !newDocument.document_name.trim() &&
      selectedDocumentName === "Other"
    ) {
      setDocNameError("Document name is required")
      return
    }
    setDocNameError("")
    if (
      editingDocument &&
      newDocument.files.length === 0
    ) {
      setFileError(
        "Please upload at least one file before updating"
      )
      return
    }
    if (
      !newDocument.files.length &&
      !editingDocument
    ) {
      setFileError(
        "Please select at least one file"
      )
      return
    }
    setFileError("")
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("user_id", user.id)
      formData.append("username", user.fullName)
      formData.append(
        "email",
        user.primaryEmailAddress.emailAddress
      )
      if (
        selectedDocumentName !== "Other" &&
        selectedDocumentName !== "Select Document"
      ) {
        formData.append(
          "document_name",
          selectedDocumentName
        )
      } else {
        formData.append(
          "document_name",
          newDocument.document_name
        )
      }
      formData.append(
        "description",
        newDocument.description
      )
      formData.append("org_slug", org_slug)

      if (editingDocument) {
        formData.append(
          "document_id",
          editingDocument._id
        )
      }

      if (
        editingDocument?.status === "rejected"
      ) {
        formData.append("status", "pending")
        formData.append(
          "document_id",
          editingDocument._id
        )
      } else if (editingDocument) {
        formData.append(
          "document_id",
          editingDocument._id
        )
      }

      if (newDocument.files.length > 0) {
        const isRestricted = [
          "aadhar",
          "pan",
        ].includes(
          selectedDocumentName.toLowerCase()
        )

        for (const file of newDocument.files) {
          if (
            isRestricted &&
            file.type === "application/pdf"
          ) {
            setFileError(
              "PDFs are not allowed for Aadhaar or PAN."
            )
            return
          }
        }
      }

      if (newDocument.files.length > 0) {
        newDocument.files.forEach((file) =>
          formData.append("files", file)
        )
      }

      const endpoint = editingDocument
        ? `${BASE_URL}/update_document`
        : `${BASE_URL}/submit_documents`

      const res = await axios.post(
        endpoint,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            org_slug: org_slug,
            organization_name: organizationName,
          },
        }
      )

      toast.success(
        res.data.message ||
          (editingDocument
            ? "Document updated successfully"
            : "Document submitted successfully")
      )
      if (
        socket &&
        socket.readyState === WebSocket.OPEN
      ) {
        socket.send("submited")
      }

      const freshDocs = await axios.get(
        `${BASE_URL}/get_user_documents/${user.id}`,
        {
          params: {
            org_slug,
            organization_name: organizationName,
          },
        }
      )
      setDocuments(freshDocs.data.documents || [])

      setShowUploadModal(false)
      setEditingDocument(null)
      setSelectedDocument(null)
      setNewDocument({
        document_name: "",
        description: "",
        files: [],
      })
      setSelectedDocumentName("Select Document")
      setFileTypeError("")
    } catch (err) {
      if (
        err.response?.data?.detail?.code ===
        "document_validation_failed"
      ) {
        setvalidationError(
          err.response?.data?.detail?.message ||
            "An error occurred"
        )
      } else {
        toast.error(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            (editingDocument
              ? "Failed to update document"
              : "Failed to upload document")
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  useEffect(() => {
    const handleMessage = () => {
      fetchDocuments()
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
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (
          message.event ===
            "document_status_updated" &&
          message.user_id === user.id
        ) {
          const statusText =
            message.status
              .charAt(0)
              .toUpperCase() +
            message.status.slice(1)
          toast.success(
            `Document status updated to: ${statusText}`
          )

          if (
            Notification.permission === "granted"
          ) {
            new Notification(
              "Document Status Update",
              {
                body: `Your document request has been ${statusText.toLowerCase()}.`,
              }
            )
          }
        }
      } catch (err) {
        toast.error(
          "Error parsing WebSocket message:",
          err
        )
      }
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
  }, [user.id])

  const handleEditDocument = (doc) => {
    setEditingDocument(doc)
    setShowUploadModal(true)
    const existingFiles =
      doc.attachments
        ?.map((file) => {
          try {
            const byteString = atob(
              file.file_content
            )
            const ab = new ArrayBuffer(
              byteString.length
            )
            const ia = new Uint8Array(ab)
            for (
              let j = 0;
              j < byteString.length;
              j++
            ) {
              ia[j] = byteString.charCodeAt(j)
            }
            const blob = new Blob([ab], {
              type: file.file_type,
            })
            return new File(
              [blob],
              file.filename,
              { type: file.file_type }
            )
          } catch (error) {
            toast.error(
              "Error converting attachment:",
              error
            )
            return null
          }
        })
        .filter(Boolean) || []

    setNewDocument({
      document_name: doc.document_name,
      description: doc.description,
      files: existingFiles,
    })
  }

  const handleReapplyDocument = (doc) => {
    const files =
      doc.attachments
        ?.map((file) => {
          try {
            const byteString = atob(
              file.file_content
            )
            const ab = new ArrayBuffer(
              byteString.length
            )
            const ia = new Uint8Array(ab)
            for (
              let j = 0;
              j < byteString.length;
              j++
            ) {
              ia[j] = byteString.charCodeAt(j)
            }
            const blob = new Blob([ab], {
              type: file.file_type,
            })
            return new File(
              [blob],
              file.filename,
              { type: file.file_type }
            )
          } catch (error) {
            toast.error(
              "Error converting attachment:",
              error
            )
            return null
          }
        })
        .filter(Boolean) || []

    setEditingDocument({
      ...doc,
      status: "pending",
    })
    setShowUploadModal(true)
    setNewDocument({
      document_name: doc.document_name,
      description: doc.description,
      files: files,
    })
  }

  const handleDeleteDocument = async () => {
    if (!docToDelete) return
    try {
      const res = await axios.delete(
        `${BASE_URL}/delete_document/${docToDelete._id}`,
        {
          data: JSON.stringify({
            user_id: user.id,
            org_slug: org_slug,
            organization_name: organizationName,
          }),
          params: {
            org_slug,
            organization_name: organizationName,
          },
        }
      )
      if (res.data.success) {
        toast.success(
          "Document deleted successfully"
        )
        setDocuments((prevDocs) =>
          prevDocs.filter(
            (doc) => doc._id !== docToDelete._id
          )
        )
        setSelectedDocument(null)
      } else {
        toast.error(
          res.data.message ||
            "Failed to delete document"
        )
      }
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete document"
      )
    } finally {
      setDeleteConfirmOpen(false)
      setDocToDelete(null)
    }
  }

  const handleCancel = () => {
    setNewDocument({
      document_name: "",
      description: "",
      files: [],
    })
    setSelectedDocumentName("Select Document")
    setFileTypeError("")
    setFileError("")
    setvalidationError("")
    setDocNameError("")
    setEditingDocument(null)
    setShowUploadModal(false)
  }

  const openDetailsModal = (document) => {
    setSelectedDocument(document)
  }

  const handleDocumentDialogClose = () => {
    setSelectedDocument(null)
  }

  const filteredDocs = useMemo(
    () =>
      documents
        .sort(
          (a, b) =>
            new Date(b.submitted_at) -
            new Date(a.submitted_at)
        )
        .filter((d) =>
          d.document_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        ),
    [documents, searchQuery]
  )

  const paginatedData = useMemo(() => {
    const start = currentPage * itemsPerPage
    return filteredDocs.slice(
      start,
      start + itemsPerPage
    )
  }, [currentPage, filteredDocs, itemsPerPage])

  const handleSelect = (value) => {
    setSelectedDocumentName(value)
  }

  return (
    <Box className="dark:bg-gray-900 dark:text-white min-h-[88vh] h-[88vh] overflow-hidden">
      {isLoading ? (
        <Box className="flex justify-center items-center h-[88vh]">
          <FadeLoader color="#2563eb" />
        </Box>
      ) : (
        <Flex
          direction="column"
          gap="10px"
          className="h-full"
        >
          <Flex
            justify="space-between"
            align="center"
          >
            <SearchBox
              placeholder="Search Documents"
              searchValue={searchQuery}
              handleOnchange={(val) =>
                setSearchQuery(val)
              }
            />
            <Dialog.Root
              open={showUploadModal}
              onOpenChange={(open) => {
                if (!open) {
                  handleCancel()
                } else if (!editingDocument) {
                  setNewDocument({
                    document_name: "",
                    description: "",
                    files: [],
                  })
                  setFileError("")
                  setvalidationError("")
                  setDocNameError("")
                }
                setShowUploadModal(open)
              }}
            >
              <Dialog.Trigger asChild>
                <Button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded dark:bg-blue-600 dark:hover:bg-blue-800"
                  data-radix-dialog-trigger
                >
                  Upload Document
                </Button>
              </Dialog.Trigger>
            </Dialog.Root>
          </Flex>

          <Box className="relative flex flex-col rounded-[0.4rem] bg-base-100 dark:bg-gray-800 shadow-xl mt-2 border border-gray-300 dark:border-gray-600 h-[600px]">
            {filteredDocs.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                className="h-full text-center text-gray-600 dark:text-gray-400"
              >
                <DocumentTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-lg font-medium">
                  No documents submitted
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by uploading a new
                  document.
                </p>
              </Flex>
            ) : (
              <Table.Root className="my-1 md:my-3 lg:my-5 p-1 lg:p-4 rounded-lg dark:bg-gray-800">
                <Table.Header>
                  <Table.Row className="text-center font-semibold">
                    <Table.ColumnHeaderCell className="dark:text-white">
                      Sr. No.
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="dark:text-white">
                      Date
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="dark:text-white">
                      Document
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="dark:text-white">
                      Status
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="dark:text-white">
                      Details
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedData.map(
                    (doc, index) => (
                      <Table.Row
                        key={doc._id}
                        className="text-center font-medium dark:bg-gray-800 dark:text-gray-300"
                      >
                        <Table.Cell>
                          {currentPage *
                            itemsPerPage +
                            index +
                            1}
                        </Table.Cell>
                        <Table.Cell>
                          {new Date(
                            doc.submitted_at
                          ).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell>
                          {doc.document_name}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            color={
                              doc.status ===
                              "approved"
                                ? "green"
                                : doc.status ===
                                    "rejected"
                                  ? "red"
                                  : doc.status ===
                                      "in_review"
                                    ? "blue"
                                    : "yellow"
                            }
                            className="dark:text-white"
                          >
                            {doc.status ===
                            "in_review"
                              ? "In Review"
                              : doc.status
                                  .charAt(0)
                                  .toUpperCase() +
                                doc.status.slice(
                                  1
                                )}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            onClick={() =>
                              openDetailsModal(
                                doc
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2 py-1 rounded flex items-center dark:bg-blue-700 dark:hover:bg-blue-800"
                            style={{
                              fontSize: "12px",
                              padding: "2px 8px",
                              lineHeight: "1.1",
                              minHeight: "25px",
                              minWidth: "0",
                              height: "20px",
                            }}
                          >
                            <FiFileText className="mr-1 w-3 h-3" />
                            View Details
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    )
                  )}
                </Table.Body>
              </Table.Root>
            )}
            {!isLoading &&
              filteredDocs.length >
                itemsPerPage && (
                <Flex
                  justify="center"
                  className="absolute bottom-[1vh] left-1/2 -translate-x-1/2 mt-6 mb-2"
                >
                  <ModernPagination
                    total={filteredDocs.length}
                    pageSize={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={({
                      selected,
                    }) =>
                      setCurrentPage(selected)
                    }
                    siblingCount={1}
                    showEdges={true}
                  />
                </Flex>
              )}
          </Box>
          {showUploadModal && (
            <Dialog.Root open>
              <Dialog.Content
                className="relative data-[state=open]:animate-contentShow max-h-[90vh] w-[90vw] max-w-[400px] sm:w-[90vw] sm:max-w-[600px] rounded-[6px] bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg"
                ref={modalRef}
              >
                <div className="flex justify-between items-center mb-4 px-4 pt-4">
                  <Dialog.Title className="text-xl font-bold text-blue-900 dark:text-blue-300">
                    <Text
                      as="div"
                      className="items-center text-blue-700 dark:text-blue-400"
                    >
                      {editingDocument?.status ===
                      "rejected"
                        ? "Reapply Document"
                        : editingDocument
                          ? "Edit Document"
                          : "Upload New Document"}
                    </Text>
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <RxCrossCircled
                      size="1.5em"
                      className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={handleCancel}
                    />
                  </Dialog.Close>
                </div>

                <Flex className="flex justify-center">
                  <Box
                    as="div"
                    className="justify-center w-full max-h-[80vh] px-4"
                  >
                    <Box className="max-h-full overflow-y-auto">
                      <form
                        onSubmit={
                          handleFileUpload
                        }
                      >
                        <Flex
                          direction="column"
                          gap="3"
                        >
                          <Text className="block mb-1 font-medium text-sm dark:text-white">
                            Select Document:
                            <span className="text-red-500">
                              *
                            </span>
                          </Text>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger
                              asChild
                            >
                              <button className="inline-flex items-center justify-between rounded border border-gray-300 dark:border-gray-700 bg-white px-4 py-2 text-sm font-medium shadow-sm text-gray-700 dark:bg-gray-800 dark:text-white">
                                {editingDocument &&
                                (newDocument.document_name ===
                                  "Aadhar" ||
                                  newDocument.document_name ===
                                    "PAN") &&
                                selectedDocumentName ===
                                  "Select Document"
                                  ? newDocument.document_name
                                  : selectedDocumentName}
                                <ChevronDown className="ml-2 h-4 w-4" />
                              </button>
                            </DropdownMenu.Trigger>

                            <DropdownMenu.Content className="-mt-[2px] w-full min-w-[--radix-dropdown-menu-trigger-width] rounded-md bg-white p-1 shadow-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                              <DropdownMenu.Item
                                onSelect={() =>
                                  handleSelect(
                                    "Aadhar"
                                  )
                                }
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600 cursor-pointer rounded"
                              >
                                Aadhar
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onSelect={() =>
                                  handleSelect(
                                    "PAN"
                                  )
                                }
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded dark:text-white dark:hover:bg-gray-600"
                              >
                                PAN
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onSelect={() =>
                                  handleSelect(
                                    "Other"
                                  )
                                }
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded dark:text-white dark:hover:bg-gray-600"
                              >
                                Other
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                          {fileTypeError &&
                            selectedDocumentName ===
                              "Select Document" && (
                              <span className="text-red-500 text-xs block -mt-1">
                                {fileTypeError}
                              </span>
                            )}
                          {(selectedDocumentName ===
                            "Other" ||
                            (editingDocument &&
                              selectedDocumentName ===
                                "Select Document" &&
                              newDocument.document_name !==
                                "Aadhar" &&
                              newDocument.document_name !==
                                "PAN")) && (
                            <>
                              <Text className="block mb-1 font-medium text-sm dark:text-white">
                                Document Name:
                                <span className="text-red-500">
                                  *
                                </span>
                              </Text>
                              <input
                                type="text"
                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 focus:outline-none text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white"
                                value={
                                  newDocument.document_name
                                }
                                onChange={(e) => {
                                  setNewDocument({
                                    ...newDocument,
                                    document_name:
                                      e.target
                                        .value,
                                  })
                                  if (
                                    e.target.value.trim()
                                  )
                                    setDocNameError(
                                      ""
                                    )
                                }}
                              />
                              {docNameError && (
                                <span className="text-red-500 text-xs -mt-1 block">
                                  {docNameError}
                                </span>
                              )}
                            </>
                          )}
                          <Text className="block mb-1 font-medium text-sm dark:text-white">
                            Description
                            (Optional):
                          </Text>
                          <textarea
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 focus:outline-none text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white"
                            value={
                              newDocument.description
                            }
                            onChange={(e) =>
                              setNewDocument({
                                ...newDocument,
                                description:
                                  e.target.value,
                              })
                            }
                            rows="2"
                          />
                          {editingDocument ? (
                            <>
                              <Text className="block mb-1 font-medium text-sm dark:text-white">
                                Upload Additional
                                Files:
                              </Text>
                              <Text className="block mb-1 font-medium text-sm dark:text-white">
                                File:
                                <span className="text-red-500">
                                  *
                                </span>
                              </Text>
                              <input
                                type="file"
                                multiple
                                onChange={
                                  handleFileChange
                                }
                                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded mt-1 focus:outline-none focus:ring focus:ring-gray-200 focus:ring-opacity-50bg-white text-black dark:bg-gray-800 dark:text-gray-200 placeholder-gray-400"
                              />
                              {fileError && (
                                <span className="text-red-500 text-xs -mt-1 block">
                                  {fileError}
                                </span>
                              )}
                              {validationerror && (
                                <span className="text-red-500 text-xs mt-1 block">
                                  {
                                    validationerror
                                  }
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <Text className="block mb-1 font-medium text-sm dark:text-white">
                                File:
                                <span className="text-red-500">
                                  *
                                </span>
                              </Text>
                              <input
                                type="file"
                                multiple
                                onChange={
                                  handleFileChange
                                }
                                className="w-full p-1 border border-gray-300 dark:border-gray-700 rounded mt-1 focus:outline-none focus:ring focus:ring-gray-200 focus:ring-opacity-50 bg-white text-black dark:bg-gray-800 dark:text-gray-200 placeholder-gray-400"
                              />
                              {fileError && (
                                <span className="text-red-500 text-xs -mt-1 block">
                                  {fileError}
                                </span>
                              )}
                              {validationerror && (
                                <span className="text-red-500 text-xs mt-1 block">
                                  {
                                    validationerror
                                  }
                                </span>
                              )}
                            </>
                          )}

                          {newDocument.files
                            .length > 0 && (
                            <Box className="mt-2">
                              <Text
                                size="1"
                                className="block mb-1 dark:text-white"
                              >
                                Selected files:
                              </Text>
                              <Box className="max-h-40 overflow-y-auto border rounded p-2 dark:border-gray-600 dark:bg-gray-700">
                                {newDocument.files.map(
                                  (
                                    file,
                                    index
                                  ) => (
                                    <Flex
                                      key={index}
                                      align="center"
                                      justify="between"
                                      className="mb-1 last:mb-0"
                                    >
                                      <Text
                                        size="1"
                                        className="truncate dark:text-white"
                                      >
                                        {
                                          file.name
                                        }
                                      </Text>
                                      <Button
                                        size="1"
                                        variant="ghost"
                                        color="red"
                                        onClick={() =>
                                          handleRemoveFile(
                                            index
                                          )
                                        }
                                        title="Remove"
                                      >
                                        <RxCrossCircled className="h-4 w-4" />
                                      </Button>
                                    </Flex>
                                  )
                                )}
                              </Box>
                            </Box>
                          )}
                        </Flex>

                        <Box className="flex justify-end mb-3 mt-6">
                          <Flex gap="3">
                            <Dialog.Close>
                              <Button
                                color="crimson"
                                variant="soft"
                                onClick={
                                  handleCancel
                                }
                                disabled={
                                  isSubmitting
                                }
                                className="dark:bg-red-700 dark:text-white dark:hover:bg-red-800"
                              >
                                Cancel
                              </Button>
                            </Dialog.Close>
                            <Button
                              className="hover:bg-blue-700 bg-blue-500 text-white cursor-pointer transition-colors duration-300 ease-out rounded px-4 py-1 dark:bg-blue-600 dark:hover:bg-blue-700"
                              type="submit"
                              disabled={
                                isSubmitting ||
                                fileError
                              }
                            >
                              {isSubmitting
                                ? editingDocument
                                  ? "Updating..."
                                  : "Submitting..."
                                : editingDocument
                                  ? "Update"
                                  : "Submit"}
                            </Button>
                          </Flex>
                        </Box>
                      </form>
                    </Box>
                  </Box>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>
          )}

          {selectedDocument && (
            <Dialog.Root
              open={!!selectedDocument}
              onOpenChange={
                handleDocumentDialogClose
              }
            >
              <Dialog.Content className="w-full max-w-4xl mx-auto h-[85vh] overflow-hidden p-4 bg-white dark:bg-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Flex
                  justify="between"
                  align="center"
                  className="mb-4"
                >
                  <Dialog.Title className="text-xl font-bold dark:text-white">
                    Document Details
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
                        <span className="font-bold mr-2 text-gray-900 dark:text-gray-200">
                          Employee Name:
                        </span>
                        <span className="text-gray-800 dark:text-gray-300">
                          {selectedDocument.username ||
                            "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-bold mr-2 text-gray-900 dark:text-gray-200">
                          Submission date:
                        </span>
                        <span className="text-gray-800 dark:text-gray-300">
                          {new Date(
                            selectedDocument.submitted_at
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:w-1/3 items-start sm:items-end pr-2">
                      <div className="flex items-center">
                        <span className="font-bold mr-2 text-gray-900 dark:text-gray-200">
                          Status:
                        </span>
                        <Badge
                          color={
                            selectedDocument.status ===
                            "approved"
                              ? "green"
                              : selectedDocument.status ===
                                  "rejected"
                                ? "red"
                                : selectedDocument.status ===
                                    "in_review"
                                  ? "blue"
                                  : "yellow"
                          }
                          className="dark:text-white"
                        >
                          {selectedDocument.status ===
                          "in_review"
                            ? "In Review"
                            : selectedDocument.status}
                        </Badge>
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
                    aria-label="Document information"
                  >
                    <Tabs.Trigger
                      value="details"
                      className="flex-1 px-4 py-2 text-center text-gray-800 font-medium hover:text-indigo-600 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                    >
                      <div className="flex items-center justify-center">
                        <FiInfo className="mr-2" />
                        Details
                      </div>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="attachments"
                      className="flex-1 px-4 py-2 text-center text-gray-800 font-medium hover:text-indigo-600 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
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
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                          <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 dark:bg-gray-900 dark:border-gray-700">
                            <div className="flex items-center">
                              <div className="bg-indigo-100 p-2 rounded-full mr-3 dark:bg-gray-800">
                                <FiInfo
                                  className="text-indigo-600 dark:text-amber-400"
                                  aria-label="Information Icon"
                                />
                              </div>
                              <h3 className="font-semibold text-indigo-500 dark:text-amber-400">
                                Document
                                Information
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-2 gap-y-3 ml-4">
                              <div>
                                <span className="text-medium text-gray-800 font-bold dark:text-white">
                                  Document Name:
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-800 ml-4 dark:text-gray-300">
                                  {
                                    selectedDocument.document_name
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-medium text-gray-800 font-bold dark:text-white">
                                  Description:
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-800 ml-4 dark:text-gray-300">
                                  {selectedDocument.description ||
                                    "No description provided"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                          <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 dark:bg-gray-900 dark:border-gray-700">
                            <div className="flex items-center">
                              <div className="bg-indigo-100 p-2 rounded-full mr-3 dark:bg-gray-800">
                                <FiFileText
                                  className="text-indigo-600 dark:text-amber-400"
                                  aria-label="Actions Icon"
                                />
                              </div>
                              <h3 className="font-semibold text-indigo-500 dark:text-amber-400">
                                Document Actions
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="overflow-x-auto">
                              <table className="w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                  <tr>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider dark:text-white"
                                    >
                                      Action
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider dark:text-white"
                                    >
                                      Description
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-center text-xs font-bold text-black uppercase tracking-wider dark:text-white"
                                    >
                                      Status
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-center text-xs font-bold text-black uppercase tracking-wider dark:text-white"
                                    >
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                  <tr>
                                    <td className="px-4 py-3 text-sm dark:text-gray-300">
                                      Edit
                                      Document
                                    </td>
                                    <td className="px-4 py-3 text-sm dark:text-gray-300">
                                      Update
                                      document
                                      details or
                                      upload new
                                      version
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                      <Badge
                                        color={
                                          selectedDocument.status ===
                                          "approved"
                                            ? "green"
                                            : selectedDocument.status ===
                                                "rejected"
                                              ? "red"
                                              : selectedDocument.status ===
                                                  "in_review"
                                                ? "blue"
                                                : "yellow"
                                        }
                                        className="dark:text-white"
                                      >
                                        {selectedDocument.status ===
                                        "in_review"
                                          ? "In Review"
                                          : selectedDocument.status
                                              .charAt(
                                                0
                                              )
                                              .toUpperCase() +
                                            selectedDocument.status.slice(
                                              1
                                            )}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                      <Flex
                                        gap="2"
                                        justify="center"
                                      >
                                        <Button
                                          onClick={() =>
                                            handleEditDocument(
                                              selectedDocument
                                            )
                                          }
                                          className={`${
                                            [
                                              "approved",
                                              "rejected",
                                            ].includes(
                                              selectedDocument.status
                                            )
                                              ? "bg-gray-400 cursor-not-allowed dark:bg-gray-500"
                                              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                          } text-white p-2 rounded`}
                                          title="Edit"
                                          disabled={[
                                            "approved",
                                            "rejected",
                                          ].includes(
                                            selectedDocument.status
                                          )}
                                        >
                                          <FiEdit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          onClick={() => {
                                            setDocToDelete(
                                              selectedDocument
                                            )
                                            setDeleteConfirmOpen(
                                              true
                                            )
                                          }}
                                          className={`${
                                            selectedDocument.status ===
                                            "approved"
                                              ? "bg-gray-400 cursor-not-allowed dark:bg-gray-500"
                                              : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                          } text-white p-2 rounded`}
                                          title={
                                            selectedDocument.status ===
                                            "approved"
                                              ? "Cannot delete approved documents"
                                              : "Delete"
                                          }
                                          disabled={
                                            selectedDocument.status ===
                                            "approved"
                                          }
                                        >
                                          <FiTrash2 className="w-4 h-4" />
                                        </Button>
                                        {selectedDocument?.status ===
                                          "rejected" && (
                                          <Button
                                            onClick={() =>
                                              handleReapplyDocument(
                                                selectedDocument
                                              )
                                            }
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded dark:bg-yellow-600 dark:hover:bg-yellow-700"
                                            title="Reapply"
                                          >
                                            <FiRepeat className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </Flex>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        {selectedDocument.status ===
                          "rejected" &&
                          selectedDocument.comment && (
                            <Box className="bg-red-100 border border-red-200 text-red-700 text-sm rounded-md px-4 py-2 mb-3 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
                              <strong>
                                Rejection Reason:
                              </strong>{" "}
                              {
                                selectedDocument.comment
                              }
                            </Box>
                          )}
                      </div>
                    </Tabs.Content>

                    <Tabs.Content
                      value="attachments"
                      className="p-1"
                    >
                      {selectedDocument?.attachments &&
                      selectedDocument.attachments
                        .length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedDocument.attachments.map(
                            (file, index) => (
                              <div
                                key={index}
                                className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700"
                              >
                                <FiFileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                <p className="mt-2 text-sm text-center text-gray-700 px-2 dark:text-gray-200">
                                  {file.filename ||
                                    `Attachment ${index + 1}`}
                                </p>
                                <div className="flex gap-2 mt-3 w-full justify-center">
                                  <button
                                    className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs flex items-center hover:bg-indigo-100 transition-colors dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                                    onClick={() => {
                                      try {
                                        const blob =
                                          new Blob(
                                            [
                                              Uint8Array.from(
                                                atob(
                                                  file.file_content
                                                ),
                                                (
                                                  c
                                                ) =>
                                                  c.charCodeAt(
                                                    0
                                                  )
                                              ),
                                            ],
                                            {
                                              type: file.file_type,
                                            }
                                          )
                                        const blobUrl =
                                          URL.createObjectURL(
                                            blob
                                          )
                                        window.open(
                                          blobUrl,
                                          "_blank"
                                        )
                                        setTimeout(
                                          () =>
                                            URL.revokeObjectURL(
                                              blobUrl
                                            ),
                                          60000
                                        )
                                      } catch (err) {
                                        toast.error(
                                          "Failed to view the file"
                                        )
                                      }
                                    }}
                                  >
                                    <FiEye className="mr-1" />
                                    View
                                  </button>

                                  <button
                                    className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs flex items-center hover:bg-indigo-100 transition-colors dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                                    onClick={() => {
                                      try {
                                        const blob =
                                          new Blob(
                                            [
                                              Uint8Array.from(
                                                atob(
                                                  file.file_content
                                                ),
                                                atob(
                                                  file.file_content
                                                ),
                                                (
                                                  c
                                                ) =>
                                                  c.charCodeAt(
                                                    0
                                                  )
                                              ),
                                            ],
                                            {
                                              type: file.file_type,
                                            }
                                          )
                                        const blobUrl =
                                          URL.createObjectURL(
                                            blob
                                          )
                                        const link =
                                          document.createElement(
                                            "a"
                                          )
                                        link.href =
                                          blobUrl
                                        link.download =
                                          file.filename ||
                                          "document"
                                        document.body.appendChild(
                                          link
                                        )
                                        link.click()
                                        document.body.removeChild(
                                          link
                                        )
                                        URL.revokeObjectURL(
                                          blobUrl
                                        )
                                      } catch (err) {
                                        toast.error(
                                          "Failed to download the file"
                                        )
                                      }
                                    }}
                                  >
                                    <FiDownload className="mr-1" />
                                    Download
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8 dark:text-gray-400">
                          No attachments
                          available.
                        </p>
                      )}
                    </Tabs.Content>
                  </ScrollArea>
                </Tabs.Root>
              </Dialog.Content>
            </Dialog.Root>
          )}
          <Dialog.Root
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
          >
            <Dialog.Content className="w-[90vw] max-w-[320px] p-5 rounded-md bg-white dark:bg-gray-900 dark:text-white border dark:border-gray-700">
              <Dialog.Title className="text-md font-semibold mb-3">
                Confirm Deletion
              </Dialog.Title>
              <Text className="text-sm mb-5">
                Are you sure you want to delete
                this document?
              </Text>
              <Flex
                justify="end"
                gap="2"
              >
                <Dialog.Close asChild>
                  <Button
                    color="crimson"
                    variant="soft"
                    size="1"
                    className="dark:bg-red-700 dark:text-white dark:hover:bg-red-800"
                    onClick={() =>
                      setDeleteConfirmOpen(false)
                    }
                  >
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  size="1"
                  onClick={handleDeleteDocument}
                >
                  Delete
                </Button>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        </Flex>
      )}
    </Box>
  )
}

export default Documents
