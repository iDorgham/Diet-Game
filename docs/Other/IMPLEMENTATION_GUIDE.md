# Diet Planner Game - SDD Implementation Guide

## Quick Start with Cursor SDD

### 1. Setup Cursor for SDD (5 minutes)

1. **Open Cursor** and navigate to your project
2. **Pin the `docs/` folder** in the Explorer for quick access
3. **Enable Composer** (Cmd/Ctrl + I) for code generation
4. **Configure API key** in Settings → Cursor → API

### 2. Basic SDD Workflow (10 minutes)

#### Step 1: Read the Spec
```
Open: docs/specs/homepage.md
Review: EARS requirements and technical specs
```

#### Step 2: Generate with Context
```
Select: docs/specs/homepage.md content
Press: Cmd/Ctrl + I (Composer)
Prompt: "Using docs/specs/homepage.md and docs/architecture/high-level-diagram.mmd, generate the HomePage component with all specified features. Use the oceanic color palette (#085492 primary, #71E6DE mint) and implement the XP system from docs/gamification/xp-system.md."
```

#### Step 3: Test and Refine
```
Run: npm run dev
Test: Component functionality
Refine: Use Sidebar Chat for improvements
```

### 3. Advanced SDD Patterns

#### Context-Rich Prompting
Always include full context in your prompts:
```
"Using docs/architecture/data-flow.md sequence #2, docs/specs/homepage.md EARS-003, and docs/ui-components/header.md, generate a task completion component that updates XP in real-time with Firestore integration."
```

#### Spec-Driven Refactoring
```
"Refactor the current HomePage to match docs/specs/homepage.md EARS-005 for real-time updates, following the data flow patterns in docs/architecture/data-flow.md."
```

#### Component Generation
```
"Generate MetricCard component following docs/ui-components/metric-cards.md with TypeScript interfaces, Tailwind styling using oceanic palette, and accessibility features."
```

## Implementation Levels

### Level 101: Basic Components (30 minutes)

**Goal**: Generate core components from specs

**Tasks**:
1. Generate HomePage from `docs/specs/homepage.md`
2. Create Header component from `docs/ui-components/header.md`
3. Implement XP system from `docs/gamification/xp-system.md`
4. Add basic navigation

**Cursor Commands**:
```bash
# Generate HomePage
"Using docs/specs/homepage.md, generate HomePage.tsx with dashboard metrics, news ticker, and task list"

# Generate Header
"Using docs/ui-components/header.md, generate Header component with status panel and user menu"

# Generate XP System
"Using docs/gamification/xp-system.md, implement XP calculation and leveling logic"
```

### Level 202: Integration & Testing (45 minutes)

**Goal**: Add Firebase integration and testing

**Tasks**:
1. Implement Firestore real-time updates
2. Add task completion flow
3. Create test suite
4. Add error handling

**Cursor Commands**:
```bash
# Firebase Integration
"Using docs/architecture/data-flow.md sequence #2, implement Firestore integration for task completion with real-time XP updates"

# Testing
"Generate Jest tests for HomePage component following the testing requirements in docs/specs/homepage.md"

# Error Handling
"Add error boundaries and retry logic following docs/architecture/data-flow.md error handling patterns"
```

### Level 303: Advanced Features (60 minutes)

**Goal**: Add advanced gamification and performance

**Tasks**:
1. Implement star milestone system
2. Add reward notifications
3. Optimize performance
4. Add accessibility features

**Cursor Commands**:
```bash
# Star System
"Implement star milestone system from docs/gamification/xp-system.md with visual animations"

# Performance
"Optimize HomePage component following performance requirements in docs/specs/homepage.md"

# Accessibility
"Add accessibility features following docs/ui-components/header.md accessibility requirements"
```

### Level 404: Production Ready (30 minutes)

**Goal**: Production deployment and monitoring

**Tasks**:
1. Add analytics tracking
2. Implement offline support
3. Add performance monitoring
4. Create deployment pipeline

**Cursor Commands**:
```bash
# Analytics
"Add analytics tracking for XP events and user interactions"

# Offline Support
"Implement offline task completion queue following docs/architecture/data-flow.md offline patterns"

# Deployment
"Create production build configuration and deployment pipeline"
```

## Cursor AI Best Practices

### 1. Always Include Context
```
❌ Bad: "Generate a task component"
✅ Good: "Using docs/specs/homepage.md EARS-003 and docs/architecture/data-flow.md sequence #2, generate a task completion component with XP rewards"
```

### 2. Reference Specific Files
```
❌ Bad: "Use the color scheme"
✅ Good: "Use the oceanic color palette from docs/README.md: #085492 primary, #71E6DE mint"
```

### 3. Chain Prompts
```
1. "Generate HomePage component from docs/specs/homepage.md"
2. "Integrate XP system from docs/gamification/xp-system.md into the HomePage"
3. "Add real-time updates following docs/architecture/data-flow.md"
```

### 4. Test After Generation
```
1. Generate component
2. Run `npm run dev`
3. Test functionality
4. Use Sidebar Chat for refinements
```

## Troubleshooting

### Common Issues

**Issue**: Generated code doesn't match specs
**Solution**: Include more specific context from spec files

**Issue**: Styling doesn't match design
**Solution**: Reference color palette and Tailwind classes from docs

**Issue**: Firebase integration not working
**Solution**: Follow data flow patterns in docs/architecture/data-flow.md

### Debug Commands
```bash
# Check spec compliance
"Review generated code against docs/specs/homepage.md requirements"

# Fix styling
"Update component to use oceanic color palette from docs/README.md"

# Debug Firebase
"Check Firestore integration against docs/architecture/data-flow.md patterns"
```

## Success Metrics

### Level 101 Complete When:
- ✅ HomePage renders with all 4 metric cards
- ✅ Header shows status panel and navigation
- ✅ XP system calculates levels correctly
- ✅ Basic navigation works

### Level 202 Complete When:
- ✅ Real-time Firestore updates work
- ✅ Task completion awards XP
- ✅ Tests pass
- ✅ Error handling works

### Level 303 Complete When:
- ✅ Star milestones display correctly
- ✅ Performance is optimized
- ✅ Accessibility features work
- ✅ Animations are smooth

### Level 404 Complete When:
- ✅ Analytics tracking works
- ✅ Offline support functions
- ✅ Production build succeeds
- ✅ Deployment pipeline works

## Next Steps

1. **Start with Level 101** - Generate basic components
2. **Test thoroughly** - Ensure each component works
3. **Iterate quickly** - Use Cursor for rapid refinements
4. **Scale systematically** - Follow the level progression
5. **Document changes** - Update specs as you evolve

---

**Remember**: SDD is about specs driving development. Always start with the documentation, use Cursor AI with full context, and test continuously. The specs are your source of truth!
