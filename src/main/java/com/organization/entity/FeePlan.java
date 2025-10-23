package com.organization.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Document(collection = "fee_plans")
@CompoundIndexes({
        @CompoundIndex(name = "course_year_unique", def = "{'course':1,'academicYear':1}", unique = true)
})
public class FeePlan {

    @Id
    private String id;

    @Indexed
    private String course;

    @Indexed
    private String academicYear;

    private BigDecimal tuition = BigDecimal.ZERO;
    private BigDecimal hostel = BigDecimal.ZERO;
    private BigDecimal library = BigDecimal.ZERO;
    private BigDecimal lab = BigDecimal.ZERO;
    private BigDecimal sports = BigDecimal.ZERO;

    public FeePlan() {}

    public FeePlan(String id, String course, String academicYear, BigDecimal tuition, BigDecimal hostel, BigDecimal library, BigDecimal lab, BigDecimal sports) {
        this.id = id;
        this.course = course;
        this.academicYear = academicYear;
        this.tuition = tuition;
        this.hostel = hostel;
        this.library = library;
        this.lab = lab;
        this.sports = sports;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public BigDecimal getTuition() {
        return tuition;
    }

    public void setTuition(BigDecimal tuition) {
        this.tuition = tuition;
    }

    public BigDecimal getHostel() {
        return hostel;
    }

    public void setHostel(BigDecimal hostel) {
        this.hostel = hostel;
    }

    public BigDecimal getLibrary() {
        return library;
    }

    public void setLibrary(BigDecimal library) {
        this.library = library;
    }

    public BigDecimal getLab() {
        return lab;
    }

    public void setLab(BigDecimal lab) {
        this.lab = lab;
    }

    public BigDecimal getSports() {
        return sports;
    }

    public void setSports(BigDecimal sports) {
        this.sports = sports;
    }

    public BigDecimal getTotal() {
        return tuition.add(hostel).add(library).add(lab).add(sports);
    }

    @Override
    public String toString() {
        return "FeePlan{" +
                "id='" + id + '\'' +
                ", course='" + course + '\'' +
                ", academicYear='" + academicYear + '\'' +
                ", tuition=" + tuition +
                ", hostel=" + hostel +
                ", library=" + library +
                ", lab=" + lab +
                ", sports=" + sports +
                '}';
    }
}
