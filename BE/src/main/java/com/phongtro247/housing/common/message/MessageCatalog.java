package com.phongtro247.housing.common.message;

public final class MessageCatalog {

    private MessageCatalog() {
    }

    public static final AppMessage ERR_VALIDATION_FAILED = new AppMessage("ERR-001", "Request validation failed");
    public static final AppMessage ERR_MALFORMED_REQUEST = new AppMessage("ERR-002", "Request body could not be parsed");
    public static final AppMessage ERR_INTERNAL = new AppMessage("ERR-003", "Unexpected server error");
    public static final AppMessage ERR_RESOURCE_NOT_FOUND = new AppMessage("ERR-004", "%s not found: %s");
    public static final AppMessage ERR_CONTACT_REQUIRED = new AppMessage("ERR-005", "Email or phone is required");
    public static final AppMessage ERR_EMAIL_EXISTS = new AppMessage("ERR-006", "Email already exists");
    public static final AppMessage ERR_PHONE_EXISTS = new AppMessage("ERR-007", "Phone already exists");
    public static final AppMessage ERR_ACCOUNT_NOT_FOUND = new AppMessage("ERR-008", "Account does not exist");
    public static final AppMessage ERR_ACCOUNT_BLOCKED = new AppMessage("ERR-009", "Account has been blocked");
    public static final AppMessage ERR_INVALID_PASSWORD = new AppMessage("ERR-010", "Password is incorrect");
    public static final AppMessage ERR_ALREADY_FAVORITED = new AppMessage("ERR-011", "Listing is already favorited");
    public static final AppMessage ERR_TENANT_REQUIRED = new AppMessage("ERR-012", "Tenant is required");
    public static final AppMessage ERR_LISTING_OWNER_REQUIRED = new AppMessage("ERR-013", "You do not own this listing");
    public static final AppMessage ERR_INVALID_CONTRACT_DATES = new AppMessage("ERR-014", "End date must be after start date");
    public static final AppMessage ERR_INCIDENT_ACCESS_DENIED = new AppMessage("ERR-015", "You cannot update this incident");
    public static final AppMessage ERR_REPORT_EXISTS = new AppMessage("ERR-016", "You already reported this listing");
    public static final AppMessage ERR_STATUS_REQUIRED = new AppMessage("ERR-017", "Report status is required");
    public static final AppMessage ERR_INVALID_LISTING_TYPE = new AppMessage("ERR-018", "Listing type does not exist");
    public static final AppMessage ERR_TOO_MANY_IMAGES = new AppMessage("ERR-019", "A listing can contain at most %s images");
    public static final AppMessage ERR_LISTING_NOT_HIDDEN = new AppMessage("ERR-020", "Only hidden listings can be shown");
    public static final AppMessage ERR_LISTING_NOT_PUBLISHED = new AppMessage("ERR-021", "Only published listings can be hidden");
    public static final AppMessage ERR_LISTING_MUST_BE_PUBLISHED = new AppMessage("ERR-022", "Listing must be published first");
    public static final AppMessage ERR_LISTING_ACCESS_DENIED = new AppMessage("ERR-023", "You do not own this listing");
    public static final AppMessage ERR_INVALID_LISTING_DATA = new AppMessage("ERR-024", "Name, price and area are required");
    public static final AppMessage ERR_INVALID_JSON_FIELD = new AppMessage("ERR-025", "Amenities and surroundings must be JSON arrays");
    public static final AppMessage ERR_LISTING_ATTRIBUTES_SERIALIZATION = new AppMessage("ERR-026", "Listing attributes could not be serialized");
    public static final AppMessage ERR_OWNER_REQUIRED = new AppMessage("ERR-027", "Owner is required");
    public static final AppMessage ERR_TENANT_EXISTS = new AppMessage("ERR-028", "Tenant already exists in your list");
    public static final AppMessage ERR_HOT_REQUEST_EXISTS = new AppMessage("ERR-029", "A hot listing request is already pending");
    public static final AppMessage ERR_LISTING_ALREADY_HOT = new AppMessage("ERR-030", "Listing is already hot");
    public static final AppMessage ERR_VIDEO_URL_REQUIRED = new AppMessage("ERR-031", "Video URL is required");
    public static final AppMessage ERR_INSUFFICIENT_BALANCE = new AppMessage("ERR-032", "User balance is not enough");
    public static final AppMessage ERR_REQUEST_ALREADY_PROCESSED = new AppMessage("ERR-033", "Request has already been processed");
    public static final AppMessage ERR_VIDEO_REQUEST_EXISTS = new AppMessage("ERR-034", "A video request is already pending");
    public static final AppMessage ERR_OWNER_REVIEW_FORBIDDEN = new AppMessage("ERR-035", "You cannot review your own listing");
    public static final AppMessage ERR_REVIEW_EXISTS = new AppMessage("ERR-036", "You have already reviewed this listing");
    public static final AppMessage ERR_REVIEW_DELETE_FORBIDDEN = new AppMessage("ERR-037", "You cannot delete this review");
    public static final AppMessage ERR_USER_NOT_FOUND = new AppMessage("ERR-038", "User not found");
    public static final AppMessage ERR_MOMO_ORDER_FAILED = new AppMessage("ERR-039", "Could not create MoMo order");
    public static final AppMessage ERR_INVALID_SIGNATURE = new AppMessage("ERR-040", "Invalid signature");
    public static final AppMessage ERR_INVALID_PAYMENT_METADATA = new AppMessage("ERR-041", "Invalid MoMo metadata");
    public static final AppMessage ERR_MOMO_NOT_CONFIGURED = new AppMessage("ERR-042", "MoMo payment is not configured for this environment");
    public static final AppMessage ERR_UPLOAD_EMPTY = new AppMessage("ERR-043", "Uploaded file is empty");
    public static final AppMessage ERR_INVALID_UPLOAD_PATH = new AppMessage("ERR-044", "Invalid upload path");
    public static final AppMessage ERR_UPLOAD_FAILED = new AppMessage("ERR-045", "Could not store uploaded file");
    public static final AppMessage ERR_JWT_SECRET_TOO_SHORT = new AppMessage("ERR-046", "JWT secret must contain at least 32 bytes");
    public static final AppMessage ERR_PAYMENT_FAILED = new AppMessage("ERR-047", "Payment failed");
    public static final AppMessage ERR_PAYMENT_METADATA_ENCODING = new AppMessage("ERR-048", "Could not encode payment metadata");
    public static final AppMessage ERR_PAYMENT_SIGNING_FAILED = new AppMessage("ERR-049", "Could not sign MoMo request");

    public static final AppMessage SUC_REGISTRATION = new AppMessage("SUC-001", "Registration successful");
    public static final AppMessage SUC_USER_UPDATED = new AppMessage("SUC-002", "User information updated successfully");
    public static final AppMessage SUC_BECOME_LANDLORD = new AppMessage("SUC-003", "You are now a landlord");
    public static final AppMessage SUC_LISTING_UPDATED = new AppMessage("SUC-004", "Listing updated successfully");
    public static final AppMessage SUC_LISTING_DELETED = new AppMessage("SUC-005", "Listing deleted successfully");
    public static final AppMessage SUC_LISTING_VISIBLE = new AppMessage("SUC-006", "Listing is visible again");
    public static final AppMessage SUC_LISTING_HIDDEN = new AppMessage("SUC-007", "Listing hidden successfully");
    public static final AppMessage SUC_FAVORITE_ADDED = new AppMessage("SUC-008", "Listing added to favorites");
    public static final AppMessage SUC_FAVORITE_REMOVED = new AppMessage("SUC-009", "Listing removed from favorites");
    public static final AppMessage SUC_CONTRACT_DELETED = new AppMessage("SUC-010", "Contract deleted successfully");
    public static final AppMessage SUC_INCIDENT_SUBMITTED = new AppMessage("SUC-011", "Incident submitted successfully");
    public static final AppMessage SUC_INCIDENT_UPDATED = new AppMessage("SUC-012", "Incident status updated successfully");
    public static final AppMessage SUC_REPORT_SUBMITTED = new AppMessage("SUC-013", "Report submitted successfully");
    public static final AppMessage SUC_REPORT_UPDATED = new AppMessage("SUC-014", "Report status updated successfully");
    public static final AppMessage SUC_REVIEW_CREATED = new AppMessage("SUC-015", "Review created successfully");
    public static final AppMessage SUC_REVIEW_DELETED = new AppMessage("SUC-016", "Review deleted successfully");
    public static final AppMessage SUC_TENANT_UPDATED = new AppMessage("SUC-017", "Tenant updated successfully");
    public static final AppMessage SUC_VIDEO_REQUEST_SUBMITTED = new AppMessage("SUC-018", "Video request submitted successfully");
    public static final AppMessage SUC_VIDEO_REQUEST_CANCELLED = new AppMessage("SUC-019", "Video request cancelled");
    public static final AppMessage SUC_VIDEO_APPROVED = new AppMessage("SUC-020", "Video request approved successfully");
    public static final AppMessage SUC_VIDEO_REJECTED = new AppMessage("SUC-021", "Video request rejected successfully");
    public static final AppMessage SUC_HOT_REQUEST_SUBMITTED = new AppMessage("SUC-022", "Hot listing request submitted successfully");
    public static final AppMessage SUC_HOT_REQUEST_CANCELLED = new AppMessage("SUC-023", "Hot listing request cancelled");
    public static final AppMessage SUC_HOT_APPROVED = new AppMessage("SUC-024", "Hot listing request approved successfully");
    public static final AppMessage SUC_HOT_REJECTED = new AppMessage("SUC-025", "Hot listing request rejected successfully");
    public static final AppMessage SUC_VIDEO_REMOVED = new AppMessage("SUC-026", "Video removed successfully");
    public static final AppMessage SUC_NOTIFICATION_READ = new AppMessage("SUC-027", "Notification marked as read");
    public static final AppMessage SUC_NOTIFICATIONS_READ = new AppMessage("SUC-028", "All notifications marked as read");
    public static final AppMessage SUC_NOTIFICATION_DELETED = new AppMessage("SUC-029", "Notification deleted");
    public static final AppMessage SUC_ACCOUNT_BLOCKED = new AppMessage("SUC-030", "Account blocked successfully");
    public static final AppMessage SUC_ACCOUNT_UNBLOCKED = new AppMessage("SUC-031", "Account unblocked successfully");
    public static final AppMessage SUC_LISTING_HOT_UPDATED = new AppMessage("SUC-032", "Listing hot label updated successfully");
    public static final AppMessage SUC_LISTING_STATUS_UPDATED = new AppMessage("SUC-033", "Listing status updated successfully");
    public static final AppMessage SUC_PAYMENT_ORDER_CREATED = new AppMessage("SUC-034", "Tạo đơn hàng thành công");
    public static final AppMessage SUC_PAYMENT_PROCESSED = new AppMessage("SUC-035", "Payment processed successfully");

    public static final AppMessage WAR_PAYMENT_ALREADY_PROCESSED = new AppMessage("WAR-001", "Payment already processed");

    public static final String VALIDATION_FULL_NAME_REQUIRED = "full_name is required";
    public static final String VALIDATION_PASSWORD_REQUIRED = "password is required";
    public static final String VALIDATION_PASSWORD_MIN_LENGTH = "password must contain at least 8 characters";
    public static final String VALIDATION_EMAIL_OR_PHONE_REQUIRED = "emailOrPhone is required";

    public static final String DEFAULT_DEPOSIT_ORDER_INFO = "Nạp tiền tài khoản";
    public static final String MOMO_TRANSACTION_DESCRIPTION = "Nạp tiền qua MoMo - OrderID: %s";
    public static final String MOMO_SUCCESS_TRANSACTION_DESCRIPTION = "Nạp tiền qua MoMo thành công - OrderID: %s - TransID: %s";
    public static final String MOMO_FAILED_TRANSACTION_DESCRIPTION = "Nạp tiền thất bại - OrderID: %s - %s";
    public static final String VIDEO_PAYMENT_DESCRIPTION = "Thanh toán phí đăng video cho tin #%s";
    public static final String HOT_PAYMENT_DESCRIPTION = "Thanh toán hot listing #%s trong %s ngày";
    public static final String VIDEO_APPROVED_NOTE = "Đã duyệt và đăng video";
    public static final String VIDEO_REJECTED_NOTE = "Từ chối yêu cầu";
    public static final String HOT_REJECTED_NOTE = "Từ chối yêu cầu";
    public static final String HOT_APPROVED_NOTE = "Đã duyệt hot listing";
    public static final String VIDEO_APPROVED_TITLE = "Yêu cầu đăng video đã được duyệt";
    public static final String VIDEO_APPROVED_NOTIFICATION = "Video của tin đăng #%s đã được đăng thành công.";
    public static final String VIDEO_REJECTED_TITLE = "Yêu cầu đăng video bị từ chối";
    public static final String VIDEO_REJECTED_NOTIFICATION = "Yêu cầu đăng video của bạn đã bị từ chối.";
    public static final String HOT_APPROVED_TITLE = "Yêu cầu hot listing đã được duyệt";
    public static final String HOT_APPROVED_NOTIFICATION = "Tin đăng #%s đã được hot trong %s ngày.";
    public static final String HOT_REJECTED_TITLE = "Yêu cầu hot listing bị từ chối";
    public static final String HOT_REJECTED_NOTIFICATION = "Yêu cầu hot listing của bạn đã bị từ chối.";
    public static final String INCIDENT_RESOLVED_STATUS = "Đã giải quyết";
    public static final String INCIDENT_DEFAULT_LISTING_NAME = "tin đăng";
    public static final String INCIDENT_NOTIFICATION_TITLE = "Phản hồi sự cố: %s";
    public static final String INCIDENT_NOTIFICATION_MESSAGE = "Chủ trọ đã phản hồi sự cố \"%s\" tại %s: %s";
    public static final String CONTRACT_ACTIVE_STATUS = "Đang hiệu lực";
    public static final String CONTRACT_EXPIRED_STATUS = "Hết hạn";
    public static final String CONTRACT_EXPIRING_STATUS = "Sắp hết hạn";
    public static final String TRANSACTION_DEPOSIT_LABEL = "Nạp tiền";
    public static final String TRANSACTION_PAYMENT_LABEL = "Thanh toán";
    public static final String TRANSACTION_REFUND_LABEL = "Hoàn tiền";
    public static final String TRANSACTION_SUCCESS_STATUS = "Thành công";
    public static final String TRANSACTION_FAILED_STATUS = "Thất bại";
    public static final String TRANSACTION_PROCESSING_STATUS = "Đang xử lý";
    public static final String EXPENSE_INCOME_LABEL = "Thu";
    public static final String EXPENSE_OUTGOING_LABEL = "Chi";
    public static final String RENT_EXPENSE_CATEGORY = "Tiền thuê";
    public static final String POSTING_FEE_CATEGORY = "Phí đăng tin";
    public static final String HOT_LISTING_FEE_CATEGORY = "Phí hot listing";
    public static final String OTHER_EXPENSE_CATEGORY = "Chi phí khác";

    public static String format(String template, Object... arguments) {
        return template.formatted(arguments);
    }
}
