/**
 * Debounced Search Input Component
 * Based on RECOMMENDATIONS_PERFORMANCE_OPTIMIZATION.md
 * Implements debouncing for search and filter operations
 */

import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash/debounce';
import { throttle } from 'lodash/throttle';

// Styled components
const SearchContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
}));

const FilterChips = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const FilterMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    minWidth: 300,
    maxHeight: 400,
  },
}));

/**
 * Debounced Search Input with advanced filtering
 */
const DebouncedSearchInput = memo(({
  onSearch,
  onFilterChange,
  placeholder = "Search recommendations...",
  debounceMs = 300,
  throttleMs = 100,
  filters = {},
  availableFilters = [],
  showAdvancedFilters = true,
  loading = false,
  suggestions = [],
  onSuggestionSelect,
  clearable = true,
  autoFocus = false,
  size = "medium",
  variant = "outlined",
  fullWidth = true,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState(filters);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const debouncedSearchRef = useRef(null);
  const throttledSearchRef = useRef(null);

  // Create debounced search function
  const debouncedSearch = useMemo(() => {
    return debounce((value, filters) => {
      onSearch?.(value, filters);
    }, debounceMs);
  }, [onSearch, debounceMs]);

  // Create throttled search function for real-time feedback
  const throttledSearch = useMemo(() => {
    return throttle((value, filters) => {
      onSearch?.(value, filters);
    }, throttleMs);
  }, [onSearch, throttleMs]);

  // Handle search input change
  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchValue(value);
    
    // Show suggestions if there are any
    if (suggestions.length > 0 && value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    // Use debounced search for performance
    debouncedSearch(value, activeFilters);
  }, [debouncedSearch, activeFilters, suggestions.length]);

  // Handle filter change
  const handleFilterChange = useCallback((filterKey, value) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    setActiveFilters(newFilters);
    
    // Trigger search with new filters
    debouncedSearch(searchValue, newFilters);
    
    // Notify parent component
    onFilterChange?.(newFilters);
  }, [activeFilters, searchValue, debouncedSearch, onFilterChange]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    setShowSuggestions(false);
    setSuggestionIndex(-1);
    
    // Clear search
    debouncedSearch('', activeFilters);
    
    // Focus input
    inputRef.current?.focus();
  }, [debouncedSearch, activeFilters]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchValue(suggestion);
    setShowSuggestions(false);
    setSuggestionIndex(-1);
    
    // Trigger search with selected suggestion
    debouncedSearch(suggestion, activeFilters);
    
    // Notify parent
    onSuggestionSelect?.(suggestion);
  }, [debouncedSearch, activeFilters, onSuggestionSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (suggestionIndex >= 0 && suggestionIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[suggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSuggestionIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, suggestionIndex, handleSuggestionSelect]);

  // Handle filter menu
  const handleFilterMenuOpen = useCallback((event) => {
    setFilterMenuAnchor(event.currentTarget);
  }, []);

  const handleFilterMenuClose = useCallback(() => {
    setFilterMenuAnchor(null);
  }, []);

  // Remove filter
  const handleRemoveFilter = useCallback((filterKey) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterKey];
    setActiveFilters(newFilters);
    
    // Trigger search with updated filters
    debouncedSearch(searchValue, newFilters);
    
    // Notify parent
    onFilterChange?.(newFilters);
  }, [activeFilters, searchValue, debouncedSearch, onFilterChange]);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setActiveFilters({});
    debouncedSearch(searchValue, {});
    onFilterChange?.({});
  }, [searchValue, debouncedSearch, onFilterChange]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.keys(activeFilters).filter(key => 
      activeFilters[key] !== undefined && 
      activeFilters[key] !== '' && 
      activeFilters[key] !== null
    ).length;
  }, [activeFilters]);

  // Render filter chips
  const renderFilterChips = useMemo(() => {
    const chips = [];
    
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) return;
      
      const filter = availableFilters.find(f => f.key === key);
      if (!filter) return;
      
      let label = value;
      if (filter.getLabel) {
        label = filter.getLabel(value);
      } else if (filter.options) {
        const option = filter.options.find(opt => opt.value === value);
        label = option?.label || value;
      }
      
      chips.push(
        <Chip
          key={key}
          label={`${filter.label}: ${label}`}
          onDelete={() => handleRemoveFilter(key)}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    });
    
    return chips;
  }, [activeFilters, availableFilters, handleRemoveFilter]);

  // Render filter menu
  const renderFilterMenu = useMemo(() => {
    if (!showAdvancedFilters || availableFilters.length === 0) return null;
    
    return (
      <FilterMenu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {availableFilters.map((filter) => (
          <Box key={filter.key} sx={{ padding: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              {filter.label}
            </Typography>
            
            {filter.type === 'select' && (
              <FormControl fullWidth size="small">
                <Select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>All {filter.label}</em>
                  </MenuItem>
                  {filter.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {filter.type === 'range' && (
              <Box sx={{ padding: 2 }}>
                <Slider
                  value={activeFilters[filter.key] || filter.defaultValue || [0, 100]}
                  onChange={(e, value) => handleFilterChange(filter.key, value)}
                  valueLabelDisplay="auto"
                  min={filter.min || 0}
                  max={filter.max || 100}
                  step={filter.step || 1}
                />
              </Box>
            )}
            
            {filter.type === 'boolean' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={activeFilters[filter.key] || false}
                    onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                  />
                }
                label={filter.label}
              />
            )}
          </Box>
        ))}
        
        {activeFilterCount > 0 && (
          <Box sx={{ padding: 2, textAlign: 'center' }}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={handleClearAllFilters}
            >
              Clear all filters
            </Typography>
          </Box>
        )}
      </FilterMenu>
    );
  }, [
    showAdvancedFilters,
    availableFilters,
    filterMenuAnchor,
    handleFilterMenuClose,
    activeFilters,
    handleFilterChange,
    activeFilterCount,
    handleClearAllFilters
  ]);

  // Render suggestions
  const renderSuggestions = useMemo(() => {
    if (!showSuggestions || suggestions.length === 0) return null;
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderTop: 0,
          borderRadius: '0 0 4px 4px',
          zIndex: 1000,
          maxHeight: 200,
          overflow: 'auto',
        }}
      >
        {suggestions.map((suggestion, index) => (
          <Box
            key={index}
            sx={{
              padding: 1.5,
              cursor: 'pointer',
              backgroundColor: index === suggestionIndex ? 'action.hover' : 'transparent',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            onClick={() => handleSuggestionSelect(suggestion)}
          >
            <Typography variant="body2">{suggestion}</Typography>
          </Box>
        ))}
      </Box>
    );
  }, [showSuggestions, suggestions, suggestionIndex, handleSuggestionSelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSearchRef.current?.cancel();
      throttledSearchRef.current?.cancel();
    };
  }, []);

  return (
    <SearchContainer>
      <Box sx={{ position: 'relative' }}>
        <TextField
          ref={inputRef}
          fullWidth={fullWidth}
          size={size}
          variant={variant}
          placeholder={placeholder}
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <SearchIcon />
                )}
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {clearable && searchValue && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                )}
                {showAdvancedFilters && availableFilters.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={handleFilterMenuOpen}
                    edge="end"
                    color={activeFilterCount > 0 ? 'primary' : 'default'}
                  >
                    <FilterIcon />
                    {activeFilterCount > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                        }}
                      />
                    )}
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
        
        {renderSuggestions}
      </Box>
      
      {renderFilterChips.length > 0 && (
        <FilterChips>
          {renderFilterChips}
        </FilterChips>
      )}
      
      {renderFilterMenu}
    </SearchContainer>
  );
});

// Set display name for debugging
DebouncedSearchInput.displayName = 'DebouncedSearchInput';

export default DebouncedSearchInput;
