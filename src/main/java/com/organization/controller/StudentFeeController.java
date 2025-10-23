package com.organization.controller;

import com.organization.entity.StudentFee;
import com.organization.service.StudentFeeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/student-fees")
public class StudentFeeController {

    private final StudentFeeService studentFeeService;

    public StudentFeeController(StudentFeeService studentFeeService) {
        this.studentFeeService = studentFeeService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/assign")
    public StudentFee assign(@RequestParam String studentId,
                             @RequestParam String feePlanId,
                             @RequestParam Instant dueDate) {
        return studentFeeService.assign(studentId, feePlanId, dueDate);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<StudentFee> listAll() {
        return studentFeeService.listAll();
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me")
    public List<StudentFee> myFees(Principal principal) {
        String studentId = principal.getName();
        return studentFeeService.listMine(studentId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/due-date")
    public StudentFee updateDueDate(@PathVariable String id, @RequestParam Instant dueDate) {
        return studentFeeService.updateDueDate(id, dueDate);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteIfNoPayments(@PathVariable String id) {
        studentFeeService.deleteIfNoPayments(id);
    }
}
