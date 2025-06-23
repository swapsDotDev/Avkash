import React, { useState, useEffect } from "react"
import { Box } from "@radix-ui/themes"
import SearchBox from "../../SearchBox"
import JobCard from "./JobCard"
import axios from "axios"
import ModernPagination from "../../ModernPagination"
import { useOrganizationContext } from "../../OrganizationContext"
import toast from "react-hot-toast"
import FadeLoader from "react-spinners/FadeLoader"
import { useUser } from "@clerk/clerk-react"

const Career = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const itemsPerPage = 6
  const [searchVal, setSearchVal] = useState("")
  const [jobs, setJobs] = useState([])
  const [referrals, setReferrals] = useState([])
  const { user } = useUser()
  const [userdata, setUserdata] = useState({})
  const [referralJob, setReferralJob] =
    useState(null)
  const [currentPage, setCurrentPage] =
    useState(0)
  const [detailJob, setDetailJob] = useState(null)
  const [submitted, setSubmitted] =
    useState(false)
  const [loading, setLoading] = useState(true)
  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    resume: null,
  })
  const { organizationName, org_slug, socket } =
    useOrganizationContext()
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

  const handleSearchFilter = (val) => {
    setSearchVal(val)
  }

  const getuserdata = () => {
    axios
      .get(`${BASE_URL}/user/${user.id}`, {
        params: {
          organization_name: organizationName,
          org_slug: org_slug,
        },
      })
      .then((response) => {
        const userdata =
          response.data.user_data[0]
        setUserdata(userdata)
      })
      .catch(() => {
        toast.error("Error fetching user data")
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

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  useEffect(() => {
    fetchAllJobs()
    getuserdata()
    if (userdata.employee_id && org_slug) {
      getReferralData()
      const handleMessage = () => {
        fetchAllJobs()
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
    }
  }, [userdata.employee_id, org_slug, socket])

  const filteredJobs = jobs.filter(
    (job) =>
      job.title
        .toLowerCase()
        .includes(searchVal.toLowerCase()) ||
      job.location
        .toLowerCase()
        .includes(searchVal.toLowerCase())
  )

  const handleCandidateChange = (e) => {
    const { name, value, files } = e.target
    setCandidate((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }))
  }

  const handleReferSubmit = (
    e,
    issubmitted,
    job_title
  ) => {
    e.preventDefault()
    if (
      candidate.resume &&
      candidate.resume.type !== "application/pdf"
    ) {
      return
    }
    if (issubmitted) return
    if (
      !candidate.name ||
      !candidate.email ||
      !candidate.resume ||
      candidate.resume.size > 1024 * 1024 * 5 + 1
    ) {
      setSubmitted(true)
      return
    }
    const formData = new FormData()
    formData.append("job_title", job_title),
      formData.append("job_id", referralJob._id)
    formData.append("name", candidate.name)
    formData.append("email", candidate.email)
    formData.append("resume", candidate.resume)
    formData.append("org_slug", org_slug)
    formData.append(
      "emp_id",
      userdata.employee_id
    )
    formData.append("emp_name", userdata.username)
    formData.append("emp_email", userdata.email)
    axios
      .post(
        `${BASE_URL}/refer_candidate`,
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
      .then(() => {
        if (
          socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          socket.send("submited")
        }
        toast.success(
          "Candidate referred successfully!"
        )
        getReferralData()
        setReferralJob(null)
        setCandidate({
          name: "",
          email: "",
          resume: null,
        })
      })
      .catch(() => {
        toast.error("Failed to refer candidate")
      })
  }

  useEffect(() => {
    setSubmitted(false)
    setCandidate({
      name: "",
      email: "",
      resume: null,
    })
  }, [referralJob])

  const startIndex = currentPage * itemsPerPage
  const currentJobs = filteredJobs.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const getReferralData = () => {
    axios
      .get(
        `${BASE_URL}/get_referred_candidates`,
        {
          params: {
            emp_id: userdata.employee_id,
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
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
      <Box className="p-1 flex items-center rounded-lg mb-2">
        <SearchBox
          placeholder="Search Job Title"
          searchValue={searchVal}
          handleOnchange={handleSearchFilter}
        />
      </Box>
      <Box className="min-h-[83vh] flex flex-col justify-between p-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-6 relative">
        {loading ? (
          <Box className="flex justify-center items-center h-full w-full min-h-[70vh]">
            <FadeLoader
              color={
                currentTheme === "dark"
                  ? "#60A5FA"
                  : "#2563EB"
              }
            />
          </Box>
        ) : (
          <>
            {filteredJobs?.length === 0 ? (
              <Box className="flex justify-center items-center h-full w-full min-h-[70vh] text-gray-500 dark:text-gray-300 text-lg">
                Currently there is no job data
              </Box>
            ) : (
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {currentJobs.map((job, index) => (
                  <JobCard
                    key={index}
                    job={job}
                    referralJob={referralJob}
                    setReferralJob={
                      setReferralJob
                    }
                    detailJob={detailJob}
                    referrals={referrals.filter(
                      (ref) =>
                        ref.job_id === job._id
                    )}
                    setDetailJob={setDetailJob}
                    submitted={submitted}
                    candidate={candidate}
                    handleCandidateChange={
                      handleCandidateChange
                    }
                    handleReferSubmit={
                      handleReferSubmit
                    }
                  />
                ))}
              </Box>
            )}
          </>
        )}
        {!loading &&
          filteredJobs?.length > itemsPerPage && (
            <Box className="mt-1 mb-3 flex justify-center">
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
