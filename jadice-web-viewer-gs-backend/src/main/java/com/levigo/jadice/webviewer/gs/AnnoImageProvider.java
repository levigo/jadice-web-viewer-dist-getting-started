/**
 * <pre>
 * Copyright (c), levigo holding gmbh.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 * </pre>
 */
package com.levigo.jadice.webviewer.gs;

import com.levigo.jadice.document.io.MemoryInputStream;
import com.levigo.jadice.document.io.SeekableInputStream;
import com.levigo.jadice.web.server.annotation.AnnotationImageProvider;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

@Component
public class AnnoImageProvider implements AnnotationImageProvider {
    @Override
    public SeekableInputStream provideAnnotationImage(String annotationImageID) throws IOException {
        InputStream is = null;
        if (annotationImageID.equals("signatureAnnoImage"))
            is = Thread.currentThread().getContextClassLoader().getResourceAsStream("signature_kl_opaque_dotted.png");
        else if (annotationImageID.equals("qrJWTAnnoImage"))
            is = Thread.currentThread().getContextClassLoader().getResourceAsStream("qr_jwt.png");
        else if (annotationImageID.equals("qrJadiceAnnoImage"))
            is = Thread.currentThread().getContextClassLoader().getResourceAsStream("qr_jadice.png");

        if (null == is)
            throw new IOException("Couldn't find/load image for id \"" + annotationImageID + "\"");

        return new MemoryInputStream(is);
    }
}
