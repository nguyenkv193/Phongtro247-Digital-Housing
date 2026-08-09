package com.phongtro247.housing.common.exception;

import com.phongtro247.housing.common.message.MessageCatalog;
import org.springframework.http.HttpStatus;

public class NotFoundException extends ApiException {

    public NotFoundException(String resource, Object id) {
        super(HttpStatus.NOT_FOUND,
                MessageCatalog.ERR_RESOURCE_NOT_FOUND.format(MessageCatalog.resourceLabel(resource), id));
    }
}
