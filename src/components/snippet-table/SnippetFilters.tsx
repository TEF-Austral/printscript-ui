import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Button,
    Grid,
    IconButton,
    Tooltip,
} from "@mui/material";
import { Clear, ArrowUpward, ArrowDownward, Add } from "@mui/icons-material";
import { useState, useEffect } from "react";
import {
    SnippetFilters,
    OwnershipFilter,
    ComplianceFilter,
    SortField,
    SortOrder,
    defaultFilters,
} from "../../types/SnippetFilter.types";
import { useGetFileTypes } from "../../utils/queries";

interface SnippetFiltersComponentProps {
    filters: SnippetFilters;
    onFiltersChange: (filters: SnippetFilters) => void;
    onAddSnippet?: () => void;
}

export const SnippetFiltersComponent = ({
                                            filters,
                                            onFiltersChange,
                                            onAddSnippet,
                                        }: SnippetFiltersComponentProps) => {
    const [localFilters, setLocalFilters] = useState<SnippetFilters>(filters);
    const { data: fileTypes } = useGetFileTypes();

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleOwnershipChange = (event: SelectChangeEvent<string>) => {
        const newFilters = {
            ...localFilters,
            ownership: event.target.value as OwnershipFilter,
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFilters = {
            ...localFilters,
            name: event.target.value || undefined,
        };
        setLocalFilters(newFilters);
    };

    const handleNameKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onFiltersChange(localFilters);
        }
    };

    const handleLanguageChange = (event: SelectChangeEvent<string>) => {
        const newFilters = {
            ...localFilters,
            language: event.target.value || undefined,
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleComplianceChange = (event: SelectChangeEvent<string>) => {
        const newFilters = {
            ...localFilters,
            compliance: event.target.value as ComplianceFilter,
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleSortByChange = (event: SelectChangeEvent<string>) => {
        const newFilters = {
            ...localFilters,
            sortBy: event.target.value as SortField,
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const toggleSortOrder = () => {
        const newFilters = {
            ...localFilters,
            sortOrder:
                localFilters.sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleClearFilters = () => {
        setLocalFilters(defaultFilters);
        onFiltersChange(defaultFilters);
    };

    const hasActiveFilters =
        localFilters.ownership !== OwnershipFilter.ALL ||
        localFilters.name ||
        localFilters.language ||
        localFilters.compliance !== ComplianceFilter.ALL ||
        localFilters.sortBy !== SortField.NAME ||
        localFilters.sortOrder !== SortOrder.ASC;

    return (
        <Box sx={{ mb: 3, p: 2, borderRadius: 1 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Ownership</InputLabel>
                        <Select
                            value={localFilters.ownership}
                            label="Ownership"
                            onChange={handleOwnershipChange}
                        >
                            <MenuItem value={OwnershipFilter.ALL}>All</MenuItem>
                            <MenuItem value={OwnershipFilter.OWNED}>Owned</MenuItem>
                            <MenuItem value={OwnershipFilter.SHARED}>Shared</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Search by name"
                        value={localFilters.name || ""}
                        onChange={handleNameChange}
                        onKeyDown={handleNameKeyDown}
                        onBlur={() => onFiltersChange(localFilters)}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Language</InputLabel>
                        <Select
                            value={localFilters.language || ""}
                            label="Language"
                            onChange={handleLanguageChange}
                        >
                            <MenuItem value="">All</MenuItem>
                            {fileTypes?.map((ft) => (
                                <MenuItem key={ft.language} value={ft.language}>
                                    {ft.language}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Compliance</InputLabel>
                        <Select
                            value={localFilters.compliance}
                            label="Compliance"
                            onChange={handleComplianceChange}
                        >
                            <MenuItem value={ComplianceFilter.ALL}>All</MenuItem>
                            <MenuItem value={ComplianceFilter.COMPLIANT}>Compliant</MenuItem>
                            <MenuItem value={ComplianceFilter.NON_COMPLIANT}>
                                Non-Compliant
                            </MenuItem>
                            <MenuItem value={ComplianceFilter.PENDING}>Pending</MenuItem>
                            <MenuItem value={ComplianceFilter.FAILED}>Failed</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <Box display="flex" gap={1}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sort by</InputLabel>
                            <Select
                                value={localFilters.sortBy}
                                label="Sort by"
                                onChange={handleSortByChange}
                            >
                                <MenuItem value={SortField.NAME}>Name</MenuItem>
                                <MenuItem value={SortField.LANGUAGE}>Language</MenuItem>
                                <MenuItem value={SortField.COMPLIANCE}>Compliance</MenuItem>
                            </Select>
                        </FormControl>
                        <Tooltip title={`Sort ${localFilters.sortOrder === SortOrder.ASC ? 'Descending' : 'Ascending'}`}>
                            <IconButton onClick={toggleSortOrder} size="small">
                                {localFilters.sortOrder === SortOrder.ASC ? <ArrowUpward /> : <ArrowDownward />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <Box display="flex" gap={1} flexDirection="column">
                        {hasActiveFilters && (
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Clear />}
                                onClick={handleClearFilters}
                                size="small"
                            >
                                Clear Filters
                            </Button>
                        )}
                        {onAddSnippet && (
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<Add />}
                                onClick={onAddSnippet}
                                size="small"
                                sx={{ boxShadow: 0 }}
                            >
                                Add Snippet
                            </Button>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};