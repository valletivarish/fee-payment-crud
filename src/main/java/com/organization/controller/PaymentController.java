package com.organization.controller;

import com.organization.entity.Payment;
import com.organization.service.PaymentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.time.Instant;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public Payment create(@RequestParam String studentFeeId,
                          @RequestParam Payment.Method method,
                          @RequestParam BigDecimal amount) {
        String payerUserId = "anonymous"; // For demo purposes
        return paymentService.create(payerUserId, studentFeeId, method, amount);
    }

    @GetMapping
    public List<Payment> listAll(@RequestParam(required = false) Payment.Method method,
                                   @RequestParam(required = false) Instant from,
                                   @RequestParam(required = false) Instant to) {
        return paymentService.list(method, from, to);
    }

    @GetMapping("/student-fee/{studentFeeId}")
    public List<Payment> byStudentFee(@PathVariable String studentFeeId) {
        return paymentService.listByStudentFee(studentFeeId);
    }

    @GetMapping("/{id}")
    public Payment get(@PathVariable String id) {
        return paymentService.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        paymentService.deleteByIdAndRollbackStudentFee(id);
    }
}
