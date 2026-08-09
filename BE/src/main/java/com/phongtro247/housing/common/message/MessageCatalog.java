package com.phongtro247.housing.common.message;

import java.util.Locale;

public final class MessageCatalog {

    private MessageCatalog() {
    }

    public static final AppMessage ERR_VALIDATION_FAILED = new AppMessage("ERR-001", "Dữ liệu yêu cầu không hợp lệ");
    public static final AppMessage ERR_MALFORMED_REQUEST = new AppMessage("ERR-002", "Không thể đọc nội dung yêu cầu");
    public static final AppMessage ERR_INTERNAL = new AppMessage("ERR-003", "Đã xảy ra lỗi hệ thống");
    public static final AppMessage ERR_RESOURCE_NOT_FOUND = new AppMessage("ERR-004", "%s không tồn tại: %s");
    public static final AppMessage ERR_CONTACT_REQUIRED = new AppMessage("ERR-005", "Vui lòng cung cấp email hoặc số điện thoại");
    public static final AppMessage ERR_EMAIL_EXISTS = new AppMessage("ERR-006", "Email đã tồn tại");
    public static final AppMessage ERR_PHONE_EXISTS = new AppMessage("ERR-007", "Số điện thoại đã tồn tại");
    public static final AppMessage ERR_ACCOUNT_NOT_FOUND = new AppMessage("ERR-008", "Tài khoản không tồn tại");
    public static final AppMessage ERR_ACCOUNT_BLOCKED = new AppMessage("ERR-009", "Tài khoản đã bị khóa");
    public static final AppMessage ERR_INVALID_PASSWORD = new AppMessage("ERR-010", "Mật khẩu không chính xác");
    public static final AppMessage ERR_ALREADY_FAVORITED = new AppMessage("ERR-011", "Tin đăng đã được yêu thích");
    public static final AppMessage ERR_TENANT_REQUIRED = new AppMessage("ERR-012", "Vui lòng chọn người thuê");
    public static final AppMessage ERR_LISTING_OWNER_REQUIRED = new AppMessage("ERR-013", "Bạn không sở hữu tin đăng này");
    public static final AppMessage ERR_INVALID_CONTRACT_DATES = new AppMessage("ERR-014", "Ngày kết thúc phải sau ngày bắt đầu");
    public static final AppMessage ERR_INCIDENT_ACCESS_DENIED = new AppMessage("ERR-015", "Bạn không thể cập nhật sự cố này");
    public static final AppMessage ERR_REPORT_EXISTS = new AppMessage("ERR-016", "Bạn đã báo cáo tin đăng này");
    public static final AppMessage ERR_STATUS_REQUIRED = new AppMessage("ERR-017", "Vui lòng cung cấp trạng thái báo cáo");
    public static final AppMessage ERR_INVALID_LISTING_TYPE = new AppMessage("ERR-018", "Loại tin đăng không tồn tại");
    public static final AppMessage ERR_TOO_MANY_IMAGES = new AppMessage("ERR-019", "Tin đăng chỉ được có tối đa %s ảnh");
    public static final AppMessage ERR_LISTING_NOT_HIDDEN = new AppMessage("ERR-020", "Chỉ có thể hiển thị lại tin đăng đang bị ẩn");
    public static final AppMessage ERR_LISTING_NOT_PUBLISHED = new AppMessage("ERR-021", "Chỉ có thể ẩn tin đăng đã được đăng");
    public static final AppMessage ERR_LISTING_MUST_BE_PUBLISHED = new AppMessage("ERR-022", "Tin đăng phải được đăng trước");
    public static final AppMessage ERR_LISTING_ACCESS_DENIED = new AppMessage("ERR-023", "Bạn không sở hữu tin đăng này");
    public static final AppMessage ERR_INVALID_LISTING_DATA = new AppMessage("ERR-024", "Tên, giá và diện tích là bắt buộc");
    public static final AppMessage ERR_INVALID_JSON_FIELD = new AppMessage("ERR-025", "Tiện ích và khu vực xung quanh phải là mảng JSON");
    public static final AppMessage ERR_LISTING_ATTRIBUTES_SERIALIZATION = new AppMessage("ERR-026", "Không thể chuyển đổi thuộc tính tin đăng");
    public static final AppMessage ERR_OWNER_REQUIRED = new AppMessage("ERR-027", "Vui lòng cung cấp chủ trọ");
    public static final AppMessage ERR_TENANT_EXISTS = new AppMessage("ERR-028", "Người thuê đã tồn tại trong danh sách của bạn");
    public static final AppMessage ERR_HOT_REQUEST_EXISTS = new AppMessage("ERR-029", "Đã có yêu cầu đẩy tin HOT đang chờ xử lý");
    public static final AppMessage ERR_LISTING_ALREADY_HOT = new AppMessage("ERR-030", "Tin đăng đã được đẩy HOT");
    public static final AppMessage ERR_VIDEO_URL_REQUIRED = new AppMessage("ERR-031", "Vui lòng cung cấp URL video");
    public static final AppMessage ERR_INSUFFICIENT_BALANCE = new AppMessage("ERR-032", "Số dư tài khoản không đủ");
    public static final AppMessage ERR_REQUEST_ALREADY_PROCESSED = new AppMessage("ERR-033", "Yêu cầu đã được xử lý");
    public static final AppMessage ERR_VIDEO_REQUEST_EXISTS = new AppMessage("ERR-034", "Đã có yêu cầu đăng video đang chờ xử lý");
    public static final AppMessage ERR_OWNER_REVIEW_FORBIDDEN = new AppMessage("ERR-035", "Bạn không thể đánh giá tin đăng của mình");
    public static final AppMessage ERR_REVIEW_EXISTS = new AppMessage("ERR-036", "Bạn đã đánh giá tin đăng này");
    public static final AppMessage ERR_REVIEW_DELETE_FORBIDDEN = new AppMessage("ERR-037", "Bạn không thể xóa đánh giá này");
    public static final AppMessage ERR_USER_NOT_FOUND = new AppMessage("ERR-038", "Không tìm thấy người dùng");
    public static final AppMessage ERR_MOMO_ORDER_FAILED = new AppMessage("ERR-039", "Không thể tạo đơn hàng MoMo");
    public static final AppMessage ERR_INVALID_SIGNATURE = new AppMessage("ERR-040", "Chữ ký không hợp lệ");
    public static final AppMessage ERR_INVALID_PAYMENT_METADATA = new AppMessage("ERR-041", "Thông tin thanh toán MoMo không hợp lệ");
    public static final AppMessage ERR_MOMO_NOT_CONFIGURED = new AppMessage("ERR-042", "MoMo chưa được cấu hình cho môi trường hiện tại");
    public static final AppMessage ERR_UPLOAD_EMPTY = new AppMessage("ERR-043", "Tệp tải lên không được để trống");
    public static final AppMessage ERR_INVALID_UPLOAD_PATH = new AppMessage("ERR-044", "Đường dẫn tệp tải lên không hợp lệ");
    public static final AppMessage ERR_UPLOAD_FAILED = new AppMessage("ERR-045", "Không thể lưu tệp tải lên");
    public static final AppMessage ERR_JWT_SECRET_TOO_SHORT = new AppMessage("ERR-046", "Khóa JWT phải có ít nhất 32 byte");
    public static final AppMessage ERR_PAYMENT_FAILED = new AppMessage("ERR-047", "Thanh toán thất bại");
    public static final AppMessage ERR_PAYMENT_METADATA_ENCODING = new AppMessage("ERR-048", "Không thể mã hóa thông tin thanh toán");
    public static final AppMessage ERR_PAYMENT_SIGNING_FAILED = new AppMessage("ERR-049", "Không thể tạo chữ ký MoMo");
    public static final AppMessage ERR_MASTER_DATA_ITEM_EXISTS = new AppMessage("ERR-050", "Mã dữ liệu danh mục đã tồn tại");
    public static final AppMessage ERR_MASTER_DATA_INVALID_METADATA = new AppMessage("ERR-051", "Metadata danh mục không đúng định dạng JSON");

    public static final AppMessage SUC_REGISTRATION = new AppMessage("SUC-001", "Đăng ký thành công");
    public static final AppMessage SUC_USER_UPDATED = new AppMessage("SUC-002", "Thông tin người dùng đã được cập nhật thành công");
    public static final AppMessage SUC_BECOME_LANDLORD = new AppMessage("SUC-003", "Bạn đã trở thành chủ trọ");
    public static final AppMessage SUC_LISTING_UPDATED = new AppMessage("SUC-004", "Tin đăng đã được cập nhật thành công");
    public static final AppMessage SUC_LISTING_DELETED = new AppMessage("SUC-005", "Tin đăng đã được xóa thành công");
    public static final AppMessage SUC_LISTING_VISIBLE = new AppMessage("SUC-006", "Tin đăng đã được hiển thị lại");
    public static final AppMessage SUC_LISTING_HIDDEN = new AppMessage("SUC-007", "Tin đăng đã được ẩn thành công");
    public static final AppMessage SUC_FAVORITE_ADDED = new AppMessage("SUC-008", "Đã thêm tin đăng vào danh sách yêu thích");
    public static final AppMessage SUC_FAVORITE_REMOVED = new AppMessage("SUC-009", "Đã xóa tin đăng khỏi danh sách yêu thích");
    public static final AppMessage SUC_CONTRACT_DELETED = new AppMessage("SUC-010", "Hợp đồng đã được xóa thành công");
    public static final AppMessage SUC_INCIDENT_SUBMITTED = new AppMessage("SUC-011", "Đã gửi báo cáo sự cố thành công");
    public static final AppMessage SUC_INCIDENT_UPDATED = new AppMessage("SUC-012", "Trạng thái sự cố đã được cập nhật thành công");
    public static final AppMessage SUC_REPORT_SUBMITTED = new AppMessage("SUC-013", "Đã gửi báo cáo thành công");
    public static final AppMessage SUC_REPORT_UPDATED = new AppMessage("SUC-014", "Trạng thái báo cáo đã được cập nhật thành công");
    public static final AppMessage SUC_REVIEW_CREATED = new AppMessage("SUC-015", "Đánh giá đã được tạo thành công");
    public static final AppMessage SUC_REVIEW_DELETED = new AppMessage("SUC-016", "Đánh giá đã được xóa thành công");
    public static final AppMessage SUC_TENANT_UPDATED = new AppMessage("SUC-017", "Thông tin người thuê đã được cập nhật");
    public static final AppMessage SUC_VIDEO_REQUEST_SUBMITTED = new AppMessage("SUC-018", "Đã gửi yêu cầu đăng video");
    public static final AppMessage SUC_VIDEO_REQUEST_CANCELLED = new AppMessage("SUC-019", "Đã hủy yêu cầu đăng video");
    public static final AppMessage SUC_VIDEO_APPROVED = new AppMessage("SUC-020", "Yêu cầu đăng video đã được duyệt");
    public static final AppMessage SUC_VIDEO_REJECTED = new AppMessage("SUC-021", "Yêu cầu đăng video đã bị từ chối");
    public static final AppMessage SUC_HOT_REQUEST_SUBMITTED = new AppMessage("SUC-022", "Đã gửi yêu cầu đẩy tin HOT");
    public static final AppMessage SUC_HOT_REQUEST_CANCELLED = new AppMessage("SUC-023", "Đã hủy yêu cầu đẩy tin HOT");
    public static final AppMessage SUC_HOT_APPROVED = new AppMessage("SUC-024", "Yêu cầu đẩy tin HOT đã được duyệt");
    public static final AppMessage SUC_HOT_REJECTED = new AppMessage("SUC-025", "Yêu cầu đẩy tin HOT đã bị từ chối");
    public static final AppMessage SUC_VIDEO_REMOVED = new AppMessage("SUC-026", "Đã gỡ video thành công");
    public static final AppMessage SUC_NOTIFICATION_READ = new AppMessage("SUC-027", "Thông báo đã được đánh dấu là đã đọc");
    public static final AppMessage SUC_NOTIFICATIONS_READ = new AppMessage("SUC-028", "Tất cả thông báo đã được đánh dấu là đã đọc");
    public static final AppMessage SUC_NOTIFICATION_DELETED = new AppMessage("SUC-029", "Thông báo đã được xóa");
    public static final AppMessage SUC_ACCOUNT_BLOCKED = new AppMessage("SUC-030", "Đã khóa tài khoản thành công");
    public static final AppMessage SUC_ACCOUNT_UNBLOCKED = new AppMessage("SUC-031", "Đã mở khóa tài khoản thành công");
    public static final AppMessage SUC_LISTING_HOT_UPDATED = new AppMessage("SUC-032", "Nhãn tin HOT đã được cập nhật");
    public static final AppMessage SUC_LISTING_STATUS_UPDATED = new AppMessage("SUC-033", "Trạng thái tin đăng đã được cập nhật");
    public static final AppMessage SUC_PAYMENT_ORDER_CREATED = new AppMessage("SUC-034", "Tạo đơn hàng thành công");
    public static final AppMessage SUC_PAYMENT_PROCESSED = new AppMessage("SUC-035", "Thanh toán đã được xử lý thành công");
    public static final AppMessage SUC_MASTER_DATA_ITEM_CREATED = new AppMessage("SUC-036", "Đã tạo dữ liệu danh mục thành công");
    public static final AppMessage SUC_MASTER_DATA_ITEM_UPDATED = new AppMessage("SUC-037", "Đã cập nhật dữ liệu danh mục thành công");
    public static final AppMessage SUC_MASTER_DATA_ITEM_STATUS_UPDATED = new AppMessage("SUC-038", "Đã cập nhật trạng thái dữ liệu danh mục");

    public static final AppMessage WAR_PAYMENT_ALREADY_PROCESSED = new AppMessage("WAR-001", "Thanh toán đã được xử lý trước đó");

    public static final String VALIDATION_FULL_NAME_REQUIRED = "Họ tên là bắt buộc";
    public static final String VALIDATION_REQUIRED = "Trường này là bắt buộc";
    public static final String VALIDATION_NAME_REQUIRED = "Tên là bắt buộc";
    public static final String VALIDATION_PHONE_REQUIRED = "Số điện thoại là bắt buộc";
    public static final String VALIDATION_REASON_REQUIRED = "Lý do là bắt buộc";
    public static final String VALIDATION_PASSWORD_REQUIRED = "Mật khẩu là bắt buộc";
    public static final String VALIDATION_PASSWORD_MIN_LENGTH = "Mật khẩu phải có ít nhất 8 ký tự";
    public static final String VALIDATION_EMAIL_OR_PHONE_REQUIRED = "Email hoặc số điện thoại là bắt buộc";
    public static final String VALIDATION_AMOUNT_MINIMUM = "Số tiền phải lớn hơn hoặc bằng 1.000";
    public static final String VALIDATION_DURATION_MINIMUM = "Thời hạn phải có ít nhất 1 ngày";
    public static final String VALIDATION_DURATION_MAXIMUM = "Thời hạn không được vượt quá 365 ngày";
    public static final String VALIDATION_RATING_MINIMUM = "Điểm đánh giá phải từ 1 đến 5";
    public static final String VALIDATION_RATING_MAXIMUM = "Điểm đánh giá phải từ 1 đến 5";
    public static final String VALIDATION_CODE_REQUIRED = "Mã dữ liệu là bắt buộc";
    public static final String VALIDATION_CODE_FORMAT = "Mã dữ liệu chỉ được chứa chữ thường, số, dấu gạch ngang hoặc gạch dưới";
    public static final String VALIDATION_MASTER_DATA_NAME_REQUIRED = "Tên dữ liệu là bắt buộc";
    public static final String VALIDATION_SORT_ORDER_MINIMUM = "Thứ tự hiển thị không được âm";

    public static final String DEFAULT_DEPOSIT_ORDER_INFO = "Nạp tiền vào tài khoản";
    public static final String MOMO_TRANSACTION_DESCRIPTION = "Nạp tiền qua MoMo - Mã đơn hàng: %s";
    public static final String MOMO_SUCCESS_TRANSACTION_DESCRIPTION = "Nạp tiền qua MoMo thành công - Mã đơn hàng: %s - Mã giao dịch: %s";
    public static final String MOMO_FAILED_TRANSACTION_DESCRIPTION = "Nạp tiền thất bại - Mã đơn hàng: %s";
    public static final String VIDEO_PAYMENT_DESCRIPTION = "Thanh toán phí đăng video cho tin #%s";
    public static final String HOT_PAYMENT_DESCRIPTION = "Thanh toán phí đẩy tin HOT #%s trong %s ngày";
    public static final String VIDEO_APPROVED_NOTE = "Đã duyệt và đăng video";
    public static final String VIDEO_REJECTED_NOTE = "Từ chối yêu cầu";
    public static final String HOT_REJECTED_NOTE = "Từ chối yêu cầu";
    public static final String HOT_APPROVED_NOTE = "Đã duyệt tin HOT";
    public static final String VIDEO_APPROVED_TITLE = "Yêu cầu đăng video đã được duyệt";
    public static final String VIDEO_APPROVED_NOTIFICATION = "Video của tin đăng #%s đã được đăng thành công.";
    public static final String VIDEO_REJECTED_TITLE = "Yêu cầu đăng video bị từ chối";
    public static final String VIDEO_REJECTED_NOTIFICATION = "Yêu cầu đăng video của bạn đã bị từ chối.";
    public static final String HOT_APPROVED_TITLE = "Yêu cầu đẩy tin HOT đã được duyệt";
    public static final String HOT_APPROVED_NOTIFICATION = "Tin đăng #%s đã được đẩy HOT trong %s ngày.";
    public static final String HOT_REJECTED_TITLE = "Yêu cầu đẩy tin HOT bị từ chối";
    public static final String HOT_REJECTED_NOTIFICATION = "Yêu cầu đẩy tin HOT của bạn đã bị từ chối.";

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
    public static final String HOT_LISTING_FEE_CATEGORY = "Phí tin HOT";
    public static final String OTHER_EXPENSE_CATEGORY = "Chi phí khác";

    public static final String RESOURCE_USER = "người dùng";
    public static final String RESOURCE_LISTING = "tin đăng";
    public static final String RESOURCE_LOCATION = "địa điểm";
    public static final String RESOURCE_FAVORITE = "tin yêu thích";
    public static final String RESOURCE_CONTRACT = "hợp đồng";
    public static final String RESOURCE_TENANT = "người thuê";
    public static final String RESOURCE_LISTING_REPORT = "báo cáo tin đăng";
    public static final String RESOURCE_INCIDENT = "sự cố";
    public static final String RESOURCE_NOTIFICATION = "thông báo";
    public static final String RESOURCE_REVIEW = "đánh giá";
    public static final String RESOURCE_REVENUE = "doanh thu";
    public static final String RESOURCE_MASTER_DATA_GROUP = "nhóm dữ liệu danh mục";
    public static final String RESOURCE_MASTER_DATA_ITEM = "dữ liệu danh mục";
    public static final String RESOURCE_HOT_REQUEST = "yêu cầu đẩy tin HOT";
    public static final String RESOURCE_VIDEO_REQUEST = "yêu cầu đăng video";
    public static final String RESOURCE_DEFAULT = "tài nguyên";

    public static String resourceLabel(String resource) {
        if (resource == null || resource.isBlank()) {
            return RESOURCE_DEFAULT;
        }
        return switch (resource.trim().toLowerCase(Locale.ROOT)) {
            case "user" -> RESOURCE_USER;
            case "listing" -> RESOURCE_LISTING;
            case "location" -> RESOURCE_LOCATION;
            case "favorite" -> RESOURCE_FAVORITE;
            case "contract" -> RESOURCE_CONTRACT;
            case "tenant" -> RESOURCE_TENANT;
            case "listing report" -> RESOURCE_LISTING_REPORT;
            case "incident" -> RESOURCE_INCIDENT;
            case "notification" -> RESOURCE_NOTIFICATION;
            case "review" -> RESOURCE_REVIEW;
            case "revenue" -> RESOURCE_REVENUE;
            case "master data group" -> RESOURCE_MASTER_DATA_GROUP;
            case "master data item" -> RESOURCE_MASTER_DATA_ITEM;
            case "hot listing request" -> RESOURCE_HOT_REQUEST;
            case "video request" -> RESOURCE_VIDEO_REQUEST;
            default -> RESOURCE_DEFAULT;
        };
    }

    public static String format(String template, Object... arguments) {
        return template.formatted(arguments);
    }
}
