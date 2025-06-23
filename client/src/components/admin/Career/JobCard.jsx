import React from "react"
import {
  Box,
  Button,
  Text,
  Table,
  Flex,
  HoverCard,
} from "@radix-ui/themes"
import * as Dialog from "@radix-ui/react-dialog"
import { Pencil, Eye } from "lucide-react"
import { useState } from "react"
import PropTypes from "prop-types"
import { RxCrossCircled } from "react-icons/rx"
import ModernPagination from "../../ModernPagination"

const JobCard = ({
  job,
  handleEditClick,
  referralJob,
  referrals,
  setReferralJob,
  handleViewPDF,
}) => {
  const [detailJob, setDetailJob] = useState(null)
  const itemsPerPage = 12
  const [currentPage, setCurrentPage] =
    useState(0)

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  const startIndex = currentPage * itemsPerPage
  const currentreferals = referrals.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <Box className="border rounded-[0.4rem] shadow-md p-4 hover:shadow-lg transition relative duration-200 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600">
      <Box className="flex justify-between items-start">
        <Text className="text-lg font-semibold">
          {job.title}
        </Text>
        <Pencil
          size={16}
          className="text-gray-500 dark:text-white cursor-pointer"
          onClick={() => handleEditClick(job)}
        />
      </Box>
      <Text className="block mt-1 text-gray-600 dark:text-white text-sm">
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
            job.skills?.slice(0, 40) +
            (job.skills?.length > 40
              ? "..."
              : ""),
        },
        {
          label: "Experience",
          value: job.experience,
        },
        {
          label: "Work Mode",
          value: job.workmode,
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
            <Text className="font-medium">
              {label}:
            </Text>{" "}
            {label === "Referrals"
              ? value
              : value}
          </Text>
        ))}
      <Box className="flex gap-2 items-center justify-between mt-2">
        <Dialog.Root
          open={detailJob === job}
          onOpenChange={(isOpen) =>
            setDetailJob(isOpen ? job : null)
          }
        >
          <Dialog.Trigger asChild>
            <Button
              variant="plain"
              className="flex items-center justify-center gap-1 w-[40%] text-sm !text-blue-600 dark:text-blue-400 py-1.5 rounded-md border border-blue-400 hover:bg-blue-50 transition"
            >
              <Eye size={14} />
              <span className="dark:text-blue-300">
                {" "}
                View Details{" "}
              </span>
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="bg-black/40 fixed inset-0" />
            <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-lg max-h-[85vh] overflow-auto -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 z-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600">
              <Flex className="justify-between items-center mb-4">
                <Dialog.Title className="text-lg font-semibold">
                  Job Details
                </Dialog.Title>
                <Dialog.Close asChild>
                  <RxCrossCircled
                    size="1.5em"
                    className="crosscircleclose text-gray-500 dark:text-white"
                  />
                </Dialog.Close>
              </Flex>
              <Box className="space-y-2 text-black dark:text-white bg-white dark:bg-gray-700">
                {[
                  {
                    label: "Title",
                    value: job.title,
                  },
                  {
                    label: "Description",
                    value: (
                      <div
                        className="block mt-1 text-sm text-black dark:text-white prose prose-sm prose-neutral max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: job.description,
                        }}
                      />
                    ),
                  },
                  {
                    label: "Skills",
                    value: job.skills,
                  },
                  {
                    label: "Experience",
                    value: job.experience,
                  },
                  {
                    label: "Work Mode",
                    value: job.workmode,
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
                    label: "Total Referrals",
                    value: referrals?.length,
                  },
                ].map(({ label, value }) => (
                  <Text
                    key={label}
                    className="block text-sm"
                  >
                    <Text className="font-bold text-sm">
                      {label}:
                    </Text>{" "}
                    {value}
                  </Text>
                ))}
              </Box>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <Dialog.Root
          open={referralJob === job}
          onOpenChange={(isOpen) => {
            setReferralJob(isOpen ? job : null)
          }}
        >
          <Dialog.Trigger asChild>
            <Button
              variant="plain"
              className="text-sm w-[35%] !text-blue-700 !border-[1px] !border-solid !border-blue-700 bg-transparent hover:bg-blue-50 hover:border-blue-300 hover:!text-blue-800 transition rounded-md py-1.5"
            >
              <span className="dark:text-blue-300">
                View Referrals
              </span>
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="bg-black/40 fixed inset-0 z-10" />
            <Dialog.Content
              className={`fixed top-1/2 flex flex-col justify-between left-1/2 w-[90vw] max-w-3xl max-h-[90vh] overflow-auto -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg p-4 z-50 ${referrals?.length > 12 && referralJob === job ? "min-h-[90vh]" : ""}`}
            >
              <Box>
                <Flex className="justify-between items-center mb-4 bg-white dark:bg-gray-700 dark:text-white">
                  <Dialog.Title className="text-lg font-semibold text-black dark:text-white">
                    Referrals for {job.title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <RxCrossCircled
                      size="1.5em"
                      className="crosscircleclose text-gray-500 dark:text-white"
                    />
                  </Dialog.Close>
                </Flex>
                {referrals?.length > 0 ? (
                  <Table.Root className="table-auto p-4 w-full border-collapse text-black dark:text-white">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell className="p-2 font-semibold text-sm text-left dark:text-white">
                          Name
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className="p-2 font-semibold text-sm text-left dark:text-white">
                          Email
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className="p-2 font-semibold text-sm text-center dark:text-white">
                          AI Score
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className="p-2 font-semibold text-sm text-center dark:text-white">
                          Resume
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className="p-2 font-semibold text-sm text-center dark:text-white">
                          Referred By
                        </Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {currentreferals.map(
                        (ref, i) => (
                          <Table.Row key={i}>
                            <Table.Cell className="p-3">
                              <Box className="h-[40px] flex text-sm items-center dark:text-white">
                                {
                                  ref.candidate_name
                                }
                              </Box>
                            </Table.Cell>
                            <Table.Cell className="p-3">
                              <Box className="h-[40px] flex text-sm items-center dark:text-white">
                                {
                                  ref.candidate_email
                                }
                              </Box>
                            </Table.Cell>
                            <Table.Cell className="p-3">
                              <Box className="h-[40px] flex justify-center text-sm items-center dark:text-white">
                                {ref.AI_score ||
                                  "--"}
                              </Box>
                            </Table.Cell>
                            <Table.Cell className="p-3 text-sm text-center">
                              <Box
                                className="text-blue-500 text-sm h-[40px] flex items-center justify-center underline cursor-pointer"
                                onClick={() => {
                                  handleViewPDF(
                                    ref.resume_data
                                  )
                                }}
                              >
                                View
                              </Box>
                            </Table.Cell>
                            <Table.Cell className="p-3">
                              <Box className="h-[40px] flex flex-col text-sm justify-center items-center text-center">
                                <HoverCard.Root>
                                  <HoverCard.Trigger className="relative z-100 dark:text-white">
                                    <nav>
                                      {
                                        ref.emp_name
                                      }
                                    </nav>
                                  </HoverCard.Trigger>
                                  <HoverCard.Content
                                    sideOffset={
                                      10
                                    }
                                    alignOffset={
                                      10
                                    }
                                    className="relative z-50 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg shadow-md"
                                  >
                                    <Box
                                      className="bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg shadow-none"
                                      style={{
                                        marginTop:
                                          "4px",
                                        width:
                                          "250px",
                                        zIndex: 2000,
                                      }}
                                    >
                                      <Text
                                        weight="bold"
                                        size="2"
                                        className="mb-1"
                                      >
                                        Name:{" "}
                                      </Text>
                                      <Text
                                        size="1"
                                        className="mb-2"
                                      >
                                        {
                                          ref.emp_name
                                        }
                                      </Text>
                                      <br />
                                      <Text
                                        weight="bold"
                                        size="2"
                                        className="mb-1"
                                      >
                                        Email:{" "}
                                      </Text>
                                      <Text size="1">
                                        {ref.emp_email ||
                                          "NA"}
                                      </Text>
                                      <br />
                                      <Text
                                        weight="bold"
                                        size="2"
                                        className="mb-1"
                                      >
                                        Employee
                                        Id:{" "}
                                      </Text>
                                      <Text size="1">
                                        {
                                          ref.emp_id
                                        }
                                      </Text>
                                    </Box>
                                  </HoverCard.Content>
                                </HoverCard.Root>
                              </Box>
                            </Table.Cell>
                          </Table.Row>
                        )
                      )}
                    </Table.Body>
                  </Table.Root>
                ) : (
                  <p className="text-black dark:text-white">
                    No referrals yet.
                  </p>
                )}
              </Box>
              {referrals?.length >
                itemsPerPage && (
                <Box className="mt-1 flex justify-center">
                  <ModernPagination
                    total={referrals?.length}
                    pageSize={itemsPerPage}
                    siblingCount={1}
                    showEdges={true}
                    style={{ height: "24px" }}
                    onPageChange={
                      handlePageChange
                    }
                    currentPage={currentPage}
                  />
                </Box>
              )}
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
    workmode: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    deadline: PropTypes.string.isRequired,
    referrals: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        resume_data: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  handleEditClick: PropTypes.func.isRequired,
  referralJob: PropTypes.object,
  org_slug: PropTypes.string.isRequired,
  setReferralJob: PropTypes.func.isRequired,
  handleViewPDF: PropTypes.func.isRequired,
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
}

export default JobCard
