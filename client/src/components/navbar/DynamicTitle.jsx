import React from "react"
import { useLocation } from "react-router-dom"
import { Box, Text } from "@radix-ui/themes"
import { withTranslation } from "react-i18next"
import PropTypes from "prop-types"
const DynamicTitle = ({ t }) => {
  DynamicTitle.propTypes = {
    t: PropTypes.string.isRequired,
  }
  const location = useLocation()
  const pathname = location.pathname

  const pageTitles = {
    "/dashboard": t("dashboard"),
    "/leaverequest": t("leaveRequests"),
    "/members": t("members"),
    "/applyleave": t("applyLeave"),
    "/payslip": t("payslips"),
    "/reimbursement": "Reimbursement",
    "/documents": "Documents",
    "/setting": t("settings"),
    "/notification": t("notifications"),
    "/helpsupport": t("helpSupport"),
    "/feedbacks": "Feedbacks",
    "/department": "Departments",
    "/recruiterDesk": "RecruiterDesk",
    "/referralportal": "Referral Portal",
    "/holidays": "Holidays",
    "/payroll": "Payroll",
    "/memberinfo": "Member Information",
    "/noticeboard": "Notice Board",
    "/membernoticeboard": "Notice Board",
    "/organizationchart": "Organization Chart",
  }

  const pageTitle = pageTitles[pathname] || ""

  return (
    <Box className="flex">
      <Text className="text-black dark:text-white transition-colors duration-200">
        {pageTitle}
      </Text>
    </Box>
  )
}

export default withTranslation()(DynamicTitle)
