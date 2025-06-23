import datetime


def get_latest_start_of_6_month_period(join_date_str):
    today = datetime.date.today()
    join_date = datetime.datetime.strptime(join_date_str, "%Y-%m-%d").date()

    if today.month <= 6:
        start_date = datetime.date(today.year, 1, 1)
    else:
        start_date = datetime.date(today.year, 7, 1)

    if start_date < join_date:
        start_date = join_date

    return start_date


def get_last_date_of_last_of_last_month():
    today = datetime.date.today()
    first_day_of_current_month = today.replace(day=1)
    last_day_of_last_month = first_day_of_current_month - datetime.timedelta(days=1)
    first_day_of_last_month = last_day_of_last_month.replace(day=1)
    last_day_of_last_of_last_month = first_day_of_last_month - datetime.timedelta(
        days=1
    )
    return last_day_of_last_of_last_month


def get_total_leaves_for_join_date(
    start_of_6month, payslip_before_date, leave_balance, leave_requests, user_id
):
    total_leave_span = 0
    for leave_request in leave_requests:
        start_date = datetime.datetime.strptime(
            leave_request["start_date"], "%Y-%m-%d"
        ).date()
        end_date = datetime.datetime.strptime(
            leave_request["end_date"], "%Y-%m-%d"
        ).date()
        if (
            start_date >= start_of_6month
            and end_date < payslip_before_date
            and leave_request["user_id"] == user_id
            and leave_request["status"] == "accepted"
        ):
            if (
                "span" in leave_request
                and leave_request["span"] is not None
                and isinstance(leave_request["span"], (int, float))
            ):
                total_leave_span += leave_request["span"]
    return leave_balance - total_leave_span


def get_leave_balance(start_date):
    today = datetime.date.today()
    if today.month <= 6:
        end_date = datetime.date(today.year, 6, 30)
    else:
        end_date = datetime.date(today.year, 12, 31)
    num_months = (
        (end_date.year - start_date.year) * 12 + end_date.month - start_date.month + 1
    )
    leave_balance = num_months * 1.5

    return leave_balance


def is_leave_for_today_or_tomorrow(start_date):
    if not start_date:
        return False, None

    start_dt = datetime.datetime.strptime(start_date, "%Y-%m-%d")
    today = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + datetime.timedelta(days=1)

    if start_dt == today:
        return True, "today"
    elif start_dt == tomorrow:
        return True, "tomorrow"
    return False, None


def should_auto_approve_leave(leave_request):

    leave_type = leave_request.get("leave_type", "").lower()
    span = float(leave_request.get("span", 0))
    leave_balance = float(leave_request.get("leave_available", 0))
    is_valid_date, date_info = is_leave_for_today_or_tomorrow(
        leave_request.get("start_date")
    )

    if leave_balance < span:
        return False, "Insufficient leave balance"

    if span > 2:
        return False, "Auto-approval only available for leaves up to 2 days"

    if not is_valid_date:
        return False, "Auto-approval only available for leaves on current or next day"

    auto_approval_rules = [
        {
            "condition": lambda: leave_type == "emergency leave"
            and span == 1
            and leave_balance >= span,
            "reason": lambda: f"for {date_info}",
        },
        {
            "condition": lambda: leave_type == "medical leave"
            and leave_balance >= span
            and span <= 2,
            "reason": lambda: f"for {date_info}",
        },
        {
            "condition": lambda: span == 0.5 and leave_balance >= span,
            "reason": lambda: f"for {date_info}",
        },
    ]

    for rule in auto_approval_rules:
        if rule["condition"]():
            return True, rule["reason"]()

    return False, "Manual approval required"
