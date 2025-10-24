package com.organization.service;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.organization.entity.Student;
import com.organization.exception.StudentApiException;
import com.organization.exception.StudentNotFoundException;
import com.organization.repository.StudentRepository;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

	@Autowired
	private StudentRepository repository;

	@Override
	public List<Student> findAll() {
		return repository.findAll();
	}

	@Override
	public Student findById(String id) {
		Optional<Student> optional = repository.findById(id);
		if(optional.isPresent()) {
			return optional.get();
		}
		throw new StudentApiException(HttpStatus.NOT_FOUND, "Student with id was not found"+id);
		
	}

	@Transactional
	@Override
	public Student save(Student student) {
		return repository.save(student);
	}

	@Transactional
	@Override
	public void deleteById(String id) {
		repository.deleteById(id);

	}

	@Override
	public List<Student> saveAll(List<Student> studentList) {
		return repository.saveAll(studentList);
	}

}
