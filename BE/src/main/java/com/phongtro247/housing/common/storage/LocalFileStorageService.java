package com.phongtro247.housing.common.storage;

import com.phongtro247.housing.common.message.MessageCatalog;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalFileStorageService {

    private final Path root;

    public LocalFileStorageService(@Value("${app.storage.uploads-directory:./uploads}") String uploadsDirectory) {
        this.root = Paths.get(uploadsDirectory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(MessageCatalog.ERR_UPLOAD_EMPTY.message());
        }
        try {
            Files.createDirectories(root);
            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + (extension == null ? "" : "." + extension.toLowerCase());
            Path destination = root.resolve(filename).normalize();
            if (!destination.getParent().equals(root)) {
            throw new IllegalArgumentException(MessageCatalog.ERR_INVALID_UPLOAD_PATH.message());
            }
            file.transferTo(destination);
            return "/uploads/" + filename;
        } catch (IOException exception) {
            throw new IllegalStateException(MessageCatalog.ERR_UPLOAD_FAILED.message(), exception);
        }
    }
}
