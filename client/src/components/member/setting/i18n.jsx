/* eslint-disable no-dupe-keys */
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: {
        translation: {
          Startdate: "Start date:",
          Enddate: " End date:",
          timesheet: "Time Sheet",
          thisWeek: "This Week",
          lastWeek: "Last Week",
          overAll: "Over All",
          week: "Week",
          inTime: "Check In Time",
          DesktopNotification:
            "Desktop Notification",
          ClickheretoOnOffDesktopNotification:
            "Click here to On/Off Desktop Notification",
          EmailNotification: "Email Notification",
          UpdateProfile: "Update Profile",
          EditProfile: "Edit Profile",
          UpdateYourProfile:
            "Update Your Profile",
          ClickheretoOnOffEmailNotification:
            "Click here to On/Off Email Notification",
          noNotifications:
            "Currently there are no Notifications.",
          clearAll: "Clear All",
          averageWorkingHours:
            "Today's Worked Hours",
          breakTime: "Total Break Time",
          endBreak: "End Break",
          endBreakDescription:
            "Click on the button below to End the Break.",
          CheckIn: "Check In",
          checkOut: "Check Out",
          checkOutDescription:
            "Click on the button below to check out.",
          cancel: "Cancel",
          leaveBalance: "Leave Balance",
          totalLeaves: "Total Leaves",
          leavesTaken: "Leaves Taken",
          startbreak: "Start Break",
          Onabreak: "On a break",
          CheckOutTime: "Check Out Time",
          MarkAllAsRead: "Mark all as read",
          Unread: " Unread",
          Read: "Read",
          "You have already applied for leave on same day":
            "You have already applied for leave on same day",
          "Leave request status updated successfully":
            "Leave request status updated successfully",
          allNotificationsRead:
            "All notifications marked as read",
          errorMarkingNotifications:
            "Error marking notifications as read",
          feedbackReplies: "Feedback Replies",
          "Your leave request for {{leaveType}} is accepted":
            "Your leave request for {{leaveType}} is accepted",
          "Your leave request for {{leaveType}} is rejected":
            "Your leave request for {{leaveType}} is rejected",
          "You have received a reply to your feedback: {{reply}}":
            "You have received a reply to your feedback: {{reply}}",
          "Your leave request for {{leaveType}} is {{status}}":
            "Your leave request for {{leaveType}} is {{status}}",
          "Leave request submitted Successfully":
            "Leave request submitted Successfully",
          Totalworkedhoursstoredsuccessfully:
            "Total worked hours stored successfully!",
          FailedtocheckoutPleasetryagainlater:
            "Failed to check out. Please try again later.",
          BreakTimeSavedSuccessfully:
            "Break Time Saved Successfully",
          Checkinsuccessfully:
            "Check-in successfully!",
          FailedtostoretotalworkedhoursPleasetryagainlater:
            "Failed to store total worked hours. Please try again later.",
          FailedtocheckinPleasetryagainlater:
            "Failed to check in. Please try again later.",
          FailedtoupdatebreaktimePleasetryagainlater:
            "Failed to update break time. Please try again later.",
          Checkoutsuccessfully:
            "Check-out successfully!",
          NoOneisOnLeaveforToday:
            "No One is On Leave for Today!",
          YouredoinggreatClickbelowtocheckoutandrecordyourprogress:
            "You're doing great! Click below to check out and record your progress",
          WelcomeClickbelowtocheckinandstartyourproductiveday:
            "Welcome! Click below to check in and start your productive day",
          TakechargeandresumeyourtasksbyclickingthebuttonbelowtoEndtheBreak:
            "Take charge and resume your tasks by clicking the button below to End the Break.",
          ClickbelowtoStartaRefreshingBreakandboostyourproductivity:
            "Click below to Start a Refreshing Break and boost your productivity.",
          leavesRemaining: "Leaves Remaining",
          contactUsTitle: "Contact Us",
          contactUsContent:
            "If you need further assistance, please feel free to contact our support team.",
          supportEmailLabel: "Email:",
          supportEmail: "support@avkash.com",
          supportPhoneLabel: "Phone:",
          supportPhone: "xxx-xxx-xxxx",
          leaveRequestTitle:
            "Leave Request Process",
          leaveRequestContent:
            "Step-by-step guide on how to submit a leave request.",
          complianceTitle:
            "Compliance and Legal Information",
          complianceContent:
            "For compliance with company policies and legal requirements, please review the following information:",
          feedbackTitle: "Feedback",
          feedbackContent:
            "We value your feedback! Let us know how we can improve our services.",
          submitFeedback: "Submit Feedback",
          upcomingHolidaysTitle:
            "Upcoming Holidays",
          noHolidaysMessage:
            "No Holidays For You",
          loadingMessage: "Loading holidays..",
          dashboard: "Dashboard",
          leaveRequests: "Leave Requests",
          members: "Members",
          applyLeave: "Apply Leave",
          payslip: "Payslip",
          settings: "Settings",
          notification: "Notification",
          helpSupport: "Help & Support",
          avkash: "Avkash",
          totalWorkedHours: "Total Worked Hours",
          noOneIsOnLeave:
            "No One is On Leave for Today.",
          daysDescription: "Days",
          days: "Days",
          workedHours: "Worked Hours",
          workedHoursLabel: "Worked Hours",
          total: "Total",
          leaves: "Leaves",
          leaveChart: "Leave Chart",
          remainingLeaves: "Remaining leaves",
          takenLeaves: "Taken leaves",
          dashboard: "Dashboard",
          leaveRequests: "Leave Requests",
          members: "Members",
          applyLeave: "Apply Leave",
          payslips: "Payslips",
          settings: "Settings",
          notifications: "Notifications",
          helpSupport: "Help & Support",
          onLeave: "On Leave",
          showMore: "Show More",
          monday: "Mon",
          tuesday: "Tue",
          wednesday: "Wed",
          thursday: "Thu",
          friday: "Fri",
          familyEmergency: "Family Emergency",
          personalVacation: "Personal Vacation",
          medicalLeave: "Medical Leave",
          examLeaves: "Exam Leaves",
          familyFunction: "Family Function",
          casualLeave: "Casual Leave",
          leaveHistoryTitle: "Leave History",
          srNo: "Sr.No",
          month: "Month",
          grossSalary: "Gross Salary",
          netPay: "Net Pay",
          notification1:
            "Your leave application is approved",
          notification2: "Notification 2",
          notification3:
            "Your leave application is approved",
          notification4: "Notification 2",
          notification5:
            "Your leave application is approved",
          notification6: "Notification 2",
          notification7:
            "Your leave application is approved",
          notification8: "Notification 2",
          notification9:
            "Your leave application is approved",
          notification10: "Notification 2",
          languagePreferenceTitle:
            "Language Preference",
          english: "English",
          leaveTypes: "Leave Types",
          hindi: "Hindi",
          marathi: "Marathi",
          sampleSettingsTitle: "Sample Settings",
          sampleSettingsText:
            "We will be adding a settings option here soon",
          Feedback: "Your Feedback:",
          submitFeedbackButton: "Submit Feedback",
          cancelButton: "Cancel",
          feedbackPlaceholder:
            "Enter your feedback...",
          searchPlaceholder: "Search here",
          notificationsHeader: "Notifications",
          applyForLeaveButton: "Apply for leave",
          leaveApplicationText:
            "Leave Application",
          leaveTypeLabel: "Leave Type",
          startDateLabel: "Start Date",
          startDateErrorMessage:
            "Please enter a Start Date",
          endDateLabel: "End Date",
          descriptionLabel: "Description:",
          backButton: "Back",
          leaveRequestSystemTitle:
            "Leave Request System",
          submitLeaveRequestTitle:
            "How to Submit a Leave Request:",
          loginInstructions:
            "Log in to your employee account on the leave portal.",
          navigateInstructions:
            'Navigate to the "Leave Request" section or page.',
          clickInstructions:
            'Click on the "Submit Leave Request" button or link.',
          fillOutFormInstructions:
            "Fill out the leave request form with the required information:",
          selectLeaveTypeInstruction:
            "Select the type of leave (e.g., Annual Leave, Sick Leave, etc.).",
          chooseDatesInstruction:
            "Choose the start and end dates of your leave.",
          provideReasonInstruction:
            "Provide a reason for your leave.",
          attachDocumentsInstruction:
            "Optionally, attach any necessary supporting documents.",
          reviewInfoInstruction:
            "Review the information you've entered and make sure it's accurate.",
          submitRequestInstruction:
            'Submit your leave request by clicking the "Submit" button.',
          waitApprovalInstruction:
            "Wait for approval from your manager or HR department.",
          receiveNotificationInstruction:
            "Once approved, you will receive a notification confirming your leave request.",
          importantNotesTitle: "Important Notes:",
          submitInAdvanceNote:
            "Make sure to submit your leave request well in advance to allow time for processing.",
          beHonestNote:
            "Be transparent and honest when providing the reason for your leave.",
          trackBalanceNote:
            "Keep track of your leave balance to ensure you have enough days available.",
          urgentRequestsNote:
            "For any urgent leave requests or special circumstances, contact your manager directly.",
          backButton: "Back",
          leavePoliciesTitle: "Leave Policies",
          purposeTitle: "Purpose",
          purposeContent:
            "The purpose of the leave policy is to provide guidelines for the use of leave by employees, to ensure that employees are aware of their rights and responsibilities, and to promote fairness and consistency in the application of leave policies.",
          eligibilityTitle: "Eligibility",
          eligibilityContent:
            "All employees are eligible for leave as per company policy. Eligibility criteria are defined by the company, based on the type of employment and duration of service.",
          typesOfLeaveTitle: "Types of Leave",
          annualLeaveTitle: "Annual Leave",
          annualLeaveContent:
            "Annual leave is provided to employees for vacation and personal reasons. The amount of annual leave an employee is entitled to is based on their employment contract and the duration of service.",
          sickLeaveTitle: "Sick Leave",
          sickLeaveContent:
            "Sick leave is provided to employees who are unable to attend work due to illness or injury. The amount of sick leave an employee is entitled to is based on their employment contract and the duration of service.",
          maternityLeaveTitle: "Maternity Leave",
          maternityLeaveContent:
            "Maternity leave is provided to female employees who are pregnant and due to give birth. The amount of maternity leaves an employee is entitled to is based on the employment contract and relevant regulations.",
          paternityLeaveTitle: "Paternity Leave",
          paternityLeaveContent:
            "Paternity leave is provided to male employees whose spouse or partner is pregnant and due to give birth. The amount of paternity leaves an employee is entitled to is based on the employment contract and relevant regulations.",
          bereavementLeaveTitle:
            "Bereavement Leave",
          bereavementLeaveContent:
            "Bereavement leave is provided to employees who have suffered the loss of an immediate family member. The amount of bereavement leaves an employee is entitled to is based on the employment contract and relevant regulations.",
          leaveWithoutPayTitle:
            "Leave without Pay",
          leaveWithoutPayContent:
            "If an employee has insufficient or no leave balance, they have the option to apply for leave without pay. The reporting manager will then send their recommendation to the Head of HR for final approval. It’s important to note that holidays and weekly offs during the period of leave without pay will not be compensated, and the employee will not receive any salary for the duration of the leave. Any leave without pay that exceeds a certain time frame will require approval from the CEO.",
          applyingLeaveTitle:
            "Applying for Leave",
          applyingLeaveContent:
            "Employees must apply for leave in writing, using the company’s leave application form. Employees are required to give reasonable notice before taking leave, and the request must be approved by the employee’s manager or supervisor.",
          leaveBalanceTitle: "Leave Balance",
          leaveBalanceContent:
            "Employees are responsible for monitoring their own leave balance, which is available through the company’s HR system. The company may also provide regular leave balance statements to employees.",
          leaveCarryoverTitle: "Leave Carryover",
          leaveCarryoverContent:
            "Employees may carry over a certain amount of annual leave to the following year, as per company policy. However, unused sick leave cannot be carried over to the following year.",
          terminationTitle:
            "Termination of Employment",
          terminationContent:
            "Employees who resign or are terminated from employment are entitled to payment for any accrued but unused annual leave. However, sick leave is not paid out on termination of employment.",
          amendmentsTitle:
            "Amendments to the Leave Policy",
          amendmentsContent:
            "The Company reserves the right to amend the leave policy at any time. Employees will be informed of any changes to the policy in writing, and the revised policy will be made available to all employees.",
          january: "January",
          february: "February",
          march: "March",
          april: "April",
          may: "May",
          june: "June",
          july: "July",
          august: "August",
          september: "September",
          october: "October",
          november: "November",
          december: "December",
          leaveTypesTitle: "Leave Types",
          noHistoryMessage:
            "There is no history anymore.",
          attachmentLabel: "Attachment:",
          Jan: "Jan",
          Feb: "Feb",
          Mar: "Mar",
          Apr: "Apr",
          May: "May",
          June: "June",
          July: "July",
          Aug: "Aug",
          Sept: "Sept",
          Oct: "Oct",
          Nov: "Nov",
          Dec: "Dec",
          Months: "Months",
          hrsPerWeek: "Hours per Week",
          leavePolicies: "Leave Policies",
          payslipForTheMonth:
            "Payslip For the Month",
          employeeSummary: "EMPLOYEE SUMMARY",
          name: "Name",
          designation: "Designation",
          joiningDate: "Joining Date",
          payPeriod: "Pay Period",
          payDate: "Pay Date",
          bankName: "Bank Name",
          accountNo: "Account No",
          panCard: "PAN Card",
          employeeNetPay: "Employee Net Pay",
          paidDays: "Paid Days",
          lopDays: "LOP Days",
          lopCost: "lop Cost",
          earning: "EARNING",
          amount: "AMOUNT",
          basicSalary: "Basic Salary",
          overtime: "Overtime",
          deduction: "DEDUCTION",
          incomeTax: "Income Tax",
          insurance: "Insurance",
          professionalTax: "Professional Tax",
          grossEarning: "Gross Earning",
          totalDeduction: "Total Deduction",
          totalNetPayable: "TOTAL NET PAYABLE",
          generate: "Generate",
          amountInWords: "Amount In Words",
          apply: "Apply",
          selectLanguage: "Select Language:",

          viewPayslip: "View Payslip",
          noRecordsFound:
            "No records found for the selected year.",
          selectLanguageText:
            "Discover your perfect language match,the one that suits you best.",
          time1: "9:28 AM",
          time2: "9:33 Hours",
          time3: "7:07 min",
          locale: "en-US",
          holidayDate: "{{date}}",
          holidays: "Holidays",
          showAll: "Show All",
          TotalWorkedHours: "Total Worked Hours",
          Mon: "Mon",
          Tue: "Tue",
          Wed: "Wed",
          Thu: "Thu",
          Fri: "Fri",
          Days: "Days",
          noData: "No Data Available",
          WorkedHours: "Worked Hours",
          Hours: "hrs",
          companyname: "Avkash",
          address: "Supreme Headquarters, Pune",
          Feedback: "Feedback",
          YourFeedback: "Your Feedback",
          EnterFeedback: "Enter your feedback...",
          SubmitFeedback: "Submit Feedback",
          otherLeaves: "Other Leaves",
          Cancel: "Cancel",
          from: "From",
          to: "To",
          UserInfo: "User Info",
          Name: "Name",
          Email: "Email",
          Gender: "Gender",
          Male: "Male",
          Female: "Female",
          BankName: "Bank Name",
          Countrycode: "Country code",
          PANnumber: "PAN number",
          Accountnumber: "Account number",
          Role: "Role",
          Submit: "Submit",
          Date: "Date",
          Designation: "Designation",
          DateofJoining: "Date of Joining",
          Department: "Department",
          DateofBirth: "Date of Birth",
          Other: "Other",
          specification: "Specification",
          SrNo: "Sr No",
          GrossSalary: "Gross Salary",
          NetPay: "Net pay",
          SlipDetails: "Slip Details",
          PleaseEnterAtLeast10Chars:
            "Please enter at least 10 characters",
          PleaseEnterLessThan100Chars:
            "Please enter less than 100 characters",
          ThankYou: "Thank you",
          FeedbackSubmittedSuccessfully:
            "Feedback submitted successfully!",
          Mandatory: "Mandatory",
          Optional: "Optional",
          RecentTransactions:
            "Recent Transactions",
          Suggested: "Suggested",
          Previous: "Previous",
          Next: "Next",
          RemainingOnLeave: "Remaining on Leave",
          NameLabel: "Name:",
          EmailLabel: "Email:",
          ReasonLabel: "Reason:",
          ViewDetails: "View Details",
          Filter: "Filter",
          Years: "Years",
          leaveHistory: "Leave History",
          status: "Status",
          details: "Details",
          seeMore: "See More",
          leaveDetailsTitle: "Leave Details",
          viewLeaveDetails:
            "View your leave details.",
          startDate: "Start Date",
          endDate: "End Date",
          leaveType: "Type of Leave",
          description: "Description",
          notMentioned: "Not-Mentioned",
          attachment: "Attachment",
          accepted: "Accepted",
          pending: "Pending",
          inReview: "In Review",
          rejected: "Rejected",
          date: "Date",
          FirstHalf: "First Half",
          SecondHalf: "Second Half",
          FullLeave: "Full Leave",
          WFH: "WFH",
          ContactNumber: "Contact Number",
          viewDetails: "View Details",
          notMentioned: "Not Mentioned",
          notAttached: "Not Attached",
          viewPDF: "View PDF",
          previous: "Previous",
          today: "Today",
          yesterday: "Yesterday",
          older: "Older",
          next: "Next",
          showOnlyRead: "Show only read",
          showOnlyUnread: "Show only unread",
          alert: "Alert!",
          noPayslipInformation:
            "Currently there is no payslip information",
          noNotificationsToShow:
            "No notifications to show",
          lowLeaveBalance:
            "Your Leave Balance Is Low!",
          NegativeLeaveBalance:
            "Your Leave Balance Is In Negative!",
          holidaySummaries: {
            "Holika Dahana": "Holika Dahana",
            Dolyatra: "Dolyatra",
            Holi: "Holi",
            "Good Friday": "Good Friday",
            "Easter Day": "Easter Day",
            "Jamat Ul-Vida": "Jamat Ul-Vida",
            Ugadi: "Ugadi",
            "Chaitra Sukhladi":
              "Chaitra Sukhladi",
            "Gudi Padwa": "Gudi Padwa",
            "Ramzan Id/Eid-ul-Fitar":
              "Ramzan Id/Eid-ul-Fitar",
            Vaisakhi: "Vaisakhi",
            "Mesadi / Vaisakhadi":
              "Mesadi / Vaisakhadi",
            "Ambedkar Jayanti":
              "Ambedkar Jayanti",
            "Rama Navami": "Rama Navami",
            "Mahavir Jayanti": "Mahavir Jayanti",
            "Birthday of Rabindranath":
              "Birthday of Rabindranath",
            "Buddha Purnima/Vesak":
              "Buddha Purnima/Vesak",
            "Bakrid/Eid ul-Adha":
              "Bakrid/Eid ul-Adha",
            "Rath Yatra": "Rath Yatra",
            "Muharram/Ashura": "Muharram/Ashura",
            "Parsi New Year": "Parsi New Year",
            "Independence Day":
              "Independence Day",
            "Raksha Bandhan (Rakhi)":
              "Raksha Bandhan (Rakhi)",
            "Janmashtami (Smarta)":
              "Janmashtami (Smarta)",
            Janmashtami: "Janmashtami",
            "Ganesh Chaturthi/Vinayaka Chaturthi":
              "Ganesh Chaturthi/Vinayaka Chaturthi",
            Onam: "Onam",
            "Milad un-Nabi/Id-e-Milad":
              "Milad un-Nabi/Id-e-Milad",
            "Mahatma Gandhi Jayanti":
              "Mahatma Gandhi Jayanti",
            "First Day of Sharad Navratri":
              "First Day of Sharad Navratri",
            "First Day of Durga Puja Festivities":
              "First Day of Durga Puja Festivities",
            "Maha Saptami": "Maha Saptami",
            "Maha Ashtami": "Maha Ashtami",
            "Maha Navami": "Maha Navami",
            Dussehra: "Dussehra",
            "Maharishi Valmiki Jayanti":
              "Maharishi Valmiki Jayanti",
            "Karaka Chaturthi (Karva Chauth)":
              "Karaka Chaturthi (Karva Chauth)",
            "Naraka Chaturdasi":
              "Naraka Chaturdasi",
            "Diwali/Deepavali":
              "Diwali/Deepavali",
            "Govardhan Puja": "Govardhan Puja",
            "Bhai Duj": "Bhai Duj",
            "Chhat Puja (Pratihar Sashthi/Surya Sashthi)":
              "Chhat Puja (Pratihar Sashthi/Surya Sashthi)",
            "Guru Nanak Jayanti":
              "Guru Nanak Jayanti",
            "Guru Tegh Bahadur's Martyrdom Day":
              "Guru Tegh Bahadur's Martyrdom Day",
            "Christmas Eve": "Christmas Eve",
            Christmas: "Christmas",
            welcomeMessage:
              "Welcome, {{fullName}}",
          },
        },
      },
      hi: {
        translation: {
          Startdate: "आरंभ करने की तिथि:",
          Enddate: "अंतिम तिथि:",
          timesheet: "टाइम शीट",
          thisWeek: "इस सप्ताह",
          lastWeek: "पिछले सप्ताह",
          overAll: "सभी",
          today: "आज",
          yesterday: "कल",
          older: "पुराना",
          week: "सप्ताह",
          noData: "कोई डेटा उपलब्ध नहीं है।",
          inTime: "समय में",
          UserInfo: "यूजर इंफॉ",
          Name: "नाम",
          Email: "ईमेल",
          Gender: "लिंग",
          Male: "पुरुष",
          Female: "स्त्री",
          ContactNumber: "संपर्क संख्या",
          Countrycode: "देश कोड",
          BankName: "बैंक का नाम",
          PANnumber: "पैन नंबर",
          Accountnumber: "खाता संख्या",
          Designation: "पद",
          DateofJoining: "शामिल होने की तिथि",
          Role: "भूमिका",
          Submit: "प्रस्तुत करें",
          Date: "तारीख",
          FirstHalf: "पहली अवधि",
          SecondHalf: "दूसरा अवधि",
          FullLeave: "पूर्ण छुट्टी",
          WFH: "घर से काम",
          Department: "विभाग",
          DateofBirth: "जन्म तिथि",
          Other: "अन्य",
          averageWorkingHours:
            "औसत काम करने का समय",
          breakTime: "ब्रेक समय",
          endBreak: "ब्रेक समाप्त",
          showOnlyRead: "केवल पढ़ा हुआ दिखाएं",
          showOnlyUnread: "केवल अपठित दिखाएं",
          DesktopNotification: "डेस्कटॉप सूचनाएं",
          ClickheretoOnOffDesktopNotification:
            "डेस्कटॉप सूचनाएं को चालू/बंद करने के लिए यहां क्लिक करें",
          EmailNotification: "ईमेल सूचनाएं",
          UpdateYourProfile:
            "अपनी प्रोफ़ाइल अपडेट करें",
          UpdateProfile: "प्रोफ़ाइल अपडेट करें",
          EditProfile: "प्रोफ़ाइल संपादित करें",
          ClickheretoOnOffEmailNotification:
            "ईमेल सूचनाएं को चालू/बंद करने के लिए यहां क्लिक करें",
          endBreakDescription:
            "ब्रेक समाप्त करने के लिए नीचे दिए गए बटन पर क्लिक करें।",
          checkOut: "बाहर निकलें",
          CheckOutTime: "चेक आउट समय",
          checkOutDescription:
            "बाहर निकलने के लिए नीचे दिए गए बटन पर क्लिक करें।",
          cancel: "रद्द करें",
          CheckOutTime: "चेक आउट समय",
          startbreak: "ब्रेक शुरू करें",
          CheckIn: "चेक इन करें",
          Checkoutsuccessfully:
            "सफलतापूर्वक चेक-आउट हुआ!",
          BreakTimeSavedSuccessfully:
            "ब्रेक का समय सफलतापूर्वक बचाया गया",
          Checkinsuccessfully:
            "सफलतापूर्वक चेक-इन हुआ!",
          Onabreak: " ब्रेक पर ",
          Totalworkedhoursstoredsuccessfully:
            "कुल काम के घंटे सफलतापूर्वक संग्रहीत!",
          FailedtostoretotalworkedhoursPleasetryagainlater:
            "कुल कार्य घंटों को संग्रहीत करने में विफल। कृपया बाद में पुन: प्रयास करें।",
          FailedtocheckoutPleasetryagainlater:
            "जाँच करने में विफल. कृपया बाद में पुन: प्रयास करें।",
          FailedtocheckinPleasetryagainlater:
            "चेक इन करने में विफल। कृपया बाद में पुनः प्रयास करें।",
          FailedtoupdatebreaktimePleasetryagainlater:
            "ब्रेक टाइम अपडेट करने में विफल. कृपया बाद में पुन: प्रयास करें।",
          YouredoinggreatClickbelowtocheckoutandrecordyourprogress:
            "तुम बहुत अच्छा कर रहे हो! अपनी प्रगति देखने और रिकॉर्ड करने के लिए नीचे क्लिक करें",
          WelcomeClickbelowtocheckinandstartyourproductiveday:
            "स्वागत! चेक इन करने और अपना उत्पादक दिन शुरू करने के लिए नीचे क्लिक करें",
          TakechargeandresumeyourtasksbyclickingthebuttonbelowtoEndtheBreak:
            "कार्यभार संभालें और ब्रेक समाप्त करने के लिए नीचे दिए गए बटन पर क्लिक करके अपने कार्यों को फिर से शुरू करें।",
          ClickbelowtoStartaRefreshingBreakandboostyourproductivity:
            "ब्रेक शुरू करें और अपनी उत्पादकता बढ़ाने के लिए नीचे क्लिक करें।",
          leaveBalance: "छुट्टियां संतुलन",
          totalLeaves: "कुल छुट्टियां",
          leavesTaken: "छुट्टियाँ ली गई",
          leavesRemaining: "छुट्टियां शेष",
          contactUsTitle: "संपर्क करें",
          contactUsContent:
            "यदि आपको और सहायता की आवश्यकता है, तो कृपया हमारी सहायता टीम से संपर्क करें।",
          supportEmailLabel: "ईमेल:",
          supportEmail: "support@avkash.com",
          supportPhoneLabel: "फोन:",
          supportPhone: "xxx-xxx-xxxx",
          leaveRequestTitle:
            "छुट्टियाँ अनुरोध प्रक्रिया",
          leaveRequestContent:
            "छुट्टियाँ अनुरोध कैसे सबमिट करें की स्टेप-बाय-स्टेप गाइड।",
          complianceTitle:
            "अनुपालन और कानूनी सूचना",
          complianceContent:
            "कंपनी नीतियों और कानूनी आवश्यकताओं का अनुपालन करने के लिए, कृपया निम्नलिखित जानकारी का समीक्षण करें:",
          feedbackTitle: "प्रतिक्रिया",
          feedbackContent:
            "हम आपकी प्रतिक्रिया की मूल्यांकन करते हैं! हमें बताएं कि हम कैसे हमारी सेवाएं बेहतर बना सकते हैं।",
          submitFeedback:
            "प्रतिक्रिया सबमिट करें",
          upcomingHolidaysTitle:
            "आगामी छुट्टियाँ",
          noHolidaysMessage:
            "आपके लिए कोई छुट्टियाँ नहीं",
          loadingMessage:
            "छुट्टियाँ लोड हो रहे हैं..",
          dashboard: "डैशबोर्ड",
          leaveRequest: "छुट्टियाँ अनुरोध",
          members: "सदस्य",
          applyLeave: "छुट्टियाँ लागू करें",
          payslip: "पे स्लिप",
          noOneIsOnLeave:
            "आज किसी की छुट्टी नहीं है!",
          settings: "सेटिंग्स",
          leaveTypes: "छुट्टियाँ प्रकार",
          notification: "सूचना",
          helpSupport: "सहायता और समर्थन",
          avkash: "अवकाश",
          totalWorkedHours: "कुल काम किए गए घंटे",
          daysDescription: "दिन",
          days: "दिन",
          workedHours: "काम किए गए घंटे",
          workedHoursLabel: "काम किए गए घंटे",
          total: "कुल",
          leaves: "छुट्टियाँ",
          leaveChart: "छुट्टियाँ चार्ट",
          remainingLeaves: "शेष छुट्टियाँ",
          takenLeaves: "ली गई छुट्टियाँ",
          dashboard: "डैशबोर्ड",
          leaveRequests: "छुट्टियाँ अनुरोध",
          members: "सदस्य",
          applyLeave: "छुट्टियाँ लागू करें",
          payslips: "पे स्लिप्स",
          settings: "सेटिंग्स",
          notifications: "सूचनाएं",
          helpSupport: "सहायता और समर्थन",
          onLeave: "छुट्टी पर",
          showMore: "अधिक दिखाएं",
          RecentTransactions: "हाल के लेन-देन",
          monday: "सोम",
          tuesday: "मंगल",
          wednesday: "बुध",
          thursday: "गुरु",
          friday: "शुक्र",
          familyEmergency:
            "पारिवारिक आपातकालीन स्थिति",
          personalVacation: "व्यक्तिगत छुट्टी",
          medicalLeave: "चिकित्सा छुट्टियाँ",
          examLeaves: "परीक्षा की छुट्टियाँ",
          familyFunction: "परिवार का कार्यक्रम",
          casualLeave: "आकस्मिक छुट्टियाँ",
          leaveHistoryTitle: "छुट्टी का इतिहास",
          srNo: "सीरियल नंबर",
          month: "महिना",
          grossSalary: "कुल वेतन",
          netPay: "नेट पे",
          notification1:
            "आपकी छुट्टी की अनुमति दी गई है",
          notification2: "सूचना २",
          notification3:
            "आपकी छुट्टी की अनुमति दी गई है",
          notification4: "सूचना २",
          notification5:
            "आपकी छुट्टी की अनुमति दी गई है",
          notification6: "सूचना २",
          notification7:
            "आपकी छुट्टी की अनुमति दी गई है",
          notification8: "सूचना २",
          notification9:
            "आपकी छुट्टी की अनुमति दी गई है",
          notification10: "सूचना २",
          languagePreferenceTitle:
            "भाषा प्राथमिकता",
          english: "अंग्रेज़ी",
          hindi: "हिंदी",
          marathi: "मराठी",
          sampleSettingsTitle: "नमूना सेटिंग्स",
          sampleSettingsText:
            "हम जल्द ही यहाँ एक सेटिंग्स विकल्प जोड़ेंगे",
          Feedback: "आपकी प्रतिक्रिया:",
          submitFeedbackButton:
            "प्रतिक्रिया जमा करें",
          cancelButton: "रद्द करें",
          feedbackPlaceholder:
            "अपनी प्रतिक्रिया दर्ज करें...",
          searchPlaceholder: "यहाँ खोजें",
          notificationsHeader: "सूचनाएं",
          applyForLeaveButton:
            "छुट्टियाँ आवेदन करें",
          leaveApplicationText: "छुट्टियाँ आवेदन",
          leaveTypeLabel: "छुट्टियाँ प्रकार",
          startDateLabel: "प्रारंभ तिथि",
          startDateErrorMessage:
            "कृपया प्रारंभ तिथि दर्ज करें",
          endDateLabel: "समाप्ति तिथि",
          descriptionLabel: "विवरण:",
          SrNo: "क्रमांक",
          Months: "महीने",
          GrossSalary: "कुल वेतन",
          noNotifications:
            "वर्तमान में कोई सूचनाएं नहीं हैं।",
          clearAll: "सभी को हटाएं",
          NetPay: "नेट वेतन",
          SlipDetails: "पर्ची का विवरण",
          backButton: "वापस",
          leaveRequestSystemTitle:
            "छुट्टियाँ विनंती प्रणाली",
          submitLeaveRequestTitle:
            "छुट्टियाँ विनंती कैसे करें:",
          loginInstructions:
            "अवकाश पोर्टल पर अपने कर्मचारी खाते में लॉग इन करें।",
          navigateInstructions:
            'छुट्टी विनंती" सेक्शन या पेज पर जाएं।',
          clickInstructions:
            'छुट्टियाँ विनंती का "सबमिट" बटन या लिंक पर क्लिक करें।',
          fillOutFormInstructions:
            "आवश्यक जानकारी के साथ छुट्टियाँ विनंती फॉर्म भरें:",
          selectLeaveTypeInstruction:
            "छुट्टियाँ के प्रकार का चयन करें (जैसे, वार्षिक छुट्टियाँ, बीमार छुट्टियाँ, आदि)।",
          chooseDatesInstruction:
            "अपनी छुट्टी की शुरुआत और समाप्ति तिथियों का चयन करें।",
          provideReasonInstruction:
            "अपनी छुट्टी के लिए कारण दें।",
          attachDocumentsInstruction:
            "वैकल्पिक रूप से, आवश्यक सहायक दस्तावेज़ अटैच करें।",
          reviewInfoInstruction:
            "आपने दर्ज की गई जानकारी की समीक्षा करें और सुनिश्चित करें कि यह सही है।",
          submitRequestInstruction:
            "अपनी छुट्टियाँ विनंती सबमिट बटन पर क्लिक करके करें।",
          waitApprovalInstruction:
            "अपने प्रबंधक या एचआर विभाग से मंजूरी के लिए प्रतीक्षा करें।",
          receiveNotificationInstruction:
            "एक बार मंजूरी मिलने पर, आपको अपनी छुट्टी की अनुरोध पुष्टि करने वाला एक सूचना प्राप्त होगी।",
          importantNotesTitle: "महत्वपूर्ण नोट:",
          submitInAdvanceNote:
            "प्रसंस्करण के लिए समय देने के लिए अपनी छुट्टी का अनुरोध बहुत पहले सबमिट करने का सुनिश्चित करें।",
          beHonestNote:
            "अपनी छुट्टी के लिए कारण प्रदान करते समय पारदर्शी और ईमानदार रहें।",

          trackBalanceNote:
            "अपने छुट्टी शेष राशि का पता रखें ताकि आपके पास पर्याप्त दिन उपलब्ध हों।",
          urgentRequestsNote:
            "किसी भी अत्यावश्यक छुट्टी के अनुरोध या विशेष परिस्थितियों के लिए, अपने प्रबंधक से सीधे संपर्क करें।",
          backButton: "वापस",
          leavePolicies: "छुट्टी नीतियाँ",
          leavePoliciesTitle: "छुट्टी नीतियाँ",
          purposeTitle: "उद्देश्य",
          purposeContent:
            "छुट्टी नीति का उद्देश्य कर्मचारियों द्वारा छुट्टी का उपयोग के लिए दिशा-निर्देश प्रदान करना है, ताकि कर्मचारियों को अपने अधिकारों और जिम्मेदारियों के बारे में जागरूक रखा जा सके, और छुट्टी नीतियों के लागू करने में निष्पक्षता और संगतता को बढ़ावा देने के लिए।",
          eligibilityTitle: "पात्रता",
          eligibilityContent:
            "कंपनी की नीति के अनुसार सभी कर्मचारी छुट्टी के लिए पात्र हैं। पात्रता मानदंड कंपनी द्वारा निर्धारित किए गए हैं, जो रोजगार के प्रकार और सेवा की अवधि पर आधारित हैं।",
          typesOfLeaveTitle: "छुट्टी के प्रकार",
          annualLeaveTitle: "वार्षिक छुट्टी",
          annualLeaveContent:
            "वार्षिक छुट्टी कर्मचारियों को छुट्टियाँ और व्यक्तिगत कारणों के लिए प्रदान की जाती है। कर्मचारी की छुट्टियाँ पर्याय की गई धनवादपत्र और सेवा की अवधि पर आधारित है।",
          sickLeaveTitle: "बीमारी की छुट्टी",
          sickLeaveContent:
            "बीमारी की छुट्टी केवल उन कर्मचारियों के लिए प्रदान की जाती है जो बीमारी या चोट के कारण कार्य स्थल पर नहीं जा सकते हैं। कर्मचारी की बीमारी की छुट्टियाँ की धनवादपत्र और सेवा की अवधि पर आधारित होती है।",
          maternityLeaveTitle: "मातृत्व छुट्टी",
          maternityLeaveContent:
            "मातृत्व छुट्टी प्रेग्नेंट महिला कर्मचारियों को प्रदान की जाती है जो गर्भवती हैं और जन्म देने के लिए समयित हैं। कर्मचारी की मातृत्व छुट्टियों की संख्या की धनवादपत्र और संबंधित विधि पर आधारित होती है।",
          paternityLeaveTitle: "पितृत्व छुट्टी",
          paternityLeaveContent:
            "पितृत्व छुट्टी पुरुष कर्मचारियों को प्रदान की जाती है जिनकी पत्नी या साथी गर्भवती हैं और जन्म देने के लिए समयित हैं। कर्मचारी की पितृत्व छुट्टियों की संख्या की धनवादपत्र और संबंधित विधि पर आधारित होती है।",
          bereavementLeaveTitle: "शोक छुट्टी",
          bereavementLeaveContent:
            "शोक छुट्टी उन कर्मचारियों को प्रदान की जाती है जिन्होंने किसी तत्काल परिवार के सदस्य का नुकसान किया है। कर्मचारी की शोक छुट्टियों की संख्या की धनवादपत्र और संबंधित नियमों पर आधारित होती है।",
          leaveWithoutPayTitle:
            "वेतन के बिना छुट्टी",
          leaveWithoutPayContent:
            "यदि किसी कर्मचारी के पास अपर्याप्त या कोई भी छुट्टी का शेष नहीं है, तो उन्हें वेतन के बिना छुट्टी के लिए आवेदन करने का विकल्प होता है। रिपोर्टिंग मैनेजर फिर इसे अंतिम मंजूरी के लिए एचआर के प्रमुख को भेजेगा। ध्यान देना महत्वपूर्ण है कि वेतन के बिना छुट्टी के दौरान छुट्टी के दिनों और साप्ताहिक छुट्टियाँ को मुआवजा नहीं दिया जाएगा, और कर्मचारी को छुट्टी के अवधि के लिए कोई वेतन नहीं मिलेगा। किसी भी वेतन के बिना छुट्टी जो एक निश्चित समय-सीमा से अधिक होती है, उसे सीईओ से मंजूरी की आवश्यकता होगी।",
          applyingLeaveTitle:
            "छुट्टी के लिए आवेदन",
          applyingLeaveContent:
            "कर्मचारी को कंपनी के छुट्टी आवेदन पत्र का उपयोग करके छुट्टी के लिए आवेदन करना चाहिए। कर्मचारी को छुट्टी लेने से पहले सार्वजनिक ध्यान देना चाहिए और अनुरोध को कर्मचारी के मैनेजर या पर्यवेक्षक द्वारा मंजूर करना होगा।",
          leaveBalanceTitle: "छुट्टी शेष",
          leaveBalanceContent:
            "कर्मचारी को अपनी छुट्टी की शेषता का निर्धारण करने की जिम्मेदारी होती है, जो कंपनी के एचआर प्रणाली के माध्यम से उपलब्ध है। कंपनी कर्मचारियों को नियमित रूप से छुट्टी शेष विवरण प्रदान कर सकती है।",
          leaveCarryoverTitle:
            "छुट्टी ले जाने का हक",
          leaveCarryoverContent:
            "कर्मचारियों को कंपनी की नीति के अनुसार एक निश्चित मात्रा की वार्षिक छुट्टी को आगामी साल में ले जाने का हक है। हालांकि, अप्रयुक्त बीमार छुट्टी को आगामी साल में ले जाना नहीं है।",
          terminationTitle: "नियोक्ता समाप्ति",
          terminationContent:
            "कर्मचारी जो नौकरी छोड़ते हैं या नियोक्ता द्वारा समाप्त किए जाते हैं, उन्हें अक्ख्र लेकिन अप्रयुक्त वार्षिक छुट्टी के लिए भुगतान का अधिकार होता है। हालांकि, बीमार छुट्टी को नौकरी समाप्ति पर भुगतान नहीं किया जाता है।",
          amendmentsTitle:
            "छुट्टी नीति में संशोधन",
          amendmentsContent:
            "कंपनी को छुट्टी नीति में किसी भी समय संशोधन करने का अधिकार है। कर्मचारियों को नीति में किसी भी परिवर्तन की सूचना लिखित रूप में दी जाएगी, और संशोधित नीति को सभी कर्मचारियों के लिए उपलब्ध कराया जाएगा।",
          January: "जनवरी",
          February: "फ़रवरी",
          March: "मार्च",
          April: "अप्रैल",
          May: "मई",
          June: "जून",
          July: "जुलाई",
          August: "अगस्त",
          September: "सितंबर",
          October: "अक्टूबर",
          November: "नवंबर",
          December: "दिसंबर",
          leaveTypesTitle: "छुट्टियाँ प्रकार",
          noHistoryMessage:
            "कोई इतिहास नहीं रहा है।",
          attachmentLabel: "अनुलग्नक:",
          Jan: "जनवरी",
          Feb: "फरवरी",
          Mar: "मार्च",
          Apr: "अप्रैल",
          May: "मई",
          June: "जून",
          July: "जुलाई",
          Aug: "अगस्त",
          Sept: "सितंबर",
          Oct: "अक्टूबर",
          Nov: "नवंबर",
          Dec: "दिसंबर",
          Months: "महीने",
          hrsPerWeek: "घंटे / सप्ताह",
          payslipForTheMonth:
            "महीने के लिए पे स्लिप",
          employeeSummary: "कर्मचारी सारांश",
          name: "नाम",
          designation: "पद",
          joiningDate: "शामिल होने की तारीख",
          payPeriod: "वेतन अवधि",
          payDate: "वेतन दिनांक",
          bankName: "बैंक का नाम",
          accountNo: "खाता संख्या",
          panCard: "पैन कार्ड",
          employeeNetPay: "कर्मचारी कुल वेतन",
          paidDays: "भुगतानित दिन",
          lopDays: "अनुपस्थिति दिन",
          lopCost: "अनुपस्थिति मूल्य",
          earning: "कमाई",
          amount: "राशि",
          basicSalary: "मूल वेतन",
          overtime: "अधिककारिता",
          deduction: "कटौती",
          incomeTax: "आयकर",
          insurance: "बीमा",
          professionalTax: "पेशेवर कर",
          grossEarning: "कुल कमाई",
          totalDeduction: "कुल कटौती",
          totalNetPayable: "कुल नेट देय",
          grossEarning: "कुल कमाई",
          totalDeduction: "कुल कटौती",
          generate: "जनरेट करें",
          cancel: "रद्द करें",
          amountInWords: "शब्दों में राशि",
          apply: "लागू करें",
          selectLanguage: "भाषा चुनें",
          day: "दिन",
          month: "महिना",
          year: "वर्ष",
          hour: "घंटा",
          minute: "मिनट",
          ampm: "पूर्वाह्न/अपराह्न",
          viewPayslip: "पे स्लिप देखें",
          noRecordsFound:
            "चयनित वर्ष के लिए कोई रिकॉर्ड नहीं मिला।",
          selectLanguageText:
            "अपना पूर्ण भाषा संबंध खोजें, जो आपके लिए सबसे अनुकूल है।",
          time1: "9:28 पूर्वाह्न ",
          time2: "9:33 बजे",
          time3: "7:07 मिनिट",
          locale: "hi-IN",
          holidayDate: "{{date}} को",
          holidays: "छुट्टियाँ",
          showAll: "सभी दिखाएँ",
          TotalWorkedHours: "कुल काम के घंटे",
          Mon: "सोमवार",
          Tue: "मंगलवार",
          Wed: "बुधवार",
          Thu: "गुरुवार",
          Fri: "शुक्रवार",
          Days: "दिन",
          WorkedHours: "काम के घंटे",
          Hours: "घंटे",
          companyname: "अवकाश",
          address: "सुप्रीम हेडक्वार्टर्स, पुणे",
          Feedback: "प्रतिक्रिया",
          YourFeedback: "आपकी प्रतिक्रिया",
          EnterFeedback:
            "अपनी प्रतिक्रिया दर्ज करें...",
          SubmitFeedback: "प्रतिक्रिया भेजें",
          Cancel: "रद्द करें",
          PleaseEnterAtLeast10Chars:
            "कृपया कम से कम 10 अक्षर दर्ज करें",
          PleaseEnterLessThan100Chars:
            "कृपया 100 अक्षर से कम दर्ज करें",
          ThankYou: "धन्यवाद",
          FeedbackSubmittedSuccessfully:
            "प्रतिक्रिया सफलतापूर्वक भेजी गई!",
          Mandatory: "अनिवार्य",
          Optional: "ऐच्छिक",
          Suggested: "सुझावित",
          Previous: "पिछला",
          Next: "आगामी",
          RemainingOnLeave: "बाकी छुट्टी पर है",
          NameLabel: "नाम:",
          EmailLabel: "ईमेल:",
          ReasonLabel: "कारण:",
          ViewDetails: "विवरण देखें",
          Filter: "फ़िल्टर",
          Years: "साल",
          leaveHistory: "छुट्टियाँ इतिहास",
          status: "स्थिती",
          details: "विवरण",
          seeMore: "अधिक देखें",
          leaveDetailsTitle: "छुट्टी का विवरण",
          viewLeaveDetails:
            "अपना छुट्टी का विवरण देखें।",
          startDate: "प्रारंभ तिथि",
          endDate: "समाप्ति तिथि",
          leaveType: "छुट्टियाँ प्रकार",
          description: "विवरण",
          notMentioned: "उल्लिखित नहीं",
          attachment: "संलग्नक",
          accepted: "स्वीकृत",
          pending: "विचाराधीन",
          inReview: "समीक्षा में",
          rejected: "अस्वीकृत",
          date: "तारीख",
          otherLeaves: "अन्य छुट्टियां",
          viewDetails: "विवरण देखें",
          notMentioned: "उल्लिखित नहीं",
          notAttached: "संलग्न नहीं",
          viewPDF: "पीडीएफ देखें",
          previous: "पिछला",
          from: "से",
          to: "तक",
          specification: "विशेषता",
          next: "अगला",
          alert: "अलर्ट!",
          noPayslipInformation:
            "वर्तमान में कोई वेतन पर्चा जानकारी नहीं है",
          noNotificationsToShow:
            "कोई सूचनाएं दिखाने के लिए नहीं",
          lowLeaveBalance:
            "आपके छुट्टियाँ शेष बहुत कम हैं!",
          NegativeLeaveBalance:
            "आपके छुट्टियाँ की शेष नकारात्मक है!",
          MarkAllAsRead:
            "सभी को पढ़ा हुआ चिह्नित करें",
          Unread: "अपठित",
          Read: "पढ़ा हुआ",
          allNotificationsRead:
            "सभी सूचनाएं पढ़ी हुई चिह्नित की गईं",
          errorMarkingNotifications:
            "सूचनाओं को पढ़ा हुआ चिह्नित करने में त्रुटि",
          feedbackReplies: "प्रतिक्रिया उत्तर",
          "You have already applied for leave on same day":
            "आपने पहले ही उसी दिन के लिए छुट्टी के लिए आवेदन किया है।",
          "Your leave request for {{leaveType}} is accepted":
            "आपका {{leaveType}} के लिए अवकाश अनुरोध स्वीकृत हो गया है",
          "Your leave request for {{leaveType}} is rejected":
            "आपका {{leaveType}} के लिए अवकाश अनुरोध अस्वीकृत कर दिया गया है",
          "You have received a reply to your feedback: {{reply}}":
            "आपको आपकी प्रतिक्रिया का उत्तर प्राप्त हुआ है: {{reply}}",
          "Your leave request for {{leaveType}} is {{status}}":
            "{{leaveType}} के लिए आपका अवकाश अनुरोध {{status}} है",
          "Leave request status updated successfully":
            "छुट्टी अनुरोध की स्थिति सफलतापूर्वक अपडेट की गई",
          "Leave request submitted Successfully":
            "छुट्टी का अनुरोध सफलतापूर्वक जमा किया गया।",
          holidaySummaries: {
            "Holika Dahana": "होलिका दहन",
            Dolyatra: "दोलयात्रा",
            Holi: "होली",
            "Good Friday": "गुड फ्राइडे",
            "Easter Day": "ईस्टर डे",
            Ugadi: "उगादी",
            "Jamat Ul-Vida": "जमात उल-विदा",
            "Chaitra Sukhladi": "चैत्र सुख़लड़ी",
            "Gudi Padwa": "गुढी पाडवा",
            "Ramzan Id/Eid-ul-Fitar":
              "रमज़ान ईद/ईद-उल-फ़ितर",
            Vaisakhi: "वैसाखी",
            "Mesadi / Vaisakhadi":
              "मेसाडी / वैसाखादी",
            "Ambedkar Jayanti": "अंबेडकर जयंती",
            "Rama Navami": "राम नवमी",
            "Mahavir Jayanti": "महावीर जयंती",
            "Birthday of Rabindranath":
              "रवींद्रनाथ का जन्मदिन",
            "Buddha Purnima/Vesak":
              "बुद्ध पूर्णिमा/वेसाक",
            "Bakrid/Eid ul-Adha":
              "बकरीद/ईद-उल-अज़हा",
            "Rath Yatra": "रथ यात्रा",
            "Muharram/Ashura": "मुहर्रम/अशुरा",
            "Parsi New Year": "पारसी नववर्ष",
            "Independence Day": "स्वतंत्रता दिवस",
            "Raksha Bandhan (Rakhi)":
              "रक्षाबंधन (राखी)",
            "Janmashtami (Smarta)":
              "जन्माष्टमी (स्मार्टा)",
            Janmashtami: "जन्माष्टमी",
            "Ganesh Chaturthi/Vinayaka Chaturthi":
              "गणेश चतुर्थी/विनायक चतुर्थी",
            Onam: "ओणम",
            "Milad un-Nabi/Id-e-Milad":
              "मीलाद-उन-नबी/ईद-ए-मिलाद",
            "Mahatma Gandhi Jayanti":
              "महात्मा गांधी जयंती",
            "First Day of Sharad Navratri":
              "शरद नवरात्रि का पहला दिन",
            "First Day of Durga Puja Festivities":
              "दुर्गा पूजा की धूमधाम",
            "Maha Saptami": "महा सप्तमी",
            "Maha Ashtami": "महा अष्टमी",
            "Maha Navami": "महा नवमी",
            Dussehra: "दशहरा",
            "Maharishi Valmiki Jayanti":
              "महर्षि वाल्मीकि जयंती",
            "Karaka Chaturthi (Karva Chauth)":
              "करवा चौथ",
            "Naraka Chaturdasi": "नरक चतुर्दशी",
            "Diwali/Deepavali": "दीपावली",
            "Govardhan Puja": "गोवर्धन पूजा",
            "Bhai Duj": "भाई दूज",
            "Chhat Puja (Pratihar Sashthi/Surya Sashthi)":
              "छठ पूजा",
            "Guru Nanak Jayanti":
              "गुरु नानक जयंती",
            "Guru Tegh Bahadur's Martyrdom Day":
              "गुरु तेग बहादुर शहादत दिवस",
            "Christmas Eve": "क्रिसमस ईव",
            "Jamat Ul-Vida (tentative)":
              "जमात उल-विदा (अनुमानित)",
            "Id-ul-Fitr": "ईद-उल-फितर",
            "Bahag Bihu/Vaisakhadi":
              "बाहाग बिहू / वैसाखी",
            "May Day/Maharashtra Day":
              "मई दिवस / महाराष्ट्र दिवस",
            "Bakrid (tentative)":
              "बकरीद (अनुमानित)",
            Dussehra: "दशहरा",
            "Muharram/Ashura (tentative)":
              "मुहर्रम / अशूरा (अनुमानित)",
            "Ganesh Chaturthi": "गणेश चतुर्थी",
            "Gandhi Jayanti": "गांधी जयंती",
            "Independence Day": "स्वतंत्रता दिवस",
            "Gandhi Jayanti": "गांधी जयंती",
            Dussehra: "दशहरा",
            "Diwali (Laxmi Pujan)":
              "दिवाली (लक्ष्मी पूजन)",
            "Diwali (Balipratipada)":
              "दिवाली (बलीप्रतिप्रदा)",
            Christmas: "क्रिसमस",
            welcomeMessage:
              "स्वागत है, {{fullName}}",
          },
        },
      },

      mr: {
        translation: {
          Startdate: "प्रारंभ तारीख:",
          Enddate: "शेवटची तारीख:",
          timesheet: "टाईमशीट",
          thisWeek: "ह्या आठवड्यात",
          lastWeek: "मागील आठवडा",
          overAll: "सर्व",
          week: "आठवडा",
          noData: "कोणतेही डेटा उपलब्ध नाही",
          inTime: "वेळेमध्ये",
          startbreak: "ब्रेक सुरू करा",
          averageWorkingHours:
            "सरासरी काम करण्याचा वेळ",
          breakTime: "ब्रेक टाइम",
          endBreak: "ब्रेक संपला",
          UserInfo: "वापरकर्ता माहिती",
          Name: "नाव",
          Email: "ईमेल",
          Gender: "लिंग",
          Male: "पुरुष",
          Female: "स्त्री",
          Countrycode: "देशाचं कोड",
          ContactNumber: "संपर्क क्रमांक",
          PANnumber: "पॅन क्रमांक",
          BankName: "बँकचं नाव",
          Designation: "पदनाम",
          Accountnumber: "खातेचा क्रमांक",
          Department: "विभाग",
          DateofJoining: "सामील होण्याची तारीख",
          DateofBirth: "जन्म तारीख",
          Role: "भूमिका",
          Submit: "सबमिट",
          Date: "तारीख",
          FirstHalf: "पहिली भाग",
          SecondHalf: "दुसरी भाग",
          FullLeave: "पूर्ण सुट्टी",
          Other: "इतर",
          endBreakDescription:
            "ब्रेक संपल्यासाठी खालील बटणावर क्लिक करा.",
          checkOut: "बाहेर पडा",
          Checkoutsuccessfully:
            "चेक-आउट यशस्वीरित्या झाले!",
          CheckOutTime: "चेक आउट वेळ ",
          checkOutDescription:
            "बाहेर पडण्यासाठी खालील बटणावर क्लिक करा.",
          cancel: "रद्द करा",
          DesktopNotification: "डेस्कटॉप सूचना",
          ClickheretoOnOffDesktopNotification:
            "डेस्कटॉप सूचना चालू/बंद करण्यासाठी येथे क्लिक करा",
          EmailNotification: "ईमेल सूचना",
          UpdateYourProfile:
            "तुमची प्रोफाइल अपडेट करा",
          UpdateProfile: "प्रोफाइल अपडेट करा",
          EditProfile: "प्रोफाईल संपादित करा",
          ClickheretoOnOffEmailNotification:
            "ईमेल सूचना चालू/बंद करण्यासाठी येथे क्लिक करा",
          noPayslipInformation:
            "वर्तमानत: कोणतेही वेतन माहिती नाही",
          leaveBalance: "सुट्टी शिल्लक",
          totalLeaves: "एकूण सुट्टी ",
          leavesTaken: "सुट्टी घेतले",
          leavesRemaining: "सुट्टी  शिल्लक",
          showOnlyRead: "केवळ वाचलेले दाखवा",
          showOnlyUnread:
            "केवळ वाचलेले नाही दाखवा",
          leaveTypes: "सुट्टी प्रकार",
          contactUsTitle: "संपर्क साधा",
          contactUsContent:
            "आवडत असल्यास, कृपया आमच्या समर्थन टीमला संपर्क साधा.",
          supportEmailLabel: "ईमेल:",
          supportEmail: "support@avkash.com",
          supportPhoneLabel: "फोन:",
          supportPhone: "xxx-xxx-xxxx",
          leaveRequestTitle:
            "सुट्टी  विनंती प्रक्रिया",
          noOneIsOnLeave:
            "आज कोणीही सुट्टीवर नाही.",
          leaveRequestContent:
            "सुट्टी विनंती कशी सबमिट करायची हे एक पायाभर गाईड.",
          complianceTitle:
            "अनुपालन आणि कायद्यांची माहिती",
          complianceContent:
            "कंपनीच्या नीतींच्या आणि कायद्यांच्या अनुपालनासाठी, कृपया खालील माहितीचे समीक्षण करा:",
          feedbackTitle: "प्रतिक्रिया",
          feedbackContent:
            "आपल्या प्रतिक्रियेला मूल्यांकन करतो! कृपया आम्हाला सांगा की आम्ही आमची सेवा कसे बेहतर करू शकतो.",
          submitFeedback: "प्रतिक्रिया सबमिट करा",
          upcomingHolidaysTitle: "आगामी सुट्टी",
          noHolidaysMessage:
            "तुमच्यासाठी कोणतेही सुट्टी नाहीत",
          loadingMessage: "सुट्टी लोड होत आहेत..",
          dashboard: "डॅशबोर्ड",
          leaveRequests: "विनंती नोंदवली",
          members: "सदस्य",
          applyLeave: "सुट्टी द्या",
          payslip: "पे स्लिप",
          settings: "सेटिंग्स",
          notification: "सूचना",
          otherLeaves: "इतर रजा",
          viewDetails: "विवरण पहा",
          helpSupport: "सहाय्यता आणि समर्थन",
          avkash: "अवकाश",
          totalWorkedHours: "कुल काम केलेले तास",
          daysDescription: "दिवस",
          days: "दिवस",
          workedHours: "काम केलेले तास",
          workedHoursLabel: "काम केलेले तास",
          total: "कुल",
          leaves: "सुट्टी ",
          noNotifications:
            "वर्तमानत: कोणतेही सूचना नाहीत।",
          clearAll: "सर्व काढा",
          leaveChart: "सुट्टी  चार्ट",
          remainingLeaves: "शिल्लक सुट्टी ",
          takenLeaves: "घेतलेले सुट्टी ",
          dashboard: "डॅशबोर्ड",
          leaveRequests: "सुट्टी  विनंती",
          members: "सदस्य",
          applyLeave: "सुट्टी अर्ज",
          payslips: "पे स्लिप्स",
          settings: "सेटिंग्ज",
          notifications: "सूचना",
          helpSupport: "मदत आणि समर्थन",
          Onabreak: "ब्रेक वर",
          noNotificationsToShow:
            "दाखविण्यासाठी कोणत्याही सूचना नाहीत",
          onLeave: "सुट्टीवर",
          NoOneisOnLeaveforToday:
            "आज कोणीही रजेवर नाही!",
          Totalworkedhoursstoredsuccessfully:
            "एकूण कामाचे तास यशस्वीरित्या संग्रहित केले!",
          FailedtostoretotalworkedhoursPleasetryagainlater:
            "कामाचे एकूण तास संचयित करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
          FailedtocheckinPleasetryagainlater:
            "चेक इन करण्यात अयशस्वी. कृपया नंतर पुन्हा प्रयत्न करा.",
          FailedtoupdatebreaktimePleasetryagainlater:
            "ब्रेकची वेळ अपडेट करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
          FailedtocheckoutPleasetryagainlater:
            "चेक आउट करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
          YouredoinggreatClickbelowtocheckoutandrecordyourprogress:
            "तुम्ही छान करत आहात! तपासण्यासाठी आणि तुमची प्रगती रेकॉर्ड करण्यासाठी खाली क्लिक करा",
          WelcomeClickbelowtocheckinandstartyourproductiveday:
            "स्वागत आहे! चेक इन करण्यासाठी आणि तुमचा उत्पादक दिवस सुरू करण्यासाठी खाली क्लिक करा",
          TakechargeandresumeyourtasksbyclickingthebuttonbelowtoEndtheBreak:
            "ब्रेक समाप्त करण्यासाठी खालील बटणावर क्लिक करून जबाबदारी घ्या आणि तुमची कार्ये पुन्हा सुरू करा.",
          ClickbelowtoStartaRefreshingBreakandboostyourproductivity:
            "ब्रेक सुरू करण्यासाठी आणि तुमची उत्पादकता वाढवण्यासाठी खाली क्लिक करा.",
          BreakTimeSavedSuccessfully:
            "ब्रेकची वेळ यशस्वीरित्या जतन केली",
          Checkinsuccessfully:
            "चेक-इन यशस्वीरित्या झाले !",
          CheckIn: "चेक इन करा",
          checkOut: "चेक आउट करा",
          showMore: "अधिक दर्शवा",
          monday: "सोम",
          tuesday: "मंगळ",
          wednesday: "बुध",
          thursday: "गुरु",
          friday: "शुक्र",
          familyEmergency: "कुटुंबीय आपत्ती",
          personalVacation: "वैयक्तिक विश्राम",
          medicalLeave: "वैद्यकीय सुट्टी ",
          examLeaves: "परीक्षा सुट्टी ",
          familyFunction: "कुटुंब सामारंभ",
          casualLeave: "साधारण सुट्टी ",
          leaveHistoryTitle: "सुट्टी  इतिहास",
          srNo: "सीरियल नंबर",
          month: "महिना",
          grossSalary: "कुल वेतन",
          netPay: "नेट पे",
          notification1:
            "आपली रजा अनुमती दिली गेली आहे",
          notification2: "सूचना २",
          notification3:
            "आपली रजा अनुमती दिली गेली आहे",
          notification4: "सूचना २",
          notification5:
            "आपली रजा अनुमती दिली गेली आहे",
          notification6: "सूचना २",
          notification7:
            "आपली रजा अनुमती दिली गेली आहे",
          notification8: "सूचना २",
          notification9:
            "आपली रजा अनुमती दिली गेली आहे",
          notification10: "सूचना २",
          languagePreferenceTitle:
            "भाषा प्राधान्य",
          RecentTransactions:
            "अलिकडीन झालेले व्यवहार",
          english: "इंग्रजी",
          hindi: "हिंदी",
          marathi: "मराठी",
          sampleSettingsTitle: "नमूना सेटिंग्स",
          sampleSettingsText:
            "आपल्याला येथे सेटिंग्स विकल्प लवकर जोडणार आहोत",
          Feedback: "तुमचा प्रतिसाद:",
          submitFeedbackButton:
            "प्रतिक्रिया सबमिट करा",
          cancelButton: "रद्द करा",
          feedbackPlaceholder:
            "आपल्या प्रतिसाद टाका...",
          searchPlaceholder: "येथे शोधा",
          notificationsHeader: "सूचना",
          applyForLeaveButton: "सुट्टी  अर्ज करा",
          leaveApplicationText: "विराम अर्ज",
          leaveTypeLabel: "सुट्टी  प्रकार",
          startDateLabel: "सुरूवाती तारीख",
          from: "पासून",
          to: "ते",
          specification: "विशेषता",
          startDateErrorMessage:
            "कृपया सुरूवाती तारीख प्रविष्ट करा",
          endDateLabel: "समाप्ती तारीख",
          descriptionLabel: "वर्णन:",
          SrNo: "क्रमांक",
          Months: "महिने",
          ViewDetails: "विवरण पहा",
          GrossSalary: "कुल वेतन",
          NetPay: "नेट पे",
          SlipDetails: "पर्चीचे तपशील",
          backButton: "परत",
          leaveRequestSystemTitle:
            "सुट्टी विनंती प्रणाली",
          submitLeaveRequestTitle:
            "सुट्टी  विनंती कसे करावी:",
          loginInstructions:
            "अवकाश पोर्टलवर आपले कर्मचारी खाते लॉगिन करा।",
          navigateInstructions:
            'सुट्टी विनंती" विभाग किंवा पृष्ठावर प्रवेश करा।',
          clickInstructions:
            '"सबमिट सुट्टी विनंती" बटण किंवा लिंकवर क्लिक करा।',
          fillOutFormInstructions:
            "आवश्यक माहितीसह सुट्टी विनंती फॉर्म भरा:",
          selectLeaveTypeInstruction:
            "सुट्टी प्रकार निवडा (उदा., वार्षिक सुट्टी , आजीविका सुट्टी , इत्यादी)।",
          chooseDatesInstruction:
            "तुमच्या सुट्टीची सुरवात आणि समाप्ती तारखा निवडा।",
          provideReasonInstruction:
            "तुमच्या सुट्टीसाठी कारण प्रदान करा।",
          attachDocumentsInstruction:
            "पर्यायीपणा, आवश्यक आधारस्थ दस्तऐवज अटॅच करा।",
          reviewInfoInstruction:
            "तुम्ही प्रविष्ट केलेली माहिती समीक्षा करा आणि सुनिश्चित करा की ती अचूक आहे।",
          submitRequestInstruction:
            '"सबमिट" बटणावर क्लिक करून तुमचा सुट्टी विनंती सबमिट करा।',
          waitApprovalInstruction:
            "तुमच्या व्यवस्थापक किंवा एचआर विभागातून मंजुरीसाठी वाट पाहा।",
          receiveNotificationInstruction:
            "एकदा मंजूर केले की, तुम्हाला आपल्या सुट्टी विनंतीची पुष्टी करणारी एक सूचना मिळेल.",
          importantNotesTitle:
            "महत्वाच्या टिप्पण्या:",
          submitInAdvanceNote:
            "प्रक्रियेसाठी काही वेळ पाठविण्यास सुरक्षित असल्यासाठी आपली सुट्टी  विनंती अग्रगामीच सबमिट करण्यात सावधानी घ्या।",
          beHonestNote:
            "तुमच्या सुट्टीसाठी कारण प्रदान करताना पारदर्शी आणि ईमानदार रहा.",
          trackBalanceNote:
            "तुमच्या सुट्टीची शिल्लक टाळण्यासाठी आपली छुट्टी शिल्लक पहा आणि पर्याप्त दिवस उपलब्ध आहेत याची खात्री करा।",
          urgentRequestsNote:
            "कोणत्याही तत्काल सुट्टीच्या विनंती किंवा विशेष परिस्थितींसाठी, आपल्या व्यवस्थापकाशी सीध्या संपर्क साधा।",
          backButton: "मागे",
          leavePoliciesTitle: "सुट्टी धोरण",
          purposeTitle: "उद्देश",
          purposeContent:
            "छुट्टी धोरणेचा उद्दिष्ट कर्मचारींना छुट्टीचा वापर करण्यासाठी मार्गदर्शन प्रदान करणे आहे, ज्यामुळे कर्मचारींना स्वतःच्या हक्कांची आणि कर्तव्यांची जागरूकता ठेवली जाऊ शकेल, आणि छुट्टी धोरणांच्या लागूकरणात निष्पक्षता आणि सुसंगतता वाढविण्यासाठी।",
          eligibilityTitle: "पात्रता",
          eligibilityContent:
            "कंपनीच्या धोरणानुसार सर्व कर्मचारी छुट्टीसाठी पात्र आहेत। पात्रता मानकंपनीने निर्धारित केलेले आहेत, ज्या रोजगाराच्या प्रकारांवर आणि सेवेच्या कालावधीवर आधारित आहेत।",
          typesOfLeaveTitle: "सुट्टीचे प्रकार",
          annualLeaveTitle: "वार्षिक सुट्टी",
          annualLeaveContent:
            "वार्षिक सुट्टी कर्मचारीला आवड आणि वैयक्तिक कारणांसाठी प्रदान केली जाते. कर्मचारीची सुट्टी पर्याय केलेल्या आभार पत्रांवर आणि सेवेच्या कालावधीवर आधारित आहे।",
          sickLeaveTitle: "आजारी सुट्टी",
          sickLeaveContent:
            "आजारी सुट्टी केवळ त्या कर्मचार्यांना प्रदान केली जाते ज्यांनी आजारी किंवा ठोक खाली कामास्थळावर जाण्याची संधी नाही. कर्मचारीची आजारी सुट्टीची सुट्टी पत्रे आणि सेवेच्या कालावधीवर आधारित आहेत।",
          maternityLeaveTitle: "मातृत्व सुट्टी",
          maternityLeaveContent:
            "मातृत्व सुट्टी गर्भवती महिला कर्मचार्यांना प्रदान केली जाते ज्या जन्मासाठी निर्धारित आहेत आणि जन्म देण्यासाठी तयार आहेत। कर्मचारीची मातृत्व सुट्टीची संख्या पत्रांवर आणि संबंधित विधिमार्गांवर आधारित आहेत।",
          paternityLeaveTitle: "पितृत्व सुट्टी",
          paternityLeaveContent:
            "पितृत्व छुट्टी पुरुष कर्मचार्यांना प्रदान केली जाते ज्यांच्या पत्नी किंवा संबंधित गर्भवती आहेत आणि जन्म देण्यासाठी तयार आहेत। कर्मचारीची पितृत्व सुट्टीची संख्या पत्रांवर आणि संबंधित विधिमार्गांवर आधारित आहेत।",
          bereavementLeaveTitle: "शोक छुट्टी",
          bereavementLeaveContent:
            "शोक छुट्टी त्या कर्मचार्यांना प्रदान केली जाते ज्यांच्याकडून कोणतीही कारणे आणि आपल्या दुःखाची स्थिती प्रभावित झाली असू शकतात। या सुट्टीमुळे त्यांना आणि त्यांच्या कुटुंबियांना अत्यंत गंभीर घटना सामोरे झाल्यामुळे आपल्या दुःखाची स्थिती शांत करण्यासाठी स्वतःच्या संघर्षांचा समय मिळतो.",

          leaveWithoutPayTitle:
            "वेतन न देणे सुट्टी",
          leaveWithoutPayContent:
            "जर कोणी कर्मचारीने अयोग्य किंवा कोणत्याही सुट्टीची शिल्प नसली तर त्यांना वेतन न देणे सुट्टीसाठी अर्ज करण्याची परवानगी आहे. अहवाल जमा करणारा व्यवस्थापक त्याला शेवटची मंजुरीसाठी एचआरच्या मुख्याधिकारीला पाठवेल. महत्वाचे आहे की वेतन न देणे छुट्टीच्या दरम्यान छुट्टीच्या दिवसांची आणि साप्ताहिक सुट्टी चे दिन गणना न केल्यानंतर कर्मचारीला कोणतेही वेतन मिळणार नाही, आणि त्याला छुट्टीसाठी कोणतेही वेतन मिळणार नाही. कोणतेही वेतन न देणे छुट्टी जोवळील अंश निश्चित काळाकालापासून अधिक असतील ती सीईओसह मंजुरीला आवश्यक आहे.",
          applyingLeaveTitle:
            "सुट्टीसाठी अर्ज करणे",
          applyingLeaveContent:
            "कर्मचारीला कंपनीच्या छुट्टी अर्ज पत्राचा वापर करून सुट्टीसाठी अर्ज करायची आहे. कर्मचारीला सुट्टी घेण्यापूर्वी सार्वजनिक कामांचे ध्यान देता येणार आणि विधीनियमकांच्या विरुद्ध अर्ज करण्याची कर्मचारीची आवश्यकता आहे.",
          leaveBalanceTitle: "छुट्टीची शिल्प",
          leaveBalanceContent:
            "कर्मचारीला स्वतःच्या छुट्टीच्या शिल्पाचा निर्धारण करण्याची जबाबदारी आहे, जो कंपनीच्या एचआर प्रणालीत उपलब्ध आहे. कंपनी कर्मचारिंना नियमितपणे सुट्टीच्या शिल्प तपशील प्रदान करू शकते.",
          leaveCarryoverTitle:
            "छुट्टी घेण्याचा हक्क",
          leaveCarryoverContent:
            "कर्मचारीला कंपनीच्या नीतीनुसार एक निश्चित मात्रा वार्षिक सुट्टी आगामी वर्षात घेण्याचा हक्क आहे. हालाकी, वापर न होणारी बीमार छुट्टी आगामी वर्षात घेण्यात येणार नाही.",
          terminationTitle: "नोकरी समाप्ती",
          terminationContent:
            "कर्मचारी ज्यानं नोकरी सोडणार किंवा नियोक्ता द्वारे समाप्त केले जाते, त्यांना विधीनियमकांनुसार बचत आणि वार्षिक छुट्टीसाठी पैसे मिळावण्याची हक्की असते. हालाकी, वापर न होणारी बीमार छुट्टी समाप्तीवेळी पैसे मिळणार नाहीत.",
          amendmentsTitle:
            "छुट्टी धोरणेमध्ये संशोधन",
          amendmentsContent:
            "कंपनीला कितीही काळानंतर छुट्टी धोरणांमध्ये संशोधन करण्याचा अधिकार आहे. कर्मचार्यांना धोरणांमध्ये काहीही बदल करण्याची सूचना लेखित रुपात दिली जाईल, आणि संशोधित धोरण कर्मचार्यांसाठी उपलब्ध करण्यात येईल.",
          January: "जानेवारी",
          February: "फेब्रुवारी",
          March: "मार्च",
          April: "एप्रिल",
          May: "मे",
          June: "जून",
          July: "जुलै",
          August: "ऑगस्ट",
          September: "सप्टेंबर",
          October: "ऑक्टोबर",
          November: "नोव्हेंबर",
          December: "डिसेंबर",
          SoftwareDeveloper: "सॉफ्टवेअर डेव्हलपर",
          January2023: "जानेवारी 2023",
          BankOfIndia: "बँक ऑफ इंडिया",
          leaveTypesTitle: "सुट्टीचे प्रकार",
          noHistoryMessage:
            "आता कोणतेही इतिहास नाही.",
          attachmentLabel: "अटॅचमेंट:",
          Jan: "जानेवारी",
          Feb: "फेब्रुवारी",
          Mar: "मार्च",
          Apr: "एप्रिल",
          May: "मे",
          June: "जून",
          July: "जुलै",
          Aug: "ऑगस्ट",
          Sept: "सप्टेंबर",
          Oct: "ऑक्टोबर",
          Nov: "नोव्हेंबर",
          Dec: "डिसेंबर",
          Months: "महीने",
          hrsPerWeek: "तास / आठवडा",
          leavePolicies: "सुट्टी  नियमावली",
          payslipForTheMonth: "महिन्याची पेस्लिप",
          employeeSummary: "कर्मचारी सारांश",
          name: "नाव",
          designation: "पद",
          joiningDate: "सामील होण्याची तारीख",
          payPeriod: "वेतन अवधि",
          payDate: "वेतनाची तारीख",
          bankName: "बँकचं नाव",
          accountNo: "खाते क्रमांक",
          panCard: "पॅन कार्ड",
          employeeNetPay: "कर्मचारी नेट पे",
          paidDays: "देय दिवस",
          lopDays: "गैरहजर दिवस",
          lopCost: "गैरहाजिरीचा किंमत",
          earning: "कमाई",
          amount: "रक्कम",
          basicSalary: "मूळ पगार",
          overtime: "अधिककारिता",
          deduction: "काढा",
          incomeTax: "आयकर",
          insurance: "विमा",
          professionalTax: "पेशेवर कर",
          grossEarning: "कुल कमाई",
          totalDeduction: "कुल काढा",
          totalNetPayable: "कुल नेट देय",
          grossEarning: "कुल कमाई",
          totalDeduction: "कुल काढा",
          generate: "उत्पन्न करा",
          cancel: "रद्द करा",
          amountInWords: "शब्दात रक्कम",
          apply: "लागू करा",
          selectLanguage: "भाषा निवडा",
          viewPayslip: "पेस्लिप पहा",
          noRecordsFound:
            "निवडलेल्या वर्षासाठी कोणतेही रेकॉर्ड सापडले नाहीत.",
          selectLanguageText:
            "आपले पूर्ण भाषा स्वरूप शोधा, तो सर्वोत्तम आणि आपल्यास अनुकूल आहे.",
          time1: "9:28 पूर्वाह्न ",
          time2: "9:33  वाजता",
          time3: "7:07 मिनिट",
          locale: "mr-IN",
          holidayDate: "{{date}}",
          holidays: "सुट्ट्या",
          showAll: "सर्व दाखवा",
          TotalWorkedHours: "एकूण काम केलेले तास",
          today: "आज",
          yesterday: "काल",
          older: "जुना",
          Mon: "सोमवार",
          Tue: "मंगळवार",
          Wed: "बुधवार",
          Thu: "गुरुवार",
          Fri: "शुक्रवार",
          Days: "दिवस",
          WorkedHours: "काम केलेले तास",
          Hours: "तासे",
          companyname: "अवकाश",
          address: "सुप्रीम हेडक्वार्टर्स, पुणे",
          Feedback: "प्रतिसाद",
          YourFeedback: "तुमचा प्रतिसाद",
          EnterFeedback:
            "तुमचा प्रतिसाद प्रविष्ट करा...",
          SubmitFeedback: "प्रतिसाद सादर करा",
          Cancel: "रद्द करा",
          PleaseEnterAtLeast10Chars:
            "कृपया कमीत कमी 10 अक्षर प्रविष्ट करा",
          PleaseEnterLessThan100Chars:
            "कृपया 100 अक्षरांपेक्षा कमी प्रविष्ट करा",
          ThankYou: "धन्यवाद",
          FeedbackSubmittedSuccessfully:
            "प्रतिसाद सफळताने सादर केला!",
          Mandatory: "अनिवार्य",
          Optional: "पर्यायी",
          Suggested: "सुचवलेले",
          Previous: "मागील",
          Next: "पुढील",
          RemainingOnLeave: "शेष रजा आहे",
          NameLabel: "नाव:",
          EmailLabel: "ईमेल:",
          ReasonLabel: "कारण:",
          Filter: "फिल्टर",
          Years: "वर्ष",
          leaveHistory: "सुट्टी इतिहास",
          status: "स्थिती",
          details: "तपशील",
          seeMore: "अधिक पाहा",
          leaveDetailsTitle: "सुट्टी तपशील",
          viewLeaveDetails:
            "आपल्या सुट्टी तपशील पहा.",
          startDate: "सुरुवात तारीख",
          endDate: "समाप्ती तारीख",
          leaveType: "सुट्टीचा प्रकार",
          description: "तपशील",
          notMentioned: "उल्लेखित नाही",
          attachment: "संलग्नक",
          accepted: "स्वीकृत",
          pending: "प्रलंबित",
          inReview: "पुनरावलोकनात",
          rejected: "अस्वीकृत",
          date: "तारीख",
          notMentioned: "उल्लेख नाही",
          notAttached: "संलग्न नाही",
          viewPDF: "पीडीएफ पहा",
          previous: "मागील",
          next: "पुढचा",
          alert: "सतर्कता!",
          WFH: "घरीचा काम",
          lowLeaveBalance:
            "आपले विश्रांती शिल्लक खूप कमी आहे!",
          NegativeLeaveBalance:
            "आपली विश्रांतीची शिल्लक नकारात्मक आहे!",
          MarkAllAsRead:
            "सर्व वाचले म्हणून चिन्हांकित करा",
          Unread: "न वाचलेले",
          Read: "वाचलेले",
          allNotificationsRead:
            "सर्व सूचना वाचलेल्या म्हणून चिन्हांकित केल्या",
          errorMarkingNotifications:
            "सूचना वाचलेल्या म्हणून चिन्हांकित करताना त्रुटी",
          feedbackReplies:
            "प्रतिक्रिया प्रत्युत्तरे",
          "You have already applied for leave on same day":
            "तुम्ही आधीच त्याच दिवशी रजा साठी अर्ज केला आहे",
          "Your leave request for {{leaveType}} is accepted":
            "तुमची {{leaveType}} साठी रजा विनंती मंजूर झाली आहे",
          "Your leave request for {{leaveType}} is rejected":
            "तुमची {{leaveType}} साठी रजा विनंती नाकारली गेली आहे",
          "You have received a reply to your feedback: {{reply}}":
            "तुमच्या अभिप्रायाचा प्रतिसाद प्राप्त झाला आहे: {{reply}}",
          "Your leave request for {{leaveType}} is {{status}}":
            "तुमची {{leaveType}} साठीची रजा विनंती {{status}} आहे",
          "Leave request status updated successfully":
            "रजा विनंतीची स्थिती यशस्वीरीत्या अद्ययावत केली",
          "Leave request submitted Successfully":
            "सुट्टीसाठी विनंती यशस्वीरित्या सबमिट करण्यात आली",
          holidaySummaries: {
            "Holika Dahana": "होलिका दहन",
            Dolyatra: "दोलयात्रा",
            Holi: "होळी",
            "Good Friday": "गुड फ्राइडे",
            "Easter Day": "ईस्टर डे",
            "Jamat Ul-Vida": "जमात उल-विदा",
            Ugadi: "उगाडी",
            "Chaitra Sukhladi": "चैत्र सुखळदी",
            "Gudi Padwa": "गुढी पाडवा",
            "Ramzan Id/Eid-ul-Fitar":
              "रमजान ईद/ईद-उल-फितर",
            Vaisakhi: "वैसाखी",
            "Mesadi / Vaisakhadi":
              "मेसाडी / वैसाखादी",
            "Ambedkar Jayanti": "अंबेडकर जयंती",
            "Rama Navami": "राम नवमी",
            "Mahavir Jayanti": "महावीर जयंती",
            "Birthday of Rabindranath":
              "रवींद्रनाथचा वाढदिवस",
            "Buddha Purnima/Vesak":
              "बुद्ध पौर्णिमा/वेसाक",
            "Bakrid/Eid ul-Adha":
              "बकरीद/ईद-उल-अज़हा",
            "Rath Yatra": "रथ यात्रा",
            "Muharram/Ashura": "मुहर्रम/अशुरा",
            "Parsi New Year": "पारसी नववर्ष",
            "Independence Day": "स्वातंत्र्यदिन",
            "Raksha Bandhan (Rakhi)":
              "रक्षाबंधन (राखी)",
            "Janmashtami (Smarta)":
              "जन्माष्टमी (स्मार्टा)",
            Janmashtami: "जन्माष्टमी",
            "Ganesh Chaturthi/Vinayaka Chaturthi":
              "गणेश चतुर्थी/विनायक चतुर्थी",
            Onam: "ओणम",
            "Milad un-Nabi/Id-e-Milad":
              "मिलाद उन-नबी/ईद-ए-मिलाद",
            "Mahatma Gandhi Jayanti":
              "महात्मा गांधी जयंती",
            "First Day of Sharad Navratri":
              "शरद नवरात्रिचा पहिला दिवस",
            "First Day of Durga Puja Festivities":
              "दुर्गा पूजा साजरी",
            "Maha Saptami": "महा सप्तमी",
            "Maha Ashtami": "महा अष्टमी",
            "Maha Navami": "महा नवमी",
            Dussehra: "दसरा",
            "Maharishi Valmiki Jayanti":
              "महर्षी वाल्मीकी जयंती",
            "Karaka Chaturthi (Karva Chauth)":
              "करवा चौथ",
            "Naraka Chaturdasi": "नरक चतुर्दशी",
            "Diwali/Deepavali": "दिवाळी",
            "Govardhan Puja": "गोवर्धन पूजा",
            "Bhai Duj": "भाऊबीज",
            "Chhat Puja (Pratihar Sashthi/Surya Sashthi)":
              "छठ पूजा",
            "Guru Nanak Jayanti":
              "गुरु नानक जयंती",
            "Guru Tegh Bahadur's Martyrdom Day":
              "गुरु तेग बहादुर शहादत दिन",
            "Christmas Eve": "क्रिसमस ईव",
            "Jamat Ul-Vida (tentative)":
              "जमात उल-विदा (अनुमानित)",
            "Id-ul-Fitr": "ईद-उल-फितर",
            "Bahag Bihu/Vaisakhadi":
              "बाहाग बिहू / वैसाखी",
            "May Day/Maharashtra Day":
              " मे दिवस / महाराष्ट्र दिन",
            "Bakrid (tentative)":
              "बकरीद (अनुमानित)",
            "Muharram/Ashura (tentative)":
              "मुहर्रम / अशूरा (अनुमानित)",
            "Ganesh Chaturthi": "गणेश चतुर्थी",
            "Gandhi Jayanti": "गांधी जयंती",
            Dussehra: "दसरा",
            "Diwali (Laxmi Pujan)":
              "दिवाळी (लक्ष्मी पूजन)",
            "Diwali (Balipratipada)":
              "दिवाळी (बलीप्रतिप्रदा)",
            "Independence Day": "स्वातंत्र्य दिन",
            "Gandhi Jayanti": "गांधी जयंती",
            Dussehra: "दसरा",
            Christmas: "क्रिसमस",
            welcomeMessage:
              "स्वागत आहे, {{fullName}}!",
            TotalWorkedHours:
              "एकूण काम केलेले तास",
            Mon: "सोमवार",
            Tue: "मंगळवार",
            Wed: "बुधवार",
            Thu: "गुरुवार",
            Fri: "शुक्रवार",
            Days: "दिवस",
            WorkedHours: "काम केलेले तास",
            Hours: "तासे",
          },
        },
      },
    },
    detection: {
      order: [
        "querystring",
        "cookie",
        "localStorage",
        "navigator",
        "htmlTag",
        "path",
        "subdomain",
      ],
      caches: ["cookie"],
      excludeCacheFor: ["cimode"],
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
