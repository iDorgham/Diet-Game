// Simple test to verify test setup is working
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('Test Setup', () => {
  it('should have vitest working', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have React available', () => {
    expect(React).toBeDefined();
  });

  it('should have vi available', () => {
    expect(vi).toBeDefined();
  });
});
