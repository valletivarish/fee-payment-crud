package com.organization.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    @Indexed
    private String studentFeeId;

    @Indexed
    private String payerUserId;

    @Indexed
    private Method method;

    @Indexed
    private BigDecimal amount;

    @Indexed
    private Instant paidAt = Instant.now();

    private String referenceNo;
    private String notes;

    public enum Method { CASH, CARD, UPI, NET_BANKING, OTHER }

    public Payment() {}

    public Payment(String id, String studentFeeId, String payerUserId, Method method, BigDecimal amount, Instant paidAt, String referenceNo, String notes) {
        this.id = id;
        this.studentFeeId = studentFeeId;
        this.payerUserId = payerUserId;
        this.method = method;
        this.amount = amount;
        this.paidAt = paidAt;
        this.referenceNo = referenceNo;
        this.notes = notes;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentFeeId() {
        return studentFeeId;
    }

    public void setStudentFeeId(String studentFeeId) {
        this.studentFeeId = studentFeeId;
    }

    public String getPayerUserId() {
        return payerUserId;
    }

    public void setPayerUserId(String payerUserId) {
        this.payerUserId = payerUserId;
    }

    public Method getMethod() {
        return method;
    }

    public void setMethod(Method method) {
        this.method = method;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }

    public String getReferenceNo() {
        return referenceNo;
    }

    public void setReferenceNo(String referenceNo) {
        this.referenceNo = referenceNo;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public String toString() {
        return "Payment{" +
                "id='" + id + '\'' +
                ", studentFeeId='" + studentFeeId + '\'' +
                ", payerUserId='" + payerUserId + '\'' +
                ", method=" + method +
                ", amount=" + amount +
                ", paidAt=" + paidAt +
                ", referenceNo='" + referenceNo + '\'' +
                ", notes='" + notes + '\'' +
                '}';
    }
}
