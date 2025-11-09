import {useState} from "react";
import {TestCase} from "../../types/TestCase.ts";
import {Autocomplete, Box, Button, Chip, TextField, Typography} from "@mui/material";
import {Delete, Save, CheckCircle} from "@mui/icons-material";

type TabPanelProps = {
    index: number;
    value: number;
    test?: TestCase;
    snippetId: string;
    setTestCase: (test: Partial<TestCase>) => void;
    removeTestCase?: (testIndex: string) => void;
    onSelectTest?: (testId: string) => void;
    onClose?: () => void;
}

export const TabPanel = ({value, index, test: initialTest, snippetId, setTestCase, removeTestCase, onSelectTest, onClose}: TabPanelProps) => {
    const [testData, setTestData] = useState<Partial<TestCase> | undefined>(initialTest);



    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            style={{width: '100%', height: '100%'}}
        >
            {value === index && (
                <Box sx={{px: 3}} display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Name</Typography>
                        <TextField size="small" value={testData?.name || ''}
                                   onChange={(e) => setTestData({...testData, name: e.target.value})}/>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Input</Typography>
                        <Autocomplete
                            multiple
                            size="small"
                            id="tags-filled"
                            freeSolo
                            value={testData?.inputs ?? []}
                            onChange={(_, value) => setTestData({...testData, inputs: value})}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({index})} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                />
                            )}
                            options={[]}
                        />
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Output</Typography>
                        <Autocomplete
                            multiple
                            size="small"
                            id="tags-filled"
                            freeSolo
                            value={testData?.expectedOutputs ?? []}
                            onChange={(_, value) => setTestData({...testData, expectedOutputs: value})}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({index})} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                />
                            )}
                            options={[]}
                        />
                    </Box>
                    <Box display="flex" flexDirection="row" gap={1}>
                        {
                            (testData?.id && removeTestCase) && (
                                <Button onClick={() => removeTestCase(testData?.id ?? "")} variant={"outlined"} color={"error"}
                                        startIcon={<Delete/>}>
                                    Remove
                                </Button>)
                        }
                        <Button
                            disabled={!testData?.name}
                            onClick={() => setTestCase({
                                ...testData,
                                snippetId: parseInt(snippetId),
                                inputs: testData?.inputs ?? [],
                                expectedOutputs: testData?.expectedOutputs ?? []
                            })}
                            variant={"outlined"}
                            startIcon={<Save/>}
                        >
                            Save
                        </Button>
                        {testData?.id && onSelectTest && (
                            <Button
                                onClick={() => {
                                    onSelectTest(testData.id!);
                                    onClose?.();
                                }}
                                variant={"contained"}
                                startIcon={<CheckCircle/>}
                                disableElevation
                            >
                                Select
                            </Button>
                        )}
                    </Box>
                </Box>
            )}
        </div>
    );
}