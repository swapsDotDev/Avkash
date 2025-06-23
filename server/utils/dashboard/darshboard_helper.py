import calendar
import datetime


def calculate_working_days(year, month):
    if month == 1:
        previous_month = 12
        previous_year = year - 1
    else:
        previous_month = month - 1
        previous_year = year
    num_days = calendar.monthrange(previous_year, previous_month)[1]
    working_days = 0
    for day in range(1, num_days + 1):
        current_date = datetime.date(previous_year, previous_month, day)

        if current_date.weekday() < 5:
            working_days += 1

    return working_days
