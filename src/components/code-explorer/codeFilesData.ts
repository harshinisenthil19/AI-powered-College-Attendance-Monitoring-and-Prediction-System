export interface CodeFile {
  filename: string;
  path: string;
  category: string;
  description: string;
  content: string;
}

export const SPRING_BOOT_CODE_FILES: CodeFile[] = [
  {
    filename: 'PredictionService.java',
    path: 'src/main/java/com/college/attendance/service/PredictionService.java',
    category: 'AI / ML Prediction',
    description: 'AI attendance risk forecasting, linear momentum regression & class deficit recommendations',
    content: `package com.college.attendance.service;

import com.college.attendance.dto.PredictionResponseDto;
import com.college.attendance.entity.Attendance;
import com.college.attendance.entity.AttendanceStatus;
import com.college.attendance.entity.Student;
import com.college.attendance.entity.Subject;
import com.college.attendance.repository.AttendanceRepository;
import com.college.attendance.repository.StudentRepository;
import com.college.attendance.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

/**
 * AI & Statistical Attendance Prediction Engine
 * Isolates predictive momentum modeling from standard arithmetic calculations.
 */
@Service
@RequiredArgsConstructor
public class PredictionService {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final SubjectRepository subjectRepository;

    private static final double MANDATORY_THRESHOLD = 0.75; // 75% minimum
    private static final double HONORS_THRESHOLD = 0.85;    // 85% honors target
    private static final int DEFAULT_SEMESTER_SESSIONS = 60;

    /**
     * Predicts attendance risk and generates remedial recommendations for a student.
     */
    public PredictionResponseDto predictStudentRisk(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

        List<Attendance> records = attendanceRepository.findByStudentIdOrderByDateAsc(studentId);
        int totalHeld = records.size();

        if (totalHeld == 0) {
            return PredictionResponseDto.builder()
                    .studentId(student.getId())
                    .studentName(student.getName())
                    .currentPercentage(100.0)
                    .predictedFinalPercentage(100.0)
                    .riskStatus("GOOD")
                    .requiredClassesTo75(0)
                    .aiExplanation("No sessions held yet. Attendance at baseline 100%.")
                    .build();
        }

        double effectiveAttended = calculateEffectiveAttended(records);
        double currentPercentage = Math.round((effectiveAttended / totalHeld) * 1000.0) / 10.0;

        // 1. Sliding-window Momentum Regression (Split into historical half vs recent half)
        String trend = "STABLE";
        double trendSlope = 0.0;
        if (records.size() >= 8) {
            int midpoint = records.size() / 2;
            List<Attendance> older = records.subList(0, midpoint);
            List<Attendance> recent = records.subList(midpoint, records.size());

            double olderRate = (calculateEffectiveAttended(older) / older.size()) * 100.0;
            double recentRate = (calculateEffectiveAttended(recent) / recent.size()) * 100.0;
            trendSlope = Math.round((recentRate - olderRate) * 10.0) / 10.0;

            if (trendSlope > 3.0) trend = "IMPROVING";
            else if (trendSlope < -3.0) trend = "DECLINING";
        }

        // 2. Projected Future Velocity Weighting
        int remainingClasses = Math.max(0, DEFAULT_SEMESTER_SESSIONS - totalHeld);
        double futureRate = currentPercentage / 100.0;
        if ("DECLINING".equals(trend)) {
            futureRate = Math.max(0.40, futureRate - 0.08);
        } else if ("IMPROVING".equals(trend)) {
            futureRate = Math.min(0.98, futureRate + 0.05);
        }

        double projectedFutureAttended = remainingClasses * futureRate;
        double projectedFinalPercentage = Math.min(100.0,
                Math.round(((effectiveAttended + projectedFutureAttended) / DEFAULT_SEMESTER_SESSIONS) * 1000.0) / 10.0);

        // 3. Risk Categorization
        String riskStatus = "GOOD";
        if (projectedFinalPercentage < 75.0) {
            riskStatus = "AT_RISK";
        } else if (projectedFinalPercentage < 80.0) {
            riskStatus = "WARNING";
        }

        // 4. Mathematical Prescriptive Remediation: (Attended + x) / (Held + x) >= T
        int classesNeeded75 = calculateRequiredClasses(effectiveAttended, totalHeld, MANDATORY_THRESHOLD);
        int classesNeeded85 = calculateRequiredClasses(effectiveAttended, totalHeld, HONORS_THRESHOLD);
        int safeAbsences = calculateSafeAbsences(effectiveAttended, totalHeld, MANDATORY_THRESHOLD);

        // 5. Synthesize AI Explanation
        String explanation;
        if ("AT_RISK".equals(riskStatus)) {
            explanation = String.format("High Risk Alert: Projected final attendance is %.1f%%, falling below the mandatory 75%% cutoff. " +
                    "Student exhibits a %s momentum trend (%.1f%% shift). Must attend the next %d consecutive classes to restore exam eligibility.",
                    projectedFinalPercentage, trend.toLowerCase(), trendSlope, classesNeeded75);
        } else if ("WARNING".equals(riskStatus)) {
            explanation = String.format("Borderline Warning: Trajectory projects %.1f%%. Safe absence buffer is low (%d classes remaining). " +
                    "Consistent presence across upcoming 2 weeks is strongly advised.", projectedFinalPercentage, safeAbsences);
        } else {
            explanation = String.format("Good Standing: Projected final attendance is healthy at %.1f%%. " +
                    "Student can safely afford up to %d absences without breaching the 75%% threshold.", projectedFinalPercentage, safeAbsences);
        }

        return PredictionResponseDto.builder()
                .studentId(student.getId())
                .rollNumber(student.getRollNumber())
                .studentName(student.getName())
                .currentPercentage(currentPercentage)
                .totalHeld(totalHeld)
                .totalAttended((int) Math.round(effectiveAttended))
                .remainingClasses(remainingClasses)
                .trend(trend)
                .trendSlope(trendSlope)
                .predictedFinalPercentage(projectedFinalPercentage)
                .riskStatus(riskStatus)
                .requiredClassesTo75(classesNeeded75)
                .requiredClassesTo85(classesNeeded85)
                .maxSafeAbsences(safeAbsences)
                .aiExplanation(explanation)
                .build();
    }

    private double calculateEffectiveAttended(List<Attendance> records) {
        return records.stream().mapToDouble(r -> {
            if (r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.EXCUSED) return 1.0;
            if (r.getStatus() == AttendanceStatus.LATE) return 0.75;
            return 0.0;
        }).sum();
    }

    private int calculateRequiredClasses(double attended, int held, double targetRatio) {
        if (held == 0 || (attended / held) >= targetRatio) return 0;
        double numerator = (targetRatio * held) - attended;
        double denominator = 1.0 - targetRatio;
        return (int) Math.max(0, Math.ceil(numerator / denominator));
    }

    private int calculateSafeAbsences(double attended, int held, double targetRatio) {
        if (held == 0 || (attended / held) < targetRatio) return 0;
        int maxHeldPossible = (int) Math.floor(attended / targetRatio);
        return Math.max(0, maxHeldPossible - held);
    }
}`
  },
  {
    filename: 'Student.java',
    path: 'src/main/java/com/college/attendance/entity/Student.java',
    category: 'JPA Entity',
    description: 'Student database entity with roll number, contact info, and aggregate attendance tracking',
    content: `package com.college.attendance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "students", indexes = {
    @Index(name = "idx_student_roll", columnList = "roll_number", unique = true),
    @Index(name = "idx_student_dept", columnList = "department")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "roll_number", nullable = false, unique = true, length = 30)
    private String rollNumber;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false, length = 10)
    private String section;

    @Column(length = 25)
    private String phone;

    @Column(name = "parent_phone", length = 25)
    private String parentPhone;

    @Column(name = "attendance_percentage")
    private Double attendancePercentage = 100.0;

    @Column(name = "total_classes_held")
    private Integer totalClassesHeld = 0;

    @Column(name = "total_classes_attended")
    private Integer totalClassesAttended = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_status", length = 20)
    private RiskLevel riskStatus = RiskLevel.GOOD;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attendance> attendanceRecords = new ArrayList<>();
}`
  },
  {
    filename: 'Attendance.java',
    path: 'src/main/java/com/college/attendance/entity/Attendance.java',
    category: 'JPA Entity',
    description: 'Attendance event entity capturing daily roll call, status, timestamps, and audit trail',
    content: `package com.college.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance", indexes = {
    @Index(name = "idx_att_student_date", columnList = "student_id, attendance_date"),
    @Index(name = "idx_att_subject_date", columnList = "subject_id, attendance_date")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_student_subject_date", columnNames = {"student_id", "subject_id", "attendance_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    @Column(name = "marked_by_teacher_id", length = 50)
    private String markedByTeacherId;

    @Column(length = 255)
    private String remarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}`
  },
  {
    filename: 'Subject.java',
    path: 'src/main/java/com/college/attendance/entity/Subject.java',
    category: 'JPA Entity',
    description: 'Curriculum subject entity mapping courses, faculty assignments, and contact hours',
    content: `package com.college.attendance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false)
    private Integer credits;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(name = "total_planned_classes")
    private Integer totalPlannedClasses = 36;

    @Column(name = "conducted_classes")
    private Integer conductedClasses = 0;
}`
  },
  {
    filename: 'AttendanceController.java',
    path: 'src/main/java/com/college/attendance/controller/AttendanceController.java',
    category: 'REST Controller',
    description: 'REST endpoints for marking daily batch roll calls, single updates, and student logs',
    content: `package com.college.attendance.controller;

import com.college.attendance.dto.AttendanceBatchRequest;
import com.college.attendance.dto.AttendanceRecordDto;
import com.college.attendance.dto.AttendanceUpdateRequest;
import com.college.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<AttendanceRecordDto>> markBatchAttendance(
            @Valid @RequestBody AttendanceBatchRequest request) {
        List<AttendanceRecordDto> saved = attendanceService.markBatchAttendance(request);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<AttendanceRecordDto> updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceUpdateRequest request) {
        AttendanceRecordDto updated = attendanceService.updateAttendance(id, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceRecordDto>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentRecords(studentId));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<AttendanceRecordDto>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getRecordsByDate(date));
    }

    @GetMapping("/percentage/student/{studentId}")
    public ResponseEntity<Double> getStudentPercentage(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.calculateOverallPercentage(studentId));
    }
}`
  },
  {
    filename: 'PredictionController.java',
    path: 'src/main/java/com/college/attendance/controller/PredictionController.java',
    category: 'REST Controller',
    description: 'AI attendance risk calculation and simulation endpoints',
    content: `package com.college.attendance.controller;

import com.college.attendance.dto.PredictionResponseDto;
import com.college.attendance.dto.SimulationRequestDto;
import com.college.attendance.dto.SimulationResultDto;
import com.college.attendance.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prediction")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PredictionController {

    private final PredictionService predictionService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<PredictionResponseDto> predictStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(predictionService.predictStudentRisk(studentId));
    }

    @GetMapping("/all-risks")
    public ResponseEntity<List<PredictionResponseDto>> getAllAtRiskStudents() {
        return ResponseEntity.ok(predictionService.getAllRiskForecasts());
    }

    @PostMapping("/simulate")
    public ResponseEntity<SimulationResultDto> simulateAttendance(
            @RequestBody SimulationRequestDto request) {
        return ResponseEntity.ok(predictionService.simulateHypotheticalAttendance(request));
    }
}`
  },
  {
    filename: 'StudentRepository.java',
    path: 'src/main/java/com/college/attendance/repository/StudentRepository.java',
    category: 'Spring Data JPA',
    description: 'Repository interface with custom JPQL queries for low-attendance filtering and department metrics',
    content: `package com.college.attendance.repository;

import com.college.attendance.entity.RiskLevel;
import com.college.attendance.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRollNumber(String rollNumber);

    List<Student> findByDepartment(String department);

    List<Student> findByRiskStatus(RiskLevel riskStatus);

    // Custom JPQL to retrieve students falling below mandatory 75% cutoff
    @Query("SELECT s FROM Student s WHERE s.attendancePercentage < :threshold ORDER BY s.attendancePercentage ASC")
    List<Student> findStudentsBelowAttendanceCutoff(@Param("threshold") Double threshold);

    @Query("SELECT AVG(s.attendancePercentage) FROM Student s WHERE s.department = :dept")
    Double calculateDepartmentAverageAttendance(@Param("dept") String dept);
}`
  },
  {
    filename: 'SecurityConfig.java',
    path: 'src/main/java/com/college/attendance/config/SecurityConfig.java',
    category: 'Security Config',
    description: 'Spring Security filter chain configuration with stateless JWT token validation and RBAC',
    content: `package com.college.attendance.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/health", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .requestMatchers("/api/attendance/mark", "/api/students/add").hasAnyRole("TEACHER", "ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}`
  },
  {
    filename: 'pom.xml',
    path: 'pom.xml',
    category: 'Maven Build',
    description: 'Maven configuration containing Spring Boot 3.3, Data JPA, Security, MySQL driver, Lombok and JJWT',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.2</version>
        <relativePath/>
    </parent>

    <groupId>com.college</groupId>
    <artifactId>attendance-monitoring-system</artifactId>
    <version>1.0.0</version>
    <name>AI-Based College Attendance Monitoring & Prediction System</name>
    <description>Full-stack Attendance Monitoring and AI Risk Early Alert Backend</description>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.11.5</jjwt.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web REST -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Data JPA & Hibernate -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- MySQL Connector/J -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Spring Security & JWT -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    filename: 'application.properties',
    path: 'src/main/resources/application.properties',
    category: 'Configuration',
    description: 'Spring Boot runtime configuration for MySQL datasource, JPA Hibernate DDL, and JWT secrets',
    content: `# Server Port
server.port=8080

# MySQL Database DataSource
spring.datasource.url=jdbc:mysql://localhost:3306/attendance_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA & Hibernate Configurations
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Security Configurations
app.jwt.secret=ApexCollegeSecretKeyForAttendanceMonitoringAndPredictionSystem2026Secure
app.jwt.expiration-ms=86400000

# Logging
logging.level.com.college.attendance=DEBUG
logging.level.org.springframework.security=INFO`
  },
  {
    filename: 'AiAttendanceApplication.java',
    path: 'src/main/java/com/college/attendance/AiAttendanceApplication.java',
    category: 'Spring Boot App',
    description: 'Spring Boot main execution class with JPA auditing enablement',
    content: `package com.college.attendance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AiAttendanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiAttendanceApplication.class, args);
        System.out.println("=================================================================");
        System.out.println("AI College Attendance Monitoring & Prediction Server Running!");
        System.out.println("REST API Base: http://localhost:8080/api");
        System.out.println("=================================================================");
    }
}`
  }
];

export const MYSQL_SCHEMA_SQL = `-- =================================================================
-- AI-Based College Attendance Monitoring and Prediction System
-- Database Schema: attendance_db
-- MySQL 8.0+ Compatible DDL and Seed Queries
-- =================================================================

CREATE DATABASE IF NOT EXISTS attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE attendance_db;

-- 1. Users Table (Role-based authentication)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    role ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL UNIQUE,
    user_id BIGINT UNIQUE,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(80) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teacher_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roll_number VARCHAR(30) NOT NULL UNIQUE,
    user_id BIGINT UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    phone VARCHAR(25),
    parent_phone VARCHAR(25),
    attendance_percentage DECIMAL(5,2) DEFAULT 100.00,
    total_classes_held INT DEFAULT 0,
    total_classes_attended INT DEFAULT 0,
    risk_status ENUM('GOOD', 'WARNING', 'AT_RISK') DEFAULT 'GOOD',
    warning_alert_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_dept_sem (department, semester),
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    teacher_id BIGINT,
    total_planned_classes INT DEFAULT 36,
    conducted_classes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subject_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED') NOT NULL,
    marked_by_teacher_id VARCHAR(50),
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_student_sub_date (student_id, subject_id, attendance_date),
    INDEX idx_att_date (attendance_date),
    INDEX idx_att_student (student_id),
    CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =================================================================
-- ESSENTIAL PRODUCTION ANALYTICAL QUERIES
-- =================================================================

-- Query 1: Calculate Real-time Overall Attendance Percentage for a Student
SELECT 
    s.id AS student_id,
    s.roll_number,
    s.name,
    COUNT(a.id) AS total_classes_held,
    SUM(CASE WHEN a.status IN ('PRESENT', 'EXCUSED') THEN 1 WHEN a.status = 'LATE' THEN 0.75 ELSE 0 END) AS attended_classes,
    ROUND((SUM(CASE WHEN a.status IN ('PRESENT', 'EXCUSED') THEN 1 WHEN a.status = 'LATE' THEN 0.75 ELSE 0 END) / COUNT(a.id)) * 100, 2) AS calculated_percentage
FROM students s
LEFT JOIN attendance a ON s.id = a.student_id
WHERE s.id = 1
GROUP BY s.id, s.roll_number, s.name;

-- Query 2: Identify High-Risk Students with Attendance Under 75%
SELECT 
    s.roll_number,
    s.name,
    s.department,
    s.attendance_percentage,
    s.risk_status,
    s.parent_phone
FROM students s
WHERE s.attendance_percentage < 75.00
ORDER BY s.attendance_percentage ASC;

-- Query 3: Monthly Attendance Aggregation Report
SELECT 
    DATE_FORMAT(a.attendance_date, '%Y-%m') AS month_year,
    COUNT(a.id) AS total_records,
    SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) AS total_present,
    ROUND((SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 1) AS monthly_attendance_rate
FROM attendance a
GROUP BY DATE_FORMAT(a.attendance_date, '%Y-%m')
ORDER BY month_year DESC;
`;

export const REST_API_SPECS = [
  {
    method: 'POST',
    endpoint: '/api/auth/login',
    role: 'Public',
    description: 'Authenticates student or teacher; generates signed JWT token',
    payload: '{"username": "dr.sarah", "password": "..."}'
  },
  {
    method: 'GET',
    endpoint: '/api/students',
    role: 'Teacher / Admin',
    description: 'Retrieves all enrolled students with attendance rates & risk status',
    payload: 'Returns List<StudentDto>'
  },
  {
    method: 'GET',
    endpoint: '/api/students/at-risk',
    role: 'Teacher / Admin',
    description: 'Filters students currently below mandatory 75% cutoff',
    payload: 'Returns List<StudentDto> sorted by deficit'
  },
  {
    method: 'POST',
    endpoint: '/api/students',
    role: 'Teacher / Admin',
    description: 'Registers new student with roll number, year, department',
    payload: '{"rollNumber": "23CS115", "name": "...", ...}'
  },
  {
    method: 'POST',
    endpoint: '/api/attendance/mark',
    role: 'Teacher / Admin',
    description: 'Marks batch roll call for selected date, subject, and student statuses',
    payload: '{"date": "2026-09-20", "subjectId": 1, "records": [...]}'
  },
  {
    method: 'PUT',
    endpoint: '/api/attendance/{id}',
    role: 'Teacher / Admin',
    description: 'Updates past attendance record with status change & medical excuse log',
    payload: '{"status": "EXCUSED", "remarks": "Medical note"}'
  },
  {
    method: 'GET',
    endpoint: '/api/attendance/student/{id}',
    role: 'Student / Teacher',
    description: 'Retrieves complete attendance history logs for a specific student',
    payload: 'Returns List<AttendanceRecordDto>'
  },
  {
    method: 'GET',
    endpoint: '/api/prediction/student/{id}',
    role: 'Student / Teacher',
    description: 'AI Risk Engine: predicts final semester standing & remedial class count',
    payload: 'Returns PredictionResponseDto (slope, forecast %, required classes)'
  },
  {
    method: 'POST',
    endpoint: '/api/prediction/simulate',
    role: 'Student / Teacher',
    description: 'What-If Simulation: projects final standing given hypothetical future classes',
    payload: '{"studentId": 1, "futureAttend": 10, "futureMiss": 2}'
  },
  {
    method: 'GET',
    endpoint: '/api/reports/daily?date=YYYY-MM-DD',
    role: 'Teacher / Admin',
    description: 'Generates daily attendance register breakdown by subject and status',
    payload: 'Returns DailyReportSummaryDto'
  },
  {
    method: 'GET',
    endpoint: '/api/reports/monthly',
    role: 'Teacher / Admin',
    description: 'Generates monthly trend aggregates and department comparisons',
    payload: 'Returns MonthlyReportDto'
  }
];

export const SETUP_INSTRUCTIONS = `# AI-Based College Attendance Monitoring & Prediction System
## Production Setup & Deployment Instructions

### Prerequisites
1. Java Development Kit (JDK 17 or higher)
2. Apache Maven 3.8+
3. MySQL Server 8.0+
4. Node.js 18+ & npm

---

### Step 1: Database Setup
1. Log into your MySQL console:
   mysql -u root -p

2. Run the database schema initialization:
   CREATE DATABASE attendance_db;
   USE attendance_db;
   SOURCE schema.sql;

---

### Step 2: Spring Boot Backend
1. Open backend-spring-boot/src/main/resources/application.properties:
   spring.datasource.url=jdbc:mysql://localhost:3306/attendance_db
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD

2. Build and run the Spring Boot application:
   cd backend-spring-boot
   ./mvnw clean install
   ./mvnw spring-boot:run

3. Verify server status:
   curl http://localhost:8080/api/health

---

### Step 3: React.js Frontend
1. In the project root directory, start the Vite development server:
   npm install
   npm run dev

2. Access the application in your browser:
   http://localhost:3000

---

### Default Credentials
- Teacher / Admin: dr.sarah | faculty@2026
- Student (At Risk): arjun.sharma | student@2026
- Student (Good): priya.patel | student@2026
`;
