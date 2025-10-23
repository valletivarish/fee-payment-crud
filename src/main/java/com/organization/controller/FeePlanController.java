package com.organization.controller;

import com.organization.entity.FeePlan;
import com.organization.service.FeePlanService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fee-plans")
public class FeePlanController {

    private final FeePlanService feePlanService;

    public FeePlanController(FeePlanService feePlanService) {
        this.feePlanService = feePlanService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public FeePlan create(@RequestBody FeePlan feePlan) {
        return feePlanService.create(feePlan);
    }

    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    @GetMapping
    public List<FeePlan> list(@RequestParam(required = false) String course,
                                @RequestParam(required = false) String academicYear) {
        return feePlanService.list(course, academicYear);
    }

    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    @GetMapping("/{id}")
    public FeePlan get(@PathVariable String id) {
        return feePlanService.get(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public FeePlan update(@PathVariable String id, @RequestBody FeePlan feePlan) {
        return feePlanService.update(id, feePlan);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        feePlanService.delete(id);
    }
}
