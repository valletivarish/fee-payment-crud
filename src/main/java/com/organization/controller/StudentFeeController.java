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
@CrossOrigin(origins = "http://localhost:5173")
public class StudentFeeController {

    private final StudentFeeService studentFeeService;

    public StudentFeeController(StudentFeeService studentFeeService) {
        this.studentFeeService = studentFeeService;
    }

    @PostMapping("/assign")
    public StudentFee assign(@RequestParam String studentId,
                             @RequestParam String feePlanId,
                             @RequestParam Instant dueDate) {
        return studentFeeService.assign(studentId, feePlanId, dueDate);
    }

    @GetMapping
    public List<StudentFee> listAll() {
        return studentFeeService.listAll();
    }

    @GetMapping("/me")
    public List<StudentFee> myFees(@RequestParam String studentId) {
        return studentFeeService.listMine(studentId);
    }

    @PatchMapping("/{id}/due-date")
    public StudentFee updateDueDate(@PathVariable String id, @RequestParam Instant dueDate) {
        return studentFeeService.updateDueDate(id, dueDate);
    }

    @DeleteMapping("/{id}")
    public void deleteIfNoPayments(@PathVariable String id) {
        studentFeeService.deleteIfNoPayments(id);
    }
}
