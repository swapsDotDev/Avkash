import React from "react"
import { Box, Button } from "@radix-ui/themes"
import * as Dialog from "@radix-ui/react-dialog"
import PropTypes from "prop-types"
import * as Form from "@radix-ui/react-form"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

const JobForm = ({
  selectedJob,
  handleInputChange,
  handleSubmit,
  isEditMode,
  submitted,
}) => {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black/40 fixed inset-0" />
      <Dialog.Content className="fixed top-1/2 max-h-[90vh] overflow-auto left-1/2 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4 z-50">
        <Dialog.Title className="text-xl text-blue-900 dark:text-blue-500 font-semibold mb-2">
          {isEditMode
            ? "Edit Job"
            : "Add New Job"}
        </Dialog.Title>
        <Form.Root
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Form.Field name="title">
            <Form.Label className="block text-sm font-medium text-black dark:text-white mb-1">
              Job Title
              <span className="text-red-600">
                *
              </span>
            </Form.Label>
            <Form.Control asChild>
              <input
                name="title"
                placeholder="Job Title"
                value={selectedJob.title || ""}
                onChange={handleInputChange}
                onInput={(e) => {
                  e.target.value =
                    e.target.value.replace(
                      /[^a-zA-Z\s]/g,
                      ""
                    )
                }}
                className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 text-left text-sm dark:text-white outline-none placeholder:text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
              />
            </Form.Control>
            {submitted && !selectedJob.title && (
              <span className="text-xs text-red-600 block">
                Job title is required.
              </span>
            )}
          </Form.Field>
          <Form.Field name="description">
            <Form.Label className="block text-sm font-medium text-black dark:text-white mb-1">
              Job Description
              <span className="text-red-600">
                *
              </span>
            </Form.Label>
            <Box className="border border-gray-300 dark:border-gray-600 rounded focus-within:border-gray-500 focus-within:ring focus-within:ring-gray-200 focus-within:ring-opacity-50 bg-white dark:bg-gray-700">
              <ReactQuill
                value={
                  selectedJob.description || ""
                }
                onChange={(value) =>
                  handleInputChange({
                    target: {
                      name: "description",
                      value: value,
                    },
                  })
                }
                placeholder="Job Description"
                className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                theme="snow"
              />
            </Box>
            {submitted &&
              !selectedJob.description && (
                <span className="text-xs text-red-600 block">
                  Job description is required.
                </span>
              )}
          </Form.Field>
          <Form.Field name="skills">
            <Form.Label className="block text-sm font-medium text-black dark:text-white mb-1">
              Skills
              <span className="text-red-600">
                *
              </span>
            </Form.Label>
            <Form.Control asChild>
              <input
                name="skills"
                placeholder="Skills"
                value={selectedJob.skills || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 text-left text-sm outline-none placeholder:text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
              />
            </Form.Control>
            {submitted && !selectedJob.skills && (
              <span className="text-xs text-red-600 block">
                Skills are required.
              </span>
            )}
          </Form.Field>
          <Form.Field name="experience">
            <Form.Label className="block text-sm font-medium text-black dark:text-white mb-1">
              Experience
              <span className="text-red-600">
                *
              </span>
            </Form.Label>
            <Form.Control asChild>
              <input
                name="experience"
                placeholder="Experience"
                value={
                  selectedJob.experience || ""
                }
                onChange={handleInputChange}
                className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 text-left text-sm outline-none placeholder:text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
              />
            </Form.Control>
            {submitted &&
              !selectedJob.experience && (
                <span className="text-xs text-red-600 block">
                  Experience is required.
                </span>
              )}
          </Form.Field>
          <Form.Field name="workMode">
            <Form.Label className="block text-sm font-medium text-black dark:text-white mb-1">
              Work Mode
              <span className="text-red-600">
                *
              </span>
            </Form.Label>
            <Form.Control asChild>
              <input
                name="workmode"
                placeholder="Work Mode"
                value={selectedJob.workmode || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded border-gray-300 text-left text-sm outline-none placeholder:text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
              />
            </Form.Control>
            {submitted &&
              !selectedJob.workmode && (
                <span className="text-xs text-red-600 block">
                  Work Mode is required.
                </span>
              )}
          </Form.Field>
          <Form.Field name="location">
            <Form.Label className="block text-sm font-medium text-black dark:text-white mb-1">
              Location
              <span className="text-red-600">
                *
              </span>
            </Form.Label>
            <Form.Control asChild>
              <input
                name="location"
                placeholder="Location"
                value={selectedJob.location || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded border-gray-300 text-left text-sm outline-none placeholder:text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
              />
            </Form.Control>
            {submitted &&
              !selectedJob.location && (
                <span className="text-xs text-red-600 block">
                  Work Mode is required.
                </span>
              )}
          </Form.Field>
          <Form.Field name="deadline">
            <Form.Label className="block text-sm font-medium text-black dark:text-white mb-1">
              Application Deadline
              <span className="text-red-600">
                *
              </span>
            </Form.Label>
            <Form.Control asChild>
              <input
                type="date"
                name="deadline"
                value={selectedJob.deadline || ""}
                onChange={handleInputChange}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                className="w-full p-2 border rounded border-gray-300 text-left text-sm outline-none placeholder:text-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
              />
            </Form.Control>
            {submitted &&
              !selectedJob.deadline && (
                <span className="text-xs text-red-600 block">
                  Application deadline is
                  required.
                </span>
              )}
          </Form.Field>
          <Box className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button
                variant="soft"
                color="red"
                className="bg-red-100 dark:bg-red-700 text-red-700 dark:text-white border-2 border-red-500 rounded-md hover:bg-red-100"
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
                className="!bg-blue-800 !text-white !border-2 !border-blue-800 rounded-md hover:bg-blue-900 hover:border-blue-900 transition"
              >
                {isEditMode ? "Update" : "Save"}
              </Button>
            </Form.Submit>
          </Box>
        </Form.Root>
      </Dialog.Content>
    </Dialog.Portal>
  )
}

JobForm.propTypes = {
  selectedJob: PropTypes.shape({
    workmode: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    skills: PropTypes.string,
    experience: PropTypes.string,
    location: PropTypes.string,
    deadline: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  submitted: PropTypes.bool.isRequired,
}

export default JobForm
