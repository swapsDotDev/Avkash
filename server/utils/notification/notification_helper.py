import datetime


def create_reimbursement_notification(reimbursement, collection_name):
    try:
        status = reimbursement["status"]
        expenses = reimbursement.get("expenses", [])
        updated_expenses = [
            exp for exp in expenses if exp.get("status") in ["approved", "rejected"]
        ]
        total_expenses = len(expenses)
        reimbursement_id = reimbursement["reimbursement_id"]
        is_notified = reimbursement.get("is_notified", False)
        timestamp = (
            reimbursement.get("admin_update_timestamp")
            or reimbursement.get("created_at")
            or datetime.datetime.now().isoformat()
        )

        approved_count = sum(1 for exp in expenses if exp.get("status") == "approved")
        rejected_count = sum(1 for exp in expenses if exp.get("status") == "rejected")

        if (approved_count == total_expenses) or (rejected_count == total_expenses):
            notification_status = (
                "approved" if approved_count == total_expenses else "rejected"
            )
            expense_descriptions = []
            expense_dates = []
            for exp in expenses:
                if "description" in exp:
                    expense_descriptions.append(exp["description"])
                if "date" in exp:
                    expense_dates.append(exp["date"])

            if expense_descriptions and expense_dates:
                description = (
                    expense_descriptions[0]
                    if len(expense_descriptions) == 1
                    else "multiple expenses"
                )
                date = expense_dates[0] if len(expense_dates) == 1 else "various dates"
                message = f"Your reimbursement request for {description} on {date} has been {notification_status}."
            else:
                message = f"Your reimbursement request #{reimbursement_id} has been fully {notification_status}."

            notification = {
                "collectionName": collection_name,
                "_id": str(reimbursement["_id"]),
                "user_id": reimbursement["userId"],
                "type": "reimbursement",
                "timestamp": timestamp,
                "message": message,
                "is_notified": is_notified,
            }
            return notification

        if approved_count > 0 or rejected_count > 0:
            expense_categories = []
            expense_dates = []
            for exp in expenses:
                if "categories" in exp and exp["categories"]:
                    expense_categories.extend(exp["categories"])
                if "date" in exp:
                    expense_dates.append(exp["date"])

            category_str = "expenses"
            if expense_categories:
                from collections import Counter

                unique_categories = list(set(expense_categories))
                if len(unique_categories) <= 3:
                    category_str = ", ".join(unique_categories)
                else:
                    top_categories = Counter(expense_categories).most_common(2)
                    category_str = (
                        f"{top_categories[0][0]}, {top_categories[1][0]}, and others"
                    )

            date_str = "various dates"
            if expense_dates:
                if len(set(expense_dates)) == 1:
                    date_str = expense_dates[0]
                elif len(set(expense_dates)) <= 3:
                    sorted_dates = sorted(set(expense_dates))
                    date_str = ", ".join(sorted_dates)
                else:
                    sorted_dates = sorted(expense_dates)
                    date_str = f"{sorted_dates[0]} to {sorted_dates[-1]}"

            message = f"Your reimbursement request for {category_str} on {date_str} has {approved_count} approved and {rejected_count} rejected expenses out of {total_expenses} total."
            notification = {
                "collectionName": collection_name,
                "_id": str(reimbursement["_id"]),
                "user_id": reimbursement["userId"],
                "type": "reimbursement",
                "timestamp": timestamp,
                "message": message,
                "is_notified": is_notified,
            }
            return notification

        return None

    except Exception as e:
        return None
