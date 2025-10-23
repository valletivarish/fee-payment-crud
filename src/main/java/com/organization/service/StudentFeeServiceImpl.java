package com.organization.service;

import com.organization.entity.FeePlan;
import com.organization.entity.Payment;
import com.organization.entity.StudentFee;
import com.organization.repository.FeePlanRepository;
import com.organization.repository.PaymentRepository;
import com.organization.repository.StudentFeeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class StudentFeeServiceImpl implements StudentFeeService {

    private final StudentFeeRepository studentFeeRepository;
    private final FeePlanRepository feePlanRepository;
    private final PaymentRepository paymentRepository;

    public StudentFeeServiceImpl(StudentFeeRepository studentFeeRepository,
                                 FeePlanRepository feePlanRepository,
                                 PaymentRepository paymentRepository) {
        this.studentFeeRepository = studentFeeRepository;
        this.feePlanRepository = feePlanRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    public StudentFee assign(String studentId, String feePlanId, Instant dueDate) {
        FeePlan plan = feePlanRepository.findById(feePlanId).orElseThrow();
        StudentFee sf = new StudentFee();
        sf.setStudentId(studentId);
        sf.setFeePlanId(plan.getId());
        sf.setCourse(plan.getCourse());
        sf.setAcademicYear(plan.getAcademicYear());
        sf.setTuition(plan.getTuition());
        sf.setHostel(plan.getHostel());
        sf.setLibrary(plan.getLibrary());
        sf.setLab(plan.getLab());
        sf.setSports(plan.getSports());
        sf.setAmountAssigned(plan.getTotal());
        sf.setAmountPaid(BigDecimal.ZERO);
        sf.setStatus(StudentFee.Status.PENDING);
        sf.setAssignedAt(Instant.now());
        sf.setDueDate(dueDate);
        return studentFeeRepository.save(sf);
    }

    @Override
    public List<StudentFee> listAll() {
        return studentFeeRepository.findAll();
    }

    @Override
    public List<StudentFee> listMine(String studentId) {
        return studentFeeRepository.findByStudentId(studentId);
    }

    @Override
    public StudentFee updateDueDate(String id, Instant dueDate) {
        StudentFee sf = studentFeeRepository.findById(id).orElseThrow();
        sf.setDueDate(dueDate);
        return studentFeeRepository.save(sf);
    }

    @Override
    public void deleteIfNoPayments(String id) {
        List<Payment> payments = paymentRepository.findByStudentFeeId(id);
        if (!payments.isEmpty()) {
            paymentRepository.deleteAll(payments);
        }
        studentFeeRepository.deleteById(id);
    }
}
