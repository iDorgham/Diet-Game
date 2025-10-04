# Kiro Methodology Rules

## Overview
This project implements the Kiro specification methodology for structured development. Kiro provides a systematic approach to transform high-level ideas into detailed implementation plans with clear tracking and accountability.

## Kiro Workflow Phases

### Phase 1: Requirements Definition
**Purpose**: Capture user stories and acceptance criteria in structured EARS notation

**Rules**:
- All requirements MUST use EARS (Easy Approach to Requirements Syntax) notation
- Format: `WHEN [condition/event] THE SYSTEM SHALL [expected behavior]`
- Include both functional and non-functional requirements
- Define clear acceptance criteria for each requirement
- Consider edge cases and error conditions

**Example**:
```
WHEN a user attempts to authenticate with invalid credentials
THE SYSTEM SHALL return a 401 Unauthorized response with error details
AND log the failed attempt for security monitoring
```

### Phase 2: Design Documentation
**Purpose**: Document technical architecture, sequence diagrams, and implementation considerations

**Rules**:
- Create sequence diagrams for complex interactions
- Document API endpoints with complete schemas
- Define database relationships and constraints
- Specify integration points with external services
- Include security considerations and authentication flows
- Document performance and scalability requirements

**Required Elements**:
- System architecture diagrams
- API endpoint specifications
- Database schema definitions
- Integration flow diagrams
- Security and authentication flows
- Performance benchmarks and SLAs

### Phase 3: Implementation Planning
**Purpose**: Break down work into discrete, trackable tasks with clear descriptions and outcomes

**Rules**:
- Each task must be atomic and independently testable
- Tasks must have clear acceptance criteria
- Include dependencies and prerequisites
- Estimate effort and complexity
- Define testing requirements for each task
- Include documentation and deployment tasks

**Task Structure**:
```
## Task 1.1: Implement User Authentication Endpoint
**Description**: Create POST /auth/login endpoint with JWT token generation
**Acceptance Criteria**:
- Endpoint accepts email/password credentials
- Validates credentials against database
- Returns JWT token on success
- Returns 401 error on invalid credentials
- Includes rate limiting and security headers
**Dependencies**: Database schema, JWT service
**Estimated Effort**: 4 hours
**Testing**: Unit tests, integration tests, security tests
```

## Kiro File Structure

### Standard Kiro Files
Every specification must include these three core files:

1. **requirements.md** - EARS notation requirements
2. **design.md** - Technical architecture and diagrams
3. **tasks.md** - Implementation task breakdown

### Evaia-Specific Extensions
Additional files for Evaia project context:

4. **api-endpoints.md** - REST API specifications
5. **database-schema.md** - Prisma schema definitions
6. **ai-integration.md** - AI service integration specs
7. **workflow-automation.md** - Business logic workflows

## EARS Notation Standards

### Basic Structure
```
WHEN [trigger condition]
THE SYSTEM SHALL [primary behavior]
[AND/OR additional behaviors]
```

### Advanced Patterns
```
WHEN [condition] AND [condition]
THE SYSTEM SHALL [behavior]
UNLESS [exception condition]
IN WHICH CASE THE SYSTEM SHALL [alternative behavior]
```

### Quality Requirements
```
THE SYSTEM SHALL [behavior]
WITHIN [time constraint]
WITH [performance metric]
```

### Examples for Evaia
```
WHEN a user submits a workflow for execution
THE SYSTEM SHALL validate the workflow definition
AND queue the workflow for processing
AND return a workflow execution ID
AND notify the user of successful submission

WHEN an AI service request exceeds 30 seconds
THE SYSTEM SHALL timeout the request
AND return a 504 Gateway Timeout error
AND log the timeout for monitoring
AND attempt to retry with exponential backoff
```

## Kiro Integration Commands

### Specification Creation
```bash
# Create new Kiro specification
/specify [feature-name] [type] --kiro

# Generate from existing requirements
/specify [feature] --from-requirements [file]

# Import from external system
/specify [feature] --import [source]
```

### Specification Management
```bash
# Update requirements
/update-requirements [spec-path]

# Refine design
/refine-design [spec-path]

# Update tasks
/update-tasks [spec-path]

# Check completion status
/check-spec-status [spec-path]
```

### Implementation Execution
```bash
# Execute all tasks
/execute-all-tasks [spec-path]

# Execute specific task
/execute-task [spec-path] [task-id]

# Check task completion
/check-task-completion [spec-path] [task-id]
```

## Kiro Best Practices

### 1. Requirements Writing
- Use clear, unambiguous language
- Avoid technical jargon in user-facing requirements
- Include both positive and negative scenarios
- Consider internationalization and accessibility
- Define data validation rules explicitly

### 2. Design Documentation
- Use standard diagramming tools (Mermaid, PlantUML)
- Include both high-level and detailed views
- Document all external dependencies
- Specify error handling and recovery mechanisms
- Include monitoring and observability requirements

### 3. Task Management
- Keep tasks small and focused (1-4 hours each)
- Include both implementation and testing tasks
- Define clear success criteria
- Include code review and documentation tasks
- Plan for integration and deployment

### 4. Iteration and Refinement
- Update specifications as requirements evolve
- Refine design based on implementation feedback
- Adjust tasks based on actual effort
- Learn from completed implementations
- Improve templates and processes

## Kiro Quality Gates

### Requirements Phase
- [ ] All requirements use EARS notation
- [ ] Requirements are clear and testable
- [ ] Edge cases and error conditions are covered
- [ ] Non-functional requirements are specified
- [ ] Requirements are reviewed and approved

### Design Phase
- [ ] Architecture diagrams are complete
- [ ] API specifications are detailed
- [ ] Database schema is defined
- [ ] Integration points are documented
- [ ] Security considerations are addressed
- [ ] Performance requirements are specified

### Implementation Phase
- [ ] Tasks are atomic and testable
- [ ] Dependencies are identified
- [ ] Effort estimates are realistic
- [ ] Testing requirements are included
- [ ] Documentation tasks are planned

## Kiro Workflow Integration

### With Existing Evaia Commands
```bash
# 1. Create Kiro specification
/specify user-auth functional --kiro

# 2. Review and validate
/validate-spec .cursor/.specify/specs/user-auth/

# 3. Start implementation
/continue 1.1

# 4. Generate code from spec
/generate api --spec .cursor/.specify/specs/user-auth/

# 5. Execute tasks
/execute-task .cursor/.specify/specs/user-auth/ 1.1

# 6. Test implementation
/test --spec .cursor/.specify/specs/user-auth/

# 7. Validate completion
/validate-spec .cursor/.specify/specs/user-auth/
```

### With Development Workflow
```bash
# Feature development with Kiro
/specify [feature] functional --kiro
/validate-spec
/continue 1.1
/generate api --spec [spec-path]
/execute-all-tasks [spec-path]
/test --spec [spec-path]
/deploy --spec [spec-path]
```

## Kiro Monitoring and Metrics

### Specification Quality Metrics
- Requirements coverage (functional vs non-functional)
- EARS notation compliance rate
- Design completeness score
- Task estimation accuracy

### Implementation Quality Metrics
- Task completion rate
- Code-to-spec compliance
- Test coverage against requirements
- Defect rate by specification phase

### Process Efficiency Metrics
- Time from spec to implementation
- Rework rate and causes
- Team collaboration effectiveness
- Specification maintenance overhead

## Kiro Tools and Automation

### Required Tools
- Mermaid for sequence diagrams
- PlantUML for architecture diagrams
- EARS notation validator
- Task tracking system
- Specification template engine

### Automation Scripts
- Auto-generate API documentation from specs
- Validate EARS notation compliance
- Generate test cases from requirements
- Track task completion status
- Generate progress reports

## Kiro Team Collaboration

### Specification Sharing
- Store specs in version control
- Use Git for spec collaboration
- Implement spec review process
- Maintain spec change history
- Share specs across teams via Git submodules

### Cross-Team Coordination
- Create central specs repository
- Use Git submodules for shared specs
- Implement cross-repository workflows
- Establish spec governance process
- Regular spec review meetings

## Kiro Success Criteria

### Individual Feature Success
- All requirements implemented and tested
- Design matches implementation
- Tasks completed on time and within estimate
- Documentation is complete and accurate
- No critical defects in production

### Process Success
- Reduced development iterations
- Improved code quality and maintainability
- Better team collaboration and communication
- Faster time-to-market for features
- Higher customer satisfaction

---

**Remember**: Kiro methodology is about structured thinking and systematic execution. Every feature should follow the three-phase workflow: Requirements → Design → Implementation. Quality gates ensure each phase is complete before proceeding to the next.
