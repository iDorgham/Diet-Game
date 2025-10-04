# EVAIA Development Rules

## Spec-Driven Development (MANDATORY)
- **ALL** features must follow spec-driven development using Kiro methodology
- Create specifications before any implementation begins
- Use EARS notation for all requirements
- Follow three-phase workflow: Requirements → Design → Implementation
- Store specifications in `.cursor/.specify/specs/`
- Use `/spec-driven-dev` command for all specification management

## Code Standards
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write comprehensive unit tests for all functions
- Use meaningful variable and function names
- Add JSDoc comments for all public APIs
- Generate code from specifications, not assumptions

## Git Workflow
- Use conventional commits (feat:, fix:, docs:, etc.)
- Create feature branches from main
- Require code review for all PRs
- Keep commits atomic and focused

## Architecture Principles
- Follow clean architecture patterns
- Separate concerns (UI, business logic, data access)
- Use dependency injection where appropriate
- Implement proper error handling
- Design based on specifications, not assumptions
- Document all architectural decisions in design.md

## Performance Guidelines
- Optimize for bundle size
- Use lazy loading for large components
- Implement proper caching strategies
- Monitor and profile performance regularly

## Security
- Validate all user inputs
- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Regular security audits and dependency updates
- Document security requirements in specifications
- Include security testing in all feature specifications

## Specification Compliance
- All code must be generated from approved specifications
- No implementation without corresponding specification
- Regular validation of code against specifications
- Update specifications when requirements change
- Maintain traceability between specs and implementation
