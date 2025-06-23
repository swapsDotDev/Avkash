import React from "react"
import { useState, useEffect } from "react"
import { Box, Button } from "@radix-ui/themes"
import SearchBox from "../../SearchBox"
import * as Dialog from "@radix-ui/react-dialog"
import JobForm from "./JobForm"
import JobCard from "./JobCard"
import axios from "axios"
import ModernPagination from "../../ModernPagination"
import { useOrganizationContext } from "../../OrganizationContext"
import toast from "react-hot-toast"
import FadeLoader from "react-spinners/FadeLoader"

const Career = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const itemsPerPage = 6
  const [searchVal, setSearchVal] = useState("")
  const [openJobModal, setOpenJobModal] =
    useState(false)
  const [isEditMode, setIsEditMode] =
    useState(false)
  const [jobs, setJobs] = useState([])
  const [referrals, setReferrals] = useState([])
  const [selectedJob, setSelectedJob] = useState(
    {}
  )
  const [referralJob, setReferralJob] =
    useState(null)
  const [currentPage, setCurrentPage] =
    useState(0)
  const [submitted, setSubmitted] =
    useState(false)
  const [loading, setLoading] = useState(true)
  const { org_slug, socket, organizationName } =
    useOrganizationContext()

  const handleSearchFilter = (val) => {
    setSearchVal(val)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSelectedJob((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditClick = (job) => {
    setSelectedJob(job)
    setIsEditMode(true)
    setOpenJobModal(true)
  }

  const handleViewPDF = (attachment) => {
    const pdfWindow = window.open()
    pdfWindow.document.write(
      `<iframe width='100%' height='100%' src='data:application/pdf;base64,${attachment}'></iframe>`
    )
  }

  const addNewJob = (newJob) => {
    axios
      .post(
        `${BASE_URL}/add_job`,
        {
          ...newJob,
          org_slug,
        },
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then(() => {
        if (
          socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          socket.send("submited")
        }
        toast.success("Job added successfully")
        fetchAllJobs()
      })
      .catch(() => {
        toast.error("Error adding job")
      })
  }

  const fetchAllJobs = () => {
    axios
      .get(`${BASE_URL}/get_jobs`, {
        params: {
          organization_name: organizationName,
          org_slug: org_slug,
        },
      })
      .then((response) => {
        setJobs(response.data.jobs.reverse())
        setLoading(false)
      })
      .catch(() => {
        toast.error("Error fetching jobs")
        setLoading(false)
      })
  }

  const editJob = (updatedJob) => {
    const job_id = updatedJob._id
    axios
      .put(
        `${BASE_URL}/update_job/${job_id}`,
        updatedJob
      )
      .then(() => {
        if (
          socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          socket.send("submited")
        }
        toast.success("Job updated successfully")
        fetchAllJobs()
      })
      .catch(() => {
        toast.error("Failed to update job")
      })
  }

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  useEffect(() => {
    fetchAllJobs()
    getReferralData()
    const handleMessage = () => {
      fetchAllJobs()
      getReferralData()
      getReferralData()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (
      !selectedJob.title ||
      !selectedJob.description ||
      !selectedJob.skills ||
      !selectedJob.experience ||
      !selectedJob.workmode ||
      !selectedJob.location ||
      !selectedJob.deadline
    ) {
      setSubmitted(true)
      return
    }
    isEditMode
      ? editJob(selectedJob)
      : addNewJob(selectedJob)
    setOpenJobModal(false)
    setSelectedJob({})
    setIsEditMode(false)
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.title
        .toLowerCase()
        .includes(searchVal.toLowerCase()) ||
      job.location
        .toLowerCase()
        .includes(searchVal.toLowerCase())
  )

  const startIndex = currentPage * itemsPerPage
  const currentJobs = filteredJobs.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  useEffect(() => {
    setSubmitted(false)
  }, [openJobModal])

  const getReferralData = () => {
    axios
      .get(`${BASE_URL}/get_all_referrals`, {
        params: {
          org_slug: org_slug,
          organization_name: organizationName,
        },
      })
      .then((response) => {
        const referralData =
          response.data.referred_candidates
        setReferrals(referralData)
      })
      .catch(() => {
        toast.error(
          "Error fetching referral data"
        )
      })
  }

  return (
    <Box>
      <Box className="flex justify-between items-center rounded-lg mb-3">
        <SearchBox
          placeholder="Search Job Title"
          searchValue={searchVal}
          handleOnchange={handleSearchFilter}
        />
        <Dialog.Root
          open={openJobModal}
          onOpenChange={setOpenJobModal}
        >
          <Dialog.Trigger asChild>
            <Button
              onClick={() => {
                setSelectedJob({
                  title: "",
                  description: "",
                  skills: "",
                  experience: "",
                  workmode: "",
                  location: "",
                  deadline: "",
                })
                setIsEditMode(false)
              }}
            >
              Add New Job
            </Button>
          </Dialog.Trigger>
          <JobForm
            selectedJob={selectedJob}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isEditMode={isEditMode}
            submitted={submitted}
          />
        </Dialog.Root>
      </Box>

      <Box className="min-h-[83vh] flex flex-col justify-between p-1 rounded-[0.4rem] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 relative">
        {loading ? (
          <Box className="flex justify-center items-center h-full w-full min-h-[70vh]">
            <FadeLoader color="#2563eb" />
          </Box>
        ) : (
          <>
            {filteredJobs?.length === 0 ? (
              <Box className="flex justify-center items-center h-full w-full min-h-[70vh] text-gray-500 dark:text-white text-lg">
                Currently there is no job data
              </Box>
            ) : (
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {currentJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    handleEditClick={
                      handleEditClick
                    }
                    org_slug={org_slug}
                    referrals={referrals.filter(
                      (ref) =>
                        ref.job_id === job._id
                    )}
                    referralJob={referralJob}
                    setReferralJob={
                      setReferralJob
                    }
                    handleViewPDF={handleViewPDF}
                  />
                ))}
              </Box>
            )}
          </>
        )}
        {!loading &&
          filteredJobs?.length > itemsPerPage && (
            <Box className="mb-3 flex justify-center">
              <ModernPagination
                total={filteredJobs?.length}
                pageSize={itemsPerPage}
                siblingCount={1}
                showEdges={true}
                onPageChange={handlePageChange}
                currentPage={currentPage}
              />
            </Box>
          )}
      </Box>
    </Box>
  )
}

export default Career
