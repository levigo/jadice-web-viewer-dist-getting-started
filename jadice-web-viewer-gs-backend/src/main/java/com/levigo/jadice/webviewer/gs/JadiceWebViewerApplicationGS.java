package com.levigo.jadice.webviewer.gs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;

import com.levigo.jadice.web.server.spring.JWTSpringConfiguration;
import com.levigo.jadice.web.server.spring.SpringPropertiesServerConfiguration;
import com.levigo.jadice.web.server.spring.autoconfig.JWTSpringComponentScan;

/**
 * Main application class for the Jadice Web Viewer Getting Started application.
 * <p>
 * This class serves as the entry point for the Spring Boot application and defines
 * the application configuration. It imports necessary Spring configurations and
 * sets up component scanning for required packages.
 * </p>
 *
 * @see JWTSpringConfiguration JWT Spring security configuration
 * @see SpringPropertiesServerConfiguration Server properties configuration
 * @see JWTSpringComponentScan JWT component scanning configuration
 */
@EnableConfigurationProperties
@SpringBootApplication
@Import({JWTSpringConfiguration.class, SpringPropertiesServerConfiguration.class, JWTSpringComponentScan.class})
@ComponentScan(basePackages = {"com.jadice.license", "com.levigo.jadice", "com.levigo.jadice.webviewer.dist"})
public class JadiceWebViewerApplicationGS {

    /**
     * The main method that serves as the entry point for the application.
     * <p>
     * This method starts the Spring Boot application with the provided command line arguments.
     * </p>
     *
     * @param args command line arguments passed to the application
     */
    public static void main(String[] args) {
        SpringApplication.run(JadiceWebViewerApplicationGS.class, args);
    }
}
