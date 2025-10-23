package com.organization.service;

import com.organization.entity.Payment;
import com.organization.entity.StudentFee;
import com.organization.repository.PaymentRepository;
import com.organization.repository.StudentFeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);
    
    private final PaymentRepository paymentRepository;
    private final StudentFeeRepository studentFeeRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              StudentFeeRepository studentFeeRepository) {
        this.paymentRepository = paymentRepository;
        this.studentFeeRepository = studentFeeRepository;
    }

    @Override
    public Payment create(String payerUserId, String studentFeeId, Payment.Method method, BigDecimal amount) {
        StudentFee sf = studentFeeRepository.findById(studentFeeId).orElseThrow();

        Payment p = new Payment();
        p.setStudentFeeId(studentFeeId);
        p.setPayerUserId(payerUserId);
        p.setMethod(method);
        p.setAmount(amount);
        p.setPaidAt(Instant.now());
        paymentRepository.save(p);

        sf.setAmountPaid(sf.getAmountPaid().add(amount));
        if (sf.getAmountPaid().compareTo(sf.getAmountAssigned()) >= 0) {
            sf.setStatus(StudentFee.Status.PAID);
        } else if (sf.getAmountPaid().signum() > 0) {
            sf.setStatus(StudentFee.Status.PARTIAL);
        }
        studentFeeRepository.save(sf);

        return p;
    }

    @Override
    public List<Payment> listAll() {
        return paymentRepository.findAll();
    }

    @Override
    public List<Payment> listByStudentFee(String studentFeeId) {
        return paymentRepository.findByStudentFeeId(studentFeeId);
    }

    @Override
    public void deleteById(String id) {
        paymentRepository.deleteById(id);
    }

    @Override
    public void deleteByIdAndRollbackStudentFee(String id) {
        logger.info("Deleting payment with id: {}", id);
        Payment payment = paymentRepository.findById(id).orElseThrow();
        logger.debug("Found payment: {}", payment);
        StudentFee studentFee = studentFeeRepository.findById(payment.getStudentFeeId()).orElseThrow();
        logger.debug("Found student fee before update: {}", studentFee);

        studentFee.setAmountPaid(studentFee.getAmountPaid().subtract(payment.getAmount()));
        if (studentFee.getAmountPaid().compareTo(BigDecimal.ZERO) <= 0) {
            studentFee.setStatus(StudentFee.Status.PENDING);
        } else {
            studentFee.setStatus(StudentFee.Status.PARTIAL);
        }
        studentFeeRepository.save(studentFee);
        logger.debug("Updated student fee: {}", studentFee);

        paymentRepository.deleteById(id);
        logger.info("Payment deleted successfully");
    }

    @Override
    public Payment getById(String id) {
        return paymentRepository.findById(id).orElseThrow();
    }

    @Override
    public List<Payment> list(Payment.Method method, Instant from, Instant to) {
        if (method != null && from != null && to != null) {
            return paymentRepository.findByMethodAndPaidAtBetween(method, from, to);
        } else if (method != null) {
            return paymentRepository.findByMethod(method);
        } else if (from != null && to != null) {
            return paymentRepository.findByPaidAtBetween(from, to);
        } else {
            return paymentRepository.findAll();
        }
    }
}
