import React, { useState, useEffect } from "react"
import {
  Box,
  Button,
  Text,
  Flex,
  Table,
} from "@radix-ui/themes"
import * as Dialog from "@radix-ui/react-dialog"
import { Eye } from "lucide-react"
import PropTypes from "prop-types"
import { RxCrossCircled } from "react-icons/rx"
import * as Form from "@radix-ui/react-form"
import { ClipLoader } from "react-spinners"

const JobCard = ({
  job,
  referralJob,
  setReferralJob,
  detailJob,
  setDetailJob,
  referrals,
  submitted,
  candidate,
  handleCandidateChange,
  handleReferSubmit,
}) => {
  const [issubmitted, setIssubmitted] =
    useState(false)
  const [ispdf, setpdf] = useState(true)
  const [viewMode, setViewMode] = useState("job")
  const formSubmit = () => {
    if (
      candidate.resume &&
      candidate.resume.type !== "application/pdf"
    ) {
      setpdf(false)
      return
    }
    if (
      candidate.name &&
      candidate.email &&
      candidate.resume &&
      candidate.resume.size <= 1024 * 1024 * 5 + 1
    ) {
      setIssubmitted(true)
    }
  }
  const handleViewPDF = (attachment) => {
    const pdfWindow = window.open()
    pdfWindow.document.write(
      `<iframe width='100%' height='100%' src='data:application/pdf;base64,${attachment}'></iframe>`
    )
  }

  useEffect(() => {
    setIssubmitted(false)
  }, [referralJob])

  return (
    <Box className="border rounded-xl shadow-md p-6 hover:shadow-lg transition bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
      <Box className="flex justify-between items-start">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white">
          {job.title}
        </Text>
      </Box>
      <Text className="block mt-1 text-gray-600 dark:text-gray-300 text-sm">
        {job.description &&
          new DOMParser()
            .parseFromString(
              job.description
                .replace(/<li>/g, "• ")
                .replace(/<\/li>/g, " ")
                .replace(/<br\s*\/?>/g, " "),
              "text/html"
            )
            .body.textContent?.trim()
            .slice(0, 40) + "..."}
      </Text>
      {[
        {
          label: "Skills",
          value:
            job.skills &&
            new DOMParser()
              .parseFromString(
                job.description
                  .replace(/<li>/g, "• ")
                  .replace(/<\/li>/g, " ")
                  .replace(/<br\s*\/?>/g, " "),
                "text/html"
              )
              .body.textContent?.trim()
              .slice(0, 40) + "...",
        },
        {
          label: "Experience",
          value: job.experience,
        },
        {
          label: "Location",
          value: job.location,
        },
        {
          label: "Deadline",
          value: job.deadline,
        },
        {
          label: "Referrals",
          value: referrals
            ? referrals?.length
            : 0,
        },
      ]
        .filter(
          ({ value }) =>
            value !== undefined && value !== null
        )
        .map(({ label, value }) => (
          <Text
            key={label}
            className={`block text-sm ${label === "Skills" ? "mt-2" : ""} ${label === "Referrals" ? "mb-4" : ""}`}
          >
            <Text className="font-medium text-gray-700 dark:text-gray-200">
              {label}:
            </Text>{" "}
            <span className="text-gray-800 dark:text-white">
              {label === "Referrals"
                ? value
                : value}
            </span>
          </Text>
        ))}

      <Box className="flex gap-2 items-center justify-between mt-2">
        <Dialog.Root
          open={detailJob === job}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setViewMode("job")
            }
            setDetailJob(isOpen ? job : null)
          }}
        >
          <Dialog.Trigger asChild>
            <Button
              variant="plain"
              className="flex items-center justify-center gap-1 w-[40%] text-sm !text-blue-600 dark:!text-blue-400 !border-blue-400 dark:!border-blue-400 py-1.5 rounded-md border hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors duration-200"
            >
              <Eye
                size={14}
                className="text-blue-600 dark:text-blue-400"
              />{" "}
              View Details
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="bg-black/40 dark:bg-black/70 fixed inset-0" />
            <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] min-h-[70vh] max-h-[85vh] overflow-auto max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 z-50 border border-gray-200 dark:border-gray-600">
              <Flex className="flex justify-between">
                <Box className="flex gap-6 border-b border-gray-200 dark:border-gray-600 mb-6">
                  <button
                    onClick={() =>
                      setViewMode("job")
                    }
                    className={`pb-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                      viewMode === "job"
                        ? "border-blue-600 text-blue-700 dark:text-blue-400 dark:border-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    Job Details
                  </button>
                  <button
                    onClick={() =>
                      setViewMode("referrals")
                    }
                    className={`pb-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                      viewMode === "referrals"
                        ? "border-blue-600 text-blue-700 dark:text-blue-400 dark:border-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    My Referrals
                  </button>
                </Box>
                <Dialog.Close asChild>
                  <RxCrossCircled
                    size="1.5em"
                    className="crosscircleclose text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
                  />
                </Dialog.Close>
              </Flex>
              {viewMode === "job" ? (
                <div>
                  <Box className="space-y-2">
                    {[
                      {
                        label: (
                          <span className="text-gray-800 dark:text-white text-sm font-semibold">
                            Job Title
                          </span>
                        ),
                        value: (
                          <div
                            className="text-gray-800 dark:text-white text-sm"
                            dangerouslySetInnerHTML={{
                              __html: job.title,
                            }}
                          />
                        ),
                      },
                      {
                        label: (
                          <span className="text-gray-800 dark:text-white text-sm font-semibold">
                            Description
                          </span>
                        ),
                        value: (
                          <div
                            className="block mt-1 text-sm text-gray-800 dark:text-gray-200 prose prose-sm prose-neutral max-w-none"
                            dangerouslySetInnerHTML={{
                              __html:
                                job.description,
                            }}
                          />
                        ),
                      },
                      {
                        label: (
                          <span className="text-gray-800 dark:text-white text-sm font-semibold">
                            Skills
                          </span>
                        ),
                        value: (
                          <div
                            className="block mt-1 text-sm text-gray-800 dark:text-gray-200 prose prose-sm prose-neutral max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: job.skills,
                            }}
                          />
                        ),
                      },
                      {
                        label: (
                          <span className="text-gray-800 dark:text-white text-sm font-semibold">
                            Experience
                          </span>
                        ),
                        value: (
                          <div
                            className="block mt-1 text-sm text-gray-800 dark:text-gray-200 prose prose-sm prose-neutral max-w-none"
                            dangerouslySetInnerHTML={{
                              __html:
                                job.experience,
                            }}
                          />
                        ),
                      },
                      {
                        label: (
                          <span className="text-gray-800 dark:text-white text-sm font-semibold">
                            Location
                          </span>
                        ),
                        value: (
                          <div
                            className="block mt-1 text-sm text-gray-800 dark:text-gray-200 prose prose-sm prose-neutral max-w-none"
                            dangerouslySetInnerHTML={{
                              __html:
                                job.location,
                            }}
                          />
                        ),
                      },
                      {
                        label: (
                          <span className="text-gray-800 dark:text-white text-sm font-semibold">
                            Deadline
                          </span>
                        ),
                        value: (
                          <div
                            className="block mt-1 text-sm text-gray-800 dark:text-gray-200 prose prose-sm prose-neutral max-w-none"
                            dangerouslySetInnerHTML={{
                              __html:
                                job.deadline,
                            }}
                          />
                        ),
                      },
                      {
                        label: (
                          <span className="text-gray-800 dark:text-white text-sm font-semibold">
                            Total Referrals
                          </span>
                        ),
                        value: referrals
                          ? referrals.length
                          : 0,
                      },
                    ].map(({ label, value }) => (
                      <Text
                        key={label}
                        className="block text-sm text-gray-700 dark:text-white"
                      >
                        <Text className="font-bold">
                          {label}:
                        </Text>{" "}
                        {value}
                      </Text>
                    ))}
                  </Box>
                </div>
              ) : referrals?.length > 0 ? (
                <Table.Root className="table-auto p-1 w-full border-collapse">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell className="p-2 font-semibold text-sm text-left text-gray-700 dark:text-gray-200">
                        Name
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="p-2 font-semibold text-sm text-left text-gray-700 dark:text-gray-200">
                        Email
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="p-2 font-semibold text-sm text-center text-gray-700 dark:text-gray-200">
                        Resume
                      </Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {referrals.map((ref, i) => (
                      <Table.Row
                        key={i}
                        className="border-b border-gray-200 dark:border-gray-600"
                      >
                        <Table.Cell className="p-3">
                          <Box className="h-[40px] flex text-sm items-center text-gray-700 dark:text-gray-200">
                            {ref.candidate_name}
                          </Box>
                        </Table.Cell>
                        <Table.Cell className="p-3">
                          <Box className="h-[40px] flex text-sm items-center text-gray-700 dark:text-gray-200">
                            {ref.candidate_email}
                          </Box>
                        </Table.Cell>
                        <Table.Cell className="p-3 text-sm text-center">
                          <Box
                            className="text-blue-500 dark:text-blue-400 text-sm h-[40px] flex items-center justify-center underline cursor-pointer hover:text-blue-700 dark:hover:text-blue-300"
                            onClick={() => {
                              handleViewPDF(
                                ref.resume_data
                              )
                            }}
                          >
                            View
                          </Box>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              ) : (
                <p className="text-gray-500 dark:text-gray-300">
                  No referral data
                </p>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <Dialog.Root
          open={referralJob === job}
          onOpenChange={(isOpen) =>
            setReferralJob(isOpen ? job : null)
          }
        >
          <Dialog.Trigger asChild>
            <Button
              variant="plain"
              className="text-sm w-[38%] !text-blue-700 dark:!text-blue-400 !border-[1px] !border-solid !border-blue-700 dark:!border-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900 hover:!text-blue-800 dark:hover:!text-blue-300 transition-colors duration-200 rounded-md py-1.5"
            >
              Refer Candidate
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="bg-black/40 dark:bg-black/70 fixed inset-0" />
            <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 z-50 border border-gray-200 dark:border-gray-600">
              <Dialog.Title className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Refer Candidate for {job.title}
              </Dialog.Title>
              <Form.Root
                onSubmit={(e) => {
                  handleReferSubmit(
                    e,
                    issubmitted,
                    job.title
                  )
                  formSubmit()
                }}
                className="space-y-4"
              >
                <Form.Field name="name">
                  <Form.Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Candidate Name{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="name"
                      placeholder="Candidate Name"
                      value={candidate.name}
                      onChange={
                        handleCandidateChange
                      }
                      onInput={(e) => {
                        e.target.value =
                          e.target.value.replace(
                            /[^a-zA-Z\s]/g,
                            ""
                          )
                      }}
                      className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 text-sm outline-none placeholder:text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-600 focus:ring-opacity-50"
                    />
                  </Form.Control>
                  {submitted &&
                    !candidate.name && (
                      <span className="text-xs text-red-600 block">
                        Name is required.
                      </span>
                    )}
                </Form.Field>
                <Form.Field name="email">
                  <Form.Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Candidate Email{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="email"
                      name="email"
                      placeholder="Candidate Email"
                      value={candidate.email}
                      onChange={
                        handleCandidateChange
                      }
                      className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 text-sm outline-none placeholder:text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-600 focus:ring-opacity-50"
                    />
                  </Form.Control>
                  {submitted &&
                    !candidate.email && (
                      <span className="text-xs text-red-600 block">
                        Email is required.
                      </span>
                    )}
                  {candidate.email &&
                    !/\S+@\S+\.\S+/.test(
                      candidate.email
                    ) && (
                      <span className="text-xs text-red-600 block">
                        Please enter a valid email
                        (e.g., abc@gmail.com).
                      </span>
                    )}
                </Form.Field>
                <Form.Field name="resume">
                  <Form.Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Resume{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="file"
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={
                        handleCandidateChange
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 file:bg-blue-600 dark:file:bg-blue-700 file:text-white file:border-none file:rounded file:px-3 file:py-1 file:mr-3"
                    />
                  </Form.Control>
                  {submitted &&
                    !candidate.resume && (
                      <span className="text-xs text-red-600 block">
                        Resume is required.
                      </span>
                    )}
                  {candidate.resume?.size >
                    5 * 1024 * 1024 + 1 && (
                    <span className="text-xs text-red-600 block">
                      File size should be less
                      than 5MB.
                    </span>
                  )}
                  {issubmitted && (
                    <span className="text-xs text-blue-500 dark:text-blue-400 block">
                      Processing Resume...
                    </span>
                  )}
                  {!ispdf && (
                    <span className="text-xs text-red-600 block">
                      Only PDF files are allowed!
                    </span>
                  )}
                </Form.Field>
                <Box className="flex justify-end gap-2 pt-2">
                  <Dialog.Close asChild>
                    <Button
                      variant="soft"
                      color="red"
                      className="bg-red-50 dark:bg-red-800 text-red-700 dark:text-white hover:bg-red-100 dark:hover:bg-red-700 transition-colors duration-200"
                      style={{
                        padding: "0.3rem 0.8rem",
                        borderRadius: "0.375rem",
                      }}
                    >
                      Cancel
                    </Button>
                  </Dialog.Close>
                  <Form.Submit asChild>
                    <Button
                      style={{
                        padding: "0.3rem 0.8rem",
                        borderRadius: "0.375rem",
                      }}
                      className={`${
                        issubmitted
                          ? "!bg-blue-300 dark:!bg-blue-600 !text-white"
                          : "!bg-blue-800 dark:!bg-blue-700 !text-white !border-2 !border-blue-800 dark:!border-blue-700 rounded-md hover:bg-blue-900 dark:hover:bg-blue-600 hover:border-blue-900 dark:hover:border-blue-600 transition-colors duration-200"
                      } `}
                    >
                      {issubmitted ? (
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
                    </Button>
                  </Form.Submit>
                </Box>
              </Form.Root>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Box>
    </Box>
  )
}

JobCard.propTypes = {
  job: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    skills: PropTypes.string.isRequired,
    experience: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    deadline: PropTypes.string.isRequired,
    referrals: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        resume: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  referrals: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      job_id: PropTypes.string.isRequired,
      candidate_name: PropTypes.string.isRequired,
      candidate_email:
        PropTypes.string.isRequired,
      resume_data: PropTypes.string.isRequired,
      emp_id: PropTypes.string.isRequired,
      emp_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  referralJob: PropTypes.object,
  setReferralJob: PropTypes.func.isRequired,
  detailJob: PropTypes.object,
  setDetailJob: PropTypes.func.isRequired,
  submitted: PropTypes.bool.isRequired,
  emp_id: PropTypes.string.isRequired,
  org_slug: PropTypes.string.isRequired,
  candidate: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    resume: PropTypes.string,
  }).isRequired,
  handleCandidateChange:
    PropTypes.func.isRequired,
  handleReferSubmit: PropTypes.func.isRequired,
}

export default JobCard
